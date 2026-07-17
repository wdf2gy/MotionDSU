#!/usr/bin/env python3
"""
体感手柄 PC 端 - DSU 协议服务器 & 网页服务 (aiohttp + vJoy 修复版)
"""

import asyncio
import json
import socket
import struct
import time
import zlib
import ssl
import os
from datetime import datetime
from aiohttp import web

try:
    import pyvjoy
    VJOY_AVAILABLE = True
except ImportError:
    VJOY_AVAILABLE = False
    print("⚠️ 未安装 pyvjoy，按键/摇杆功能不可用。请执行: pip install pyvjoy")

# ============ 配置 ============
HTTP_PORT = 9876       
DSU_PORT = 26760       
SERVER_ID = 0x12345678 
WEB_DIR = "web"        
MAC_ADDRESS = b'\x12\x34\x56\x78\x9A\xBC'  # DSU 控制器唯一 MAC

# ============ DSU 协议常量 ============
DSUS_MAGIC = b'DSUS'
DSUC_MAGIC = b'DSUC'
PROTOCOL_VERSION = 1001
# 注: CemuHook DSU 标准 = 16 字节头(包含 client_id) + 4 字节 msg_type + N 字节 payload
# length 字段 = 4 + N (msg_type 之后的总字节数)
# PadData = 80 字节, 总包 = 100 字节

# ============ vJoy 虚拟手柄控制器 ============
class VJoyController:
    def __init__(self, device_id=1):
        self.j = None
        if not VJOY_AVAILABLE:
            return
        try:
            self.j = pyvjoy.VJoyDevice(device_id)
            print(f"✅ vJoy 设备 {device_id} 已初始化")
        except Exception as e:
            print(f"❌ vJoy 初始化失败: {e}")

    def update(self, buttons: int, axes: list, triggers: list):
        if not self.j:
            return
        for i in range(16):
            try:
                self.j.set_button(i + 1, bool(buttons & (1 << i)))
            except Exception:
                pass
        
        def map_axis(v):
            return max(0, min(32767, int((v + 1) * 16383.5)))
        
        try:
            if len(axes) >= 4:
                self.j.set_axis(pyvjoy.HID_USAGE_X, map_axis(axes[0]))
                self.j.set_axis(pyvjoy.HID_USAGE_Y, map_axis(axes[1]))
                self.j.set_axis(pyvjoy.HID_USAGE_Z, map_axis(axes[2]))
                self.j.set_axis(pyvjoy.HID_USAGE_RX, map_axis(axes[3]))
            if len(triggers) >= 2:
                self.j.set_axis(pyvjoy.HID_USAGE_RZ, int(triggers[0] * 32767))
                self.j.set_axis(pyvjoy.HID_USAGE_RY, int(triggers[1] * 32767))
        except Exception as e:
            print(f"❌ vJoy 轴/扳机更新失败: {e}")

# ============ DSU 协议双向通信服务 ============
class DSUServer:
    """DSU 协议 UDP 服务端 (支持握手响应与传感器推送)"""
    def __init__(self, port: int):
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind(('0.0.0.0', port))
        self.sock.setblocking(False)
        self.client_addr = None
        self.sensor_requested = False
        self.packet_counter = 0  # ⚠️ 关键：DSU 协议要求单调递增的包计数器
        self._last_phone_data = 0  # 最近一次手机数据到达时间，用于自动保活
        self._target_mac = MAC_ADDRESS
        self._last_gyro = None
        self._last_accel = None
        self._last_buttons = 0
        self._last_axes = [0, 0, 0, 0]
        self._last_triggers = [0, 0]
        print(f"✅ DSU UDP 服务已绑定: 0.0.0.0:{port}")

    def _build_response(self, msg_type: int, payload: bytes) -> bytes:
        """构建标准 DSUS 响应包 (16 字节头 + 4 字节 msg_type + N 字节 payload)"""
        length = 4 + len(payload)  # msg_type(4) + payload(N)
        header_pre = struct.pack('<4sHH', DSUS_MAGIC, PROTOCOL_VERSION, length)
        crc_data = (header_pre + b'\x00\x00\x00\x00' +
                    struct.pack('<I', SERVER_ID) +
                    struct.pack('<I', msg_type) + payload)
        crc = zlib.crc32(crc_data) & 0xFFFFFFFF
        return (header_pre + struct.pack('<II', crc, SERVER_ID) +
                struct.pack('<I', msg_type) + payload)

    async def handle_requests(self):
        """异步监听并响应 Sudachi 的 DSU 握手请求"""
        loop = asyncio.get_event_loop()
        while True:
            try:
                data, addr = await loop.sock_recvfrom(self.sock, 2048)
                if len(data) < 20 or data[:4] != DSUC_MAGIC:
                    continue
                
                _, ver, length, crc, client_id, msg_type = struct.unpack_from('<4sHHIII', data)
                self.client_addr = addr
                
                # 1. 版本请求 (Version Request)
                if msg_type == 0x100000:
                    rsp = self._build_response(0x100000, struct.pack('<I', PROTOCOL_VERSION))
                    self.sock.sendto(rsp, addr)
                    if not hasattr(self, '_printed_version'):
                        print(f"↩️ [{addr}] 已回复 DSU 版本握手")
                        self._printed_version = True

                # 2. 端口列表请求 (List Ports)
                elif msg_type == 0x100001:
                    # CemuHook 标准: id(1)+state(1)+model(1)+conn(1)+mac(6)+battery(1) = 11 bytes/slot, 4 slots
                    slot0 = struct.pack('<4B6sB', 0, 2, 2, 1, MAC_ADDRESS, 100)
                    slot1 = struct.pack('<4B6sB', 1, 0, 0, 0, b'\x00'*6, 0)
                    slot2 = struct.pack('<4B6sB', 2, 0, 0, 0, b'\x00'*6, 0)
                    slot3 = struct.pack('<4B6sB', 3, 0, 0, 0, b'\x00'*6, 0)
                    payload = slot0 + slot1 + slot2 + slot3
                    rsp = self._build_response(0x100001, payload)
                    self.sock.sendto(rsp, addr)
                    if not hasattr(self, '_printed_port'):
                        print(f"↩️ [{addr}] 已回复端口列表 (Slot 0)")
                        self._printed_port = True

                # 3. 传感器数据订阅 (Sensor Data Request)
                elif msg_type == 0x100002:
                    self.sensor_requested = True
                    # 从请求 payload 中提取目标 MAC (20 字节头部后的 6 字节)
                    if len(data) >= 26:
                        req_mac = data[20:26]
                        if req_mac != b'\x00' * 6:
                            self._target_mac = req_mac
                    if not hasattr(self, '_printed_sub'):
                        print(f"🔄 [{addr}] 已订阅 MAC={self._target_mac.hex()} data_len={len(data)}")
                        self._printed_sub = True

            except BlockingIOError:
                await asyncio.sleep(0.001)
            except Exception as e:
                print(f"❌ DSU 请求处理异常: {e}")
    def _map_stick(self, v):
        """Web -1..1 → DSU u8 0..255 (center 128)"""
        return max(0, min(255, int((v + 1) * 127.5)))

    def _map_trigger(self, v):
        """Web 0..1 → DSU u8 0..255"""
        return max(0, min(255, int(v * 255)))

    def _map_buttons_dsu(self, our_buttons: int) -> int:
        """将前端按钮位掩码(0: A,1: B,2: X,3: Y...) → CemuHook u16 标准位掩码"""
        # CemuHook u16: Share, L3, R3, Options, Up, Right, Down, Left, L2, R2, L1, R1, Y, B, A, X
        mapping = [(6,0),(8,1),(9,2),(7,3),(11,4),(14,5),(12,6),(13,7),
                   (0,14),(1,13),(2,15),(3,12),(4,10),(5,11)]
        result = 0
        for our_bit, hook_bit in mapping:
            if our_buttons & (1 << our_bit):
                result |= (1 << hook_bit)
        if our_buttons & (1 << 10):
            result |= (1 << 16)  # home → bit 16 outside u16, handled separately
        return result

    def _build_pad_payload(self, buttons: int, axes: list, triggers: list,
                            gyro: dict, accel: dict) -> bytes:
        """构建 CemuHook DataResponse: PortInfo(12) + DataResponseData(68) = 80 bytes
        Ref: https://github.com/cemu-project/cemu/blob/main/src/input/api/DSU/DSUMessages.h
        """
        ts = int(time.time() * 1_000_000)
        lx = self._map_stick(axes[0]); ly = self._map_stick(axes[1])
        rx = self._map_stick(axes[2]); ry = self._map_stick(axes[3])
        lt = self._map_trigger(triggers[0]); rt = self._map_trigger(triggers[1])

        # PortInfoData: 12 bytes (index, state, model, conn, mac[6], battery, is_active)
        payload = struct.pack('<BBBB6sBB', 0, 2, 2, 1, self._target_mac, 100, 1)

        # DataResponseData: 68 bytes
        # 0-3: packet_counter (uint32)
        payload += struct.pack('<I', self.packet_counter)
        # 4-7: state1, state2, ps, touch (4 × uint8)
        home = 0xFF if (buttons >> 10) & 1 else 0  # bit 10 = Home
        payload += struct.pack('<BBBB', 0, 0, home, 0)
        # 8-11: sticks (4 × uint8)
        payload += struct.pack('<BBBB', lx, ly, rx, ry)
        # 12-15: dpad (4 × uint8, 0xFF=pressed)
        dl = 0xFF if (buttons >> 13) & 1 else 0  # Left
        dd = 0xFF if (buttons >> 12) & 1 else 0  # Down
        dr = 0xFF if (buttons >> 14) & 1 else 0  # Right
        du = 0xFF if (buttons >> 11) & 1 else 0  # Up
        payload += struct.pack('<BBBB', dl, dd, dr, du)
        # 16-19: face buttons (square→X, cross→A, circle→B, triangle→Y)
        sq = 0xFF if (buttons >> 2) & 1 else 0   # X → square
        cr = 0xFF if (buttons >> 0) & 1 else 0   # A → cross
        ci = 0xFF if (buttons >> 1) & 1 else 0   # B → circle
        tr = 0xFF if (buttons >> 3) & 1 else 0   # Y → triangle
        payload += struct.pack('<BBBB', sq, cr, ci, tr)
        # 20-23: r1, l1, r2, l2 (0xFF=digital, or analog 0-255)
        r1 = 0xFF if (buttons >> 5) & 1 else 0   # RB
        l1 = 0xFF if (buttons >> 4) & 1 else 0   # LB
        r2 = rt                                  # RT (analog)
        l2 = lt                                  # LT (analog)
        payload += struct.pack('<BBBB', r1, l1, r2, l2)
        # 24-35: touchpad (2 × TouchPoint, 6 bytes each, all zeros)
        payload += b'\x00' * 12
        # 36-43: motion_timestamp (uint64 microseconds)
        payload += struct.pack('<Q', ts)
        # 44-55: accel (3 × float, in G)
        ax = float(accel.get('x', 0)) / 9.8
        ay = float(accel.get('y', 0)) / 9.8
        az = float(accel.get('z', 0)) / 9.8
        payload += struct.pack('<fff', ax, ay, az)
        # 56-67: gyro (3 × float, in DEG/S — Cemu converts to rad/s internally)
        gx = float(gyro.get('y', 0))   # beta (X rotation) → gyro.x
        gy = float(gyro.get('z', 0))   # gamma (Y rotation) → gyro.y
        gz = float(gyro.get('x', 0))   # alpha (Z rotation) → gyro.z
        payload += struct.pack('<fff', gx, gy, gz)

        if not hasattr(self, '_dbg_payload'):
            print(f"📱 RAW gyro={gyro} accel={accel}")
            print(f"🔁 MAPPED accel=({ax:.3f},{ay:.3f},{az:.3f}) gyro=({gx:.1f},{gy:.1f},{gz:.1f}) deg/s")
            print(f"🔍 payload hex 56-79: {payload[56:80].hex(' ')}")
            self._dbg_payload = True
        return payload

    def send_sensor_data(self, gyro: dict, accel: dict, buttons: int = 0, axes: list = None, triggers: list = None):
        """从手机 WebSocket 收到数据时调用，标记最近一次手机数据时间"""
        if not self.sensor_requested or not self.client_addr:
            return
        self._last_phone_data = time.time()
        self._last_gyro = gyro
        self._last_accel = accel
        self._last_buttons = buttons
        if axes is None: axes = [0, 0, 0, 0]
        if triggers is None: triggers = [0, 0]
        self._last_axes = axes
        self._last_triggers = triggers
        self.packet_counter += 1
        payload = self._build_pad_payload(buttons, axes, triggers, gyro, accel)
        packet = self._build_response(0x100002, payload)
        try:
            self.sock.sendto(packet, self.client_addr)
            if not hasattr(self, '_sent_pad'):
                print(f"📡 首包已发送到 {self.client_addr} 共 {len(packet)} 字节 (payload={len(payload)})")
                self._sent_pad = True
        except Exception as e:
            print(f"❌ DSU 发送失败: {e}")

    async def _auto_send_loop(self):
        """后台任务：无手机数据时用最近体感数据保活，防止 Sudachi 超时"""
        while True:
            await asyncio.sleep(0.01)
            if not self.sensor_requested or not self.client_addr:
                continue
            if time.time() - self._last_phone_data > 0.15:
                self.packet_counter += 1
                payload = self._build_pad_payload(
                    self._last_buttons, self._last_axes, self._last_triggers,
                    self._last_gyro or {'x':0,'y':0,'z':0},
                    self._last_accel or {'x':0,'y':0,'z':0})
                packet = self._build_response(0x100002, payload)
                try:
                    self.sock.sendto(packet, self.client_addr)
                    if not hasattr(self, '_sent_keepalive'):
                        print(f"📡 保活包已发送到 {self.client_addr} 共 {len(packet)} 字节")
                        self._sent_keepalive = True
                except Exception:
                    pass

    def __del__(self):
        self.sock.close()

# ============ WebSocket 与 HTTP 服务器 ============
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

async def handle_phone(request):
    """处理手机 WebSocket 连接，分发数据到 vJoy 和 DSU"""
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    
    vjoy = request.app['vjoy']
    dsu = request.app['dsu']
    
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] ✓ 客户端已连接!(等待数据流...)")
    frame_count = 0
    
    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                try:
                    data = json.loads(msg.data)
                    
                    # --- 调试：打印所有接收到的数据 ---
                    # print(f"🔍 RAW JSON: {data}")

                    # 1. 将按键/摇杆/扳机写入 vJoy 虚拟手柄
                    # --- 处理虚拟手柄数据 (vJoy) ---
                    # 假设前端发送的数据结构包含 buttons (位掩码) 和 axes (摇杆数组)
                    buttons = data.get('buttons', 0)
                    axes = data.get('axes', [0, 0, 0, 0])
                    triggers = data.get('triggers', [0, 0])
                    
                    # 只有当有按键或摇杆变化时才打印，避免刷屏
                    # or any(abs(axis) > 0.1 for axis in axes)
                    if buttons > 0  or any(trigger > 0.1 for trigger in triggers):
                        pressed = [str(i + 1) for i in range(15) if buttons & (1 << i)]
                        print(f"🎮 按钮: {'+'.join(pressed) or '无'}, 摇杆: {axes}, 扳机: {triggers}")
                    
                    # 写入 vJoy
                    vjoy.update(buttons, axes, triggers)
                    
                    # 2. 将完整手柄数据通过 DSU 协议推送（含按键/摇杆/体感）
                    if 'gyroscope' in data and 'accelerometer' in data:
                        dsu.send_sensor_data(
                            data.get('gyroscope', {'x':0,'y':0,'z':0}),
                            data.get('accelerometer', {'x':0,'y':0,'z':0}),
                            buttons, axes, triggers
                        )
                    
                    frame_count += 1
                    if frame_count % 300 == 0:
                        gyro = data.get('gyroscope', {})
                        accel = data.get('accelerometer', {})
                        if any(gyro.get(k,0) for k in 'xyz') or any(accel.get(k,0) for k in 'xyz'):
                            print(f"\r[{datetime.now().strftime('%H:%M:%S')}] "
                                  f"陀螺仪: X={gyro.get('x',0):.1f} Y={gyro.get('y',0):.1f} Z={gyro.get('z',0):.1f} | "
                                  f"加速度: ({accel.get('x',0):.2f}, {accel.get('y',0):.2f}, {accel.get('z',0):.2f})")
                except Exception as e:
                    print(f"❌ 数据处理错误: {e}")              
                except json.JSONDecodeError:
                    pass
            elif msg.type == web.WSMsgType.ERROR:
                print(f'\nWebSocket 错误: {ws.exception()}')
    except Exception as e:
        print(f"\n连接异常: {e}")
    finally:
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 客户端已断开")
        
    return ws

async def init_app():
    app = web.Application()
    app.router.add_get("/ws", handle_phone)
    app.router.add_static("/", path=WEB_DIR, show_index=True)
    
    # 将共享实例注入 app
    app['vjoy'] = VJoyController()
    app['dsu'] = DSUServer(DSU_PORT)
    
    return app

async def main():
    local_ip = get_local_ip()
    print("=" * 60)
    print("体感手柄 PC 端 - DSU 协议服务器 & 网页服务 (vJoy版)")
    print("=" * 60)
    
    print(f"\n本机 IP: {local_ip}")
    print(f"服务端口: {HTTP_PORT}")
    print(f"DSU 端口: {DSU_PORT}")
    print(f"\n【Sudachi 配置指南】")
    print(f"1. Controls → Input Device: 选择 'vJoy Device'")
    print(f"2. Controls → Motion → Source: CemuhookUDP")
    print(f"3. Motion IP: 127.0.0.1  Port: {DSU_PORT}")
    print("\n" + "-" * 60)
    
    app = await init_app()
    
    # 启动 DSU UDP 握手监听 + 自动数据保活任务
    asyncio.create_task(app['dsu'].handle_requests())
    asyncio.create_task(app['dsu']._auto_send_loop())
    
    ssl_context = None
    cert_path = os.path.join(WEB_DIR, "cert.pem")
    key_path = os.path.join(WEB_DIR, "key.pem")
    
    if os.path.exists(cert_path) and os.path.exists(key_path):
        ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        ssl_context.load_cert_chain(cert_path, key_path)
        print(f"✅ 已加载 SSL 证书，启用 HTTPS 模式")
    else:
        print(f"⚠️ 未找到 SSL 证书，将以 HTTP 模式运行")
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", HTTP_PORT, ssl_context=ssl_context)
    await site.start()
    
    print("等待客户端连接...")
    await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())