/* ============================================================================
 * dsh-startup-screen — 启动动画运行时（浏览器端，零依赖）
 * ----------------------------------------------------------------------------
 * 由 Host 半侧注入到 index.html，在 React 应用挂载之前接管首屏：
 *
 *   第一幕  黑幕 + DeepSeek 鲸鱼标识／"深度求索"／"DEEPSEEK"（字距收紧 + 扫光）
 *   过场    过曝洗白（黑 → 灰 → 暖白底板），对应参考片的硬切洗白
 *   第二幕  暖白"技术档案"底板：左上品牌块左→右擦出、右下 POWERED BY、进度条
 *   序列    需要访问许可 → 身份资料确认 → 接收访问需求 → 读取完毕 → 验证通过
 *           → 欢迎 <身份名称> 访问；每步中文大字 + 英文等宽字幕 + 底部长句日志
 *   交互    第 1、2 步等待用户确认（按钮 / Enter / 空格 / 点击），可跳过
 *   终幕    WELCOME TO / [DEEPSEEK HARNESS] / 鲸鱼标识，青红色散故障后揭幕
 *
 * 配置来自 window.__DSH_STARTUP__（Host 侧注入），也可用
 * window.__DSH_STARTUP_API__.replay() 重播。
 * ========================================================================== */
(function () {
  'use strict'

  if (window.__DSH_STARTUP_LOADED__) return
  window.__DSH_STARTUP_LOADED__ = true

  var ROOT_ID = 'dsh-startup-root'

  /* ── DeepSeek 官方鲸鱼标识（取自 DSH 自带 favicon.svg 的路径数据）──────── */
  var WHALE_PATH =
    'M48.8354 10.0479C48.3232 9.79199 48.1025 10.2798 47.8032 10.5278C47.7007 10.6079 ' +
    '47.6143 10.7119 47.5273 10.8076C46.7793 11.624 45.9048 12.1597 44.7622 12.0957C43.0923 ' +
    '12 41.666 12.5356 40.4058 13.8398C40.1377 12.2319 39.2476 11.272 37.8926 10.6558C37.1836 ' +
    '10.3359 36.4668 10.0156 35.9702 9.31982C35.6235 8.82373 35.5293 8.27197 35.356 ' +
    '7.72754C35.2456 7.3999 35.1353 7.06396 34.7651 7.00781C34.3633 6.94385 34.2056 7.2876 ' +
    '34.0479 7.57568C33.418 8.75195 33.1733 10.0479 33.1973 11.3599C33.2524 14.312 34.4736 ' +
    '16.6641 36.8999 18.3359C37.1758 18.5278 37.2466 18.7197 37.1597 19C36.9946 19.5757 ' +
    '36.7974 20.1357 36.624 20.7119C36.5137 21.0801 36.3486 21.1597 35.9624 21C34.6309 ' +
    '20.4321 33.481 19.5918 32.4644 18.5757C30.7393 16.8721 29.1792 14.9917 27.2334 ' +
    '13.52C26.7764 13.1758 26.3193 12.856 25.8467 12.5518C23.8618 10.584 26.1069 8.96777 ' +
    '26.627 8.77588C27.1704 8.57568 26.8159 7.8877 25.0591 7.896C23.3022 7.90381 21.6953 ' +
    '8.50391 19.647 9.30371C19.3477 9.42383 19.0322 9.51172 18.7095 9.58398C16.8501 9.22363 ' +
    '14.9199 9.14355 12.9033 9.37598C9.10596 9.80762 6.07275 11.6396 3.84326 14.7681C1.16455 ' +
    '18.5278 0.53418 22.7998 1.30664 27.2559C2.11768 31.9521 4.46582 35.8398 8.07373 ' +
    '38.8799C11.8159 42.0322 16.1255 43.5762 21.041 43.2803C24.0269 43.104 27.3516 42.6963 ' +
    '31.1016 39.4561C32.0469 39.936 33.0396 40.1279 34.686 40.272C35.9546 40.3921 37.1758 ' +
    '40.208 38.1211 40.0078C39.6021 39.688 39.4995 38.2881 38.9639 38.0322C34.623 35.9678 ' +
    '35.5762 36.8081 34.71 36.1279C36.9155 33.4639 40.2402 30.6958 41.54 21.728C41.6426 ' +
    '21.0161 41.5557 20.5679 41.54 19.9917C41.5322 19.6396 41.6108 19.5039 42.0049 ' +
    '19.4639C43.0923 19.3359 44.1479 19.0317 45.1167 18.4878C47.9292 16.9199 49.064 14.3438 ' +
    '49.3315 11.2559C49.3711 10.7837 49.3237 10.2959 48.8354 10.0479ZM24.3262 ' +
    '37.8398C20.1196 34.4639 18.0791 33.3521 17.2358 33.3999C16.4482 33.4482 16.5898 ' +
    '34.3682 16.7632 34.9678C16.9443 35.5601 17.1812 35.9683 17.5117 36.4878C17.7402 ' +
    '36.832 17.8979 37.3442 17.2832 37.728C15.9282 38.584 13.5728 37.4399 13.4624 ' +
    '37.3838C10.7207 35.7358 8.42822 33.5601 6.81348 30.584C5.25342 27.7197 4.34766 ' +
    '24.6479 4.19775 21.3677C4.1582 20.5757 4.38672 20.2959 5.15869 20.1519C6.17529 ' +
    '19.96 7.22314 19.9199 8.23926 20.0718C12.5327 20.7119 16.1885 22.6719 19.2529 ' +
    '25.7759C21.002 27.5439 22.3252 29.6558 23.6885 31.7202C25.1377 33.9121 26.6978 36 ' +
    '28.6831 37.7119C29.3843 38.312 29.9434 38.7681 30.479 39.104C28.8643 39.2881 26.1699 ' +
    '39.3281 24.3262 37.8398ZM26.3433 24.6001C26.3433 24.248 26.6191 23.9678 26.9658 ' +
    '23.9678C27.0444 23.9678 27.1152 23.9839 27.1782 24.0078C27.2651 24.04 27.3438 ' +
    '24.0879 27.4067 24.1602C27.5171 24.272 27.5801 24.4321 27.5801 24.6001C27.5801 ' +
    '24.9521 27.3042 25.2319 26.9575 25.2319C26.6108 25.2319 26.3433 24.9521 26.3433 ' +
    '24.6001ZM32.6064 27.8799C32.2046 28.0479 31.8027 28.1919 31.4165 28.208C30.8179 ' +
    '28.2397 30.1641 27.9922 29.8096 27.688C29.2583 27.2158 28.8643 26.9521 28.6987 ' +
    '26.1279C28.6279 25.7759 28.6675 25.2319 28.7305 24.9199C28.8721 24.248 28.7144 ' +
    '23.8159 28.2495 23.4238C27.8716 23.104 27.3911 23.0161 26.8633 23.0161C26.666 ' +
    '23.0161 26.4849 22.9277 26.3511 22.856C26.1304 22.7441 25.9492 22.4639 26.1226 ' +
    '22.1201C26.1777 22.0078 26.4458 21.7358 26.5088 21.688C27.2256 21.272 28.0527 ' +
    '21.4077 28.8169 21.7197C29.5259 22.0161 30.0615 22.5601 30.834 23.3281C31.6216 ' +
    '24.2559 31.7632 24.5117 32.2124 25.208C32.5669 25.752 32.8901 26.312 33.1104 ' +
    '26.9521C33.2446 27.3521 33.0713 27.6802 32.6064 27.8799Z'

  /* ── 默认配置（与 Host 侧 lib/index.js 的 DEFAULTS 保持一致）──────────── */
  var DEFAULTS = {
    enabled: true,
    mode: 'session',            // session | daily（原 always 已删除）
    theme: 'dark',              // light | dark
    speed: 1,
    requireInteraction: true,   // 旧字段：仅用于迁移到 autoPlay（见下方 normalize）
    /* 出厂留空：老配置（只有 requireInteraction）必须能被识别并迁移。
       注意：这里必须是 ''（空串），不能写 'off'/'full' —— cfg() 靠"默认值之外
       是否真的带了 autoPlay"来判断走不走 requireInteraction 迁移，写死任一合法值
       都会让老配置的迁移失效。真正的出厂默认（不自动播放）由 Host 的 DEFAULTS 提供。 */
    autoPlay: '',               // full=完全自动播放 / once=仅需点击一次进入（需空密码）/ off=不自动播放
    allowSkip: true,
    sound: true,                // 界面音效（WebAudio 合成，无音频文件）
    soundVolume: 0.5,
    voice: true,                // 女声播报
    voiceLang: 'en',            // zh | en（仅作真声素材缺失时的 TTS 兜底；自动（优先神经网络女声）-US 本体为内置真声）
    voiceName: 'zhixing-cn',            // '' = 自动（优先神经网络女声）-US（真声 line-1..6）/ 'zhixing-cn' = 智性少女音-CN（真声 line-cn-1..6）/ 'cm-zh' = 沉稳男声-中文（真声 line-cm-1..6）/ 'calmlady-jp' = 清冷优雅-日语（真声 line-jp-1..6）/ 'pessimistic-ru' = 清冷脆弱-俄语（真声 line-ru-1..6） / 'rm-ru' = 低沉沙哑男声-俄语（真声 line-rm-1..6）/ 'announcer-kr' = 威严铿锵宣示-朝鲜语（真声 line-kr-1..6）
    voiceRate: 0.88,            // 电影旁白档：比朗读慢，字与字之间才有重量
    voicePitch: 0.85,           // 压低音调，深沉的 AI 女声
    voiceVolume: 0.9,
    voiceCue: true,             // 念台词前的一声轻提示
    sfx: 'audio',               // audio=真素材（用户音频里抠的音效）/ synth=现场合成
    voiceSource: 'asset',       // asset=优先用真声素材 / tts=全部 TTS 合成
    voiceLead: 240,             // 提示音之后留一小段空白再开口
    mascot: 0,                  // 右下角人物立绘编号（0-3 对应设置页，-1 = 空 / 不显示立绘）
    emblem: 0,                  // 中央/终幕图案：只有 0 = HWAVIK
    bootVideo: '',              // 开屏视频：lib/assets/videos/ 下的文件名（空 = 关闭）
    bootVideoSound: true,       // 开屏视频是否带声音（被自动播放策略拦下时自动转静音重播）
    bootVideoTransition: 'wash', // 视频结束后的过场：wash | dissolve
    bgmBoard: 'board-loop.m4a', // 底板/流程背景音乐（循环）
    bgmFinale: '',              // 终幕背景音乐（空 = 关闭；当前用空值，让底板曲一路播到揭幕）
    bgmVolume: 0.35,             // 底板/流程 BGM 音量（素材已校准到 -18 LUFS）
    bgmFinaleVolume: 1,       // 终幕 BGM 音量
    bootVideoVolume: 1,         // 开场视频音量
    eventWindow: false,         // 降世事件窗口：默认关闭；开启后每次动画结束都弹出
    identity: 'OPERATOR',  // ← 设置页可改的"身份名称"
    identityId: 'A000001',
    accessLevel: '最高权限',
    identityPassword: '',       // ← 第二步身份确认的访问密码（空 = 不启用）
    brand1: '哈夫克集团',
    brand2: 'HAAVK GROUP · EST. 2035',
    brand3a: 'HAAVK',
    brand3b: '超算平台',
    orgZh: '哈夫克集团',
    orgEn: 'HAAVK GROUP',
    orgSub: '哈夫克，让世界更高效',
    welcomeBox: 'HAAVK LINK ESTABLISHED',
    footer: 'Powered By Mandelbrick',
    accent: '#c70000',
    glitchA: '#ff3b30',
    glitchB: '#ce0912'
  }

  /* ── 序列脚本：中文主字 + 英文等宽字幕 + 底部日志 ───────────────────────
     `say` 是专门给语音播报用的自然语句（照着参考片里女声念状态行的节奏，
     正好卡在各自文字出现的时间点上）。 */
  /* ── 序列脚本 ──────────────────────────────────────────────────────────
     文字与真声素材一一对应（来自你给的音频）：
       自动（优先神经网络女声）-US 素材：line-1..6.mp3
       智性少女音-CN 素材：line-cn-1..6.mp3（同名、不同音色）
        沉稳男声-中文 素材：line-cm-1..6.mp3（同名、不同音色）
       清冷优雅-日语 素材：line-jp-1..6.mp3（同名、不同音色）
       清冷脆弱-俄语 素材：line-ru-1..6.mp3（同名、不同音色）
        低沉沙哑男声-俄语 素材：line-rm-1..6.mp3（同名、不同音色）
       威严铿锵宣示-朝鲜语 素材：line-kr-1..6.mp3（同名、不同音色）
     七个音色共用同一套文字/步骤，`audio` 是素材文件名（不含扩展名），
     播放时按 voiceName 自动选 line-* / line-cn-* / line-cm-* / line-jp-* / line-ru-* / line-rm-* / line-kr-*。
       line-1.mp3 = 需要访问许可（Sonia TTS）
       line-2.mp3 = 身份资料确认（Sonia TTS）
       line-3.mp3 = 接入哈夫克网络（Sonia TTS）
       line-4.mp3 = 同步超算核心（Sonia TTS）
       line-5.mp3 = 读取完毕 · 核验通过（Sonia TTS）
      V3 是用户名字独白，按你的要求不用。
      TTS 已全链路关闭（voice 模块的 TTS_ENABLED=false），`say` 目前不生效，
      留作以后重开 TTS 时的兜底文本。 */
  var STEPS = [
    {
      zh: '需要访问许可',
      en: 'ACCESS PERMISSION REQUIRED',
      say: 'Access permission required.',
      audio: 'line-1',
      log: '等待集团安保授权…',
      logEn: 'AWAITING HAAVK SECURITY CLEARANCE',
      badge: 'AUTHORIZATION',
      action: 'grant',
      btnZh: '授予访问权限',
      btnEn: 'GRANT ACCESS',
      hold: 900,
      progress: 0.34
    },
    {
      zh: '身份资料确认',
      en: 'IDENTITY VERIFICATION',
      say: 'Identity verification.',
      audio: 'line-2',
      log: '比对集团员工档案…',
      logEn: 'MATCHING HAAVK PERSONNEL RECORD',
      badge: 'IDENTITY',
      action: 'confirm',
      btnZh: '确认身份',
      btnEn: 'CONFIRM IDENTITY',
      hold: 700,
      progress: 0.5
    },
    {
      zh: '接入哈夫克网络',
      en: 'HAAVK NETWORK LINK',
      say: 'Linking to Haavk network.',
      audio: 'line-3',
      log: '建立加密信道，接入平台节点…',
      logEn: 'ENCRYPTED UPLINK ESTABLISHED',
      badge: 'UPLINK',
      action: 'auto',
      hold: 1200,
      progress: 0.66,
      assembleLogo: true
    },
    {
      zh: '同步超算核心',
      en: 'AI CORE SYNC',
      say: 'Synchronizing Haavk AI core.',
      audio: 'line-4',
      log: '同步集团超算平台数据…',
      logEn: 'SYNCING HAAVK COMPUTE CORE',
      badge: 'SYNC',
      action: 'auto',
      hold: 1200,
      progress: 0.8,
      hex: true
    },
    {
      zh: '读取完毕 · 核验通过',
      en: 'READ COMPLETE · VERIFIED',
      say: 'Read complete. Verification passed.',
      audio: 'line-5',
      log: '权限已授予，欢迎回到哈夫克',
      logEn: 'CLEARANCE GRANTED',
      badge: 'VERIFY',
      action: 'auto',
      hold: 1600,
      progress: 0.93,
      reticle: true
    }
  ]

  /* 六个音色各用一套独立素材：自动-US→line-1..6、智性少女音-CN→line-cn-1..6、
     沉稳男声-中文→line-cm-1..6、清冷优雅-日语→line-jp-1..6、
     清冷脆弱-俄语→line-ru-1..6、威严铿锵宣示-朝鲜语→line-kr-1..6。
     特意写成幂等形态：无论传入 line-N、line-cn-N、line-cm-N、line-jp-N、line-ru-N 还是 line-kr-N，
     都解析成当前音色对应的名字，重复调用结果不变 —— 避免多个调用点各自做一次转换
     导致前缀叠加（历史 bug：终幕被转成 line-cn-cn-6 → 404 → 静音）。 */
  function cnAsset(n) {
    if (!n) return n
    var m = /^line-(?:cn-|cm-|jp-|ru-|kr-|rm-)?(\d+)$/.exec(n)
    if (!m) return n
    if (C.voiceName === 'zhixing-cn') return 'line-cn-' + m[1]
    if (C.voiceName === 'cm-zh') return 'line-cm-' + m[1]
    if (C.voiceName === 'calmlady-jp') return 'line-jp-' + m[1]
    if (C.voiceName === 'pessimistic-ru') return 'line-ru-' + m[1]
    if (C.voiceName === 'rm-ru') return 'line-rm-' + m[1]
    if (C.voiceName === 'announcer-kr') return 'line-kr-' + m[1]
    return 'line-' + m[1]
  }

  function cfg() {
    var raw = (window.__DSH_STARTUP__ && typeof window.__DSH_STARTUP__ === 'object')
      ? window.__DSH_STARTUP__
      : {}
    /* 降世事件窗口「首次启动弹一次」的一次性标记（localStorage，跨会话） */
    var EVENT_SEEN_KEY = 'dsh-startup-screen:event-seen'
    var out = {}
    for (var k in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) out[k] = DEFAULTS[k]
    for (var k2 in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, k2) && raw[k2] !== undefined && raw[k2] !== null) {
        out[k2] = raw[k2]
      }
    }
    out.speed = Math.min(3, Math.max(0.35, Number(out.speed) || 1))
    out.identity = String(out.identity || DEFAULTS.identity).slice(0, 48)
    /* 代号取身份名称里的字母数字；纯中文名字取不到时退回 OPERATOR */
    out.identityId = String(out.identityId || out.identity).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
    if (!out.identityId) out.identityId = 'OPERATOR'
    /* 身份密码：空字符串 = 不启用密码校验；非空时第二步需输对才能继续 */
    out.identityPassword = String(out.identityPassword || '').slice(0, 128)

    /* ── 自动播放三档（2026-10-18）──────────────────────────────────────
       full = 完全自动播放：五步全自动，不需要任何操作
       once = 仅需点击一次进入：开头停下来等一次确认（要求身份密码为空）
       off  = 不自动播放：第 1、2 步都等用户确认（相当于旧的「需要人工确认」）
       旧配置只有 requireInteraction(true/false)，按它迁移，老用户无感。 */
    var ap = String(out.autoPlay || '')
    if (ap !== 'full' && ap !== 'once' && ap !== 'off') {
      ap = (out.requireInteraction === false || out.requireInteraction === 'false' || out.requireInteraction === 0)
        ? 'full'
        : 'off'
    }
    out.autoPlay = ap
    /* 只有「不自动播放」才需要逐步停止；另外两档都不在第二步停 */
    out.requireInteraction = ap === 'off'

    /* ── 音色锁定 ──────────────────────────────────────────────────────
       设置页的音色选择器已移除：现在只有一套预录语音（哈夫克播报 · Sonia），
       素材挂在 line-1..6 上。这里把 voiceName 钉死成 ''，即使旧配置里留着
       'zhixing-cn' 之类的值，也不会去读那几套旧录音（line-cn-* / line-cm-* …）。 */
    out.voiceName = ''
    out.voiceSource = 'asset'

    /* ── 降世事件窗口：整体停用 ────────────────────────────────────────
       设置页的开关已移除，闸门（eventGate）也只剩 `if (!C.eventWindow) return`。
       这里把两个字段都钉成 false：即使旧配置里写着 true，也不会再弹窗。
       （原来「全新安装首次启动弹一次」的 localStorage 标记一并去掉。） */
    out.eventWindow = false
    out.eventOnce = false

        /* 人物立绘已整块移除（素材 5 张共 1.4 MB 撤掉了），mascot 永远等于「空」 */
    out.mascot = -1
    out.showMascot = false

    /* 图案编号：0 = 徽章 / 1 = 东亚防御倡议（默认）。
       EMBLEMS 同样在本函数之下才定义，所以这里不写死上限（同 mascot 踩过的坑），
       拿不到长度时按"放过"处理，真正的越界由 svgWhale 里的取值兜底。
       未配置时回落到 1（东亚防御倡议是新的默认选项）。 */
    var ei = parseInt(out.emblem, 10)
    var emblemMax = (typeof EMBLEMS !== 'undefined' && EMBLEMS && EMBLEMS.length) ? EMBLEMS.length : Infinity
    if (!Number.isFinite(ei)) ei = DEFAULTS.emblem
    out.emblem = (ei >= 0 && ei < emblemMax) ? ei : DEFAULTS.emblem
    return out
  }

  var C = cfg()

  /* ── 让「设置里刚保存的配置」立刻生效（2026-10-18 新增）───────────────
     设置页「立即预览」原本只是把运行时脚本重新挂一遍，页面上的 /dsh-startup/config
     还是**打开页面那一刻**注入的旧配置，所以刚改的交互方式/事件窗口/立绘都看不到。
     injectSelf 在重挂之前会先调用下面的 refresh()，把最新配置拉回来拼进 C。 */
  var refreshPromise = null

  function applyConfig(next) {
    if (!next || typeof next !== 'object') return false
    var merged = {}
    for (var k in window.__DSH_STARTUP__) {
      if (Object.prototype.hasOwnProperty.call(window.__DSH_STARTUP__, k)) merged[k] = window.__DSH_STARTUP__[k]
    }
    for (var k2 in next) { if (Object.prototype.hasOwnProperty.call(next, k2)) merged[k2] = next[k2] }
    window.__DSH_STARTUP__ = merged
    var fresh = cfg()
    for (var k3 in fresh) { if (Object.prototype.hasOwnProperty.call(fresh, k3)) C[k3] = fresh[k3] }
    return true
  }

  /** 拉一次最新配置。拿不到（离线预览 / 路由不可达）就沿用当前配置，绝不阻塞重播。 */
  function refresh() {
    if (refreshPromise) return refreshPromise
    var url = window.__DSH_STARTUP_CONFIG_URL__
    if (!url) return Promise.resolve(false)
    refreshPromise = new Promise(function (resolve) {
      try {
        fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
          .then(function (r) { return r.json() })
          .then(function (j) {
            if (j && j.ok === true && j.config) { applyConfig(j.config); resolve(true); return }
            resolve(false)
          })
          .catch(function () { resolve(false) })
      } catch (e) { resolve(false) }
    }).then(function (v) { refreshPromise = null; return v })
    return refreshPromise
  }

  /** 重播：把运行时脚本重新挂一次（配置/身份名称改动后 preview 用它）。
      重挂之前先拉最新配置，「立即预览」才能看到刚保存的设置。
      注意：**绝不能先摘 dsu-lock**。以前先摘锁再去拉配置（异步），这中间黑幕层消失、
      窗口按钮也会读回宿主色，于是重播时会闪一下不透明标题栏 + 露出主界面。
      现在全程保持上锁，新脚本加载后由它自己接管。 */
  function replayLatest() {
    var old = document.getElementById(ROOT_ID)
    if (old && old.parentNode) old.parentNode.removeChild(old)
    /* 保持 dsu-lock 与滚动锁：黑幕层继续盖住主界面，标题栏 token 也继续是透明 */
    document.documentElement.classList.add('dsu-lock')
    document.documentElement.style.overflow = 'hidden'
    if (document.body) document.body.style.overflow = 'hidden'
    var layer = document.querySelector('.dsu-event')
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer)
    return refresh().then(injectSelf, injectSelf)
  }

  /** 重播：把运行时脚本重新挂一次。 */
  function injectSelf() {
    window.__DSH_STARTUP_LOADED__ = false
    var old = document.getElementById(ROOT_ID)
    if (old && old.parentNode) old.parentNode.removeChild(old)
    window.__DSH_STARTUP_SKIP__ = false
    var s = document.createElement('script')
    /* 正式运行时由 Host 路由提供（加时间戳绕开缓存）；
       离线预览页会把相对路径写进 __DSH_STARTUP_SCRIPT_URL__，file:// 下不加查询串。 */
    if (window.__DSH_STARTUP_SCRIPT_URL__) {
      s.src = window.__DSH_STARTUP_SCRIPT_URL__
    } else {
      s.src = '/dsh-startup/splash.js?t=' + Date.now()
    }
    document.head.appendChild(s)
  }

  /* Host 侧的首屏兜底脚本已经判定"这次不播"（未启用 / 本会话已播 / 今日已播）：
     这里不再建 DOM，但仍然暴露 API，方便设置页按需重播。 */
  if (window.__DSH_STARTUP_SKIP__ === true) {
    window.__DSH_STARTUP_API__ = {
      replay: replayLatest,
      skip: function () {},
      finish: function () {},
      config: C
    }
    return
  }

  /* 最后一道保险：无论前面哪一步抛异常，都不许把用户留在黑幕里 */
  setTimeout(function () {
    try {
      var r = document.getElementById(ROOT_ID)
      if (r && r.classList && r.classList.contains('dsu-boot')) {
        if (r.parentNode) r.parentNode.removeChild(r)
        /* 首屏黑幕层也要一起撤，否则放行了却还是全黑 */
        var v = document.getElementById('dsh-startup-veil')
        if (v && v.parentNode) v.parentNode.removeChild(v)
        document.documentElement.classList.remove('dsu-lock')
        if (document.body) document.body.style.overflow = ''
        window.__DSH_STARTUP_FAILED__ = true
      }
    } catch (e) { /* 兜底本身不许再抛 */ }
  }, 9000)

  /* ── 小工具 ───────────────────────────────────────────────────────────── */
  function el(tag, cls, text) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    if (text != null) n.textContent = text
    return n
  }

  /* ── 中国共产党党徽（用户提供的官方图案 PNG，内嵌 base64，红色）────────
     用 <img> 直接显示图片，不做矢量重绘，保证与官方图案完全一致。 */
  /* ── 赛博电子风人物立绘（第二页起右下角）───────────────────────────────
     用户提供的霓虹红线稿，黑底已按亮度抠成透明，webp 内嵌。 */
/* 可切换人物立绘：与设置页「人物立绘」选项一一对应 */
  /* 立绘素材已移除：数组留空，渲染分支靠 showMascot=false 短路 */
  var MASCOT_NAMES = []
  var MASCOTS = []

  /* ── 事件窗口（动画结束后、进入主界面前）────────────────────────────── */
var EMBLEM_SRC = 'data:image/webp;base64,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ASroBmcCPikUiUOhoSEQBAAYAoS0t3C7sI2gBPYB77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych76wAAP7/+SYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='

  /* 第二款图案「东亚防御倡议」（设置页「图案」可切换，1 = 默认） */
  /* 图案全集：只剩一个（0 = HWAVIK） */
  var EMBLEMS = [EMBLEM_SRC]
  var EMBLEM_NAMES = ['HWAVIK']

  
  function svgWhale(cls) {
    var img = document.createElement('img')
    /* 按设置页「图案」选项取图；越界回落第 0 款，避免拿到 undefined 变空白 */
    var idx = (typeof C !== 'undefined' && C && Number.isFinite(Number(C.emblem))) ? Number(C.emblem) : 1
    if (!(idx >= 0 && idx < EMBLEMS.length)) idx = 0
    img.setAttribute('src', EMBLEMS[idx] || EMBLEMS[0])
    img.setAttribute('data-emblem', String(idx))
    img.setAttribute('alt', '')
    img.setAttribute('draggable', 'false')
    if (cls) img.setAttribute('class', cls)
    return img
  }

  /** 逐字渐显：比逐字截断更稳（居中排版不会因为字宽变化而抖动） */
  function typeIn(host, text, stagger) {
    host.textContent = ''
    var frag = document.createDocumentFragment()
    var n = 0
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i)
      if (ch === ' ') {
        frag.appendChild(document.createTextNode('\u00a0'))
        continue
      }
      var s = el('span', 'dsu-ch', ch)
      s.style.transitionDelay = Math.round(n * stagger) + 'ms'
      frag.appendChild(s)
      n++
    }
    host.appendChild(frag)
  }

  function setIn(node, on, cls) {
    if (!node) return
    node.classList.toggle(cls || 'dsu-in', !!on)
  }

  /* ── DOM 搭建 ─────────────────────────────────────────────────────────── */
  var root = document.getElementById(ROOT_ID)
  if (!root) {
    root = el('div')
    root.id = ROOT_ID
    root.className = 'dsu-root'
    document.body.appendChild(root)
  }
  /* 重播时首屏黑幕层可能已被上一次 finish 清掉，这里补回来：
     新动画起来之前，页面仍然需要一块纯 CSS 的黑幕盖住主界面。 */
  if (document.body && !document.getElementById('dsh-startup-veil')) {
    var veil = el('div')
    veil.id = 'dsh-startup-veil'
    veil.setAttribute('aria-hidden', 'true')
    document.body.insertBefore(veil, document.body.firstChild)
  }
  root.classList.add('dsu-boot')
  root.classList.toggle('dsu-dark', C.theme === 'dark')
  root.classList.toggle('dsu-light', C.theme === 'light')
  root.style.setProperty('--dsu-speed', String(C.speed))
  root.style.setProperty('--dsu-accent', C.accent)
  root.style.setProperty('--dsu-glitch-a', C.glitchA)
  root.style.setProperty('--dsu-glitch-b', C.glitchB)

  var ui = {}
  var clockTimer = null
  var html =
    '<div class="dsu-plate"></div>' +
    '<div class="dsu-vignette"></div>' +
    '<div class="dsu-watermark"></div>' +
    '<div class="dsu-grain"></div>' +
    '<div class="dsu-black">' +
      '<div class="dsu-black-inner"></div>' +
      '<div class="dsu-sweep"></div>' +
    '</div>' +
    '<div class="dsu-wash"></div>' +
    '<header class="dsu-brand">' +
      '<div class="dsu-brand-1"></div><div class="dsu-brand-2"></div>' +
      '<div class="dsu-brand-3"><b></b><span></span></div>' +
    '</header>' +
    '<div class="dsu-stepcount">[ 00 / 06 ] INIT</div>' +
    '<div class="dsu-center">' +
      '<div class="dsu-status"><span class="dsu-status-zh"></span><i class="dsu-caret"></i></div>' +
      '<div class="dsu-sub-en"></div>' +
      '<div class="dsu-rule"></div>' +
      '<div class="dsu-logo"></div>' +
      '<div class="dsu-dots" hidden></div>' +
    '</div>' +
    '<div class="dsu-idline"></div>' +
    '<div class="dsu-reticle"></div>' +
    '<div class="dsu-hex"></div>' +
    '<div class="dsu-welcome">' +
      '<div class="dsu-w1">WELCOME TO</div>' +
      '<div class="dsu-w2"></div>' +
      '<div class="dsu-w3"></div>' +
      '<div class="dsu-w4"></div>' +
    '</div>' +
    '<div class="dsu-action">' +
      '<div class="dsu-card" hidden></div>' +
      '<button class="dsu-btn" type="button">' +
        '<span class="dsu-btn-zh"></span><span class="dsu-btn-en"></span>' +
      '</button>' +
      '<div class="dsu-hint"></div>' +
    '</div>' +
    '<div class="dsu-frame">' +
      '<i class="dsu-corner dsu-c-tl"></i><i class="dsu-corner dsu-c-tr"></i>' +
      '<i class="dsu-corner dsu-c-bl"></i><i class="dsu-corner dsu-c-br"></i>' +
      '<div class="dsu-scanline"></div>' +
    '</div>' +
    '<div class="dsu-slats"></div>' +
    '<div class="dsu-voice"><i></i><i></i><i></i><i></i><i></i></div>' +
    '<div class="dsu-meta"><span class="dsu-meta-1"></span><span class="dsu-meta-2"></span></div>' +
    '<div class="dsu-skip">SKIP ▸</div>' +
    '<footer class="dsu-foot"><span></span><i></i></footer>' +
    '<div class="dsu-subtitle">' +
      '<span class="dsu-sub-zh"></span><span class="dsu-sub-en2"></span>' +
    '</div>' +
    '<div class="dsu-progress"><i></i></div>' +
    '<div class="dsu-bloom"></div>' +
    '<div class="dsu-streak"></div>' +
    '<div class="dsu-flash"></div>' +
    '<div class="dsu-mascot" hidden></div>' +
    '<div class="dsu-event" hidden></div>'

  root.innerHTML = html

  function q(sel) { return root.querySelector(sel) }
  ui.plate = q('.dsu-plate')
  ui.watermark = q('.dsu-watermark')
  ui.black = q('.dsu-black')
  ui.blackInner = q('.dsu-black-inner')
  ui.sweep = q('.dsu-sweep')
  ui.wash = q('.dsu-wash')
  ui.flash = q('.dsu-flash')
  ui.bloom = q('.dsu-bloom')
  ui.streak = q('.dsu-streak')
  /* 赛博风人物立绘（第二页起右下角）：图片内嵌 base64，黑底已抠成透明。
     设置页「人物立绘 = 空」时 mascot 为 -1，整块不渲染。 */
  ui.mascot = q('.dsu-mascot')
  ui.mascot.hidden = true   /* 立绘素材已移除 */
  ui.event = q('.dsu-event')
  ui.vignette = q('.dsu-vignette')
  ui.brand = q('.dsu-brand')
  ui.center = q('.dsu-center')
  ui.brand1 = q('.dsu-brand-1')
  ui.brand2 = q('.dsu-brand-2')
  ui.brand3b = q('.dsu-brand-3 b')
  ui.brand3s = q('.dsu-brand-3 span')
  ui.stepcount = q('.dsu-stepcount')
  ui.status = q('.dsu-status')
  ui.statusZh = q('.dsu-status-zh')
  ui.caret = q('.dsu-caret')
  ui.subEn = q('.dsu-sub-en')
  ui.rule = q('.dsu-rule')
  ui.logo = q('.dsu-logo')
  ui.dots = q('.dsu-dots')
  ui.idline = q('.dsu-idline')
  ui.reticle = q('.dsu-reticle')
  ui.hex = q('.dsu-hex')
  ui.welcome = q('.dsu-welcome')
  ui.w1 = q('.dsu-w1')
  ui.w2 = q('.dsu-w2')
  ui.w3 = q('.dsu-w3')
  ui.w4 = q('.dsu-w4')
  ui.action = q('.dsu-action')
  ui.card = q('.dsu-card')
  ui.btn = q('.dsu-btn')
  ui.btnZh = q('.dsu-btn-zh')
  ui.btnEn = q('.dsu-btn-en')
  ui.hint = q('.dsu-hint')
  ui.skip = q('.dsu-skip')
  ui.foot = q('.dsu-foot')
  ui.footText = q('.dsu-foot span')
  ui.subZh = q('.dsu-sub-zh')
  ui.subEn2 = q('.dsu-sub-en2')
  ui.progress = q('.dsu-progress')
  ui.bar = q('.dsu-progress i')
  ui.frame = q('.dsu-frame')
  ui.scanline = q('.dsu-scanline')
  ui.slats = q('.dsu-slats')
  ui.voice = q('.dsu-voice')
  ui.meta = q('.dsu-meta')
  ui.meta1 = q('.dsu-meta-1')
  ui.meta2 = q('.dsu-meta-2')

  /* 内容填充 */
  ui.brand1.textContent = C.brand1
  ui.brand2.textContent = C.brand2
  ui.brand3b.textContent = C.brand3a
  ui.brand3s.textContent = C.brand3b
  ui.footText.textContent = C.footer
  ui.w2.textContent = C.welcomeBox
  ui.w4.textContent = '欢迎 ' + C.identity + ' 访问'
  ui.idline.textContent = '· ID CONFIRMED : ' + C.identityId

  /* ── 第一幕：开屏视频 ────────────────────────────────────────────────────
     配了 C.bootVideo 就把「徽章 + 中文大字 + 英文 + 副标」整段换成视频，
     视频由 Host 的 /dsh-startup/boot-video 下发（放在 lib/assets/videos/ 里）。
     拿不到视频 / 解码失败时自动退回原来的标识 + 文字，绝不把首屏卡在黑屏上。 */
  var bootVideo = null
  var BOOT_VIDEO_SRC = (function () {
    var u = String(window.__DSH_STARTUP_SCRIPT_URL__ || '')
    var m = /^(.*)\/splash\.js/.exec(u)
    return (m ? m[1] : '/dsh-startup') + '/boot-video'
  })()

  ;(function blackStage() {
    var inner = ui.blackInner
    var legacyBuilt = false
    function buildLegacy() {
      if (legacyBuilt) return
      legacyBuilt = true
      inner.appendChild(svgWhale('dsu-whale'))
      inner.appendChild(el('div', 'dsu-black-zh', C.orgZh))
      var en = el('div', 'dsu-black-en', C.orgEn)
      inner.appendChild(en)
      inner.appendChild(el('div', 'dsu-black-sub', C.orgSub))
      ui.blackEn = en
    }
    var name = String(C.bootVideo || '').trim()
    if (!name) { buildLegacy(); return }
    var v = document.createElement('video')
    v.className = 'dsu-boot-video'
    v.src = BOOT_VIDEO_SRC + '?v=' + encodeURIComponent(name)
    v.preload = 'auto'
    v.muted = !C.bootVideoSound
    /* 音量：素材已校准到 -18 LUFS，默认 1.0 就是目标响度 */
    var bv = Number(C.bootVideoVolume)
    v.volume = Math.min(1, Math.max(0, isFinite(bv) ? bv : 1))
    v.defaultMuted = v.muted
    v.playsInline = true
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    v.addEventListener('error', function () {
      /* 视频挂了就立刻退回原版第一幕（ram 里留个空节点没有意义） */
      bootVideo = null
      if (v.parentNode) v.parentNode.removeChild(v)
      buildLegacy()
    })
    ui.black.appendChild(v)
    bootVideo = v
  })()

  ;(function logoStage() {
    ui.logo.appendChild(svgWhale())
    ui.logo.appendChild(el('div', 'dsu-logolabel', 'D E E P S E E K'))
  })()

  ;(function welcomeLogo() {
    ui.w3.appendChild(svgWhale())
    ui.w3.appendChild(el('span', 'dsu-w3label', 'D E E P S E E K  ·  H A R N E S S'))
  })()

  ;(function watermark() {
    var boxes = [
      [0.60, 0.02, 0.16, 0.96], [0.78, 0.02, 0.16, 0.96], [0.96, 0.02, 0.16, 0.96],
      [0.05, 0.02, 0.10, 0.5]
    ]
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i]
      var n = el('div', 'dsu-wm')
      n.style.left = (b[0] * 100) + '%'
      n.style.top = (b[1] * 100) + '%'
      n.style.width = (b[2] * 100) + '%'
      n.style.height = (b[3] * 100) + '%'
      ui.watermark.appendChild(n)
    }
  })()

  /* 左侧六格阶段柱 + 品牌块下方的小字数据行 + 实时时钟 */
  ;(function slatsAndMeta() {
    for (var i = 0; i < STEPS.length + 1; i++) ui.slats.appendChild(el('i', 'dsu-slat'))
    ui.meta1.textContent = 'REV 0.1.0 · WEB PROFILE'
    paintClock()
    clockTimer = setInterval(paintClock, 1000)
  })()

  ;(function reticle() {
    var ns = 'http://www.w3.org/2000/svg'
    var svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('viewBox', '0 0 400 400')
    function arc(cx, cy, r, a0, a1, cls, cap) {
      var rad = function (d) { return (d - 90) * Math.PI / 180 }
      var x0 = cx + r * Math.cos(rad(a0)), y0 = cy + r * Math.sin(rad(a0))
      var x1 = cx + r * Math.cos(rad(a1)), y1 = cy + r * Math.sin(rad(a1))
      var large = (a1 - a0) > 180 ? 1 : 0
      var p = document.createElementNS(ns, 'path')
      p.setAttribute('d', 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) +
        ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2))
      p.setAttribute('class', cls)
      if (cap) p.setAttribute('stroke-linecap', cap)
      return { node: p, x: x1, y: y1, x0: x0, y0: y0 }
    }
    var gA = document.createElementNS(ns, 'g')
    gA.setAttribute('class', 'dsu-ret-rot-a')
    /* 300° 弧，缺口留在正下方 6 点钟方向：底部字幕永远不会被压到，
       弧末端圆点落在 5 点钟位置，和原片一致。 */
    var a = arc(200, 200, 150, 215, 505, 'dsu-ring-a', 'round')
    gA.appendChild(a.node)
    var da = document.createElementNS(ns, 'circle')
    da.setAttribute('class', 'dsu-dot-a')
    da.setAttribute('cx', a.x.toFixed(2)); da.setAttribute('cy', a.y.toFixed(2)); da.setAttribute('r', '7')
    gA.appendChild(da)
    svg.appendChild(gA)

    var gB = document.createElementNS(ns, 'g')
    gB.setAttribute('class', 'dsu-ret-rot-b')
    var b = arc(200, 200, 104, 200, 490, 'dsu-ring-b', 'round')
    gB.appendChild(b.node)
    var db = document.createElementNS(ns, 'circle')
    db.setAttribute('class', 'dsu-dot-b')
    db.setAttribute('cx', b.x0.toFixed(2)); db.setAttribute('cy', b.y0.toFixed(2)); db.setAttribute('r', '4')
    gB.appendChild(db)
    svg.appendChild(gB)

    var gC = document.createElementNS(ns, 'g')
    var bl = arc(200, 200, 62, 118, 242, 'dsu-bracket', 'round')
    var br = arc(200, 200, 62, 298, 62, 'dsu-bracket', 'round')
    gC.appendChild(bl.node); gC.appendChild(br.node)
    svg.appendChild(gC)

    var pts = [[152, 132], [252, 268], [278, 150]]
    for (var i = 0; i < pts.length; i++) {
      var c = document.createElementNS(ns, 'circle')
      c.setAttribute('class', 'dsu-dot-o')
      c.setAttribute('cx', pts[i][0]); c.setAttribute('cy', pts[i][1]); c.setAttribute('r', '2.8')
      svg.appendChild(c)
    }
    ui.reticle.appendChild(svg)
  })()

  /* ── 时间线引擎 ───────────────────────────────────────────────────────── */
  var timers = []
  var waiters = []
  var skipped = false
  var finished = false
  var hexTimer = null

  function ms(base) { return Math.round(base / C.speed) }

  function wait(base) {
    return new Promise(function (resolve) {
      if (skipped) return resolve()
      var done = false
      function fin() {
        if (done) return
        done = true
        var i = waiters.indexOf(fin)
        if (i >= 0) waiters.splice(i, 1)
        resolve()
      }
      var t = setTimeout(fin, Math.max(0, ms(base)))
      timers.push(t)
      waiters.push(fin)
    })
  }

  function waitAction(step) {
    return new Promise(function (resolve) {
      if (skipped) return resolve()
      /* ── 三档自动播放（设置页「自动播放」）──────────────────────────
         full：任何一步都不等；
         once：只在第一步（授予访问权限）等一次，之后全自动；
         off ：第 1、2 步都等（grant/confirm 两步）。
         第二步的密码校验只在「不自动播放」档启用，所以用 needPwd 兜住，
         保证「仅需点击一次进入」不会漏一道密码闸。 */
      var isWaitStep = step && (step.action === 'grant' || step.action === 'confirm')
      if (C.autoPlay === 'full') return resolve()
      if (C.autoPlay === 'once' && !(step && step.action === 'grant')) return resolve()
      if (C.autoPlay === 'off' && !isWaitStep) return resolve()
      /* 第二步密码校验：设置了 identityPassword 才拦截，输对才推进 */
      var needPwd = step && step.action === 'confirm' && C.identityPassword
      /* 「仅需点击一次进入」要求空密码；万一配置里还留着密码，这里跳过密码闸，
         否则等一次点击就变成「必须先输对密码」，与选项描述不符。 */
      if (C.autoPlay === 'once') needPwd = false
      /* 空档里刚按过 Enter（「不自动播放」连按两下）→ 这一步直接放行。
         有密码时不这么做：密码必须真的输进去。 */
      if (!needPwd && consumeRecentPress()) return resolve()
      if (needPwd && ui.pwdInput) {
        ui.pwdInput.value = ''
        if (ui.pwdErr) ui.pwdErr.textContent = ''
        ui.pwdInput.classList.remove('dsu-pwd-shake')
        try { ui.pwdInput.focus() } catch (e) {}
      }
      var done = false
      function fin() {
        if (done) return
        if (needPwd) {
          var input = ui.pwdInput ? ui.pwdInput.value : ''
          if (input !== C.identityPassword) {
            if (ui.pwdErr) ui.pwdErr.textContent = '密码错误，无法进入'
            if (ui.pwdInput) {
              ui.pwdInput.classList.add('dsu-pwd-shake')
              ui.pwdInput.value = ''
              try { ui.pwdInput.focus() } catch (e) {}
            }
            audio.deny()
            return
          }
        }
        done = true
        cleanup()
        resolve()
      }
      function onKey(e) {
        if (needPwd) {
          /* 密码模式只响应 Enter（空格留给输入框打字） */
          if (e.key === 'Enter') { e.preventDefault(); fin() }
          return
        }
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); fin() }
      }
      function onClick(e) {
        /* 密码模式下点击输入框本身只是聚焦，不触发确认 */
        if (needPwd && ui.pwdInput && e.target === ui.pwdInput) return
        e.preventDefault(); fin()
      }
      function cleanup() {
        ui.btn.removeEventListener('click', onClick)
        ui.action.removeEventListener('click', onClick)
        document.removeEventListener('keydown', onKey)
        var i = waiters.indexOf(fin)
        if (i >= 0) waiters.splice(i, 1)
      }
      ui.btn.addEventListener('click', onClick)
      ui.action.addEventListener('click', onClick)
      document.addEventListener('keydown', onKey)
      waiters.push(fin)
    })
  }

  function releaseAll() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i])
    timers.length = 0
    var list = waiters.slice()
    waiters.length = 0
    for (var j = 0; j < list.length; j++) { try { list[j]() } catch (err) { /* noop */ } }
  }

  /* ── 确认连按：前后两次确认之间的空档也能用 Enter 快进 ──────────────────
     「不自动播放」档：第一步按 Enter 确认后，要等语音念完 + 320ms 才切到第二步，
     这一秒多里没有任何「等待确认」的状态，此时按的 Enter 会被直接丢掉 ——
     用户连按两下，第二下就像没反应。
     做法：只记录「没有在等待时」按下的 Enter；下一步开始等待时若在 1.5 秒内就直接放行。
     等待中的 Enter 由各自的监听处理，不会被这里重复计数。 */
  var CONFIRM_GRACE_MS = 1500
  var idlePressAt = 0

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || skipped || finished) return
    if (waiters.length === 0) idlePressAt = Date.now()
  })

  /** 开始等待时调用：刚在空档里按过 Enter 就直接放行（一次只放行一步）。 */
  function consumeRecentPress() {
    var fresh = idlePressAt > 0 && (Date.now() - idlePressAt) < CONFIRM_GRACE_MS
    idlePressAt = 0
    return fresh
  }

  function setProgress(p) {
    var pct = Math.max(0, Math.min(1, p))
    ui.bar.style.width = Math.round(pct * 100) + '%'
  }

  /** 六格阶段柱：走过的压暗、当前的拉满并点亮主题橙 */
  function setSlats(active) {
    var items = ui.slats.children
    for (var i = 0; i < items.length; i++) {
      var idx = i + 1
      items[i].classList.toggle('dsu-on', idx === active)
      items[i].classList.toggle('dsu-past', idx < active)
    }
  }

  /** 扫描线自上而下扫一遍（底板洗白后一次，验准时再一次） */
  function sweep() {
    if (!ui.scanline) return
    ui.scanline.classList.remove('dsu-go')
    void ui.scanline.offsetWidth
    ui.scanline.classList.add('dsu-go')
  }

  function paintClock() {
    var d = new Date()
    var pad = function (n) { return (n < 10 ? '0' : '') + n }
    ui.meta2.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
  }

  function setSubtitle(zh, en) {
    /* 同一句不重复设：视频交接时这一屏已经写好了，再走一遍会让字幕闪一下 */
    if (ui.subZh.textContent === (zh || '') && ui.subEn2.textContent === (en || '') &&
        ui.subZh.classList.contains('dsu-in')) return
    ui.subZh.classList.remove('dsu-in')
    ui.subEn2.classList.remove('dsu-in')
    setTimeout(function () {
      ui.subZh.textContent = zh || ''
      ui.subEn2.textContent = en || ''
      ui.subZh.classList.add('dsu-in')
      if (en) ui.subEn2.classList.add('dsu-in')
    }, ms(140))
  }

  function setStepCount(i, code) {
    var totalSteps = STEPS.length + 1
    ui.stepcount.textContent = '[ ' + String(i).padStart(2, '0') + ' / ' +
      String(totalSteps).padStart(2, '0') + ' ] ' + code
  }

  function startHex() {
    var lines = 12
    function line() {
      var s = ''
      for (var i = 0; i < 26; i++) {
        s += '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16))
        if (i % 2 === 1) s += ' '
      }
      return s
    }
    function paint() {
      var out = []
      for (var i = 0; i < lines; i++) out.push(line())
      ui.hex.innerHTML = out.join('<br>')
    }
    paint()
    ui.hex.classList.add('dsu-in')
    audio.tickRun()
    hexTimer = setInterval(paint, 110)
  }
  function stopHex() {
    if (hexTimer) { clearInterval(hexTimer); hexTimer = null }
    ui.hex.classList.remove('dsu-in')
  }

  /* ── 声音 ──────────────────────────────────────────────────────────────
   * 两条独立的通道，都不依赖任何音频文件：
   *   audio —— 界面音效，WebAudio 现场合成（咔哒 / 双音确认 / 噪声扫频 / 和声钟）
   *   voice —— 女声播报，Web Speech API 念每一行的英文（照参考片的女声节奏：
   *            7.3-9.3s 念状态行、19.6-21.2s 念 PERMISSION AUTHORIZED）
   * 浏览器策略要求"先有用户手势"，所以第一次点击/按键会补一次解锁 + 补播。 */
  function clamp01(v, lo, hi) {
    var n = Number(v)
    return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo
  }

  var audio = (function () {
    var ctx = null
    function ac(force) {
      /* 语音素材要独立于「界面音效」开关：force=true 时无视 C.sound */
      if (!C.sound && !force) return null
      try {
        var AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return null
        if (!ctx) ctx = new AC()
        if (ctx.state === 'suspended' && typeof ctx.resume === 'function') ctx.resume()
        return ctx
      } catch (e) { return null }
    }
    function vol(gain) { return Math.max(0.0002, (gain == null ? 0.05 : gain) * clamp01(C.soundVolume, 0, 1) * 2) }
    function tone(freq, dur, type, gain, delay, glideTo) {
      var c = ac(); if (!c) return
      try {
        var t0 = c.currentTime + (delay || 0)
        var o = c.createOscillator(), g = c.createGain()
        o.type = type || 'sine'
        o.frequency.setValueAtTime(freq, t0)
        if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur)
        g.gain.setValueAtTime(0.0001, t0)
        g.gain.exponentialRampToValueAtTime(vol(gain), t0 + Math.min(0.02, dur * 0.3))
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
        o.connect(g); g.connect(c.destination)
        o.start(t0); o.stop(t0 + dur + 0.03)
      } catch (e) { /* 静默降级 */ }
    }
    function noise(dur, gain) {
      var c = ac(); if (!c) return
      try {
        var n = Math.floor(c.sampleRate * dur)
        var buf = c.createBuffer(1, n, c.sampleRate)
        var d = buf.getChannelData(0)
        for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n)
        var src = c.createBufferSource(); src.buffer = buf
        var f = c.createBiquadFilter(); f.type = 'bandpass'
        f.frequency.value = 1500; f.Q.value = 0.6
        var g = c.createGain(); g.gain.value = vol(gain)
        src.connect(f); f.connect(g); g.connect(c.destination)
        src.start()
      } catch (e) { /* 静默降级 */ }
    }
    /* 真声素材（用户音频里抠出来的"哒"等）从打包内联的 window.__DSA_ASSETS__
       取出并解码缓存；不再走音频 HTTP 路由。
       拿不到就自动回落到下面合成的音，功能不依赖网络/素材存在与否。 */
    var buffers = {}
    var fetching = {}

    /* 音频素材改为打包内联（lib/asset-data.js → window.__DSA_ASSETS__），
       不再经过音频 HTTP 路由：离线、本地、零网络请求。 */
    function b64ToBuf(b64) {
      var bin = atob(b64)
      var len = bin.length
      var bytes = new Uint8Array(len)
      for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i)
      return bytes.buffer
    }
    function decodeAsset(name) {
      return new Promise(function (resolve) {
        try {
          var uri = (window.__DSA_ASSETS__ && window.__DSA_ASSETS__[name]) || null
          if (!uri) { resolve(null); return }
          var comma = uri.indexOf(',')
          var b64 = comma >= 0 ? uri.slice(comma + 1) : uri
          ac(true).decodeAudioData(b64ToBuf(b64))
            .then(function (buf) { resolve(buf || null) })
            .catch(function () { resolve(null) })
        } catch (e) { resolve(null) }
      })
    }
    function loadAsset(name) {
      if (C.sfx === 'synth') return
      if (buffers[name] || fetching[name]) return
      fetching[name] = true
      decodeAsset(name).then(function (buf) { if (buf) buffers[name] = buf }).catch(function () {})
    }
    /* 素材预加载：fetch + decodeAudioData 不需要用户手势，所以加载时就拉，
       这样第一步就能用真声，而不用等用户第一次点击。 */
    var pending = {}
    function ensureAsset(name) {
      if (buffers[name]) return Promise.resolve(true)
      if (pending[name]) return pending[name]
      if (C.voiceSource === 'tts') return Promise.resolve(false)
      pending[name] = new Promise(function (resolve) {
        decodeAsset(name).then(function (buf) {
          if (buf) { buffers[name] = buf; resolve(true) } else { resolve(false) }
        }).catch(function () { resolve(false) })
      })
      return pending[name]
    }

    /** 播素材并等它播完，resolve 实际时长(ms)。拿不到素材 resolve 0。 */
    function playAssetAndWait(name, gain) {
      return new Promise(function (resolve) {
        var c = ac(true)
        var buf = buffers[name]
        if (!c || !buf) { resolve(0); return }
        try {
          var src = c.createBufferSource()
          src.buffer = buf
          var g = c.createGain()
          g.gain.value = Math.min(1, (gain == null ? 0.85 : gain) * clamp01(C.voiceVolume, 0, 1) * 1.6)
          src.connect(g); g.connect(c.destination)
          src.onended = function () { resolve(Math.round(buf.duration * 1000)) }
          src.start()
        } catch (e) { resolve(0) }
      })
    }

    function playAsset(name, gain) {
      var c = ac(); if (!c) return false
      var buf = buffers[name]
      if (!buf) { loadAsset(name); return false }
      try {
        var src = c.createBufferSource()
        src.buffer = buf
        var g = c.createGain()
        g.gain.value = Math.min(1, (gain == null ? 0.55 : gain) * clamp01(C.soundVolume, 0, 1) * 2)
        src.connect(g); g.connect(c.destination)
        src.start()
        return true
      } catch (e) { return false }
    }

    return {
      resume: function () { ac(); loadAsset('sfx-tick'); loadAsset('sfx-ticks-run') },
      preload: function () { loadAsset('sfx-tick'); loadAsset('sfx-ticks-run') },
      ensureAsset: ensureAsset,
      playAssetAndWait: playAssetAndWait,
      /* 文字渐显 / 阶段推进 / 按钮确认 —— 优先用真素材 */
      tick: function () { if (!playAsset('sfx-tick', 0.45)) tone(1760, 0.035, 'square', 0.022) },
      confirm: function () { if (!playAsset('sfx-tick', 0.85)) { tone(660, 0.09, 'triangle', 0.07); tone(990, 0.17, 'triangle', 0.055, 0.085) } },
      tickRun: function () { playAsset('sfx-ticks-run', 0.5) },
      step: function () { if (!playAsset('sfx-tick', 0.6)) { tone(880, 0.05, 'sine', 0.05); tone(1320, 0.07, 'sine', 0.028, 0.045) } },
      hover: function () { tone(2200, 0.02, 'sine', 0.018) },
      /* 密码错误 / 访问拒绝：两声下沉的钝响，和 confirm 的上行音反着来 */
      deny: function () { tone(196, 0.18, 'sawtooth', 0.05); tone(130, 0.24, 'sawtooth', 0.045, 0.09) },
      confirm: function () { tone(660, 0.09, 'triangle', 0.07); tone(990, 0.17, 'triangle', 0.055, 0.085) },
      sweep: function () { noise(0.75, 0.035) },
      /* 念台词之前的两声轻提示：这一笔让 TTS 从"浏览器念字"变成"系统播报" */
      cue: function () { tone(1046.5, 0.05, 'sine', 0.028); tone(1568, 0.06, 'sine', 0.02, 0.075) },
      rise: function () { tone(220, 1.1, 'sine', 0.032, 0, 990) },
      chime: function () {
        tone(659.25, 0.9, 'sine', 0.055)
        tone(830.61, 0.9, 'sine', 0.04, 0.09)
        tone(987.77, 1.3, 'sine', 0.045, 0.18)
      }
    }
  })()

  var voice = (function () {
    /* 用户要求：本插件不再使用任何 TTS 合成语音。
       人声只走 lib/assets 里预录的真声素材（line-*）；素材拿不到就静音，
       绝不回落 speechSynthesis。下面这个开关一关，TTS 相关的
       预热念白 / 台词兜底 / 名字播报 / 语音列表加载 全部自动短路。 */
    var TTS_ENABLED = false
    var supported = TTS_ENABLED && typeof window !== 'undefined' && !!window.speechSynthesis &&
      typeof window.SpeechSynthesisUtterance === 'function'
    var voices = []
    var picked = { en: null, zh: null }
    var meter = null
    var saidOnce = false
    var pending = { en: '', zh: '' }

    /* 想让它听起来像"AI 播报"，音色本身比什么都重要。
       同一台机器上，"Microsoft Zira Desktop" 是上世纪拼接合成，念长句塑料味很重；
       Edge 的 "... Online (Natural)"、Chrome 的 "Google ..."、macOS 的 Siri 才是神经网络音色。
       所以这里按分数挑，而不是挨个名字第一个命中。 */
    var NATURAL_HINTS = ['natural', 'neural', 'online', 'premium', 'enhanced', 'siri', 'google']
    var FEMALE_HINTS = [
      'aria', 'jenny', 'michelle', 'emma', 'ava', 'libby', 'sonia', 'maisie',
      'zira', 'samantha', 'karen', 'moira', 'tessa', 'victoria', 'serena', 'allison',
      'susan', 'fiona', 'hazel', 'female', 'woman',
      'xiaoxiao', 'xiaoyi', 'xiaomo', 'huihui', 'yaoyao', '晓晓', '晓伊', '女声'
    ]
    var MALE_HINTS = ['david', 'mark', 'guy', 'ryan', 'george', 'daniel', 'alex', 'fred',
      'male', 'yunxi', 'yunjian', 'kangkang']

    /** 给一个音色打分：神经网络 > 女声 > 语种吻合 > 本地 */
    function score(v, want) {
      var name = String(v.name || '').toLowerCase()
      var lang = String(v.lang || '').toLowerCase()
      var sc = 0
      for (var i = 0; i < NATURAL_HINTS.length; i++) {
        if (name.indexOf(NATURAL_HINTS[i]) !== -1) { sc += 60; break }
      }
      for (var j = 0; j < FEMALE_HINTS.length; j++) {
        if (name.indexOf(FEMALE_HINTS[j]) !== -1) { sc += 40; break }
      }
      for (var k = 0; k < MALE_HINTS.length; k++) {
        if (name.indexOf(MALE_HINTS[k]) !== -1) { sc -= 45; break }
      }
      if (lang.indexOf(want) === 0) sc += 25
      if (v.localService) sc += 4          /* 本地音色起播快，不会先卡半秒 */
      if (v.default) sc += 3
      return sc
    }

    /** 挑某语种最合适的一个音色（want 传 'en' / 'zh' 这样的两字母前缀） */
    function bestFor(want) {
      if (!voices.length) return null
      if (C.voiceName) {
        for (var i = 0; i < voices.length; i++) {
          var v = voices[i]
          if (v.name === C.voiceName && String(v.lang || '').toLowerCase().indexOf(want) === 0) return v
        }
      }
      var pool = []
      for (var j = 0; j < voices.length; j++) {
        if (String(voices[j].lang || '').toLowerCase().indexOf(want) === 0) pool.push(voices[j])
      }
      if (!pool.length) pool = voices.slice()
      var best = null
      var bs = -1e9
      for (var n = 0; n < pool.length; n++) {
        var sc = score(pool[n], want)
        if (sc > bs) { bs = sc; best = pool[n] }
      }
      return best
    }

    function setMeter(on) { if (meter) meter.classList.toggle('dsu-on', !!on) }

    function load() {
      if (!supported) return
      try { voices = window.speechSynthesis.getVoices() || [] } catch (e) { voices = [] }
      picked.en = bestFor('en')
      picked.zh = bestFor('zh')
    }

    /** 全大写名字有些引擎会一个字母一个字母念，转成 Title Case 更像在叫名字 */
    function spokenName(name) {
      return String(name || '').replace(/\S+/g, function (w) {
        return (/^[A-Z0-9.\-]+$/.test(w) && w.length > 1) ? w.charAt(0) + w.slice(1).toLowerCase() : w
      })
    }

    function utter(text, lang) {
      try {
        var u = new window.SpeechSynthesisUtterance(text)
        var v = lang.indexOf('zh') === 0 ? picked.zh : picked.en
        if (v) { u.voice = v; u.lang = v.lang || lang } else u.lang = lang
        /* 神经网络音色在 .95 / 1.02 这个档位最像"系统在播报"：
           再快就赶，再慢就假；音调略抬一点显得干净利落 */
        u.rate = clamp01(C.voiceRate, 0.5, 2)
        u.pitch = clamp01(C.voicePitch, 0, 2)
        u.volume = clamp01(C.voiceVolume, 0, 1)
        u.onstart = function () { setMeter(true) }
        u.onend = function () { setMeter(false) }
        u.onerror = function () { setMeter(false) }
        window.speechSynthesis.speak(u)
        return true
      } catch (e) { return false }
    }

    /** 一句话的时长估算（个别引擎不触发 onend 时兜底；中文按字、英文按字符） */
    function estimateMs(items) {
      var chars = 0
      var rate = clamp01(C.voiceRate, 0.5, 2) || 1
      for (var i = 0; i < items.length; i++) {
        var t = String(items[i].t || '')
        chars += /[\u4e00-\u9fa5]/.test(t) ? t.length * 1.7 : t.length
      }
      return Math.round((chars / 13) * 1000 / rate) + 460
    }

    function buildUtter(text, lang) {
      var u = new window.SpeechSynthesisUtterance(text)
      var v = lang.indexOf('zh') === 0 ? picked.zh : picked.en
      if (v) { u.voice = v; u.lang = v.lang || lang } else u.lang = lang
      u.rate = clamp01(C.voiceRate, 0.5, 2)
      u.pitch = clamp01(C.voicePitch, 0, 2)
      u.volume = clamp01(C.voiceVolume, 0, 1)
      return u
    }

    return {
      supported: supported,
      load: load,
      attach: function (node) { meter = node },

      /**
       * 念一行，返回"这一行实际花了多久(ms)"的 Promise。
       *
       * 三个关键决定：
       *  - **不 cancel 上一句**。原来每步都 cancel，用户点快一点、或者
       *    hold 短于台词长度，语音就被硬生生掐断 —— 那正是要避免的。
       *    speechSynthesis 本身是队列，不 cancel 就是顺序播报。
       *  - 提示音响过之后留 `voiceLead` 的空白再开口，这是旁白的呼吸感。
       *  - 等 `onend` 才 resolve，动画据此决定这一步停多久；个别引擎不触发
       *    onend 时按估算兜底，绝不把动画卡死。
       */
      line: function (en, zh, asset) {
        /* 有真声素材就优先用素材（音色就是你给的那个）；拿不到再回落 TTS */
        if (asset && C.voice && C.voiceSource !== 'tts' && !finished) {
          return audio.ensureAsset(cnAsset(asset)).then(function (ok) {
            if (!ok || finished) return 0
            if (C.voiceCue !== false) audio.cue()
            return audio.playAssetAndWait(cnAsset(asset), 0.85).then(function (ms) {
              if (ms > 0) setMeter(true)
              return ms
            })
          }).then(function (ms) {
            if (ms > 0) { saidOnce = true; return ms }
            return ttsLine(en, zh)
          })
        }
        return ttsLine(en, zh)
      },

      /** TTS 路径：素材缺失 / voiceSource=tts / 终幕那条动态名字 */
      tts: function (en, zh) { return ttsLine(en, zh) },

      /** 不等待的版本：设置页试听 / 任何"念完就行"的场合 */
      say: function (en, zh) { return this.line(en, zh) },

      /** 浏览器要求"先有用户手势"才放声：第一次点击/按键解锁 + 补播当前行 */
      unlock: function () {
        try { if (supported) window.speechSynthesis.resume() } catch (e) {}
        audio.resume()
        /* 预热：先无声念一个空格，把引擎唤醒，避免第一句被吃掉开头半个字 */
        if (supported && !saidOnce) {
          try {
            var w = new window.SpeechSynthesisUtterance(' ')
            w.volume = 0
            var v = picked.en || picked.zh
            if (v) { w.voice = v; w.lang = v.lang }
            window.speechSynthesis.speak(w)
          } catch (e) { /* noop */ }
        }
        if (!saidOnce && C.voice && (pending.en || pending.zh)) this.say(pending.en, pending.zh)
      },
      speakName: spokenName,
      current: function () {
        var a = picked.en ? picked.en.name : ''
        var b = picked.zh ? picked.zh.name : ''
        return a === b ? a : (a + (b ? '  /  ' + b : ''))
      },
      listVoices: function () { return voices.slice() },
      /** 只有这里才真的掐断语音（跳过 / 揭幕） */
      stop: function () { try { if (supported) window.speechSynthesis.cancel() } catch (e) {} setMeter(false) }
    }

    /** TTS 合成并等它念完，resolve 实际时长(ms)；拿不到引擎时 resolve 0。 */
    function ttsLine(en, zh) {
      return new Promise(function (resolve) {
        if (!supported || !C.voice || finished) { resolve(0); return }
        pending = { en: en || '', zh: zh || '' }
        var items = []
        var mode = C.voiceLang
        if (mode === 'zh') { if (zh) items.push({ t: zh, l: 'zh-CN' }) }
        else if (mode === 'both') {
          if (zh) items.push({ t: zh, l: 'zh-CN' })
          if (en) items.push({ t: en, l: 'en-US' })
        } else if (en) { items.push({ t: en, l: 'en-US' }) }
        if (!items.length) { resolve(0); return }

        saidOnce = true
        if (C.voiceCue !== false) audio.cue()

        var startedAt = Date.now()
        var est = estimateMs(items)
        var lead = clamp01(C.voiceLead, 0, 1200)
        var settled = false
        var watchdog = null

        function settle() {
          if (settled) return
          settled = true
          if (watchdog) clearTimeout(watchdog)
          setMeter(false)
          resolve(Math.max(0, Date.now() - startedAt))
        }

        setTimeout(function () {
          if (finished) { settle(); return }
          var last = items.length - 1
          for (var i = 0; i <= last; i++) {
            var u = buildUtter(items[i].t, items[i].l)
            if (i === last) {
              u.onstart = function () { setMeter(true) }
              u.onend = settle
              u.onerror = settle
            }
            try { window.speechSynthesis.speak(u) } catch (e) { if (i === last) settle() }
          }
          watchdog = setTimeout(settle, est + 900)
        }, lead)
      })
    }
  })()

  /* 语音/音效接线：声卡要等用户手势才能出声，这里挂一次性解锁 */
  voice.attach(q('.dsu-voice'))
  ;(function preloadVoices() {
    if (C.voiceSource === 'tts') return
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i].audio) audio.ensureAsset(cnAsset(STEPS[i].audio))
    audio.ensureAsset(cnAsset('line-6'))   /* 终幕欢迎语 */
  })()
  /* ── 背景音乐（BGM）────────────────────────────────────────────────────
     第二幕（底板 + 五步流程）循环播 loop 曲；终幕换成 finale 曲。
     用普通 <audio> 而不是 WebAudio.decodeAudioData：1 分钟的曲子没必要整段解码进内存，
     loop 交给浏览器原生实现。自动播放可能被策略拦下 → 挂到第一次用户手势上补播
     （第一步本来就要点「授予访问权限」，所以静音档也有手势）。
     关闭「界面音效」= 不放 BGM。 */
  var BGM_BASE = (function () {
    var u = String(window.__DSH_STARTUP_SCRIPT_URL__ || '')
    var m = /^(.*)\/splash\.js/.exec(u)
    return (m ? m[1] : '/dsh-startup') + '/bgm'
  })()

  var bgm = (function () {
    var boardEl = null
    var finaleEl = null
    var armed = false

    function wanted(kind) { return String((kind === 'board' ? C.bgmBoard : C.bgmFinale) || '').trim() }

    /* 底板曲和终幕曲分开给音量：素材都已校准到 -18 LUFS */
    function volume(kind) {
      var raw = kind === 'finale' ? C.bgmFinaleVolume : C.bgmVolume
      var v = Number(raw)
      if (!isFinite(v)) v = kind === 'finale' ? 1 : 0.35
      return Math.min(1, Math.max(0, v))
    }

    function mk(kind, loop) {
      var a = document.createElement('audio')
      a.src = BGM_BASE + '?k=' + kind
      a.loop = !!loop
      a.preload = 'auto'
      a.volume = 0
      /* 挂进 body（不显示）：挂在文档里的媒体元素行为最一致，调试时也能在
         Elements 面板里直接看到 currentTime / paused。 */
      a.style.display = 'none'
      ;(document.body || document.documentElement).appendChild(a)
      return a
    }

    /* 淡入 / 淡出：音量存在元素上，两个元素各自一路定时器，互不打断 */
    function fadeTo(el, target, dur) {
      if (!el) return
      if (el.__fade) { clearInterval(el.__fade); el.__fade = null }
      var from = el.volume || 0
      var total = dur || 600
      var t0 = Date.now()
      /* 进度按「真实经过时间」算，不按 tick 次数：
         后台/无头浏览器会把 setInterval 节流到 ~1s，按次数算会变成几十秒才淡完。 */
      el.__fade = setInterval(function () {
        var k = Math.min(1, (Date.now() - t0) / total)
        el.volume = Math.min(1, Math.max(0, from + (target - from) * k))
        if (k >= 1) { clearInterval(el.__fade); el.__fade = null }
      }, 40)
    }

    function retryLater(el) {
      if (armed) return
      armed = true
      function retry() {
        armed = false
        document.removeEventListener('pointerdown', retry, true)
        document.removeEventListener('keydown', retry, true)
        try {
          if (el && el.paused) {
            var p = el.play()
            if (p && typeof p.catch === 'function') p.catch(function () {})
          }
        } catch (e) { /* 还是不让播就算了，别影响动画 */ }
      }
      document.addEventListener('pointerdown', retry, true)
      document.addEventListener('keydown', retry, true)
    }

    function play(el, kind) {
      if (!el) return
      el.volume = 0
      var p
      try { p = el.play() } catch (e) { retryLater(el); return }
      if (p && typeof p.catch === 'function') p.catch(function () { retryLater(el) })
      fadeTo(el, volume(kind), 900)
    }

    function stopEl(el) {
      if (!el) return
      if (el.__fade) { clearInterval(el.__fade); el.__fade = null }
      try { el.pause(); el.currentTime = 0 } catch (e) { /* noop */ }
    }

    return {
      /* 第二幕开始：底板浮现那一刻起播循环曲 */
      board: function () {
        if (C.sound === false || !wanted('board')) return
        if (boardEl) return
        boardEl = mk('board', true)
        play(boardEl, 'board')
      },
      /* 终幕：配了终幕曲才「淡出底板曲 + 换曲」；没配就让底板曲一直循环到揭幕。
         注意顺序 —— 先判断有没有终幕曲，再决定要不要停底板曲。
         反过来的话，没配终幕曲时也会把底板曲停掉，终幕就整段静音了。 */
      finale: function () {
        if (C.sound === false || !wanted('finale')) return
        if (boardEl) {
          var b = boardEl
          boardEl = null
          fadeTo(b, 0, 700)
          setTimeout(function () { stopEl(b) }, 780)
        }
        if (finaleEl) return
        finaleEl = mk('finale', false)
        play(finaleEl, 'finale')
      },
      /* 揭幕 / 跳过：全停 */
      stop: function () {
        stopEl(boardEl)
        stopEl(finaleEl)
        boardEl = null
        finaleEl = null
      }
    }
  })()

  ;(function wireSound() {
    voice.load()
    if (voice.supported && typeof window.speechSynthesis.addEventListener === 'function') {
      try { window.speechSynthesis.addEventListener('voiceschanged', function () { voice.load() }) } catch (e) {}
    }
    var unlocked = false
    function unlock() {
      if (unlocked) return
      unlocked = true
      voice.unlock()
      document.removeEventListener('pointerdown', unlock, true)
      document.removeEventListener('keydown', unlock, true)
      document.removeEventListener('touchstart', unlock, true)
    }
    document.addEventListener('pointerdown', unlock, true)
    document.addEventListener('keydown', unlock, true)
    document.addEventListener('touchstart', unlock, true)
  })()

  /* ── 时间线 ───────────────────────────────────────────────────────────── */

  /* 视频版交接：这片子的末尾就是「系统自检」那一屏，所以不走洗白，
     而是把底板直接铺好、让黑幕（里面装着视频）整体淡出 —— 相当于对真底板做一次交叉溶解。
     实测末帧亮度 32.2、真底板 39.5，520ms 的溶解看不出接缝。 */
  function videoHandoff() {
    ui.plate.style.transition = 'none'
    ui.plate.style.opacity = '1'
    ui.watermark.style.transition = 'none'
    ui.watermark.style.opacity = '1'
    /* 片子最后一帧是「满配」的系统自检屏：品牌块 / 阶段计数 / 页脚 / 系统自检中 全都在。
       所以这里必须把这屏一次性铺满，否则溶解过程中真底板还是一片空白，
       会看到文字先消失再淡回来。下面 run() 里那段照跑，都是幂等操作不会重放。 */
    ui.brand.classList.add('dsu-in')
    ui.foot.classList.add('dsu-in')
    ui.stepcount.classList.add('dsu-in')
    ui.idline.classList.add('dsu-in')
    ui.frame.classList.add('dsu-in')
    ui.slats.classList.add('dsu-in')
    ui.meta.classList.add('dsu-in')
    ui.vignette.classList.add('dsu-in')
    ui.voice.classList.add('dsu-in')
    setProgress(0.12)
    setStepCount(0, 'BOOT')
    setSlats(0)
    setSubtitle('系统自检中…', 'SYSTEM SELF-CHECK')
    if (C.allowSkip) ui.skip.classList.add('dsu-in')
    ui.black.style.transition = 'opacity ' + ms(520) + 'ms ease'
    ui.black.style.opacity = '0'
    return wait(560)
  }

  /* 原版第一幕：标识浮出 → 字距收紧 → 扫光 */
  function legacyBlackAct() {
    audio.rise()
    return wait(240)
      .then(function () {
        if (ui.blackEn) ui.blackEn.classList.add('dsu-tighten')
        return wait(880)
      })
      .then(function () {
        ui.sweep.classList.add('dsu-go')
        return wait(760)
      })
  }

  /* 视频版第一幕：播到结束（或超时兜底）再进洗白 */
  function bootVideoAct() {
    return new Promise(function (resolve) {
      var v = bootVideo
      if (!v) return resolve()
      var done = false
      function fin() {
        if (done) return
        done = true
        try { v.pause() } catch (e) { /* noop */ }
        resolve()
      }
      /* 兜底：视频卡住也不让首屏等太久 —— 时长 + 1.2s，最多 9s */
      var dur = (isFinite(v.duration) && v.duration > 0) ? v.duration * 1000 : 5200
      var guard = setTimeout(fin, Math.min(9000, ms(dur) + 1200))
      timers.push(guard)
      waiters.push(fin)            /* 「跳过」时由 releaseAll() 放行 */
      v.addEventListener('ended', fin)
      v.addEventListener('error', fin)
      var p = v.play()
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          /* 带声音自动播放被策略拦下 → 静音重播，保证画面先出来 */
          v.muted = true
          var p2 = v.play()
          if (p2 && typeof p2.catch === 'function') p2.catch(fin)
        })
      }
    })
  }

  function run() {
    return Promise.resolve()
      /* 第一幕：黑幕 --> DeepSeek 标识 */
      .then(function () { return wait(820) })
      .then(function () {
        if (bootVideo) {
          /* 视频版第一幕：淡入视频，节奏以视频时长为准 */
          bootVideo.classList.add('dsu-in')
          return bootVideoAct()
        }
        ui.blackInner.classList.add('dsu-in')
        return legacyBlackAct()
      })
      /* 过场：原版第一幕用过曝洗白；视频版走交叉溶解（见 videoHandoff） */
      .then(function () {
        if (bootVideo && C.bootVideoTransition === 'dissolve') return videoHandoff()
        ui.blackInner.classList.add('dsu-out')
        audio.sweep()
        ui.wash.style.transition = 'opacity ' + ms(220) + 'ms linear'
        ui.wash.style.opacity = '1'
        return wait(260)
      })
      .then(function () {
        bgm.board()
        ui.plate.style.transition = 'opacity ' + ms(900) + 'ms ease'
        ui.plate.style.opacity = '1'
        ui.watermark.style.transition = 'opacity ' + ms(1100) + 'ms ease'
        ui.watermark.style.opacity = '1'
        ui.wash.style.transition = 'opacity ' + ms(720) + 'ms cubic-bezier(.2,.9,.2,1)'
        ui.wash.style.opacity = '0'
        ui.black.style.transition = 'opacity ' + ms(720) + 'ms ease'
        ui.black.style.opacity = '0'
        return wait(760)
      })
      /* 第二幕：品牌块 / 页脚 / 进度条 */
      .then(function () {
        ui.brand.classList.add('dsu-in')
        ui.foot.classList.add('dsu-in')
        ui.stepcount.classList.add('dsu-in')
        ui.idline.classList.add('dsu-in')
        ui.frame.classList.add('dsu-in')
        ui.slats.classList.add('dsu-in')
        ui.meta.classList.add('dsu-in')
        ui.vignette.classList.add('dsu-in')
        ui.voice.classList.add('dsu-in')
        setProgress(0.12)
        setStepCount(0, 'BOOT')
        setSlats(0)
        setSubtitle('系统自检中…', 'SYSTEM SELF-CHECK')
        if (C.allowSkip) ui.skip.classList.add('dsu-in')
        return wait(700)
      })
      .then(function () { ui.black.style.display = 'none'; sweep() })
      /* 六个阶段 */
      .then(function () { return stepLoop() })
      /* 终幕 */
      .then(function () { return finale() })
      .catch(function (err) {
        try { console.warn('[dsh-startup-screen] 动画异常，直接揭幕：', err) } catch (e2) {}
        return finish()
      })
  }

  function stepLoop() {
    var chain = Promise.resolve()
    STEPS.forEach(function (step, i) {
      chain = chain.then(function () {
        if (finished) return
        var n = i + 1
        setStepCount(n, step.badge)
        setSlats(n)
        setProgress(step.progress)
        setSubtitle(step.log, step.logEn)
        audio.step()
        if (step.bgm === 'finale') bgm.finale()
        /* 离开「身份资料确认」那一步时把卡片收起来：
           自动播放档下卡片会一直留着，不清掉的话第三步以后还会挂着一块「身份资料」。 */
        if (step.action !== 'confirm' && ui.card) {
          ui.card.hidden = true
          if (C.autoPlay === 'full') {
            /* full 档容器一直保持可见，只需把卡片本身藏掉 */
            ui.card.hidden = true
          } else if (n > 2) {
            hideAction()
          }
        }
        /* 语音在这里起头，但**不阻塞**下面的文字渐显 —— 两者同时发生 */
        /* silent：既不播素材、也不回落 TTS（voice.line 在 asset 为空时会走 TTS） */
        var spoke = step.silent ? Promise.resolve(0) : voice.line(step.say, step.zh, step.audio)

        ui.status.classList.toggle('dsu-zhline', true)
        /* 先摘掉 dsu-in 并强制一次样式计算，新的逐字 span 才会重新走渐显动画 */
        ui.status.classList.remove('dsu-in')
        ui.subEn.classList.remove('dsu-in')
        void ui.status.offsetWidth
        typeIn(ui.statusZh, step.zh, 46)
        typeIn(ui.subEn, step.en, 13)
        ui.caret.classList.toggle('dsu-on', !!step.action && step.action !== 'auto')
        requestAnimationFrame(function () {
          if (finished) return
          ui.status.classList.add('dsu-in')
          ui.subEn.classList.add('dsu-in')
        })
        ui.rule.classList.add('dsu-in')

        if (step.assembleLogo) assembleLogo()
        if (step.reticle) {
          /* 照原片：准星出现时中央只留状态字，鲸鱼标识和虚线收掉，别挤成一团 */
          ui.logo.classList.remove('dsu-in')
          ui.dots.hidden = true
          ui.reticle.classList.add('dsu-in')
          sweep()
        }
        if (step.hex) startHex()

        /* 这一步停多久 = max(视觉基准, 实际播报时长 + 收尾留白) —— 台词长就多停，
           台词短也不会干等。用户点得快时同样等这一句念完，不掐断。 */
        function holdFor(spoken) {
          var target = Math.max(ms(step.hold), (spoken || 0) + ms(240))
          return wait(Math.max(0, target - (spoken || 0)))
        }

        if (step.action === 'grant' || step.action === 'confirm') {
          /* 这一步要不要摆按钮，由三档自动播放决定：
             full = 不摆；once = 只在第一步摆；off = 第 1、2 步都摆。 */
          var wantsWait = C.autoPlay === 'off' ||
            (C.autoPlay === 'once' && step.action === 'grant')
          if (wantsWait) {
            showAction(step)
            return wait(520)
              .then(function () { return waitAction(step) })
              .then(function () {
                hideAction()
                audio.confirm()
                ui.caret.classList.remove('dsu-on')
                return spoke
              }).then(function () { return wait(ms(320)) })
          }
          /* 自动播放：立绘/身份卡照常出现，但不等任何操作，停顿按视觉基准走。
             注意：这里**不能**紧接着调 hideAction() —— 那会把刚加上的 dsu-in 又摘掉，
             .dsu-action 回到 opacity:0，住在里面的身份资料卡就整块看不见了
             （2026-10-19 用户两次反馈「看不到身份信息」的真正原因）。
             卡片保持可见直到这一步结束，进入下一步时由 showAction 重新决定内容。 */
          showAction(step)
          return spoke.then(holdFor)
        }
        if (step.hex) {
          return spoke.then(holdFor).then(function () { stopHex() })
        }
        return spoke.then(holdFor)
      })
    })
    return chain
  }

  function assembleLogo() {
    ui.logo.classList.add('dsu-in')
    ui.dots.hidden = false
    /* 党徽图片：柔和放大淡入（图片版不再做勾线动画，保持丝滑） */
    var img = ui.logo.querySelector('img')
    if (img) {
      try {
        img.animate(
          [
            { opacity: 0, transform: 'scale(0.86)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          { duration: ms(900), easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'backwards' }
        )
      } catch (err) { /* Web Animations 不可用时直接显示 */ }
    }
    return wait(300)
  }

  function showAction(step) {
    ui.btnZh.textContent = step.btnZh
    ui.btnEn.textContent = step.btnEn
    ui.card.hidden = step.action !== 'confirm'
    /* 第二步是否需要密码：只有设置了 identityPassword 才启用密码校验 */
    var needPwd = step.action === 'confirm' && C.identityPassword
    if (step.action === 'confirm') {
      ui.card.innerHTML = ''
      /* 纯中文标签 + 数字/名称，去掉英文双写与主机行，别堆信息 */
      var rows = [
        ['身份名称', C.identity, true],
        ['身份编号', C.identityId, false],
        ['权限等级', C.accessLevel, false]
      ]
      rows.forEach(function (r) {
        var row = el('div', 'dsu-card-row')
        row.appendChild(el('span', null, r[0]))
        row.appendChild(el('b', r[2] ? 'dsu-zhname' : null, r[1]))
        ui.card.appendChild(row)
      })
      /* 访问密码输入行：设置了 identityPassword 才出现 */
      ui.pwdInput = null
      ui.pwdErr = null
      if (needPwd) {
        var pwdRow = el('div', 'dsu-card-row dsu-pwd-row')
        pwdRow.appendChild(el('span', null, '访问密码'))
        var input = document.createElement('input')
        input.type = 'password'
        input.className = 'dsu-pwd-input'
        input.placeholder = '输入密码以继续'
        input.autocomplete = 'off'
        input.spellcheck = false
        pwdRow.appendChild(input)
        ui.card.appendChild(pwdRow)
        var err = el('div', 'dsu-pwd-error', '')
        ui.card.appendChild(err)
        ui.pwdInput = input
        ui.pwdErr = err
      }
    }
    ui.hint.innerHTML = needPwd
      ? '输入访问密码后按 <kbd>Enter</kbd>，或点击按钮确认'
      : '按 <kbd>Enter</kbd> / <kbd>Space</kbd>，或点击按钮继续'
    /* 完全自动播放：不需要用户点按钮，但**第二步的身份资料卡必须照常显示**。
       以前这里是整块 dsu-action 不加 dsu-in，而 .dsu-action 默认 opacity:0，
       卡片恰好住在它里面，于是「确认身份资料」下面的身份名称/编号/权限等级全看不见了
       （2026-10-19 用户反馈）。现在只隐藏按钮与按键提示，卡片照常淡入。 */
    if (C.autoPlay === 'full') {
      ui.action.classList.add('dsu-in')
      ui.btn.hidden = true
      ui.hint.hidden = true
      ui.btn.classList.remove('dsu-pulse')
    } else {
      ui.action.classList.add('dsu-in')
      ui.btn.hidden = false
      ui.hint.hidden = false
      ui.btn.classList.add('dsu-pulse')
    }
    /* 从第一页（授予访问权限）起：右下角亮出赛博风人物立绘，之后一直保持。
       立绘设为「空」（mascot = -1）时整块保持隐藏。 */
    if (C.showMascot !== false && C.mascot >= 0 && (step.action === 'grant' || step.action === 'confirm')) {
      ui.mascot.hidden = false
      ui.mascot.classList.add('dsu-on')
    }
  }

  function hideAction() {
    ui.action.classList.remove('dsu-in')
    ui.btn.classList.remove('dsu-pulse')
  }

  function finale() {
    if (finished) return Promise.resolve()
    setStepCount(6, 'WELCOME')
    setSlats(6)
    setProgress(1)
    /* 底部日志和终幕里的「欢迎 xxx 访问」区分开，避免同一句出现两遍 */
    setSubtitle('身份验证完成，会话已建立', 'IDENTITY VERIFIED · SESSION ESTABLISHED')
    audio.chime()
    bgm.finale()
    /* 终幕欢迎语：用从 Video Project 3 截出来的真声素材（line-6）。
       素材缺失 / voiceSource=tts / voice 关闭时自动静音，不会退回 TTS 念白 ——
       因为这条素材是「欢迎访问」整句，和动态身份名称无关。 */
    /* 注意：这里传原始名 'line-6'，voice.line() 内部会按 voiceName 做一次 cnAsset 映射。
       若在此先用 cnAsset 包一层，进函数会被再映射一次成 line-cn-cn-6（404 静音）。 */
    var welcome = voice.line(null, null, 'line-6')

    ui.status.classList.remove('dsu-in')
    ui.subEn.classList.remove('dsu-in')
    ui.rule.classList.remove('dsu-in')
    ui.reticle.classList.remove('dsu-in')
    stopHex()
    /* 中央区（状态行/分隔线/鲸鱼/虚线）整体退场：不清掉会和 WELCOME 版式叠字 */
    ui.center.classList.add('dsu-off')
    ui.dots.hidden = true

    return wait(360)
      .then(function () {
        ui.welcome.classList.add('dsu-in')
        ui.idline.classList.remove('dsu-in')
        return wait(420)
      })
      .then(function () {
        /* 结尾色散故障：分片位移 + 0.5px 模糊 + 混合模式，读起来像镜头色散 */
        var targets = [ui.w1, ui.w2, ui.w4]
        targets.forEach(function (t) {
          t.classList.add('dsu-glitch')
          t.setAttribute('data-text', t.textContent)
        })
        ui.w2.classList.add('dsu-glitch-box')   /* 黑底白字那块换加色混合 */
        void ui.welcome.offsetWidth
        targets.forEach(function (t) { t.classList.add('dsu-on') })
        return wait(640)
      })
      /* 光晕从中心炸开 + 变形光条横扫 + 文字青色 halation */
      .then(function () {
        root.classList.add('dsu-peak')
        ui.bloom.classList.add('dsu-go')
        ui.streak.classList.add('dsu-go')
        return wait(430)
      })
      /* 光晕最亮那一下补一记极短高光（是"眨一下"，不是长时间糊白） */
      .then(function () {
        ui.flash.style.transition = 'opacity ' + ms(70) + 'ms linear'
        ui.flash.style.opacity = '0.72'
        return wait(90)
      })
      .then(function () {
        ui.flash.style.transition = 'opacity ' + ms(340) + 'ms cubic-bezier(0.4, 0, 0.2, 1)'
        ui.flash.style.opacity = '0'
        return wait(320)
      })
      /* 欢迎语没播完就不揭幕（素材缺失时这个 Promise 立刻 resolve，不影响节奏） */
      .then(function () { return welcome })
      /* 揭幕：整个机位后撤 + 轻微失焦，比单纯淡出更有镜头感 */
      .then(function () {
        root.classList.add('dsu-handoff')
        return wait(780)
      })
      .then(function () { return eventGate() })
      .then(function () { return finish() })
  }

  /* 事件窗口：动画播完、揭幕之后弹出；Enter 或点击按钮（带按压动效）进入主界面。
     关闭（设置里关掉）时直接放行；20 秒无操作自动放行，绝不锁死主界面。
     注意：必须挂在 document.body 上（独立于 root），否则会被 root 的 dsu-handoff
     叠层上下文连带带走——出现过「看不见但挡住主界面」的 bug。 */
  /* 降世事件窗口已整体停用（eventWindow 恒为 false）。
     保留这个空闸门占位，调用链（finish 里的 .then(return eventGate)）不用改。 */
  function eventGate() { return Promise.resolve() }

  function finish() {
    if (finished) return
    finished = true
    bgm.stop()
    releaseAll()
    stopHex()
    voice.stop()
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null }
    try {
      if (C.mode === 'session') window.sessionStorage.setItem('dsh-startup-screen:shown', '1')
      if (C.mode === 'daily') {
        window.localStorage.setItem('dsh-startup-screen:day', new Date().toISOString().slice(0, 10))
      }
    } catch (err) { /* 隐私模式下不可写，忽略 */ }
    /* 解锁：Host 注入的关键样式用 html.dsu-lock 锁滚动，这里必须一并摘掉，
       否则揭幕后主界面会永远滚不动。 */
    document.documentElement.classList.remove('dsu-lock')
    document.documentElement.style.overflow = ''
    if (document.body) document.body.style.overflow = ''
    /* 首屏黑幕层：dsu-lock 撤掉后它已不可见，这里顺手把节点清掉别留垃圾 */
    var veil = document.getElementById('dsh-startup-veil')
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil)
    root.classList.remove('dsu-boot')
    /* 退场：直接摘掉，不做长淡出。
       以前是「620ms 淡出 + 再等 900ms 才移除」，中间那段时间 root 仍是一块
       z-index 2147483000 的全屏层（只是越来越透明），视觉上就是
       「动画结束/按 Enter 之后还要黑一会儿」（2026-10-19 用户反馈）。
       揭幕那一帧 root 已经整体淡到接近全透明（dsu-handoff 的 780ms 过渡跑完才会走到这里），
       所以这里直接移除不会有突兀的跳变。 */
    root.classList.add('dsu-gone')
    if (root.parentNode) root.parentNode.removeChild(root)
    try { window.dispatchEvent(new CustomEvent('dsh-startup:done')) } catch (err) { /* noop */ }
  }

  function requestSkip() {
    if (skipped || finished) return
    skipped = true
    releaseAll()
    finish()
  }

  if (C.allowSkip && ui.skip) {
    ui.skip.hidden = false
    ui.skip.addEventListener('click', function (e) { e.stopPropagation(); requestSkip() })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') requestSkip()
    })
  } else if (ui.skip) {
    ui.skip.hidden = true
  }

  /* 对外 API：settings 面板里的"立即预览"按钮和重播都走它 */
  window.__DSH_STARTUP_API__ = {
    /* 设置页试听与冒烟测试用：直接念一行 */
    speak: function (en, zh) { voice.say(en, zh) },
    speakName: function (n) { return voice.speakName(n) },
    get voice() { return voice.current() },
    replay: replayLatest,
    skip: requestSkip,
    finish: finish,
    config: C
  }

  /* 锁滚动，动画期间不露出下面的应用 */
  document.documentElement.classList.add('dsu-lock')
  document.documentElement.style.overflow = 'hidden'
  if (document.body) document.body.style.overflow = 'hidden'
  setProgress(0.05)
  root.classList.remove('dsu-boot')

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { run() })
  } else {
    run()
  }
})()
