# 实时币圈资讯订阅功能集成文档

## 1. 功能概述
本功能允许用户订阅 Telegram 频道的消息以及 OKX 官方公告，并在网页端实时展示。
实现了从多源获取消息 -> 存储数据库 -> 提供 API -> 前端展示的全链路流程。

## 2. 系统架构

### 后端 (okx-trading)
-   **依赖**: 
    -   `telegrambots-spring-boot-starter` (v6.8.0) - 用于 Bot 方式
    -   `jsoup` (v1.17.2) - 用于网页抓取和 API 调用
    -   `fastjson` - 用于 JSON 解析
-   **服务**: 
    -   `TelegramBotService`: 负责 Bot 被动接收消息。
    -   `TelegramScraperService`: 负责定时主动抓取（Telegram 公开频道 + OKX 公告）。
-   **存储**: `TelegramMessageEntity` (表 `telegram_messages`)
-   **接口**: `TelegramController` (`GET /api/telegram/messages`)

### 前端 (cryptoquantx)
-   **页面**: `TelegramNewsPage` (/telegram-news)
-   **路由**: `/telegram-news`
-   **入口**: 顶部导航栏 "电报资讯"
-   **特性**:
    -   每 30 秒自动刷新。
    -   支持 HTML 格式消息显示（保留换行、链接）。
    -   统一展示 Telegram 频道消息和 OKX 公告。

## 3. 配置说明

### 3.1 方式一：使用 Telegram Bot
适用于你有频道管理权限，或者私有频道。
1.  在 Telegram 中搜索 `@BotFather`。
2.  发送 `/newbot` 创建新机器人。
3.  获取 API Token。
4.  将机器人拉入频道并设为管理员。

### 3.2 方式二：Telegram 网页抓取（无需管理员）
适用于公开频道（如 `t.me/jinse2017`），无需 Bot Token，无需管理员权限。
1.  无需配置 Token。
2.  直接配置频道名称即可。

### 3.3 方式三：OKX 公告抓取（内置）
系统自动定时从 OKX 官方 API 获取最新公告，无需额外配置。
-   数据源: `https://www.okx.com/api/v5/support/announcements`
-   展示名称: "OKX公告"

### 3.4 配置文件
修改 `application.properties`：

```properties
# 方式一：Bot 配置
telegram.bot.username=你的机器人用户名
telegram.bot.token=你的机器人Token

# 方式二：抓取配置（逗号分隔多个频道）
telegram.scraper.channels=jinse2017,other_channel

# OKX API 配置 (可选)
okx.api.base-url=https://www.okx.com
# 代理配置 (如果在国内网络环境无法访问 Telegram/OKX)
okx.proxy.enabled=true
okx.proxy.host=127.0.0.1
okx.proxy.port=10809
```

## 4. 数据库结构

表名: `telegram_messages`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 主键 |
| chat_id | Long | 聊天室/频道ID (抓取模式下为0) |
| chat_title | String | 频道名称 (如 "jinse2017" 或 "OKX公告") |
| message_id | Integer | 消息ID (或公告ID的hash) |
| text | Text | 消息内容 (HTML格式) |
| sender_name | String | 发送者名称 |
| sender_username | String | 发送者用户名 |
| received_at | DateTime | 接收时间 |
| message_date | DateTime | 消息发送时间 |

## 5. 故障排查
-   **收不到消息**: 检查机器人是否为频道管理员；检查 Token 是否正确；查看后端日志 `TelegramBotService`。
-   **抓取失败**: 检查网络是否能访问 Telegram/OKX，必要时开启代理配置 (`okx.proxy.enabled=true`)。
-   **前端显示空白**: 检查后端接口 `/api/telegram/messages` 是否返回数据；检查网络请求是否报错。
