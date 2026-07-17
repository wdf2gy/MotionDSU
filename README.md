# MotionDSU — 手机体感手柄

将手机变为 Sudachi / Cemu / Ryujinx 等模拟器的体感控制器（CemuHook DSU 协议）和虚拟手柄。手机浏览器提供触摸虚拟手柄 + 陀螺仪/加速度计输入；PC 服务端转发数据到模拟器并提供 vJoy 虚拟 DirectInput 设备。

## 系统架构

```
手机浏览器 → WebSocket (ws://主机IP:9876/ws) → server.py
                                                   ├─ VJoyController (按键/摇杆 → vJoy 虚拟手柄)
                                                   └─ DSUServer (陀螺仪/加速度计/按键 → DSU UDP :26760 → 模拟器)
```

- **server.py** — 单文件 Python 入口：aiohttp HTTP + WebSocket 服务端、DSU UDP 广播器、vJoy 控制器
- **web/** — 纯静态前端（无构建步骤）：`index.html`、`style.css`、`main.js`

## 功能特点

- ✅ 5 套预设布局：Xbox、PlayStation、Switch、GBA、体感专用
- ✅ 自定义预设：按 `+` 按钮克隆当前布局并命名
- ✅ 编辑模式：拖拽任意控件位置、隐藏/显示控件、多选+对齐
- ✅ 3D 体感可视化立方体（需手机自带加速度与陀螺仪）
- ✅ 支持横竖屏独立布局（自动切换）
- ✅ 布局导出/导入为 JSON 文件
- ✅ 支持 Android 与 iOS HTTPS（需自签名证书）
- ✅ 低延迟：触摸事件 60 Hz + 体感 60 Hz
- ✅ 空闲帧节流：无操作时自动降频至 ~1 Hz

## 环境准备

### 安装依赖

```bash
pip install -r requirements.txt
```

`requirements.txt` 内容：

```
aiohttp~=3.9
pyvjoy; sys_platform == 'win32'
```

`pyvjoy` 仅 Windows 需要，用于虚拟手柄。

### SSL 证书（强烈推荐）

要求 HTTPS 才能获取 `DeviceMotionEvent` 权限。生成本机局域网 IP 的证书：

```bash
# 方式一：使用 mkcert（推荐）
mkcert -install
mkcert 192.168.x.x localhost 127.0.0.1
# 将生成的文件改名为 cert.pem 和 key.pem 并放到 web/ 目录下

# 方式二：使用 OpenSSL
openssl req -x509 -newkey rsa:2048 -keyout web/key.pem -out web/cert.pem -days 365 -nodes -subj "/CN=192.168.x.x"
```

无 SSL 时服务端自动降级为 HTTP —— 低版本 Android 可能正常使用，iOS 无法启用体感。

### vJoy 虚拟手柄（Windows 必选）

1. 下载安装 [vJoy](https://sourceforge.net/projects/vjoystick/)（推荐 2.1.9+）
2. 打开 vJoy 配置，将 **设备 1** 的轴设为：X、Y、Z、Rx、Ry、Rz，按钮数设为 16
3. `pip install pyvjoy`

## 快速开始

```bash
python server.py
```

启动后控制台会显示本机局域网 IP（如 `192.168.1.6`）和服务端口：

- HTTP/WS 端口：**9876**
- DSU UDP 端口：**26760**

### 手机连接步骤

1. **同一局域网**：确保手机与电脑在同一网络
2. **打开浏览器**：访问 `https://192.168.1.6:9876`
   - 自签名证书会被浏览器警告，选择"继续访问"
   - 如果跳转到了 `https://192.168.1.6:9876/` 看到的是目录列表，请加 `/index.html`
3. **点击「连接」**：iOS 会弹出体感权限请求，点允许
4. **点击「开启体感」**：手机开始发送陀螺仪数据，转动手机可以看到立文体转动

### 模拟器配置（以 Sudachi 为例）

- **体感设置**：控制 → 体感 → 输入源：`CemuhookUDP`，IP `127.0.0.1`，端口 `26760`
- **按键映射**：控制 → 输入设备：选择 `vJoy Device`，按需映射按钮

### 验证体感

打开模拟器的体感设置页面，应能看到 3D 立方体随手机转动。也可使用 Cemu 自带的 `CemuhookUDP Test` 工具验证。

## 按键映射

### DSU → vJoy → 默认映射表

| 手机按钮 | vJoy 按钮 | 模拟器映射 |
| -------- | --------- | ---------- |
| A        | 1         | A          |
| B        | 2         | B          |
| X        | 3         | X          |
| Y        | 4         | Y          |
| LB       | 5         | L          |
| RB       | 6         | R          |
| Select   | 7         | Select     |
| Start    | 8         | Start      |
| L3       | 9         | 左摇杆按下 |
| R3       | 10        | 右摇杆按下 |
| Home     | 11        | Home       |
| D-pad 上 | 12        | D-pad 上   |
| D-pad 下 | 13        | D-pad 下   |
| D-pad 左 | 14        | D-pad 左   |
| D-pad 右 | 15        | D-pad 右   |

**摇杆映射**：

- 左摇杆 → X / Y 轴
- 右摇杆 → Z / Rx 轴
- L2（左扳机）→ Ry 轴（模拟量）
- R2（右扳机）→ Rz 轴（模拟量）

### DSU 协议按钮位定义

DSU UDP 协议使用 Nintendo/Switch 按钮顺序：

| 位 | 按钮        |
| -- | ----------- |
| 0  | A           |
| 1  | B           |
| 2  | X           |
| 3  | Y           |
| 4  | L           |
| 5  | R           |
| 6  | ZL          |
| 7  | ZR          |
| 8  | − (Select) |
| 9  | + (Start)   |
| 10 | L3          |
| 11 | R3          |
| 12 | Home        |
| 13 | 截图        |

## 预设管理

### 内置预设

- **Xbox** — 标准 ABXY 布局，常见 PC 手柄布局
- **PlayStation** — 三角/圆圈/叉/方块 + L1/R1
- **Switch** — 按钮位置同 Xbox，AB/XY 标签对调
- **GBA** — 简化布局（无摇杆、XY、扳机）
- **体感专用** — 隐藏右摇杆，适合纯体感游戏

### 自定义预设

1. 点击顶栏的 **+** 按钮
2. 输入预设名称
3. 系统会克隆当前预设的所有控件位置
4. 自定义预设在下拉列表中显示在分隔线下方
5. 选中自定义预设时，**−** 按钮可删除

自定义预设的布局数据存储在浏览器 `localStorage` 中，可通过导出功能备份。

## 编辑模式

点击「编辑布局」进入编辑模式：

### 基础操作

- **拖拽移动**：触摸任意按钮/摇杆拖拽到新位置
- **隐藏/显示**：点击控件右上角的 👁/👁‍🗨 图标
- **保存**：点击「保存布局」

### 多选 & 对齐

1. **选中**：触摸控件（不拖拽）切换选中状态，选中项显示黄色边框
2. **取消选择**：工具栏显示 `已选 N` 和 `取消选择` 按钮
3. **对齐**：选中 ≥ 2 个控件后出现对齐工具栏：
   - 水平：左对齐 / 水平居中 / 右对齐 / 水平分布
   - 垂直：顶部对齐 / 垂直居中 / 底部对齐 / 垂直分布
4. **群体拖拽**：选中多个后触摸其中一个拖拽，所有选中控件同步移动
5. **对齐辅助线**：拖拽时蓝色虚线自动吸附提示（纯参考线，无磁性吸附）
6. **工具栏位置**：拖拽工具栏顶部的 `⠿` 手柄可移动工具栏位置，下次出现时自动恢复

### 高级功能

- **编辑模式下按键标签**：每个按钮显示按键码值（`#0`–`#14`、`L3`、`R3`、`ANA`）
- **横竖屏独立布局**：切换屏幕方向后各自编辑和保存

## 布局导出/导入

### 导出

点击「导出」按钮导出所有预设（含自定义）的横竖屏布局为 JSON 文件：

- 移动端优先使用系统分享菜单（Web Share API）
- 浏览器不兼容时自动复制到剪贴板
- 兜底方案：下载文件

### 导入

点击「导入」选择 JSON 文件恢复布局。导入会直接覆盖现有存储。

## 文件结构

```
MotionDSU/
├── server.py              # Python 后端 — 入口点
├── requirements.txt       # Python 依赖
├── startup.bat            # Windows 快速启动
└── web/                   # 静态前端（无构建步骤）
    ├── index.html         # HTML 入口
    ├── style.css          # 深色主题 + 触摸手柄 + 3D 立方体
    └── main.js            # 触摸输入 + 体感 + WebSocket + 布局编辑
```

## DSU 协议参考

- 二进制格式遵循 Cemu 的 `DSUMessages.h` 定义
- **PortInfoData**：12 字节（slot、state、model、connection、MAC 地址 [6]、电池）
- **PadData**：68 字节（MAC [6]、电池、连接状态、计数器、按钮位掩码、摇杆 [4]、扳机 [2]、保留 [6]、触摸 [24]、时间戳、加速度计 [3f]、陀螺仪 [3f]）
- 陀螺仪单位：**度/秒**（Cemu 内部乘以 π/180 转换为弧度）
- 按钮格式：16 个独立 `uint8` 字节，非 packed bitmask
- 自动发送循环：手机数据停顿 >150 ms 时服务端以 100 Hz 广播保活包（保持上次已知状态）
- 包计数器单调递增
- `_build_response` 的 `length` 字段 = `16 + len(payload)`

## 常见问题

**Q: iOS 无法启用体感？**
A: 确保使用 HTTPS（`https://` 前缀），且已接受自签名证书。iOS 13+ 强制要求 HTTPS。

**Q: 模拟器收不到体感数据？**
A: 检查 DSU UDP 端口（26760）未被防火墙拦截。Sudachi 中确认体感输入源设为 CemuhookUDP、IP `127.0.0.1`。

**Q: vJoy 设备未识别？**
A: 确认 vJoy 配置中按钮数 ≥ 16，轴包含 X/Y/Z/Rx/Ry/Rz。重启模拟器使设备列表刷新。

**Q: 按钮映射不对？**
A: 当前使用 Nintendo 按钮顺序（A/B/X/Y）。如果模拟器期望 Xbox 顺序，请调整 `main.js` 中的 DSU 按钮位定义。

## 许可

本项目仅供学习交流使用。vJoy 是其各自所有者的财产。
