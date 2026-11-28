# 夜语 · DạNgữ — 设计规矩（DESIGN.md）

> 品牌：黑金，永远不改配色。数值只用下面 YAML 里的档位，不许手写 13px、18px、26px。
> 改界面先改这份文件，再改 `index.html`；改完检查有没有新冒出来的裸色值和随手字号。

## 品牌三行（第二批，2026-11-28，Ha 定“独一无二”）

- **形容词**：深夜、私密、鎏金、面对面、克制。
- **美学本质（三词）**：午夜鎏金对谈。
- **Signature move（只许一个）**：学语页每日一句翻面 + 翻面时一道金线扫过卡片。

```yaml
---
# 颜色（语义变量，组件只引用变量，不写裸色值）
# 黑底性格：方案 A“鎏金夜”（2026-11-28 选定，Ha 授权黑底可动；金色不动）
colors:
  background: "#0B0A08"      # 页面底（暖黑）
  surface: "#171310"         # 卡片 / 输入框底（暖）
  surface_soft: "#211B16"    # 悬停 / 选中底（暖）
  border: "rgba(216,181,109,.14)"  # 分隔线 / 描边（淡金线）
  gold: "#D8B56D"            # 品牌金（主色，不动）
  gold_light: "#E8C97A"      # 最新译文
  gold_dim: "rgba(216,181,109,.5)"  # 弱化金（状态字）
  text: "#F5F6F8"            # 正文（近白）
  text_dim: "#9CA3AF"        # 次要文字
  muted: "#A4A6A5"           # 最小可读灰（AA 4.5:1 以上，低于此不许当正文）
  success: "#46C69A"         # 在线绿点
  received_bubble: "#1A1512" # 对方气泡（暖）
  sent_bubble: "#211C15"     # 我方气泡

# 字号（只用这四档 + 两处例外）
typography:
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', system-ui, sans-serif"
  sizes:
    xs: 12px    # 小字（标签、徽标），不许再小
    sm: 14px    # 辅助文字
    base: 16px  # 正文，行高 1.5
    md: 20px    # 学语页越文大字 / 标题，行高 1.6
  exceptions:
    tiny_meta: 11px  # 仅时间戳、毫秒徽标、VIP 小标签（11px 是下限）
    display_title: 26px  # 仅页面大标题 h1（display 层，不算正文字号）
    avatar_initials: "随头像尺寸走（约头像直径 35–40%），不进字号档位"

# 圆角（只用这四档）
rounded:
  sm: 8px       # 输入框、胶囊、小按钮
  md: 12px      # 卡片、弹窗
  lg: 16px      # 抽屉、提词器卡片
  full: 9999px  # 胶囊、头像、金键

# 间距（只用 4 的倍数）
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px

# 组件
components:
  mic_button:
    size: 56px
    shape: 圆形（9999px）
    border: "1px solid rgba(216,181,109,.6)"
    background: "#090B0E"
    motion: "收音时呼吸脉冲 1.2s；播报时边框光点 1.5–2s 一圈 + 扫光；平时不亮"
    touch_target: "最小 44×44pt（视觉 56px 已达标）"
  translate_pill:
    position: "悬浮底部，bottom: max(24px, env(safe-area-inset-bottom))"
    background: "无（透明浮在黑底上）"
  message_bubble:
    received: "#14181F"
    border: "1px solid #1A1F26"
  touch_target:
    min: "44×44pt（视觉不够用透明内边距补，不把图标本身放大）"
  focus:
    ring: "1px 金色描边 + 2px 偏移金色光环（:focus-visible）"
    input_focus_border: "金色 #D8B56D，过渡 200ms"
---

# 人话版规矩

- 黑金是品牌，永远不改配色。
- 数值只用上面 YAML 里的档位，不许手写 13px、15px、17px、18px、22px、27px。
- 动效只给金键和译文出现两处，其余全删；减弱动效时只保留透明度变化。
- 图标用 Lucide 线条图标（24×24 网格、2px 描边、圆角端点），Emoji 只当表情包，不当功能图标。
- 小字最低 11px、最低 #A4A6A5（AA 4.5:1 以上），低于这个不许当正文。
- 结构大改前先在 Excalidraw 按 390px 手机宽画线框；头像、宣传图先过 rembg 扣成透明底再进页面。
- 每次改完跑固定回归：学语页每日一句翻面 → 词典查词 → 情景短语点读 → 练一句出译文（旧同传回归见 `tests/regression.spec.js`，已随同传页下线而失效，待重写）。
- 动效语言见 `MOTION.md`（“鎏金流动”，与本文件平级）。

## 自审（第二批，2026-11-28）

- 裸结构检查：去掉所有样式只看结构，学语页每日一句翻面、握手、提词器三处裸结构也成立才算独特。
- 每次改完：动效 10% 慢放走一遍状态、填发现表（严重度/位置/改前/改后/原因）、按动效质量标尺打分（目标 18+）。
- 裸结构结论（2026-11-28，第二批实施后）：样式剥掉后，学语页每日一句翻面、握手仪式、提词器三处独特结构仍可辨认；消息页结构上最接近通用聊天 App（L1 的未读优先 + 时间锚已缓释）。
```

---

## 令牌对照（`index.html` 里 `:root` 的实际变量名）

| 含义 | 变量 | 值 |
|---|---|---|
| 页面底 | `--outer` / `--bg` | `#0B0A08` |
| 卡片底 | `--paper` / `--surface` | `#171310` |
| 悬停底 | `--soft` | `#211B16` |
| 分隔线 | `--line` / `--border` | `rgba(216,181,109,.14)` |
| 品牌金 | `--gold` / `--accent` / `--warm` / `--strong` | `#D8B56D` |
| 最新译文 | `--gold-light` | `#E8C97A` |
| 正文 | `--ink` / `--text` | `#F5F6F8` |
| 次要文字 | `--text-dim` | `#9CA3AF` |
| 最小可读灰 | `--muted` | `#A4A6A5` |
| 在线绿 | `--online` | `#46C69A` |
| 对方气泡 | `--received` | `#1A1512` |
| 我方气泡 | `--sent` | `#211C15` |
| 字号 xs/sm/base/md | `--text-xs` / `--text-sm` / `--text-base` / `--text-md` | 12 / 14 / 16 / 20px |
| 间距 4–24 | `--space-1` … `--space-6` | 4 / 8 / 12 / 16 / 20 / 24px |
| 圆角 | `--radius-control` / `--radius-card` / `--radius-pill` | 12 / 16 / 999px |
