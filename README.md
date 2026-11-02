# 自习小镇 Study Town

一个在线自习室：大家在**小镇地图**上一起学习。
An online study room where everyone studies together on a little **town map**.

## 功能 Features
- 🗺️ 小镇地图：图书馆 / 咖啡馆 / 公园 / 实验室 / 海边，点地点就能搬过去
- 👥 在线名单与状态：头像、正在学什么、专注中/休息中、已学时长
- 💬 留言板：每条 ≤200 字、30 秒一条、简单敏感词过滤
- 📊 打卡与排行：今日/本周学习时长排行，满 25 分钟自动打卡，记录连续天数
- 🍅 同步番茄钟（可选）：全小镇每半小时一轮（25 分钟专注 + 5 分钟休息）
- 🌐 中文 / English 一键切换

## 两种模式 Modes
| 模式 | 什么时候 | 效果 |
|---|---|---|
| **演示模式 Demo** | `firebase-config.js` 为空（默认） | 同一浏览器的多个标签页互通，另有几位标着"演示"的示例同学 |
| **在线模式 Live** | 填好 Firebase 配置 | 所有人真正实时在线 |

## 切换到在线模式 Going live (Firebase)
1. 打开 https://console.firebase.google.com ，新建项目
2. **Build → Authentication → Sign-in method**：启用 **Anonymous（匿名）**
3. **Build → Realtime Database**：创建数据库，然后把 `database.rules.json` 的内容粘贴到 **Rules** 并发布
4. **项目设置 → 你的应用 → 添加 Web 应用**，复制 `firebaseConfig`
5. 把配置粘贴进 `firebase-config.js`（替换 `null`），提交即可

## 本地运行 Run locally
```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 文件 Files
- `index.html` 页面结构 · `style.css` 样式 · `app.js` 交互逻辑
- `i18n.js` 中英文案和地点 · `backend.js` 数据层（演示 / Firebase）
- `firebase-config.js` Firebase 配置 · `database.rules.json` 数据库安全规则

## 之后计划 Roadmap
- 手机号登录（视上架方案而定）
- 头像装扮、更多地点、好友房间
