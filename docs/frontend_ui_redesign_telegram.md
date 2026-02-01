# Telegram News Page UI Redesign

## Goal
Redesign the Telegram/News page (`TelegramNewsPage`) to move away from a basic `div` layout to a modern, polished interface. The key requirement was to ensure consistent height for all message cards regardless of content length.

## Design Decisions

### 1. Visual Style: Glassmorphism
- **Background**: Translucent dark blue/gray (`rgba(30, 34, 45, 0.6)`) with `backdrop-filter: blur(12px)`.
- **Borders**: Thin, semi-transparent borders to define edges without being heavy (`rgba(255, 255, 255, 0.08)`).
- **Typography**: switched to 'Inter' for UI text and 'JetBrains Mono' for code snippets, ensuring high readability on dark backgrounds.
- **Accents**: 
  - Green for general Telegram channels.
  - Blue (`#2979ff`) for OKX official announcements.

### 2. Layout: CSS Grid & Flexbox
- **Grid**: Used `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))` to create a responsive masonry-like grid that adapts to screen width.
- **Fixed Height**: Forced all cards to `height: 320px`.
- **Internal Layout**: 
  - Used `flex-direction: column`.
  - The message body uses `flex: 1` and `overflow-y: auto`.
  - This ensures that short messages look uniform, and long messages are scrollable within the card, preventing layout shifts or uneven rows.

### 3. Typography & Readability
- **Date Formatting**: Simplified to `MM-DD HH:mm` to save header space.
- **Sender Info**: Hidden if the sender name matches the channel title (reduces noise for official announcement channels).
- **Scrollbars**: Custom styled scrollbars (thin, dark theme compatible) to blend into the card design.

## Implementation Details

### CSS (`src/pages/TelegramNewsPage.css`)
- Added `.message-card` with fixed height and flex properties.
- Added `.channel-name.okx` for source differentiation.
- Implemented custom scrollbar webkit styles.

### React Component (`src/pages/TelegramNewsPage.tsx`)
- Updated `formatDate` for cleaner output.
- Added `isOkxChannel` helper to toggle classes.
- Added conditional rendering for `message-sender`.

### Global Styles (`src/index.css`)
- Imported Google Fonts (Inter, JetBrains Mono).
- Set global font family.

## Future Improvements
- Add "Copy to Clipboard" button for messages.
- Add filtering by source (OKX vs Telegram).
- Add "Load More" functionality for history.
