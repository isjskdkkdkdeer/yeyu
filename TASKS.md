# Yeyu 团队任务板

> 协作方式：原生子智能体支持并行。各项源码工作在独立 Git 分支及 worktree 中进行；每个 worktree 只由对应任务负责人编辑。

| ID | 负责人 | 任务 | 可编辑范围 | 验收条件 | 状态 |
|---|---|---|---|---|---|
| T-01 | 技术总监 | 初始化 Git，提交基线并登记分支方案 | Git 元数据、`TASKS.md` | 指定文件纳入单次基线提交；默认分支和工作区状态确认 | 已完成 |
| T-02 | 前端 + 测试与安全 | 审计并修复 `index.html` 所有动态 HTML 插入点 | `index.html`（独立 worktree） | 列出所有 sink、追踪动态值、修复不安全插值并记录逐处验证 | 已完成 |
| T-03 | 测试与安全 | 配置两个 Playwright 用例本地运行 | `tests/`、必要的测试配置/脚本（独立 worktree） | `YEYU_URL` 指向本地服务；默认目标不再是线上；提供本地命令并实际运行 | 已完成 |
| T-04 | 后端 | 梳理翻译、助手、实时陪练接口与数据流 | 无（只读审计，结果由协调者登记） | 标注已证实信息及未知的限流/保留策略 | 已完成 |
| T-05 | 协调者 | 补齐 d372965 合并、推送与线上验证交接 | `TASKS.md`（独立 worktree） | 明确保留远端 main 历史、推送成功和 Pages 验证结果；清理过时状态 | 已完成 |
| T-06 | 测试与安全 | 在 d372965 上重跑 2 个本地 Playwright 用例 | 独立验证 worktree | `YEYU_URL` 指向本地，2 个用例通过并记录实跑结果 | 已完成 |
| T-07 | 前端 + 测试与安全 | 审计并改为仅本地上传用户头像 | `index.html`、必要的测试 | 内置三头像保持原样；外部头像 URL 不再加载；本地上传可用；回归测试通过 | 已完成 |
| T-08 | 前端 + 测试 | 用 60 句本地双语库替换每日一句联网获取 | `index.html`、`tests/regression.spec.js`（独立 worktree） | 每年按日轮换；无 Tatoeba 前端请求；翻面/朗读保留；本地测试通过 | 已完成 |
| T-09 | 前端 + 测试与安全 | 改进通话实时字幕 HUD，支持中越气泡、字号/透明度、显隐/锁定与偏好记忆 | `index.html`、`tests/regression.spec.js`（独立 worktree） | 实时字幕按角色呈现；建议的 `addSubtitle` 接口可用；透明度为零时关闭模糊；设置持久化；Playwright 全套回归通过 | 已按序合入本地 master；整合测试通过 |
| T-10 | 产品研发团队 | 审计产品价值、校正无依据的产品承诺，并优化聊天快捷表达 | `PRODUCT_AUDIT.md`、`index.html`、`README.md`、`tests/regression.spec.js`、`TASKS.md`（独立 worktree） | 记录各模块去留的五问审查；数据流描述符合源码且不改变外发/权限策略；移除纯装饰假状态；快捷修复短语离线有译文；本地全套测试通过 | 已按序合入本地 master；整合测试通过（功能提交 `acd29fa`） |
| T-11 | 前端 + 测试与安全 | 为聊天译文增加复制与收藏操作，并核实名片测试条目 | `DESIGN.md`、`index.html`、`tests/regression.spec.js`、`TASKS.md`（独立 worktree `feat/chat-translation-actions`） | 译文可复制；真实聊天双语可加入现有本地收藏；不改翻译/云函数调用；只清理有证据的测试卡片；本地全套回归通过 | 完成，测试通过，已提交，待 Muse 核对 |

## 交接记录

- 2026-11-28：技术总监初始化本地 Git 仓库，默认分支为 `master`；基线提交 `dd449aa` 包含指定的 22 个文件（`index.html`、`DESIGN.md`、`MOTION.md`、`README.md`、`AGENTS.md`、`TASKS.md`、`assets/`、`tests/`）。提交后核验工作区干净。
- 2026-11-28：分支方案：前端安全修复使用 `security/dynamic-html-sinks` 分支和独立 `.worktrees/dynamic-html-sinks` worktree；Playwright 本地化使用 `test/local-playwright` 分支和独立 `.worktrees/local-playwright` worktree；后端审计只读，不创建代码分支。各分支从本地基线创建并合入 `master`。后续推送记录见本节末尾。
- 2026-11-28：首次只读审查已完成；当前阶段按用户要求以 Git 基线为准，重新分配后续工作。
- 基线阶段未修改应用源码，未运行测试。
- T-04 后端审计完成：翻译 POST 发送原文/目标语言/语气/称谓（`index.html:1658-1673`）；助手 `/assistant` 携带最近 10 条消息（`1675-1698`）；实时陪练通过 `/realtime` WebSocket 并传输麦克风音频（`2296`、`2420-2510`）。另有 `/tatoeba`（`2208-2216`）和 `/dict`（`2231-2257`）。Worker 服务端源码不在仓库中，限流、鉴权、日志及服务端保留策略均未知。
- T-02 完成并合入：扫描到 8 个 HTML sink：`index.html:1838` (`innerHTML` 字幕)、`2330` (`innerHTML` 固定按钮)、`2657` (`outerHTML` 提词器)、`2726` (`insertAdjacentHTML` 演示字幕)、`2819`/`2827`/`2832` (`root.innerHTML` 退出页/通话页/主应用)、`3289` (会话搜索结果 `innerHTML`)。无 `document.write`、`createContextualFragment` 或 `DOMParser` 命中。修复了用户可编辑姓名/简介/签名、联系人名称、转录说话人、本地消息时间等到达 HTML 文本上下文时缺少转义的问题；RTC 字幕与演示字幕均转义。相关属性值为固定枚举或应用内受限 ID，动态头像 URL 虽经过 HTML 属性转义，仍可触发用户指定外域图片请求，属于外联隐私边界，未在本任务改 URL 策略。
- T-02 验证：`git diff --check` 通过；使用 Node 从 UTF-8 文件提取并编译内嵌脚本通过；整合后两项 Playwright 回归通过。
- T-03 完成并合入：新增 Playwright 配置、锁文件、本地静态服务器和忽略规则；两个回归用例迁移到当前源码已有的聊天翻译与学习卡片行为。默认目标为 `127.0.0.1:4173`；Worker API 使用确定性本地 mock，其他外源请求拦截。设置本地 `YEYU_URL` 时也会自动启动本地 server。
- T-03 本地运行：首次 `npm ci`，安装 Chromium 一次性运行 `npx playwright install chromium`；PowerShell 命令 `$env:YEYU_URL='http://127.0.0.1:4173/?v=regression'; npm test`。已在整合后的 `master` 实跑，结果 **2 passed**。外部头像请求被测试策略拦截，控制台出现 `ERR_BLOCKED_BY_CLIENT` 属于预期，不代表用例失败或访问外站。
- 整合验证：本轮测试时 `master` 代码 HEAD 为 `e9434f0`；已运行 `npm ci`（4 个包审计，0 漏洞）和上述本地 Playwright 命令；验证后工作区干净。
- T-05 完成：推送前 `master` 干净且 HEAD 为 `c247288`。远端 `main` 已有独立历史，首次 push 被拒绝（fetch first）；随后将 `origin/main` 合并到 `master`，生成 `d372965`，保留远端历史且代码树与 `c247288` 一致。仅执行 `git push origin master:main`，远端从 `016e9d9` 前进到 `d372965`，推送成功。
- T-05 线上验证：推送后等待 90 秒，`https://isjskdkkdkdeer.github.io/yeyu/?v=c247288` 返回 HTTP 200；Pages 内容与 GitHub `main/index.html` 完全一致，已核实姓名和时间转义修复存在。
- T-06 完成：独立验证 worktree 在目标代码提交 `d372965311d33d94ce8b14292317723fd210d278` 上执行 `npm ci`（4 packages audited，0 vulnerabilities），随后在 PowerShell 执行 `$env:YEYU_URL='http://127.0.0.1:4173/?v=regression'; npm test`，实测 **2 passed（4.2s）**。未修改源码；外链请求按预期被测试策略拦截。
- T-07 头像来源审计及修复完成：三位内置联系人使用 `assets/avatars/linh.jpg`、`assets/avatars/an.jpg`、`assets/avatars/mai.jpg`（`index.html:966,978,981`），路径和图像均未更改。本人旧默认值曾是外域 `https://view-link.cx/...`，现改为 initials 回退。用户头像来源仅为 `noiloi-my-profile`/`noiloi-friend-overrides` 的历史持久化值或现有相册/拍照 file picker（`1183-1244`）；启动时迁移并写回非法旧值，头像渲染器只接受三个内置路径或不超过 1 MB 的 JPEG Base64 data URL（`1003-1010,1120-1145,1352-1358`）。用户上传经 canvas 256px 缩放并重新编码为 JPEG；外部 URL 不会写入 `img.src` 或触发请求。
- T-07 回归：新增用例覆盖本人/好友旧外链值的清理、外域请求为零、三个内置资源路径仍在，以及本地图片上传后成为 JPEG data URL 且刷新后保留。独立 worktree 实测 **4 passed（5.3s）**，`git diff --check` 通过；修复已合入本地 `master`，提交 `cafe271`。
- T-07 整合验证：本地 `master` HEAD `d8d13da` 再执行 `$env:YEYU_URL='http://127.0.0.1:4173/?v=regression'; npm test`，实测 **4 passed（5.7s）**；经用户确认后已推送并部署至 `b6150fd`。
- T-08 开始：从当前远端已部署 `master` HEAD `b6150fd` 创建独立分支 `feat/daily-phrase-builtin` 与 `.worktrees/daily-phrase-builtin` worktree。已确认每日卡片当前通过 `/tatoeba` 请求数据，朗读与翻面分别由 `speakDailySentence()` 和 `dailyFlipped` 处理。
- T-08 完成：`index.html` 内置 60 组越南语/简体中文完整日常句，越南语和中文各自均无重复；以年内日序从第 1 句开始每 60 天循环，连续日期轮换不同。移除了每日一句的前端 Tatoeba 请求，词典、陪练、翻面和朗读路径保持原状；`speakDailySentence()` 在本地句子无音频时继续走原有语音合成回退。`regression.spec.js` 新增日期固定测试，验证相邻日期句子不同且没有 `/tatoeba` 请求。独立 worktree 执行 `npm ci` 后运行 `$env:YEYU_URL='http://127.0.0.1:4173/?v=regression'; npm test`，实测 **5 passed（12.7s）**；`git diff --check` 通过，内置句库计数/去重检查为 60/60。功能提交 `836cd34` 已合入本地 `master`，在整合提交 `c9622c3` 上再次实跑 **5 passed（11.3s）**。当前改动未推送或部署，等待用户确认。
- 技术审查：项目是单页应用，核心代码集中在 `index.html`；云翻译/助手依赖外部 Cloudflare Worker，通话适配器需要外部配置；暂未发现后端源码。
- T-09 开始：从当前本地 `master` HEAD `650a54f` 创建 `feat/call-subtitle-overlay` 与独立 worktree `.worktrees/call-subtitle-overlay`。现有通话 HUD 位于 `index.html:830-843, 2736-2758`，实时字幕来自 RTC data channel 的 `receiveCaption()`；当前无 `addSubtitle`、`.sub-translated`，字号仅三档，字幕是原文在前。实现将复用 RTC 字幕存储与渲染，补充公开适配入口与浮层控件。尚未运行测试或部署。
- T-09 实现完成（独立 worktree `feat/call-subtitle-overlay`）：字幕浮层为底部中央宽卡片，列表顶部渐隐；使用 Inter / Noto Sans / 系统无衬线、1.55 行高、译文主显/原文弱化及按说话方左右气泡。右上控制条提供 14–28px 字号、0–90% 底色、显隐、锁定和跟随；字号/透明度写入 `noiloi-call-preferences` localStorage，透明度为 0 时背景透明且 blur 归零。`platform.CallManager.addSubtitle({role,langPair,translated,original,...})` 复用字幕数据流；流式片段保留 `.streaming` 并安全地增量更新文本，最终片段移除该状态。修改文件：`index.html`、`tests/regression.spec.js` 和本任务记录。
- T-09 本地验证：`npm ci` 完成（4 packages audited，0 vulnerabilities）；PowerShell 执行 `$env:YEYU_URL='http://127.0.0.1:4173/?v=subtitle-overlay'; npm test`，本地静态服务由 Playwright 配置自动启动，最终 **6 passed（8.9s）**。新增用例覆盖流式字幕更新/结束、字号与透明度范围、0% 时关闭模糊、本地偏好持久化、显隐和锁定状态。首次实跑 5 passed/1 failed，原因是测试选择器命中两个语音按钮；限定 `.chat-header` 后重跑通过。`git diff --check` 和 Node 内嵌脚本语法编译通过。功能与测试提交：`f741871`。当前仅在本地功能分支，未合并 `master`、未推送或部署。
- T-10 审计阶段：基线 `master` `650a54f` 干净；产品/商业、创意/体验、架构/测试安全三方独立审查并交叉质疑。详见 `PRODUCT_AUDIT.md`。确认的高风险矛盾是 `README.md` 声称云翻译默认关闭且有 `enableCloud(true)`，但 `index.html` 无该方法，在线 HTTP/S 下会尝试 Worker；本任务不改变云请求/助手上下文/麦克风权限，仅校正披露与无依据文案。选定低风险改进：将现有六条快捷短语改为保留两条日常表达 + 四条沟通修复句，并补本地译文及回归用例；否决新增独立学习入口、签到/排行榜及社交 Feed。
- T-10 实现与验证：仅在独立 worktree `product/trust-and-repair` 修改 `index.html`、`README.md`、`tests/regression.spec.js`、本文件，并新增 `PRODUCT_AUDIT.md`。移除无依据的固定网关/延迟、VIP、E2EE/动态密钥、未接入生物识别和伪引擎策略展示；移除未启用相机的扫码假入口；保留本地联系人/聊天数据和原有缓存策略。新增全局数据去向说明及详情页；README 按源码说明 Cloudflare Worker 数据流和未知保留策略；快捷短语加入四条本地可译的对话修复表达。未改云请求默认、助手历史长度、麦克风权限或数据清理规则。执行 `npm ci`（4 packages audited，0 vulnerabilities）及 `$env:YEYU_URL='http://127.0.0.1:4173/?v=product-audit'; npm test`，最终 **7 passed（14.6s）**；`git diff --check` 与 Node 内嵌脚本语法编译通过。功能提交 `acd29fa`（Yeyu Local Baseline）；当前分支尚未合入 master、未推送或部署。



- 本次整合：先以合并提交 714dcd6 将 feat/call-subtitle-overlay（分支头 360a63d）合入，再以合并提交 06d27fb 合并 product/trust-and-repair（分支头 4f36855，功能提交 acd29fa）；保留双方测试与 T-09/T-10 任务记录。TASKS.md 冲突保留 T-09 详细任务行和 T-10 产品审计行，删除重复的旧版 T-09 行；测试文件保留字幕 HUD、离线短语和隐私披露三个用例。合并后在 master 执行 `npm ci`（4 packages audited，0 vulnerabilities）及 `$env:YEYU_URL='http://127.0.0.1:4173/?v=merge-check'; npm test`，实测 **8 passed（17.8s）**。冲突解决后保留了 HUD、离线短语、隐私披露三项新增用例，并通过 `git diff --check`。推送前已 fetch；远端 `origin/main` 为 `b6150fd` 且是本地 master 的祖先，推送为快进更新。

- T-11 审计与实现（独立 worktree `feat/chat-translation-actions`，基线 `542de08`）：联系人卡片由 `contacts()` 从 `chats` 过滤生成，实际为 AI 助手和 Linh/An/Mai 三位内置联系人；群组被过滤。`friendDirectory` 的 `bao27`、`thao18`、`huy08` 仅出现在添加好友的本地搜索/申请流程，不进入名片卡片。没有标记为测试的名片条目，因此未删除任何联系人；新增回归用例锁定这一边界。
- T-11 产品筛选：候选为聊天译文复制、真实聊天表达收藏、联系人搜索、未读会话筛选；先实现前两项，复用现有收藏区，拒绝重复学习入口。
- T-11 实现与验证：先更新 `DESIGN.md` 交互表，再改 `index.html` 增加译文复制/收藏；收藏只写现有 `noiloi-saved-phrases`（最多 50 条，按原文/译文/方向去重），复制仅使用浏览器剪贴板并在失败时提供手动复制后备；未改翻译链、Worker 路由或密钥。`tests/regression.spec.js` 新增复制、收藏及名片来源 3 个用例。本地执行 `npm ci`（4 packages audited，0 vulnerabilities）和 `$env:YEYU_URL='http://127.0.0.1:4173/?v=chat-actions'; npm test`，**11 passed（9.9s）**；`git diff --check` 通过。
