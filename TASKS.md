# Yeyu 团队任务板

> 协作方式：原生子智能体支持并行。各项源码工作在独立 Git 分支及 worktree 中进行；每个 worktree 只由对应任务负责人编辑。

| ID | 负责人 | 任务 | 可编辑范围 | 验收条件 | 状态 |
|---|---|---|---|---|---|
| T-01 | 技术总监 | 初始化 Git，提交基线并登记分支方案 | Git 元数据、`TASKS.md` | 指定文件纳入单次基线提交；默认分支和工作区状态确认 | 已完成 |
| T-02 | 前端 + 测试与安全 | 审计并修复 `index.html` 所有动态 HTML 插入点 | `index.html`（独立 worktree） | 列出所有 sink、追踪动态值、修复不安全插值并记录逐处验证 | 进行中 |
| T-03 | 测试与安全 | 配置两个 Playwright 用例本地运行 | `tests/`、必要的测试配置/脚本（独立 worktree） | `YEYU_URL` 指向本地服务；默认目标不再是线上；提供本地命令并实际运行 | 进行中 |
| T-04 | 后端 | 梳理翻译、助手、实时陪练接口与数据流 | 无（只读审计，结果由协调者登记） | 标注已证实信息及未知的限流/保留策略 | 已完成 |

## 交接记录

- 2026-11-28：技术总监初始化本地 Git 仓库，默认分支为 `master`；基线提交 `eaca0cf03c4c1695712586a36ffbbb23594054be` 包含 `index.html`、`DESIGN.md`、`MOTION.md`、`README.md`、`AGENTS.md`、`TASKS.md`、`assets/`、`tests/`。提交后核验工作区干净。
- 2026-11-28：分支方案：前端安全修复使用 `security/dynamic-html-sinks` 分支和独立 `.worktrees/dynamic-html-sinks` worktree；Playwright 本地化使用 `test/local-playwright` 分支和独立 `.worktrees/local-playwright` worktree；后端审计只读，不创建代码分支。各分支均从本地默认分支基线创建，不推送、不发布。任务结束后协调者审查并决定是否合并。
- 2026-11-28：首次只读审查已完成；当前阶段按用户要求以 Git 基线为准，重新分配后续工作。
- 基线阶段未修改应用源码，未运行测试。
- T-04 后端审计完成：翻译 POST 发送原文/目标语言/语气/称谓；助手 `/assistant` 携带最近 10 条消息；实时陪练通过 `/realtime` WebSocket 并传输麦克风音频。另有 `/tatoeba` 例句、`/dict` 词典接口。Worker 服务端源码不在仓库中，故限流、鉴权、日志和服务端保留策略均未知。实际证据见 `index.html` 与上一轮后端审查位置清单。
- T-02 和 T-03 已在各自独立 worktree 并行开始；截至此记录尚未完成或验证。
- 技术审查：项目是单页应用，核心代码集中在 `index.html`；云翻译/助手依赖外部 Cloudflare Worker，通话适配器需要外部配置；暂未发现后端源码。
- 后端审查：源码将翻译文本发往 Worker，助手请求包含最近 10 条对话；实时陪练通过 Worker 的 `/realtime` WebSocket；状态通过 `localStorage` 保存在本机。后端实现、限流和数据保留策略无法从本项目源码确认。
- 前端审查：页面使用模板字符串与 `innerHTML` 渲染，动态字段应逐处审查转义；建议核实源码字面量在浏览器中的编码显示后再修复乱码风险。
- 测试审查：目前只有两个 Playwright 用例，默认目标是线上 GitHub Pages，涉及真实翻译 Worker；尚未验证本地可重复性。未运行测试。
- 安全审查：翻译文本、助手最近 10 条上下文和语音流会发送至外部 Worker；`localStorage` 保存本地状态；字幕路径有转义，其他动态 HTML sink 仍需逐项审查。未据抽查断言存在可利用 XSS。

