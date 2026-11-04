# dsh-splash-screen-haavk

**哈夫克（HAAVK）风格的 DSH 启动动画插件。**

开屏视频 → 过曝洗白 → 冷蓝底板 → 五步访问授权流程 → 终幕揭幕。全程配预录语音播报与循环背景音乐，文字、配色、素材都在 DSH 设置页里改。

> 本包是 `dsh-startup-secret@1.5.2`（长征机主题，二次创作版）的哈夫克改写版，与上游不再同步。

## 播放序列

| 阶段 | 内容 | 声音 |
|---|---|---|
| ① 开屏视频 | `intro.mp4`（2560×1440 H.264，约 5.2s，尾部淡到纯黑） | 视频自带音轨，-18 LUFS |
| ② 过曝洗白 | 灰光过曝一下，接冷蓝底板（淡入 900ms） | 噪声扫频 |
| ③ 冷蓝底板 | 左上品牌区、右上 SKIP、底部日志与阶段计数 | 底板循环曲从这个阶段淡入，一直播到揭幕 |
| ④ 五步流程 | 中文大字 + 英文副标 + 日志行 + 阶段徽标，第 1、2 步要手动确认 | 每步一句预录语音 |
| ⑤ 终幕 | 准星 + 「欢迎 <身份名称> 访问」 | 欢迎语 + 收尾音 |

五步文案（在 `lib/splash.js` 的 `STEPS` 数组里）：

| # | 中文 | 英文副标 | 徽标 |
|---|---|---|---|
| 1 | 需要访问许可 | ACCESS PERMISSION REQUIRED | AUTHORIZATION |
| 2 | 身份资料确认 | IDENTITY VERIFICATION | IDENTITY |
| 3 | 接入哈夫克网络 | HAAVK NETWORK LINK | UPLINK |
| 4 | 同步超算核心 | AI CORE SYNC | SYNC |
| 5 | 读取完毕 · 核验通过 | READ COMPLETE · VERIFIED | VERIFY |

## 安装

```bash
dsh plugin --profile desktop add dsh-splash-screen-haavk
```

本地开发安装：

```bash
dsh plugin --profile desktop add link:D:\工作区\插件\dsh-splash-screen-haavk
```

装完刷新页面即可。卸载：

```bash
dsh plugin --profile desktop remove dsh-splash-screen-haavk
```

配置持久化在 `~/.dsh/dsh-startup.json`（与包名无关，改名不会丢设置）。

## 设置选项

设置 → 启动动画，分六组：

- **播放**：启用开关、播放时机、速度倍率（0.35 慢放 ~ 3 快放）
- **身份资料**：身份名称 / 编号 / 权限等级 / 访问密码
- **交互**：自动播放（三档）、允许跳过、音效
- **语音与音效**：播报开关、音量、提示音、界面音效、底板 BGM 开关与音量、开场视频音量
- **视觉**：主题（冷蓝一套）、图案（HWAVIK）、开屏视频开关与声音
- **文案**：品牌区、黑幕、终幕、页脚等全部文字

## 素材

```
lib/assets/
  videos/intro.mp4        开屏视频（换片直接覆盖同名文件）
  music/board-loop.m4a    底板循环曲（58.8s 无缝循环）
  line-1..5.mp3           五步台词（哈夫克播报 · Sonia）
  line-6.mp3              终幕欢迎语
  sfx-tick.mp3            咔哒音
  sfx-ticks-run.mp3       十六进制瀑布「哒哒」
lib/asset-data.js         上面这些音频的 base64 内联（改音频要重建它）
```

改音频后需要重建 `asset-data.js`；开发期可用配套的 `asset_tool.py`，或直接把新文件 base64 塞进去。

**人声只用预录素材，不启用 TTS。** `lib/splash.js` 的 voice 模块里 `TTS_ENABLED = false` 是总开关：关掉后台词只播 `line-*`，素材缺失就静音，绝不回落 `speechSynthesis`。

## 相对上游 1.5.2 的改动

**素材**
- 全站换成哈夫克配色：冷蓝底（`#0a1b2e → #12304f`）+ 白字 + `#4d8dff` 点缀
- 徽章换成白色 HAAVK 标识；东亚防御倡议那款已删除
- 开屏换成本地 4K 转码的转场片，音频归一到 -18 LUFS
- 五句台词 + 终幕欢迎语换成 Sonia TTS 预录素材，统一 -18 LUFS
- 底板循环曲覆盖全场；终幕曲 `finale.m4a` 已停用并删除

**功能**
- 事件窗口（降世）整体停用，配置层钉死 `eventWindow = false`
- 人物立绘整体移除（素材 + 渲染分支 + 设置项），`mascot` 恒为 `-1`
- 音色选择移除，只剩 `line-*` 一套；`voiceName` 钉死为空
- TTS 全链路关闭
- 主题只剩深色（冷蓝）一套，浅色主题的 CSS 已删除

**工程**
- 包名 `dsh-startup-secret` → `dsh-splash-screen-haavk`
- `asset-data.js` 44 段 → 8 段（2.3 MB → 0.39 MB）
- 媒体路由的 Range 实现去重为一份（`streamMedia`），并补上读流 `error` 监听

## 测试

```bash
npm test
```

264 项断言，覆盖 Host 路由与配置归一化、浏览器半侧的渲染与流程、音频时长、图案/立绘/事件窗的当前行为。全部在 Node 里跑，不需要浏览器。

## 声明

本作品为二次创作，仅用于学习交流，没有任何商业用途。

## 许可

MIT。
