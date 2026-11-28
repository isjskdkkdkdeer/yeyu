# 夜语 · DạNgữ | Noctis Private Chat

中越交流原型，单文件网页版。CSS 和原生 JavaScript 均已内嵌，无需构建；本地演示可独立运行，联网翻译、助手、词典和练习会使用外部 Worker。

## 上线地址

https://isjskdkkdkdeer.github.io/yeyu/

## 说明

- 放到 GitHub Pages 所选发布分支的根目录即可使用。
- 本项目是中越交流原型，不提供真实用户间消息传输；消息、资料和偏好写入当前浏览器的 `localStorage`。
- 在线聊天翻译会尝试将原文、目标语言、风格和称谓发送到 Cloudflare Worker；`TranslationEngine.enableCloud` 不存在。助手请求会带当前输入和最近 10 条消息，查词与“练一句”也会请求 Worker。Worker 的日志、访问控制和数据保留策略未知。界面“隐私与数据去向”页列有具体说明。本说明不改变当前网络行为。
- 真实通话需要外部注入 `CallManager.configure`；本仓库没有适配器配置实现，不能据此认定通话或端到端加密已接通。
- 口语陪练会请求麦克风并通过 WebSocket 中继发送音频；中继服务端处理及保留策略未知，使用前应知悉该数据流。
