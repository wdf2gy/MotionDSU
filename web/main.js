// ==========================================
// 1. 布局配置 (基础默认 + 差异化覆盖)
// ==========================================
// 通用默认布局 (适用于大多数手柄的横竖屏)
const DEFAULT_LAYOUT = {
    landscape: {
        stickL: { x: 8, y: 72, show: true }, stickR: { x: 82, y: 72, show: true },
        btnA: { x: 92, y: 65, show: true }, btnB: { x: 85, y: 80, show: true },
        btnX: { x: 85, y: 50, show: true }, btnY: { x: 78, y: 65, show: true },
        dpadUp: { x: 18, y: 50, show: true }, dpadDown: { x: 18, y: 80, show: true },
        dpadLeft: { x: 11, y: 65, show: true }, dpadRight: { x: 25, y: 65, show: true },
        shoulderL: { x: 5, y: 5, show: true }, shoulderR: { x: 82, y: 5, show: true },
        triggerL: { x: 5, y: 15, show: true }, triggerR: { x: 82, y: 15, show: true },
        btnSelect: { x: 38, y: 90, show: true }, btnStart: { x: 62, y: 90, show: true },
        btnHome: { x: 50, y: 90, show: true }
    },
    portrait: {
        stickL: { x: 15, y: 78, show: true }, stickR: { x: 85, y: 78, show: true },
        btnA: { x: 85, y: 55, show: true }, btnB: { x: 75, y: 68, show: true },
        btnX: { x: 75, y: 42, show: true }, btnY: { x: 65, y: 55, show: true },
        dpadUp: { x: 15, y: 42, show: true }, dpadDown: { x: 15, y: 68, show: true },
        dpadLeft: { x: 7, y: 55, show: true }, dpadRight: { x: 23, y: 55, show: true },
        shoulderL: { x: 10, y: 5, show: true }, shoulderR: { x: 72, y: 5, show: true },
        triggerL: { x: 10, y: 15, show: true }, triggerR: { x: 72, y: 15, show: true },
        btnSelect: { x: 35, y: 92, show: true }, btnStart: { x: 65, y: 92, show: true },
        btnHome: { x: 50, y: 92, show: true }
    }
};

// 深度合并工具：用差异配置覆盖默认配置
function mergeLayout(base, override) {
    const result = JSON.parse(JSON.stringify(base));
    for (const [orient, controls] of Object.entries(override)) {
        if (!result[orient]) result[orient] = {};
        for (const [id, pos] of Object.entries(controls)) {
            result[orient][id] = { ...result[orient][id], ...pos };
        }
    }
    return result;
}

const LAYOUT_CONFIG = {
    xbox: DEFAULT_LAYOUT, // 直接使用默认
    ps: mergeLayout(DEFAULT_LAYOUT, {
        landscape: {
            stickL: { label: 'L3' }, stickR: { label: 'R3' },
            btnA: { text: '❌' }, btnB: { text: '⭕' }, btnX: { text: '🟦' }, btnY: { text: '△' },
            shoulderL: { text: 'L1' }, shoulderR: { text: 'R1' },
            triggerL: { text: 'L2' }, triggerR: { text: 'R2' },
            btnSelect: { text: 'SHARE' }, btnStart: { text: 'OPT' }, btnHome: { text: '🎮' }
        },
        portrait: {
            stickL: { label: 'L3' }, stickR: { label: 'R3' },
            btnA: { text: '❌' }, btnB: { text: '⭕' }, btnX: { text: '🟦' }, btnY: { text: '△' },
            shoulderL: { text: 'L1' }, shoulderR: { text: 'R1' },
            btnSelect: { text: 'SHARE' }, btnStart: { text: 'OPT' }, btnHome: { text: '🎮' }
        }
    }),
    switch: mergeLayout(DEFAULT_LAYOUT, {
        landscape: { btnA: { text: 'A' }, btnB: { text: 'B' }, btnX: { text: 'Y' }, btnY: { text: 'X' } },
        portrait: { btnA: { text: 'A' }, btnB: { text: 'B' }, btnX: { text: 'Y' }, btnY: { text: 'X' } }
    }),
    gba: mergeLayout(DEFAULT_LAYOUT, {
        landscape: {
            stickL: { show: false }, stickR: { show: false },
            btnX: { show: false }, btnY: { show: false },
            triggerL: { show: false }, triggerR: { show: false },
            btnHome: { show: false }
        },
        portrait: {
            stickL: { show: false }, stickR: { show: false },
            btnX: { show: false }, btnY: { show: false },
            triggerL: { show: false }, triggerR: { show: false },
            btnHome: { show: false }
        }
    }),
    motion: mergeLayout(DEFAULT_LAYOUT, {
        landscape: { stickR: { show: false } },
        portrait: { stickR: { show: false } }
    })
};

const CONTROL_META = {
    stickL: { cls: 'v-stick left-stick', key: null, type: 'stick' },
    stickR: { cls: 'v-stick right-stick', key: null, type: 'stick' },
    btnA: { cls: 'v-btn btn-a', key: 0, type: 'btn' },
    btnB: { cls: 'v-btn btn-b', key: 1, type: 'btn' },
    btnX: { cls: 'v-btn btn-x', key: 2, type: 'btn' },
    btnY: { cls: 'v-btn btn-y', key: 3, type: 'btn' },
    shoulderL: { cls: 'v-btn shoulder-l small-btn', key: 4, type: 'btn' },
    shoulderR: { cls: 'v-btn shoulder-r small-btn', key: 5, type: 'btn' },
    triggerL: { cls: 'v-btn trigger-l trigger-btn', key: null, type: 'trigger' },
    triggerR: { cls: 'v-btn trigger-r trigger-btn', key: null, type: 'trigger' },
    btnSelect: { cls: 'v-btn btn-select small-btn', key: 6, type: 'btn' },
    btnStart: { cls: 'v-btn btn-start small-btn', key: 7, type: 'btn' },
    btnHome: { cls: 'v-btn btn-home small-btn', key: 10, type: 'btn' },
    dpadUp: { cls: 'v-btn dpad-up dpad-btn', key: 11, type: 'btn' },
    dpadDown: { cls: 'v-btn dpad-down dpad-btn', key: 12, type: 'btn' },
    dpadLeft: { cls: 'v-btn dpad-left dpad-btn', key: 13, type: 'btn' },
    dpadRight: { cls: 'v-btn dpad-right dpad-btn', key: 14, type: 'btn' }
};

// ==========================================
// 1b. 自定义预设管理
// ==========================================
function getCustomPresets() {
    try { return JSON.parse(localStorage.getItem('custom_presets')) || []; } catch { return []; }
}
function getPresetConfig() {
    const b = LAYOUT_CONFIG[currentPreset]?.[currentOrientation];
    if (b) return b;
    if (currentPreset && currentPreset.startsWith('custom_'))
        return JSON.parse(JSON.stringify(DEFAULT_LAYOUT[currentOrientation]));
    return null;
}

// ==========================================
// 2. 状态与渲染引擎
// ==========================================
let currentPreset = 'xbox';
let currentOrientation = 'portrait';
let isEditMode = false;
const virtualPad = document.getElementById('virtualPad');

function getOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

function renderControls() {
    virtualPad.innerHTML = '';
    const config = getPresetConfig();
    if (!config) return;

    // 先加载存储的 show 状态，确保刷新后隐藏正确
    const saved = JSON.parse(localStorage.getItem(getStorageKey()));
    if (saved) {
        Object.entries(saved).forEach(([id, p]) => {
            if (p.show !== undefined && config[id]) config[id].show = p.show;
        });
    }

    Object.entries(CONTROL_META).forEach(([id, meta]) => {
        const pos = config[id];
        if (!pos) return;
        // 编辑模式下渲染所有控件（含隐藏的）；普通模式跳过隐藏的
        if (!isEditMode && !pos.show) return;

        const el = document.createElement('div');
        el.className = meta.cls;
        el.dataset.controlId = id;
        if (meta.key !== null) el.dataset.key = meta.key;
        if (meta.type === 'stick') el.id = id;

        el.style.left = `${pos.x}%`;
        el.style.top = `${pos.y}%`;
        el.style.transform = 'translate(-50%, -50%)'; // 纯居中，无旋转

        if (meta.type === 'stick') {
            const label = pos.label || (id === 'stickL' ? 'L' : 'R');
            el.innerHTML = `<div class="v-stick-knob"></div><div class="v-stick-label">${label}</div>`;
        } else if (meta.type === 'trigger') {
            el.innerHTML = `<div class="trigger-track"><div class="trigger-fill"></div></div><div class="trigger-thumb"></div><span class="trigger-text">${pos.text || getDefaultText(id)}</span>`;
        } else {
            el.textContent = pos.text || getDefaultText(id);
        }

        // 编辑模式：显隐切换 + 按键码值显示
        if (isEditMode) {
            if (!pos.show) el.classList.add('v-hidden');
            const toggle = document.createElement('div');
            toggle.className = 'vis-toggle';
            toggle.textContent = pos.show ? '👁' : '👁‍🗨';
            toggle.addEventListener('touchstart', (e) => e.stopPropagation());
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                pos.show = !pos.show;
                toggle.textContent = pos.show ? '👁' : '👁‍🗨';
                el.classList.toggle('v-hidden');
                saveCustomLayout(true);
            });
            el.appendChild(toggle);
            // 按键码值标签
            const keyTag = document.createElement('div');
            keyTag.className = 'key-tag';
            if (meta.key !== null) {
                keyTag.textContent = `#${meta.key}`;
            } else if (id === 'stickL') {
                keyTag.textContent = '#8(L3)';
            } else if (id === 'stickR') {
                keyTag.textContent = '#9(R3)';
            } else if (meta.type === 'trigger') {
                keyTag.textContent = 'ANA';
            }
            el.appendChild(keyTag);
        }

        virtualPad.appendChild(el);
    });

    loadCustomLayout();
}

function getDefaultText(id) {
    const m = {
        btnA:'A', btnB:'B', btnX:'X', btnY:'Y',
        shoulderL:'LB', shoulderR:'RB', triggerL:'LT', triggerR:'RT',
        btnSelect:'SEL', btnStart:'START', btnHome:'HOME',
        dpadUp:'↑', dpadDown:'↓', dpadLeft:'←', dpadRight:'→'
    };
    return m[id] || '';
}

// ==========================================
// 3. 安全区动态计算
// ==========================================
function updateSafeArea() {
    const topH = document.querySelector('.top-bar').offsetHeight;
    const bottomH = document.querySelector('.bottom-bar').offsetHeight;
    virtualPad.style.top = `${topH}px`;
    virtualPad.style.bottom = `${bottomH}px`;
    virtualPad.style.height = `calc(100% - ${topH + bottomH}px)`;
}

window.addEventListener('resize', () => {
    updateSafeArea();
    // 窗口大小变化时检测横竖屏切换
    const newOrient = getOrientation();
    if (newOrient !== currentOrientation) {
        currentOrientation = newOrient;
        renderControls();
    }
});
new ResizeObserver(updateSafeArea).observe(document.querySelector('.top-bar'));
new ResizeObserver(updateSafeArea).observe(document.querySelector('.bottom-bar'));

// ==========================================
// 4. 防串扰存储
// ==========================================
function getStorageKey() { return `layout_${currentPreset}_${currentOrientation}`; }

function saveCustomLayout(silent) {
    const custom = {};
    virtualPad.querySelectorAll('[data-control-id]').forEach(el => {
        custom[el.dataset.controlId] = {
            left: el.style.left,
            top: el.style.top,
            show: !el.classList.contains('v-hidden')
        };
    });
    localStorage.setItem(getStorageKey(), JSON.stringify(custom));
    if (!silent) alert(`✅ ${currentPreset} ${currentOrientation === 'landscape' ? '横屏' : '竖屏'} 布局已保存`);
}

function loadCustomLayout() {
    const saved = JSON.parse(localStorage.getItem(getStorageKey()));
    if (!saved) return;
    virtualPad.querySelectorAll('[data-control-id]').forEach(el => {
        const p = saved[el.dataset.controlId];
        if (p) {
            el.style.left = p.left;
            el.style.top = p.top;
            el.style.transform = 'translate(-50%, -50%)';
        }
    });
}

// ==========================================
// 4b. 布局导出 / 导入
// ==========================================
async function exportLayout() {
    const data = {};
    const presets = ['xbox', 'ps', 'switch', 'gba', 'motion', ...getCustomPresets()];
    const orientations = ['landscape', 'portrait'];
    presets.forEach(p => {
        orientations.forEach(o => {
            const key = `layout_${p}_${o}`;
            const saved = localStorage.getItem(key);
            if (saved) data[key] = JSON.parse(saved);
        });
    });
    const text = JSON.stringify(data, null, 2);
    const filename = `MotionDSU_布局_${new Date().toISOString().slice(0,10)}.json`;

    // 1) 尝试 Web Share API (移动端原生分享菜单)
    const file = new File([text], filename, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: filename }); return; }
        catch (e) { /* cancelled */ }
    }

    // 2) 复制到剪贴板 (所有浏览器都支持)
    try {
        await navigator.clipboard.writeText(text);
        alert('✅ 配置已复制到剪贴板\n新建文件粘贴后保存为 .json 即可导入');
    } catch (e) {
        prompt('请复制以下内容保存为 .json 文件后导入:', text);
    }
}

function importLayout(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            let count = 0;
            Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith('layout_')) {
                    localStorage.setItem(key, JSON.stringify(value));
                    count++;
                }
            });
            alert(`✅ 已导入 ${count} 个布局配置`);
            renderControls();
        } catch(err) {
            alert('❌ 导入失败: ' + err.message);
        }
    };
    reader.readAsText(file);
}

document.getElementById('exportBtn').addEventListener('click', exportLayout);
document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) importLayout(e.target.files[0]);
    e.target.value = '';
});

// ==========================================
// 5. 编辑模式 — 拖拽 + 多选 + 对齐辅助 + 排列
// ==========================================
let dragTarget = null, dragOffsetX = 0, dragOffsetY = 0;
const editModeBtn = document.getElementById('editModeBtn');

let selectedControls = new Set();
let alignGuides = [];
let tapStart = {x:0,y:0};
let tapMoved = false;

editModeBtn.addEventListener('click', () => {
    isEditMode = !isEditMode;
    if (isEditMode) { clearSelection(); resetOutOfBounds(); }
    else saveCustomLayout();
    renderControls();
    virtualPad.classList.toggle('edit-mode', isEditMode);
    editModeBtn.classList.toggle('active', isEditMode);
    editModeBtn.textContent = isEditMode ? '💾 保存布局' : '✏️ 编辑布局';
});

function resetOutOfBounds() {
    const r = virtualPad.getBoundingClientRect();
    virtualPad.querySelectorAll('[data-control-id]').forEach(el => {
        const er = el.getBoundingClientRect();
        if (er.left < r.left || er.top < r.top || er.right > r.right || er.bottom > r.bottom) {
            el.style.left = '50%'; el.style.top = '50%';
            el.style.transform = 'translate(-50%, -50%)';
        }
    });
}

// ----- 多选 -----
function toggleSelection(el) {
    const id = el.dataset.controlId;
    if (selectedControls.has(id)) { selectedControls.delete(id); el.classList.remove('selected'); }
    else { selectedControls.add(id); el.classList.add('selected'); }
    updateAlignToolbar();
}
function clearSelection() {
    selectedControls.clear();
    virtualPad.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    updateAlignToolbar();
}

// ----- 对齐辅助线 -----
const ALIGN_THRESH = 6;
function clearGuides() { alignGuides.forEach(g=>g.remove()); alignGuides=[]; }

function showGuideLine(axis, pos, pr) {
    const g = document.createElement('div'); g.className='align-guide';
    if (axis==='h') g.style.cssText=`position:absolute;left:0;right:0;top:${pos-pr.top}px;height:1px;border-top:1px dashed #00d4ff;pointer-events:none;z-index:999;`;
    else g.style.cssText=`position:absolute;top:0;bottom:0;left:${pos-pr.left}px;width:1px;border-left:1px dashed #00d4ff;pointer-events:none;z-index:999;`;
    virtualPad.appendChild(g); alignGuides.push(g);
}

function findSnap(dr, others) {
    const d = {l:dr.left,r:dr.right,cx:dr.left+dr.width/2,t:dr.top,b:dr.bottom,cy:dr.top+dr.height/2};
    let sx=null,sy=null,gx=null,gy=null;
    const ve=['l','cx','r'],he=['t','cy','b'];
    for (const o of others) {
        const oo={l:o.left,r:o.right,cx:o.left+o.width/2,t:o.top,b:o.bottom,cy:o.top+o.height/2};
        for (const de of ve) for (const oe of ve) { const df=d[de]-oo[oe]; if (Math.abs(df)<ALIGN_THRESH) { sx=oo[oe]-d[de]; gx=oo[oe]; } }
        for (const de of he) for (const oe of he) { const df=d[de]-oo[oe]; if (Math.abs(df)<ALIGN_THRESH) { sy=oo[oe]-d[de]; gy=oo[oe]; } }
    }
    return {dx:sx,dy:sy,guideX:gx,guideY:gy};
}

// ----- 排列工具栏 (可拖动) -----
let tbDragOff = null;
function updateAlignToolbar() {
    let bar = document.getElementById('alignToolbar');
    if (selectedControls.size<2) { if (bar) bar.remove(); tbDragOff=null; return; }
    if (!bar) {
        bar=document.createElement('div'); bar.id='alignToolbar'; bar.className='align-toolbar';
        const n=selectedControls.size;
        bar.innerHTML=`<div class="tb-handle"><span class="tb-dots">⠿</span></div>
<div class="tb-row tb-hdr"><span class="tb-count">已选 ${n}</span><button class="tb-desel">取消选择</button></div>
<div class="tb-row"><span>水平</span><button data-a="L">L</button><button data-a="CX">CX</button><button data-a="R">R</button><button data-a="DH">↔</button></div>
<div class="tb-row"><span>垂直</span><button data-a="T">T</button><button data-a="CY">CY</button><button data-a="B">B</button><button data-a="DV">↕</button></div>`;
        virtualPad.appendChild(bar);
        bar.querySelectorAll('button:not(.tb-desel)').forEach(b=>b.addEventListener('touchstart',e=>{ e.stopPropagation(); alignSelected(b.dataset.a); }));
        bar.querySelector('.tb-desel')?.addEventListener('touchstart',e=>{ e.stopPropagation(); clearSelection(); });
        // 拖拽手柄
        bar.querySelector('.tb-handle').addEventListener('touchstart',e=>{ const r=bar.getBoundingClientRect(); tbDragOff={x:e.touches[0].clientX-r.left,y:e.touches[0].clientY-r.top}; e.stopPropagation(); },{passive:false});
        // 恢复上次拖拽位置
        try {
            const tp = JSON.parse(localStorage.getItem(`tbPos_${currentPreset}_${currentOrientation}`));
            if (tp) { bar.style.left=tp.x+'%'; bar.style.top=tp.y+'%'; bar.style.bottom='auto'; bar.style.transform='translate(-50%,-50%)'; }
        } catch {}
    }
}


function moveElBy(el, dx, dy, pr) {
    const cl=parseFloat(el.style.left)||50, ct=parseFloat(el.style.top)||50;
    if (dx) el.style.left=`${Math.max(5,Math.min(95,cl+(dx/pr.width)*100))}%`;
    if (dy) el.style.top=`${Math.max(5,Math.min(95,ct+(dy/pr.height)*100))}%`;
}

function alignSelected(mode) {
    const els=[...virtualPad.querySelectorAll('[data-control-id]')].filter(el=>selectedControls.has(el.dataset.controlId));
    if (els.length<2) return;
    const pr=virtualPad.getBoundingClientRect();
    const info=els.map(el=>({el,rect:el.getBoundingClientRect()}));
    switch(mode) {
        case 'L': { const m=Math.min(...info.map(i=>i.rect.left)); info.forEach(i=>moveElBy(i.el,m-i.rect.left,0,pr)); break; }
        case 'CX': { const m=info.reduce((s,i)=>s+i.rect.left+i.rect.width/2,0)/info.length; info.forEach(i=>moveElBy(i.el,m-(i.rect.left+i.rect.width/2),0,pr)); break; }
        case 'R': { const m=Math.max(...info.map(i=>i.rect.right)); info.forEach(i=>moveElBy(i.el,m-i.rect.right,0,pr)); break; }
        case 'T': { const m=Math.min(...info.map(i=>i.rect.top)); info.forEach(i=>moveElBy(i.el,0,m-i.rect.top,pr)); break; }
        case 'CY': { const m=info.reduce((s,i)=>s+i.rect.top+i.rect.height/2,0)/info.length; info.forEach(i=>moveElBy(i.el,0,m-(i.rect.top+i.rect.height/2),pr)); break; }
        case 'B': { const m=Math.max(...info.map(i=>i.rect.bottom)); info.forEach(i=>moveElBy(i.el,0,m-i.rect.bottom,pr)); break; }
        case 'DH': {
            info.sort((a,b)=>a.rect.left-b.rect.left);
            const start=info[0].rect.left, end=info[info.length-1].rect.right;
            const gap=((end-start)-info.reduce((s,i)=>s+i.rect.width,0))/(info.length-1);
            let cur=start; for(const i of info) { moveElBy(i.el,cur-i.rect.left,0,pr); cur+=i.rect.width+gap; }
            break;
        }
        case 'DV': {
            info.sort((a,b)=>a.rect.top-b.rect.top);
            const start=info[0].rect.top, end=info[info.length-1].rect.bottom;
            const gap=((end-start)-info.reduce((s,i)=>s+i.rect.height,0))/(info.length-1);
            let cur=start; for(const i of info) { moveElBy(i.el,0,cur-i.rect.top,pr); cur+=i.rect.height+gap; }
            break;
        }
    }
}

let dragGroup = null;

// ----- 编辑模式触控 -----
virtualPad.addEventListener('touchstart', (e) => {
    if (!isEditMode) return; e.preventDefault();
    const t=e.touches[0];
    if (e.target?.closest?.('.align-toolbar')||e.target?.classList?.contains('vis-toggle')) return;
    const ctrl=document.elementFromPoint(t.clientX,t.clientY)?.closest('[data-control-id]');
    if (!ctrl) return;
    tapStart={x:t.clientX,y:t.clientY}; tapMoved=false; clearGuides();
    dragTarget=ctrl; const r=ctrl.getBoundingClientRect();
    dragOffsetX=t.clientX-r.left; dragOffsetY=t.clientY-r.top;
    // 群体拖拽：触摸已选元素 + 有其他已选元素时，整组移动
    dragGroup = (selectedControls.has(ctrl.dataset.controlId) && selectedControls.size > 1)
        ? [...virtualPad.querySelectorAll('[data-control-id]')]
            .filter(el=>selectedControls.has(el.dataset.controlId))
            .map(el=>({el, sl:parseFloat(el.style.left)||50, st:parseFloat(el.style.top)||50}))
        : null;
}, {passive:false});

document.addEventListener('touchmove', (e) => {
    const bar=document.getElementById('alignToolbar');
    if (bar&&tbDragOff) {
        const t=e.touches[0], pr=virtualPad.getBoundingClientRect(), br=bar.getBoundingClientRect();
        let nx=((t.clientX-tbDragOff.x-pr.left+br.width/2)/pr.width)*100;
        let ny=((t.clientY-tbDragOff.y-pr.top+br.height/2)/pr.height)*100;
        nx=Math.max(5,Math.min(95,nx)); ny=Math.max(5,Math.min(95,ny));
        bar.style.left=`${nx}%`; bar.style.top=`${ny}%`; bar.style.bottom='auto'; bar.style.transform='translate(-50%,-50%)';
        localStorage.setItem(`tbPos_${currentPreset}_${currentOrientation}`, JSON.stringify({x:nx,y:ny}));
        return;
    }
    if (!isEditMode||!dragTarget) return; e.preventDefault();
    const t=e.touches[0];
    if (Math.abs(t.clientX-tapStart.x)>4||Math.abs(t.clientY-tapStart.y)>4) tapMoved=true;
    if (!tapMoved) return;
    const pr=virtualPad.getBoundingClientRect(), er=dragTarget.getBoundingClientRect();
    let nx=((t.clientX-dragOffsetX-pr.left+er.width/2)/pr.width)*100;
    let ny=((t.clientY-dragOffsetY-pr.top+er.height/2)/pr.height)*100;
    clearGuides();
    const others=[...virtualPad.querySelectorAll('[data-control-id]')].filter(el=>el!==dragTarget).map(el=>el.getBoundingClientRect());
    const snap=findSnap(er,others);
    if (snap.dx!==null) showGuideLine('v',snap.guideX,pr);
    if (snap.dy!==null) showGuideLine('h',snap.guideY,pr);
    nx=Math.max(5,Math.min(95,nx)); ny=Math.max(5,Math.min(95,ny));
    dragTarget.style.left=`${nx}%`; dragTarget.style.top=`${ny}%`; dragTarget.style.transform='translate(-50%,-50%)';
    // 群体移动
    if (dragGroup) {
        const me=dragGroup.find(g=>g.el===dragTarget);
        if (me) {
            const dx=nx-me.sl, dy=ny-me.st;
            dragGroup.forEach(item=>{
                if (item.el===dragTarget) return;
                item.el.style.left=`${Math.max(5,Math.min(95,item.sl+dx))}%`;
                item.el.style.top=`${Math.max(5,Math.min(95,item.st+dy))}%`;
                item.el.style.transform='translate(-50%,-50%)';
            });
        }
    }
}, {passive:false});

document.addEventListener('touchend', () => {
    tbDragOff=null; dragGroup=null;
    if (!isEditMode) return;
    if (dragTarget&&!tapMoved) toggleSelection(dragTarget);
    clearGuides(); dragTarget=null; tapMoved=false;
});

// ==========================================
// 6. 预设管理 & 切换
// ==========================================
function initPresetSelect() {
    const sel = document.getElementById('presetSelect');
    const cur = sel.value || currentPreset;
    sel.innerHTML = '';
    const opts = [
        {v:'__add__', t:'+ 新建预设'},
        {v:'__del__', t:'- 删除预设'},
        {v:'', t:'── 内置 ──', d:true}
    ];
    const builtins = ['xbox', 'ps', 'switch', 'gba', 'motion'];
    const labels = {xbox:'Xbox', ps:'PlayStation', switch:'Switch', gba:'GBA', motion:'体感专用'};
    builtins.forEach(p => opts.push({v:p, t:labels[p]}));
    const c = getCustomPresets();
    if (c.length) {
        opts.push({v:'', t:'── 自定 ──', d:true});
        c.forEach(p => opts.push({v:p, t:p.replace(/^custom_/,'')}));
    }
    opts.forEach(({v,t,d}) => {
        const o = document.createElement('option');
        if (d) o.disabled = true;
        o.value = v; o.textContent = t;
        sel.appendChild(o);
    });
    sel.value = cur && builtins.includes(cur) ? cur : (c.includes(cur) ? cur : 'xbox');
}
document.getElementById('presetSelect').addEventListener('change', (e) => {
    const v = e.target.value;
    if (v === '__add__') {
        const name = prompt('新预设名称：');
        if (name && name.trim()) {
            const key = 'custom_' + name.trim();
            const list = getCustomPresets();
            if (list.includes(key)) { alert('预设名已存在'); }
            else {
                currentPreset = key; saveCustomLayout(true);
                list.push(key); localStorage.setItem('custom_presets', JSON.stringify(list));
                initPresetSelect(); document.getElementById('presetSelect').value = key;
                document.body.className = `preset-${currentPreset}`; renderControls();
            }
        }
        initPresetSelect(); return;
    }
    if (v === '__del__') {
        if (currentPreset.startsWith('custom_') && confirm(`删除预设「${currentPreset.replace(/^custom_/,'')}」？`)) {
            const list = getCustomPresets().filter(p => p !== currentPreset);
            localStorage.setItem('custom_presets', JSON.stringify(list));
            ['landscape','portrait'].forEach(o => localStorage.removeItem(`layout_${currentPreset}_${o}`));
            currentPreset = 'xbox'; initPresetSelect(); document.getElementById('presetSelect').value = 'xbox';
            document.body.className = 'preset-xbox'; renderControls();
        } else { initPresetSelect(); }
        return;
    }
    currentPreset = v;
    document.body.className = `preset-${currentPreset}`;
    renderControls();
});

// ==========================================
// 7. 触控输入 (含 L3/R3)
// ==========================================
const activeTouches = new Map();
let gamepadState = { buttons: 0, axes: [0,0,0,0], triggers: [0,0] };

virtualPad.addEventListener('touchstart', (e) => {
    if (isEditMode) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
        const el = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-control-id]');
        if (!el) continue;
        activeTouches.set(t.identifier, { element: el, startX: t.clientX, startY: t.clientY, moved: false });
        if (el.dataset.controlId === 'triggerL' || el.dataset.controlId === 'triggerR') {
            const rect = el.getBoundingClientRect();
            const relY = (t.clientY - rect.top) / rect.height;
            const val = Math.max(0, Math.min(1, relY));
            const f = el.querySelector('.trigger-fill'); if (f) f.style.height = `${val * 100}%`;
            const th = el.querySelector('.trigger-thumb'); if (th) th.style.top = `${val * 100}%`;
            el.classList.add('pressed');
            if (el.dataset.controlId === 'triggerL') gamepadState.triggers[0] = val;
            else gamepadState.triggers[1] = val;
        } else if (el.classList.contains('v-btn')) {
            gamepadState.buttons |= (1 << parseInt(el.dataset.key));
            el.classList.add('pressed');
        }
    }
}, { passive: false });

virtualPad.addEventListener('touchmove', (e) => {
    if (isEditMode) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
        const d = activeTouches.get(t.identifier);
        if (!d) continue;
        if (d.element.classList.contains('v-stick')) {
            const dx = t.clientX - d.startX, dy = t.clientY - d.startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
            const max = 45, dist = Math.sqrt(dx*dx+dy*dy);
            const cd = Math.min(dist, max), ang = Math.atan2(dy, dx);
            const cdx = Math.cos(ang)*cd, cdy = Math.sin(ang)*cd;
            d.element.querySelector('.v-stick-knob').style.transform = 
                `translate(calc(-50% + ${cdx}px), calc(-50% + ${cdy}px))`;
            const nx = cdx/max, ny = -cdy/max;
            if (d.element.id === 'stickL') { gamepadState.axes[0]=nx; gamepadState.axes[1]=ny; }
            else { gamepadState.axes[2]=nx; gamepadState.axes[3]=ny; }
        } else if (d.element.dataset.controlId === 'triggerL' || d.element.dataset.controlId === 'triggerR') {
            const rect = d.element.getBoundingClientRect();
            const relY = (t.clientY - rect.top) / rect.height;
            const val = Math.max(0, Math.min(1, relY));
            const f = d.element.querySelector('.trigger-fill'); if (f) f.style.height = `${val * 100}%`;
            const th = d.element.querySelector('.trigger-thumb'); if (th) th.style.top = `${val * 100}%`;
            if (d.element.dataset.controlId === 'triggerL') gamepadState.triggers[0] = val;
            else gamepadState.triggers[1] = val;
        }
    }
}, { passive: false });

virtualPad.addEventListener('touchend', (e) => {
    if (isEditMode) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
        const d = activeTouches.get(t.identifier);
        if (!d) continue;
        if (d.element.dataset.controlId === 'triggerL') { gamepadState.triggers[0] = 0; d.element.classList.remove('pressed'); const f = d.element.querySelector('.trigger-fill'); if (f) f.style.height = '0%'; const th = d.element.querySelector('.trigger-thumb'); if (th) th.style.top = '0%'; }
        else if (d.element.dataset.controlId === 'triggerR') { gamepadState.triggers[1] = 0; d.element.classList.remove('pressed'); const f = d.element.querySelector('.trigger-fill'); if (f) f.style.height = '0%'; const th = d.element.querySelector('.trigger-thumb'); if (th) th.style.top = '0%'; }
        else if (d.element.classList.contains('v-btn')) {
            gamepadState.buttons &= ~(1 << parseInt(d.element.dataset.key));
            d.element.classList.remove('pressed');
        } else if (d.element.classList.contains('v-stick')) {
            if (!d.moved) {
                const btn = d.element.id === 'stickL' ? 8 : 9;
                gamepadState.buttons |= (1 << btn);
                setTimeout(() => { gamepadState.buttons &= ~(1 << btn); }, 60);
            }
            d.element.querySelector('.v-stick-knob').style.transform = 'translate(-50%,-50%)';
            if (d.element.id === 'stickL') { gamepadState.axes[0]=0; gamepadState.axes[1]=0; }
            else { gamepadState.axes[2]=0; gamepadState.axes[3]=0; }
        }
        activeTouches.delete(t.identifier);
    }
}, { passive: false });

// ==========================================
// 8. 体感 & WebSocket
// ==========================================
let gyroData={x:0,y:0,z:0}, accelData={x:0,y:0,z:0};
// 陀螺仪积分累加器，用于客户端立方体
let cubeRot = {pitch:0, yaw:0, roll:0};
let lastMotionTs = 0;
const motionToggle = document.getElementById('motionToggle');
const motionVisual = document.getElementById('motionVisual');
const cube = document.querySelector('.cube');
const gyroDisplay = document.querySelector('.gyro-data');
const accelDisplay = document.querySelector('.accel-data');
// const orientationStatus = document.getElementById('orientationStatus');
let motionHandler = null;
let wakeLock = null;

async function requestWakeLock() {
    try { wakeLock = await navigator.wakeLock?.request('screen'); }
    catch(e) { /* wake lock not supported */ }
}

function updateVisualization() {
    const a = accelData;
    const g = gyroData;
    // 陀螺仪积分累计角（同 DSU 映射: beta→pitch, alpha→yaw, gamma→roll）
    if (cube) cube.style.transform = `rotateX(${cubeRot.pitch}deg) rotateY(${cubeRot.roll}deg) rotateZ(${cubeRot.yaw}deg)`;
    if (gyroDisplay) gyroDisplay.textContent = `陀螺仪: X=${(g.x||0).toFixed(1)} Y=${(g.y||0).toFixed(1)} Z=${(g.z||0).toFixed(1)}`;
    if (accelDisplay) accelDisplay.textContent = `加速度: X=${(a.x||0).toFixed(1)} Y=${(a.y||0).toFixed(1)} Z=${(a.z||0).toFixed(1)}`;
}

function startSensor() {
    if (motionHandler) return;
    motionHandler = (e) => {
        const r=e.rotationRate||{}, a=e.accelerationIncludingGravity||{};
        const gx = r.alpha != null ? r.alpha : (r.x || 0);
        const gy = r.beta != null ? r.beta : (r.y || 0);
        const gz = r.gamma != null ? r.gamma : (r.z || 0);
        gyroData={x:gx, y:gy, z:gz};
        accelData={x:a.x||0,y:a.y||0,z:a.z||0};
        // 陀螺仪积分: 累积角 += 角速度(°/s) × Δt(s) (仅体感开启时)
        if (motionToggle.checked) {
            const ts = e.timeStamp;
            if (lastMotionTs) {
                const dt = (ts - lastMotionTs) / 1000;
                if (dt > 0 && dt < 0.5) {
                    // 检测横竖屏: 竖屏 0°/180°, 横屏 90°/270°
                    const angle = screen.orientation ? screen.orientation.angle : 0;
                    const isLandscape = angle % 180 !== 0;
                    // var orientation = (screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
                    // const isLandscape = orientation == "landscape-primary"; //"portrait-primary";
                    // 屏幕水平/垂直轴 → 手机物理轴映射:
                    //   竖屏: 水平轴 = X(beta=前后), 垂直轴 = Y(gamma=左右)
                    //   横屏: 水平轴 = Y(gamma=前后), 垂直轴 = X(beta=左右)
                    const pitchRate = isLandscape ? gy : gx;  // 前后倾斜速率
                    const rollRate  = isLandscape ? gx : gy;  // 左右翻转速率
                    cubeRot.pitch += pitchRate * dt;
                    cubeRot.roll  += rollRate * dt;
                    cubeRot.yaw   += gz * dt * -1;  // 自旋 (alpha, 始终不变)
                    // orientationStatus.textContent = isLandscape ? "横屏" : "竖屏";
                }
            }
            lastMotionTs = ts;
        } else {
            lastMotionTs = 0;
        }
        if (!window._visFrame) {
            window._visFrame = true;
            requestAnimationFrame(() => {
                window._visFrame = false;
                updateVisualization();
            });
        }
    };
    window.addEventListener('devicemotion', motionHandler);
}

function stopSensor() {
    if (!motionHandler) return;
    window.removeEventListener('devicemotion', motionHandler);
    motionHandler = null;
    gyroData = {x:0, y:0, z:0};
    accelData = {x:0, y:0, z:0};
    cubeRot = {pitch:0, yaw:0, roll:0};
    lastMotionTs = 0;
    updateVisualization();
}

motionToggle.addEventListener('change', async () => {
    const on = motionToggle.checked;
    motionVisual.classList.toggle('hidden', !on);
    if (on) {
        requestWakeLock();
    } else {
        if (wakeLock) { wakeLock.release(); wakeLock = null; }
        cubeRot = {pitch:0, yaw:0, roll:0};
        lastMotionTs = 0;
        updateVisualization();
    }
});

let socket;
const statusEl = document.getElementById('statusBox');
const connectBtn = document.getElementById('connectBtn');
connectBtn.addEventListener('click', async () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
        return;
    }
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
        try {
            if (await DeviceMotionEvent.requestPermission() !== 'granted') {
                alert('⚠️ 体感权限被拒，无法获取运动数据');
            }
        } catch(e) {}
    }
    const proto = location.protocol==='https:'?'wss:':'ws:';
    socket = new WebSocket(`${proto}//${location.host}/ws`);
    socket.onopen = () => {
        statusEl.textContent='✅ 已连接'; statusEl.className='connected';
        connectBtn.textContent='断开'; connectBtn.classList.add('connected');
        startSensor();  // 连接后立即启动体感(含重力), DSU 始终有有效重力数据
    };
    socket.onclose = () => {
        statusEl.textContent='❌ 断开'; statusEl.className='disconnected';
        connectBtn.textContent='连接'; connectBtn.classList.remove('connected');
        stopSensor();
    };
    socket.onerror = () => {
        statusEl.textContent='❌ 错误'; statusEl.className='disconnected';
        connectBtn.textContent='连接'; connectBtn.classList.remove('connected');
        stopSensor();
    };
});

let lastDataStr = '';
let idleFrames = 0;

function buildPacket() {
    const gyro = motionToggle.checked ? gyroData : {x:0, y:0, z:0};
    return JSON.stringify({
        timestamp: Date.now()/1000, gyroscope: gyro, accelerometer: accelData,
        buttons: gamepadState.buttons, axes: gamepadState.axes, triggers: gamepadState.triggers
    });
}

function dataChanged() {
    const g = motionToggle.checked ? gyroData : {x:0, y:0, z:0};
    const sig = JSON.stringify({g:g, a:accelData, b:gamepadState.buttons, x:gamepadState.axes, t:gamepadState.triggers});
    if (sig !== lastDataStr) { lastDataStr = sig; return true; }
    return false;
}

setInterval(() => {
    if (socket?.readyState !== WebSocket.OPEN) return;
    
    if (motionToggle.checked) {
        socket.send(buildPacket());
        idleFrames = 0;
        return;
    }
    
    if (dataChanged()) {
        socket.send(buildPacket());
        idleFrames = 0;
    } else {
        idleFrames++;
        if (idleFrames >= 60) {
            socket.send(buildPacket());
            idleFrames = 0;
        }
    }
}, 16);

// ==========================================
// 9. 初始化
// ==========================================
currentOrientation = getOrientation();
document.body.className = `preset-${currentPreset}`;
initPresetSelect();
renderControls();
updateSafeArea();