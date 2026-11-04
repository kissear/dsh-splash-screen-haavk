/* ============================================================================
 * 2026-10-18 三个新功能的冒烟测试
 *
 *   1) 自动播放三档：full（完全自动）/ once（仅需点击一次，需空密码）/ off（不自动）
 *      - 老配置只有 requireInteraction，必须按 true→off、false→full 迁移
 *   2) 降世事件窗口：默认关闭；装好后的首次启动弹一次；勾选后每次都弹
 *   3) 人物立绘「空」：mascot = -1 时不渲染任何立绘图片
 *
 * 做法与 smoke-splash.mjs 一致：最小 DOM 桩 + vm 里跑真实的 splash.js。
 * 运行时状态（C）挂在 __DSH_STARTUP_API__.config 上，直接断言它。
 *
 * 用法：node test/new-options.mjs
 * ========================================================================== */
import fs from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const BUNDLE = fileURLToPath(new URL('../lib/splash.js', import.meta.url))
const HOST = fileURLToPath(new URL('../lib/index.js', import.meta.url))

let pass = 0
let fail = 0
function check(label, ok, extra) {
  if (ok) { pass++; console.log('  ok   ' + label) }
  else { fail++; console.log('  FAIL ' + label + (extra !== undefined ? '  → ' + extra : '')) }
}

/* ── 最小 DOM 桩（与 smoke-splash.mjs 同款，够用即可）───────────────────── */
function makeEl(tag) {
  const el = {
    tagName: tag,
    _cls: '',
    _text: '',
    _html: '',
    style: { setProperty() {}, removeProperty() {} },
    dataset: {},
    children: [],
    hidden: false,
    offsetWidth: 1,
    parentNode: null,
    appendChild(c) { this.children.push(c); if (c) c.parentNode = this; return c },
    insertBefore(c) { this.children.unshift(c); if (c) c.parentNode = this; return c },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c },
    setAttribute() {},
    getAttribute() { return null },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    animate() { return { cancel() {}, finish() {} } },
    getTotalLength() { return 120 },
    querySelector(sel) { return lookup(sel) },
    querySelectorAll() { return [] },
    focus() {},
    contains() { return false },
  }
  Object.defineProperty(el, 'className', {
    get() { return el._cls },
    set(v) { el._cls = v == null ? '' : String(v) },
  })
  Object.defineProperty(el, 'textContent', {
    get() { return el._text },
    set(v) { el._text = v == null ? '' : String(v) },
  })
  Object.defineProperty(el, 'innerHTML', {
    get() { return el._html },
    set(v) { el._html = v == null ? '' : String(v); MARKUP = el._html },
  })
  el.classList = {
    add(...cs) { cs.forEach((c) => { if (!el._cls.split(' ').includes(c)) el._cls = (el._cls + ' ' + c).trim() }) },
    remove(...cs) { cs.forEach((c) => { el._cls = el._cls.split(' ').filter((x) => x && x !== c).join(' ') }) },
    toggle(c, on) {
      const has = el._cls.split(' ').includes(c)
      const want = on === undefined ? !has : !!on
      if (want && !has) el.classList.add(c)
      if (!want && has) el.classList.remove(c)
    },
    contains(c) { return el._cls.split(' ').includes(c) },
  }
  return el
}

let MARKUP = ''
/* 固定节点表：同一个选择器永远返回**同一个**节点，断言才看得见 splash.js 的操作 */
const FIXED = {}
function lookup(sel) {
  if (!sel) return null
  const key = String(sel)
  if (FIXED[key]) return FIXED[key]
  const m = /\.([A-Za-z0-9_-]+)/.exec(key)
  return m && MARKUP.includes(m[1]) ? makeEl('div') : null
}

/* ── 跑一次 splash.js ──────────────────────────────────────────────────────
   opts.storageSeen = true 表示"这台机器已经弹过首次事件窗口"
   opts.config    = 注入 window.__DSH_STARTUP__ 的配置
   返回：windowStub 上的 API、立绘节点上挂了几张图、事件层是否出现过 */
function run(opts) {
  MARKUP = ''
  const o = opts || {}
  const stored = {}
  if (o.storageSeen) stored['dsh-startup-screen:event-seen'] = '1'

  const root = makeEl('div')
  root._cls = 'dsu-root dsu-boot'
  const mascot = makeEl('div')
  const images = []
  /* querySelector 必须返回**同一个**节点，否则断言看到的是另一个对象 */
  const bySelector = { '.dsu-mascot': mascot }
  FIXED['.dsu-mascot'] = mascot

  const documentStub = {
    readyState: 'complete',
    head: makeEl('head'),
    body: makeEl('body'),
    documentElement: makeEl('html'),
    getElementById: (id) => (id === 'dsh-startup-root' ? root : null),
    createElement: (t) => {
      const el = makeEl(t)
      if (t === 'img') images.push(el)
      return el
    },    createElementNS: (_ns, t) => makeEl(t),
    querySelector: (sel) => (bySelector[String(sel)] || null),
    addEventListener() {},
    removeEventListener() {},
    querySelectorAll() { return [] },
  }

  const timers = []
  const windowStub = {
    __DSH_STARTUP__: Object.assign({
      enabled: true, mode: 'session', theme: 'light', speed: 1,
      /* 与 Host DEFAULTS 一致：1.3.1 时代 requireInteraction 出厂为 true */
      requireInteraction: true,
      identity: 'JOYCE MOORE', identityId: '0087', accessLevel: '3',
      voice: true, voiceLang: 'en', voiceName: '',
      sound: true, soundVolume: 0.5,
    }, o.config || {}),
    AudioContext: function () {
      return {
        state: 'running', currentTime: 0, sampleRate: 48000, destination: {},
        resume() {},
        createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} } },
        createGain() { return { gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} } },
        createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) } },
        createBufferSource() { return { buffer: null, connect() {}, start() {} } },
        createBiquadFilter() { return { type: '', frequency: { value: 0 }, Q: { value: 0 }, connect() {} } },
      }
    },
    location: { host: '127.0.0.1:3080', href: 'http://127.0.0.1:3080/' },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    sessionStorage: { getItem: () => null, setItem() {} },
    localStorage: {
      getItem: (k) => (k in stored ? stored[k] : null),
      setItem: (k, v) => { stored[k] = String(v) },
    },
    fetch: () => Promise.reject(new Error('no network in test')),
    requestAnimationFrame: (fn) => { fn(); return 1 },
    cancelAnimationFrame() {},
    /* 小延时同步跑（语音留白），时间线入队不自动跑：测试只关心配置与渲染 */
    setTimeout: (fn, ms) => {
      if ((ms || 0) <= 400) { fn(); return -1 }
      timers.push(fn)
      return timers.length
    },
    clearTimeout() {},
    setInterval: () => 1,
    clearInterval() {},
    CustomEvent: function (t) { this.type = t },
  }
  windowStub.window = windowStub

  const sandbox = {
    window: windowStub,
    document: documentStub,
    console: { log() {}, warn() {}, error() {} },
    Promise, Object, Array, JSON, String, Number, Math, Date, Error, RegExp, isFinite, parseInt,
    setTimeout: windowStub.setTimeout,
    clearTimeout: windowStub.clearTimeout,
    setInterval: windowStub.setInterval,
    clearInterval: windowStub.clearInterval,
    requestAnimationFrame: windowStub.requestAnimationFrame,
  }
  sandbox.globalThis = sandbox
  sandbox.self = sandbox

  vm.createContext(sandbox)
  let thrown = null
  try {
    vm.runInContext(fs.readFileSync(BUNDLE, 'utf8'), sandbox, { filename: 'splash.js' })
  } catch (e) { thrown = e }

  return {
    thrown,
    api: windowStub.__DSH_STARTUP_API__,
    stored,
    timers,
    mascot,
    mascotImages: images.filter((img) => img._cls === 'dsu-mascot-img'),
    root,
  }
}

/* ═══ 1. 自动播放三档 ════════════════════════════════════════════════════ */
console.log('\n[1] 自动播放三档')
{
  const full = run({ config: { autoPlay: 'full' } })
  check('full：初始化不抛异常', full.thrown === null, full.thrown && full.thrown.message)
  check('full：C.autoPlay = full', full.api && full.api.config.autoPlay === 'full', full.api && full.api.config.autoPlay)
  check('full：不再要求逐步确认（requireInteraction=false）', full.api && full.api.config.requireInteraction === false)

  const once = run({ config: { autoPlay: 'once' } })
  check('once：C.autoPlay = once', once.api && once.api.config.autoPlay === 'once', once.api && once.api.config.autoPlay)
  check('once：不进入逐步确认档', once.api && once.api.config.requireInteraction === false)

  const off = run({ config: { autoPlay: 'off' } })
  check('off：C.autoPlay = off', off.api && off.api.config.autoPlay === 'off')
  check('off：进入逐步确认档（第 1、2 步都停）', off.api && off.api.config.requireInteraction === true)

  /* 2026-10-19 回归（两次修复）：
     ① full 档曾经整块不加 .dsu-action 的 dsu-in，而身份资料卡住在它里面（默认 opacity:0），
        第二步的「身份名称/编号/权限等级」全看不见 → 改为只隐藏按钮与提示；
     ② 只改①还不够：stepLoop 在自动播放分支里紧接着调了 hideAction()，
        把刚加上的 dsu-in 又摘掉，卡片依旧不可见 → full 档不得再调 hideAction()。 */
  {
    const src = fs.readFileSync(BUNDLE, 'utf8')
    const block = /if \(C\.autoPlay === 'full'\) \{([\s\S]*?)\} else \{/.exec(src)
    const fullBranch = block ? block[1] : ''
    /* showAction 里不应该再出现「整块收起 dsu-action」；
       注意 hideAction() 里的 remove 是确认后收起的正常逻辑，不在检查范围 */
    const showActionBody = /function showAction\(step\) \{([\s\S]*?)\n  \}/.exec(src)
    check('full 档：身份卡容器仍然淡入（showAction 里不再整块移除 dsu-in）',
      !!showActionBody && !/ui\.action\.classList\.remove\('dsu-in'\)/.test(showActionBody[1]) &&
      /ui\.action\.classList\.add\('dsu-in'\)/.test(fullBranch))
    check('full 档：改成隐藏按钮与按键提示',
      /ui\.btn\.hidden = true/.test(fullBranch) && /ui\.hint\.hidden = true/.test(fullBranch))
    /* 核心：自动播放分支里 showAction 之后不能紧跟 hideAction（否则卡片又被藏起来） */
    check('自动播放分支不再紧跟 hideAction()（卡片得以保持可见）',
      !/showAction\(step\)\s*\n\s*hideAction\(\)/.test(src))
    check('离开第二步后卡片会被收起（不残留到后续步骤）',
      /step\.action !== 'confirm'[\s\S]{0,220}?ui\.card\.hidden = true/.test(src))
    const cssSrc2 = fs.readFileSync(new URL('../lib/splash.css', import.meta.url), 'utf8')
    check('CSS 补齐了 [hidden] 的 display:none（否则 inline-flex 会盖掉）',
      /\.dsu-btn\[hidden\],\s*\n\s*\.dsu-hint\[hidden\] \{ display: none !important; \}/.test(cssSrc2))
  }

  const bad = run({ config: { autoPlay: 'whatever' } })
  check('非法值回落到 off（保守，不擅自全自动）', bad.api && bad.api.config.autoPlay === 'off', bad.api && bad.api.config.autoPlay)

  const init = run({})
  check('不给 autoPlay 时按旧 requireInteraction 默认值 → off', init.api && init.api.config.autoPlay === 'off', init.api && init.api.config.autoPlay)
}

console.log('\n[2] 老配置迁移（真实 1.3.1 用户升级不会被打乱）')
{
  const oldOn = run({ config: { requireInteraction: true } })
  check('旧 requireInteraction=true → off（保持原样等确认）', oldOn.api && oldOn.api.config.autoPlay === 'off', oldOn.api && oldOn.api.config.autoPlay)
  const oldOff = run({ config: { requireInteraction: false } })
  check('旧 requireInteraction=false → full（原来就是全自动）', oldOff.api && oldOff.api.config.autoPlay === 'full', oldOff.api && oldOff.api.config.autoPlay)
  const both = run({ config: { autoPlay: 'once', requireInteraction: true } })
  check('新字段优先于旧字段', both.api && both.api.config.autoPlay === 'once', both.api && both.api.config.autoPlay)
}

console.log('\n[3] 仅需点击一次 + 密码的约定（该档要求空密码）')
{
  const src = fs.readFileSync(BUNDLE, 'utf8')
  check('once 档跳过第二步密码闸（否则「点一次」变成「必输密码」）',
    /if \(C\.autoPlay === 'once'\) needPwd = false/.test(src))
  check('once 档只在第一步（grant）等一次',
    /C\.autoPlay === 'once' && !\(step && step\.action === 'grant'\)/.test(src))
  check('off 档第 1、2 步都等',
    /C\.autoPlay === 'off' && !isWaitStep/.test(src))
}

/* ═══ 4. 降世事件窗口 ════════════════════════════════════════════════════ */
console.log('\n[4] 降世事件窗口：整体停用（两个字段都钉死为 false）')
{
  const fresh = run({})
  check('eventWindow 恒为 false', fresh.api && fresh.api.config.eventWindow === false, fresh.api && fresh.api.config.eventWindow)
  check('eventOnce 恒为 false（不再有「首次启动弹一次」）', fresh.api && fresh.api.config.eventOnce === false, fresh.api && fresh.api.config.eventOnce)

  const forced = run({ config: { eventWindow: true } })
  check('配置里强行写 true 也会被归一化回 false', forced.api && forced.api.config.eventWindow === false, forced.api && forced.api.config.eventWindow)

  const gateSrc = fs.readFileSync(BUNDLE, 'utf8')
  const cssSrc = fs.readFileSync(new URL('../lib/splash.css', import.meta.url), 'utf8')
  check('闸门只剩空壳（永远 resolve 0）',
    /function eventGate\(\) \{ return Promise\.resolve\(\) \}/.test(gateSrc))
  check('不再内置事件层 DOM 与事件图', !gateSrc.includes('dsu-event-card') && !gateSrc.includes('EVENT_SRC'))
  check('CSS 里事件层样式已清理', !cssSrc.includes('.dsu-event'))
  check('finish 直接移除 root',
    /root\.classList\.add\('dsu-gone'\)\s*\n\s*if \(root\.parentNode\) root\.parentNode\.removeChild\(root\)/.test(gateSrc))
}

console.log('\n[5] 人物立绘：素材已移除，整块常隐')
{
  const empty = run({ config: { mascot: -1 } })
  check('mascot = -1', empty.api && empty.api.config.mascot === -1, empty.api && empty.api.config.mascot)
  check('showMascot = false', empty.api && empty.api.config.showMascot === false)
  check('不往立绘容器里塞任何图片', empty.mascot.children.length === 0, '子节点 ' + empty.mascot.children.length)
  check('立绘容器保持隐藏', empty.mascot.hidden === true)

  const first = run({ config: { mascot: 0 } })
  check('配置写 0 也不渲染（mascot 被钉死 -1）', first.mascot.children.length === 0, '子节点 ' + first.mascot.children.length)
  check('showMascot 恒为 false', first.api && first.api.config.showMascot === false)

  const src = fs.readFileSync(BUNDLE, 'utf8')
  check('MASCOTS 已清空', /var MASCOTS = \[\]/.test(src))
  check('不残留立绘 base64 常量', !src.includes('MASCOT_SRC'))
}

console.log('\n[7] 音色只剩一套：line-*（其它音色素材已删）')
{
  const src = fs.readFileSync(BUNDLE, 'utf8')
  check('归一化里把 voiceName 钉成空', /out\.voiceName = ''/.test(src))
  check('归一化里把 voiceSource 钉成 asset', /out\.voiceSource = 'asset'/.test(src))
  const ad = fs.readFileSync(new URL('../lib/asset-data.js', import.meta.url), 'utf8')
  check('素材里仍有 line-1..6', ['1','2','3','4','5','6'].every((n) => ad.includes('"line-' + n + '"')))
  check('没有残留其它音色素材', !/line-(cn|cm|jp|ru|kr|rm)-/.test(ad))
  const client = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  check('设置面板不再有音色下拉', !client.includes("['cm-zh'") && !client.includes("['rm-ru'"))
  check('不再渲染音色选择控件', !client.includes('h(VoicePicker'))
}

console.log('\n[8] 图案只剩一款（HWAVIK）')
{
  const src = fs.readFileSync(BUNDLE, 'utf8')
  check('EMBLEM_SRC_EASTASIA 已删除', !src.includes('EMBLEM_SRC_EASTASIA'))
  check('EMBLEMS 只有一款', /var EMBLEMS = \[EMBLEM_SRC\]/.test(src))
  check('svgWhale 仍按 emblem 选图', /EMBLEMS\[idx\] \|\| EMBLEMS\[0\]/.test(src))
  check('svgWhale 对越界编号做兜底', /if \(!\(idx >= 0 && idx < EMBLEMS\.length\)\) idx = 0/.test(src))

  const host = fs.readFileSync(HOST, 'utf8')
  check('Host 默认 emblem = 0', /emblem: 0,/.test(host))
  check('Host 把 emblem 钉死为 0', /out\.emblem = 0/.test(host))

  const client = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  check('设置面板含「图案」字段', client.includes("label: '图案'"))
  check('图案下拉只有 HWAVIK', client.includes("options: [['0', 'HWAVIK']]"))
  check('不再出现「东亚防御倡议」选项', !client.includes("'东亚防御倡议'"))
}

console.log('\n============================')
console.log(`  通过 ${pass} / 失败 ${fail}`)
console.log('============================\n')
process.exit(fail === 0 ? 0 : 1)
