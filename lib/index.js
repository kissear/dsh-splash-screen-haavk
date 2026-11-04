/* ============================================================================
 * dsh-startup-screen — Host 半侧
 * ----------------------------------------------------------------------------
 * 做三件事：
 *   1) 在 index.html 里注入「启动界面」：首屏兜底黑幕 + 关键 CSS + 配置 + 运行时
 *   2) 提供 /dsh-startup/splash.css · splash.js · config 三个路由
 *   3) 把配置持久化到 ~/.dsh/dsh-startup.json（设置页经 /dsh-startup/config 读写）
 *
 * 说明：配置刻意不走 settings 命名空间，而是自带一份 JSON + 自带设置面板
 * （与 dsh-meme 同款做法），这样不受 dsh-settings 版本变更影响。
 * ========================================================================== */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const CONFIG_FILE = path.join(DSH_HOME, 'dsh-startup.json')

const NS = 'dsh-splash-screen-haavk'
const ROUTE_BASE = '/dsh-startup'
/** 开屏视频目录：lib/assets/videos/<bootVideo>。只认这些扩展名，其余一律 404。 */
const VIDEO_DIR = path.join(PACKAGE_ROOT, 'lib', 'assets', 'videos')
const VIDEO_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime'
}
/** 背景音乐目录 / 允许的音频扩展名 */
const MUSIC_DIR = path.join(PACKAGE_ROOT, 'lib', 'assets', 'music')
const AUDIO_TYPES = {
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.webm': 'audio/webm'
}

/** 插件版本：读自己的 package.json，避免源码与版本号两处各写一份。
    读不到就退回占位符（设置页会显示它，不会显示 undefined）。 */
const PLUGIN_VERSION = (() => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'))
    const v = String(pkg.version || '').trim()
    return v || '0.0.0'
  } catch (err) {
    return '0.0.0'
  }
})()

/** 默认配置：字段与 lib/splash.js 的 DEFAULTS 一一对应。 */
const DEFAULTS = {
  enabled: true,
  mode: 'session',            // session | daily（原 always 已删除，自动迁移到 session）
  theme: 'dark',             // 只剩深色（冷蓝）一套
  speed: 1,
  autoPlay: 'off',           // full=完全自动播放 / once=仅需点击一次进入（需空密码）/ off=不自动播放
  requireInteraction: true,   // 旧字段：仅用于把老配置迁移到 autoPlay
  allowSkip: true,
  sound: true,                // 界面音效（WebAudio 合成，无音频文件）
  soundVolume: 0.5,
  voice: true,                // 女声播报（Web Speech API）
  voiceLang: 'en',            // en | zh | both
  voiceName: 'zhixing-cn',              // '' = 自动挑（按分数优先神经网络女声）；另有 zhixing-cn / cm-zh / calmlady-jp / pessimistic-ru / rm-ru / announcer-kr 六档真声音色
  voiceRate: 0.88,            // 电影旁白档：比朗读慢，字与字之间才有重量
  voicePitch: 0.85,           // 压低音调，深沉的 AI 女声
  voiceVolume: 0.9,
  voiceCue: true,             // 念台词前的一声轻提示
  sfx: 'audio',               // 音效来源：audio=lib/assets 里的真素材 / synth=现场合成
  voiceSource: 'asset',       // 语音来源：asset=优先用真声素材（拿不到自动回落 TTS）/ tts=全 TTS
  voiceLead: 240,             // 提示音之后留一小段空白再开口
  mascot: -1,                 // 人物立绘已移除，恒为 -1（空）
  emblem: 0,                  // 中央/终幕图案：只有 0=HWAVIK
  eventWindow: false,         // 降世事件窗口已整体停用（钉死 false）
  bootVideo: 'intro.mp4',       // 开屏视频（随包附带，空 = 关闭）
  bootVideoSound: true,       // 开屏视频是否带声音（被自动播放策略拦下时自动转静音重播）
  bootVideoTransition: 'wash', // 视频结束后的过场：wash=原版过曝洗白 / dissolve=交叉溶解（片尾已含底板时更顺）
  bgmBoard: 'board-loop.m4a', // 底板/流程背景音乐（lib/assets/music/ 下，循环播放；空 = 关闭）
  bgmFinale: '',              // 终幕背景音乐（空 = 关闭；当前用空值，底板曲覆盖全程）
  bgmVolume: 0.35,             // 底板/流程 BGM 音量（素材已校准到 -18 LUFS，0.5 ≈ -24 LUFS）
  bgmFinaleVolume: 1,         // 终幕 BGM 音量（1.0 ≈ -18 LUFS，与开场视频持平）
  bootVideoVolume: 1,         // 开场视频音量（素材已校准到 -18 LUFS）
  identity: 'OPERATOR',  // ← 设置页里可改的「身份名称」
  identityId: 'A000001',
  accessLevel: '最高权限',
  identityPassword: '',       // ← 第二步身份确认的访问密码（空 = 不启用密码校验）
  brand1: '哈夫克集团',
  brand2: 'HAAVK GROUP · EST. 2035',
  brand3a: 'HAAVK',
  brand3b: '超算平台',
  orgZh: '哈夫克集团',
  orgEn: 'HAAVK GROUP',
  orgSub: '哈夫克，让世界更高效',
  welcomeBox: 'HAAVK LINK ESTABLISHED',
  footer: 'Powered By Mandelbrick',
  accent: '#4d8dff',
  glitchA: '#4d8dff',
  glitchB: '#8fbcff'
}

const TEXT_KEYS = [
  'identity', 'identityId', 'accessLevel',
  'brand1', 'brand2', 'brand3a', 'brand3b',
  'orgZh', 'orgEn', 'orgSub', 'welcomeBox', 'footer', 'voiceName', 'bootVideo', 'bgmBoard', 'bgmFinale'
]
const COLOR_KEYS = ['accent', 'glitchA', 'glitchB']
const ENUMS = {
  mode: ['session', 'daily'],
  theme: ['dark'],
  voiceLang: ['en', 'zh', 'both'],
  sfx: ['audio', 'synth'],
  voiceSource: ['asset', 'tts'],
  autoPlay: ['full', 'once', 'off'],
  bootVideoTransition: ['wash', 'dissolve']
}
const BOOL_KEYS = ['enabled', 'requireInteraction', 'allowSkip', 'sound', 'voice', 'voiceCue', 'eventWindow', 'bootVideoSound']
/** 数值字段的合法区间（越界即夹取）。 */
const RANGES = {
  speed: [0.35, 3],
  soundVolume: [0, 1],
  voiceRate: [0.5, 2],
  voiceLead: [0, 1200],
  voicePitch: [0, 2],
  voiceVolume: [0, 1],
  bgmVolume: [0, 1],
  bgmFinaleVolume: [0, 1],
  bootVideoVolume: [0, 1]
}

/** 旧字段的真假判定：老配置里可能是 true / 'true' / 1 / '1'，也可能是 undefined(null)。 */
function isFalseish(value) {
  return value === false || value === 'false' || value === 0 || value === '0'
}

function normalize(input) {
  const out = { ...DEFAULTS }
  const src = input && typeof input === 'object' ? input : {}
  for (const key of Object.keys(DEFAULTS)) {
    if (!(key in src) || src[key] === undefined || src[key] === null) continue
    const value = src[key]
    if (BOOL_KEYS.includes(key)) {
      out[key] = value === true || value === 'true' || value === 1 || value === '1'
    } else if (ENUMS[key]) {
      out[key] = ENUMS[key].includes(value) ? value : DEFAULTS[key]
    } else if (key === 'speed' || RANGES[key]) {
      const [lo, hi] = RANGES[key] || RANGES.speed
      const n = Number(value)
      out[key] = Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : DEFAULTS[key]
    } else if (COLOR_KEYS.includes(key)) {
      const s = String(value).trim()
      out[key] = /^#[0-9a-fA-F]{3,8}$/.test(s) ? s : DEFAULTS[key]
    } else if (TEXT_KEYS.includes(key)) {
      out[key] = String(value).slice(0, 64)
    } else {
      out[key] = value
    }
  }
  /* 自动播放三档。注意 requireInteraction 在循环里已经被判成布尔了，
     所以「本次提交是否真的带了 autoPlay」必须用原始输入判断：
       - 带了合法值 → 用它；
       - 没带（老配置 / 老设置页）→ 按 requireInteraction 迁移（true→off，false→full）；
       - 带了非法值 → 落到 off（保守，绝不擅自变全自动）。 */
  const apRaw = typeof src.autoPlay === 'string' ? src.autoPlay.trim() : undefined
  if (apRaw !== undefined && ENUMS.autoPlay.includes(apRaw)) {
    out.autoPlay = apRaw
  } else if (apRaw === undefined) {
    out.autoPlay = isFalseish(src.requireInteraction) ? 'full' : 'off'
  } else {
    out.autoPlay = 'off'
  }
  out.requireInteraction = out.autoPlay === 'off'
  /* 人物立绘素材已移除：恒为「空」 */
  out.mascot = -1
  /* 图案只剩一款（0 = HWAVIK），钉死 */
  out.emblem = 0
  /* 开屏视频 / 背景音乐文件名：只留单纯的文件名，杜绝目录穿越 */
  out.bootVideo = String(out.bootVideo || '').replace(/[\\/]/g, '').replace(/\.\./g, '').trim()
  out.bgmBoard = String(out.bgmBoard || '').replace(/[\\/]/g, '').replace(/\.\./g, '').trim()
  out.bgmFinale = String(out.bgmFinale || '').replace(/[\\/]/g, '').replace(/\.\./g, '').trim()
  if (!String(out.identity).trim()) out.identity = DEFAULTS.identity
  if (!String(out.identityId).trim()) {
    out.identityId = String(out.identity).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  }
  if (!String(out.identityId).trim()) out.identityId = 'OPERATOR'
  return out
}

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8')
    return normalize(JSON.parse(raw))
  } catch (err) {
    return { ...DEFAULTS }
  }
}

function writeConfig(next) {
  const cfg = normalize(next)
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  const tmp = CONFIG_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2), 'utf8')
  fs.renameSync(tmp, CONFIG_FILE)
  return cfg
}

/** 静态文件按 mtime 缓存，改完插件刷新页面即生效。 */
function makeReader(rel) {
  let cache = null
  return function read() {
    const file = path.join(PACKAGE_ROOT, rel)
    try {
      const st = fs.statSync(file)
      if (!cache || cache.mtimeMs !== st.mtimeMs) {
        cache = { mtimeMs: st.mtimeMs, text: fs.readFileSync(file, 'utf8') }
      }
      return cache.text
    } catch (err) {
      return ''
    }
  }
}

const readSplashCss = makeReader('lib/splash.css')
const readSplashJs = makeReader('lib/splash.js')
const readAssetData = makeReader('lib/asset-data.js')

/** 内联脚本里绝对不能出现 `</script>`。 */
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '')
}

/** 首屏兜底：在应用挂载前先把窗口盖住，避免闪出界面本体。
 *
 * 2026-10-19：除了给挂载点铺黑，还要**兜住 <html> 本身的底色**。
 * 实测（桌面端）第一次绘制约在 200ms，那时挂载点可能还没生成、splash.css 也还没到，
 * 浏览器会先画出 html 的默认白底 —— 用户看到的就是「先白/闪一下工作台」。
 * 这里用纯 CSS（不依赖任何脚本或外链）给 html 上一块黑底，并在 body 里放一个
 * 与挂载点同级的全屏黑层；两者都由 #dsh-startup-root / html.dsu-lock 的状态驱动，
 * 动画结束或本次不播时会自动撤掉。 */
const CRITICAL_CSS = [
  'html.dsu-lock,html.dsu-lock body{overflow:hidden!important}',
  '#dsh-startup-root.dsu-boot{position:fixed;inset:0;z-index:2147483000;background:#000}',
  /* 桌面端窗口按钮（Electron titleBarOverlay）的配色：
     preload 会在 body 里放一个探针 span，读 --dsw-specific-sidebar-fill 的**计算值**
     再用 canvas 转成 rgba 发给主进程 setTitleBarOverlay。
     实测：探针读到的是宿主传入的 #1b1b1c（不透明），窗口按钮就先画成不透明，
     等我们的样式生效后才跳成透明 —— 这就是「先不透明再变透明」的观感。
     这里不依赖 data-windows-titlebar（探针可能在属性写入前就读过一次），
     只要处于启动期（dsu-lock）就置透明，非桌面端没有探针、不吃这条规则。 */
  'html.dsu-lock body{--dsw-specific-sidebar-fill:transparent!important;--dsw-alias-label-primary:#fff!important}',
  /* 兼容旧写法：部分桌面构建会先写 data-windows-titlebar 再上锁 */
  'html[data-windows-titlebar].dsu-lock body{--dsw-specific-sidebar-fill:transparent!important;--dsw-alias-label-primary:#fff!important}',
  /* html 级黑底：只认 dsu-lock 这个类，撤掉类就恢复原样，不影响主界面 */
  'html.dsu-lock{background:#000!important;color-scheme:dark}',
  'html.dsu-lock body{background:#000!important}',
  /* 首屏黑幕层：与挂载点同级，独立于应用挂载，dsu-lock 一撤跟着消失 */
  'html.dsu-lock #dsh-startup-veil{display:block}',
  '#dsh-startup-veil{display:none;position:fixed;inset:0;z-index:2147482999;background:#000}'

].join('')

const BOOTSTRAP_JS = `(function(){try{
var d=document.documentElement;
/* 第一件事：先锁住并铺黑。后面无论走哪条分支、哪怕抛异常，这一行都已经生效，
   所以不会再出现「白底闪一下」的窗口期。 */
d.classList.add('dsu-lock');
var c=window.__DSH_STARTUP__||{};
var root=document.getElementById('dsh-startup-root');
var off=!c.enabled;
if(!off&&c.mode==='session'&&sessionStorage.getItem('dsh-startup-screen:shown')==='1')off=true;
if(!off&&c.mode==='daily'&&localStorage.getItem('dsh-startup-screen:day')===new Date().toISOString().slice(0,10))off=true;
if(off){window.__DSH_STARTUP_SKIP__=true;d.classList.remove('dsu-lock');if(root&&root.parentNode)root.parentNode.removeChild(root);}
else{/* 兜底：连 splash.js 都没跑起来（404/被拦/语法错）时，9 秒后无条件放行，绝不锁黑屏 */setTimeout(function(){try{var r=document.getElementById('dsh-startup-root');if(r&&r.className&&r.className.indexOf('dsu-boot')!==-1){if(r.parentNode)r.parentNode.removeChild(r);var v=document.getElementById('dsh-startup-veil');if(v&&v.parentNode)v.parentNode.removeChild(v);document.documentElement.classList.remove('dsu-lock');if(document.body)document.body.style.overflow='';window.__DSH_STARTUP_FAILED__=true;}}catch(e){}},9000);}
}catch(e){} })()`

const name = NS
const inject = ['webServer', 'connection']

/**
 * 取得 HTTP 载体服务。
 *
 * web profile 与桌面端（DeepSeek Harness Desktop）都会挂 `@deepseek-ai/dsh-web-app`，
 * 其中 `webserver` 这一行提供 `webServer`；但 Electron 也可能改成 `file://` + IPC
 * 直接下发前端（`dsh-host-webserver` 的文档注释就写着 "Electron uses file:// plus
 * IPC instead"）。那种情况下没有 webServer，本插件不该把一颗 fiber 炸掉 ——
 * 交给客户端半侧自举（`lib/client.js` 的 selfBoot）。
 */
function resolveWebServer(ctx) {
  try {
    const viaGet = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined
    if (viaGet) return viaGet
  } catch (err) { /* 取不到就当没有 */ }
  return ctx.webServer
}

function hasRoutes(server) {
  return !!server && typeof server.register === 'function' && typeof server.tapIndex === 'function'
}

function apply(ctx) {
  const disposers = []
  const webServer = resolveWebServer(ctx)

  /** 没有可注册路由的 HTTP 载体：桌面端若走 IPC 下发前端就是这种形态。
      什么都不注册（plugin 仍然 APPLIED，不报错），页面由客户端半侧自举。 */
  if (!hasRoutes(webServer)) {
    try {
      ctx.logger?.warn?.(
        '[' + NS + '] 当前 profile 没有可用的 webServer（桌面端可能用 file:// + IPC 下发前端）；' +
        'Host 半侧跳过路由与首屏注入，改由浏览器半侧自举启动界面。'
      )
    } catch (err) { /* 日志失败不影响加载 */ }
    return
  }

  /** 浏览器信任栅栏：自定义路由必须过一遍，否则可被任意网页读写。 */
  function rejected(req, res) {
    try {
      const conn = (typeof ctx.get === 'function' ? ctx.get('connection') : undefined) || ctx.connection
      if (!conn || typeof conn.requestRejection !== 'function') return false
      const code = conn.requestRejection(req)
      if (code === undefined || code === null || code === false) return false
      res.statusCode = typeof code === 'number' ? code : 403
      res.end()
      return true
    } catch (err) {
      return false
    }
  }

  function registerRoute(route) {
    const inner = route && route.handler
    const wrapped = Object.assign({}, route, {
      handler: async (req, res) => {
        if (rejected(req, res)) return
        return inner(req, res)
      }
    })
    return webServer.register(wrapped)
  }

  function sendJson(res, code, payload) {
    const body = Buffer.from(JSON.stringify(payload), 'utf8')
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': String(body.length)
    })
    res.end(body)
  }

  function readBody(req, limit = 64 * 1024) {
    return new Promise((resolve) => {
      let size = 0
      const chunks = []
      req.on('data', (c) => {
        size += c.length
        if (size > limit) {
          req.destroy()
          resolve('')
          return
        }
        chunks.push(c)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      req.on('error', () => resolve(''))
    })
  }

  function sendText(res, type, text) {
    const body = Buffer.from(text, 'utf8')
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'Content-Length': String(body.length)
    })
    res.end(body)
  }

  /** 通用流式下发：支持 Range（浏览器要 Range 才肯边下边播 / 拖动进度）。 */
  function streamMedia(req, res, file, type) {
    let stat
    try {
      stat = fs.statSync(file)
    } catch (err) {
      res.writeHead(404, { 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    if (!stat.isFile()) {
      res.writeHead(404, { 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    const total = stat.size
    const headers = {
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store'
    }
    const range = req.headers && req.headers.range
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim())
      if (!m) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + total })
        res.end()
        return
      }
      let start = m[1] ? parseInt(m[1], 10) : 0
      let end = m[2] ? parseInt(m[2], 10) : total - 1
      if (!m[1] && m[2]) {                       // "bytes=-N"：最后 N 字节
        start = Math.max(0, total - parseInt(m[2], 10))
        end = total - 1
      }
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + total })
        res.end()
        return
      }
      end = Math.min(end, total - 1)
      res.writeHead(206, Object.assign({}, headers, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Content-Length': String(end - start + 1)
      }))
      pipeFile(fs.createReadStream(file, { start, end }), res)
      return
    }
    res.writeHead(200, Object.assign({}, headers, { 'Content-Length': String(total) }))
    pipeFile(fs.createReadStream(file), res)
  }

  /** 读流 → 响应。必须挂 'error'：文件在传输中途被删/被换时，
      没人监听 'error' 会变成未捕获异常，把宿主进程带崩。 */
  function pipeFile(readStream, res) {
    readStream.on('error', () => {
      try { res.destroy() } catch (err) { /* noop */ }
    })
    res.on('error', () => {
      try { readStream.destroy() } catch (err) { /* noop */ }
    })
    readStream.pipe(res)
  }

  /** 下发背景音乐。k=board|finale 对应配置里的两个文件名；没配 / 文件不在 → 404。 */
  function sendBgm(req, res) {
    const cfg = readConfig()
    let kind = ''
    try {
      kind = new URL(req.url || '/', 'http://localhost').searchParams.get('k') || ''
    } catch (err) {
      kind = ''
    }
    const name = kind === 'board' ? cfg.bgmBoard : (kind === 'finale' ? cfg.bgmFinale : '')
    if (!name) {
      res.writeHead(404, { 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    const file = path.join(MUSIC_DIR, path.basename(String(name)))
    const type = AUDIO_TYPES[path.extname(file).toLowerCase()]
    if (!type) {
      res.writeHead(404, { 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    streamMedia(req, res, file, type)
  }

  /** 下发开屏视频。没配 / 文件不在 / 扩展名不认识 → 404，前端会退回原版第一幕。 */
  function sendBootVideo(req, res) {
    const name = String(readConfig().bootVideo || '').trim()
    if (!name) {
      res.writeHead(404, { 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    const file = path.join(VIDEO_DIR, path.basename(name))
    const type = VIDEO_TYPES[path.extname(file).toLowerCase()]
    if (!type) {
      res.writeHead(404, { 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    /* 与背景音乐共用同一条流式下发路径（stat / 404 / Range / 416 都在里面），
       避免两份 Range 实现各自漂移。 */
    streamMedia(req, res, file, type)
  }

  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/splash.css',
    handler: (req, res) => sendText(res, 'text/css; charset=utf-8', readSplashCss())
  }))

  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/splash.js',
    handler: (req, res) => sendText(res, 'application/javascript; charset=utf-8', readSplashJs())
  }))

  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/asset-data.js',
    handler: (req, res) => sendText(res, 'application/javascript; charset=utf-8', readAssetData())
  }))

  /* 开屏视频：按配置下发 lib/assets/videos/<bootVideo>。
     必须支持 Range，浏览器才肯边下边播；文件名只取 basename，杜绝目录穿越。 */
  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/boot-video',
    handler: (req, res) => sendBootVideo(req, res)
  }))

  /* 背景音乐：/dsh-startup/bgm?k=board|finale。同样支持 Range。 */
  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/bgm',
    handler: (req, res) => sendBgm(req, res)
  }))

  /* 音频素材已改为打包内联（lib/asset-data.js → 浏览器 window.__DSA_ASSETS__），
     不再提供音频 HTTP 路由，彻底去掉音频的网络请求。
     lib/assets/*.mp3 仍随包发布，作为内联数据的源文件与本地兜底。 */
disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/config',
    handler: async (req, res) => {
      const method = (req.method || 'GET').toUpperCase()
      if (method === 'GET') {
        sendJson(res, 200, { ok: true, version: PLUGIN_VERSION, config: readConfig(), defaults: DEFAULTS, file: CONFIG_FILE })
        return
      }
      if (method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'method not allowed' })
        return
      }
      const text = await readBody(req)
      let payload = {}
      try {
        payload = text ? JSON.parse(text) : {}
      } catch (err) {
        sendJson(res, 400, { ok: false, error: 'invalid json' })
        return
      }
      try {
        if (payload && payload.action === 'reset') {
          const cfgNow = writeConfig(DEFAULTS)
          sendJson(res, 200, { ok: true, version: PLUGIN_VERSION, config: cfgNow, defaults: DEFAULTS })
          return
        }
        const current = readConfig()
        const patch = payload && typeof payload.patch === 'object' && payload.patch ? payload.patch : payload
        const cfgNow = writeConfig({ ...current, ...patch })
        sendJson(res, 200, { ok: true, version: PLUGIN_VERSION, config: cfgNow, defaults: DEFAULTS })
      } catch (err) {
        sendJson(res, 500, { ok: false, error: String((err && err.message) || err) })
      }
    }
  }))

  disposers.push(webServer.tapIndex((html) => {
    if (!html || html.includes(ROUTE_BASE + '/splash.js')) return html
    const cfg = readConfig()
    const head =
      /* critical CSS 排在最前：它是防闪屏的关键，不能被后面的样式表拖慢 */
      '<style id="dsh-startup-critical">' + CRITICAL_CSS + '</style>' +
      /* 同步上锁：必须放在 <head> 里、且在任何样式表之前。
         以前这一步在 <body> 的内联脚本里做，实测 documentElement 在 165ms 就存在，
         但内联脚本要等正文解析到才执行（225ms）—— 这 60ms 里页面没有任何启动态标记，
         桌面端 preload 的配色探针正好在这段时间读到宿主色，窗口按钮就先画成不透明，
         随后再跳成透明。放在 <head> 里能把这个窗口压到接近 0。 */
      '<script>try{document.documentElement.classList.add(\'dsu-lock\')}catch(e){}</script>' +
      '<link rel="stylesheet" href="' + ROUTE_BASE + '/splash.css">'
    const body =
      /* 首屏黑幕层：纯 CSS 覆盖全屏，由 html.dsu-lock 驱动，不依赖任何脚本。
         即便挂载点还没被解析到、splash.js 还没下载完，用户看到的也是黑幕而不是白底工作台。 */
      '<div id="dsh-startup-veil" aria-hidden="true"></div>' +
      '<div id="dsh-startup-root" class="dsu-root dsu-boot"></div>' +
      '<script>window.__DSH_STARTUP_BOOT__="index";window.__DSH_STARTUP_VERSION__=' + safeJson(PLUGIN_VERSION) + ';window.__DSH_STARTUP_CONFIG_URL__=' + safeJson(ROUTE_BASE + '/config') + ';window.__DSH_STARTUP__=' + safeJson(cfg) + ';' + BOOTSTRAP_JS + '</script>' +
      '<script defer src="' + ROUTE_BASE + '/asset-data.js"></script>' +
      '<script defer src="' + ROUTE_BASE + '/splash.js"></script>'

    let out = html
    if (out.includes('</head>')) out = out.replace('</head>', head + '</head>')
    else out = head + out
    if (out.includes('<body>')) out = out.replace('<body>', '<body>' + body)
    else if (out.includes('</body>')) out = out.replace('</body>', body + '</body>')
    else out = out + body
    return out
  }))

  ctx.effect(() => () => {
    for (const dispose of disposers) {
      try { dispose() } catch (err) { /* noop */ }
    }
  })
}

/* 导出形状对齐 DSH 内部插件（如 dsh-host-open-in-app）：
   只给具名 name / inject / apply。
   两点刻意不做：
   1) 不导出 default —— cordis-plugin-loader 的 unwrapExports 是
      `exports.default ?? exports`，一旦有 default 就只认 default，
      两边都写反而多一个"改一处忘一处"的坑；
   2) 不导出 Config —— Cordis 约定 Config 是 schemastery schema，
      我这份只是普通默认值对象，当 schema 用会炸。本插件也不吃 profile 配置。 */
export { apply, inject, name }
