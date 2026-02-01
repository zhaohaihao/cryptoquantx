# Feature: Dynamic Channels & Pagination Implementation

## Overview
Implemented dynamic Telegram channel management, pagination for news messages, and a UI redesign to list view.

## Backend Changes (`okx-trading`)

### 1. Data Model
- Created `TelegramChannelEntity` to store channel configurations dynamically.
- Created `TelegramChannelRepository` for database access.

### 2. Service Logic (`TelegramScraperService`)
- **Dynamic Channels**: Now loads channels from the database instead of a static configuration.
- **OKX Toggle**: "OKX Announcements" is now treated as a special channel named "OKX公告". Adding this channel enables OKX scraping; removing it disables it.
- **Methods Added**: `addChannel`, `removeChannel`, `getAllChannels`.

### 3. API Endpoints (`TelegramController`)
- `GET /api/telegram/messages?page=0&size=20`: Added pagination support.
- `GET /api/telegram/channels`: List all active channels.
- `POST /api/telegram/channels?channelName=xxx`: Add a new channel.
- `DELETE /api/telegram/channels?channelName=xxx`: Remove a channel.

## Frontend Changes (`cryptoquantx`)

### 1. UI Redesign
- **Layout**: Switched from Grid (Card) view to List (Row) view for better information density.
- **Style**: Maintained Glassmorphism aesthetic but optimized for rows.
- **Consistency**: Matched font and color scheme with the rest of the application.

### 2. New Features
- **Channel Management**: Added an input field to add new channels dynamically.
- **Active Subscriptions**: Displays a list of currently subscribed channels with delete options.
- **Pagination**: Added "Previous" / "Next" buttons and page number display.
- **Manual Refresh**: Added a refresh button to trigger immediate data reload.

## Usage Guide
1. **Add Channel**: Enter the Telegram channel ID (e.g., `jinse2017`) in the input box and click "添加频道".
2. **Enable OKX**: Enter `OKX公告` to enable OKX announcement scraping.
3. **Pagination**: Use the buttons at the bottom to navigate history.
