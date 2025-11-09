# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000 with dynamic date discovery
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run preview` - Preview production build

### Testing
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI interface

### Code Quality
- `npm run lint` - Run ESLint to check for code issues
- `npm run format` - Format code with Prettier

## Architecture

### Application Structure
This is a **Snapchat Archive Viewer** built as a single-page React application that displays conversation history and media from Snapchat archives. Users place their Snapchat data export in the `/public` folder, and the app dynamically discovers and displays available data.

### Core Features

1. **Dashboard Landing Page** (`/` route):
   - Displays aggregate statistics across all available dates
   - Interactive calendar grid showing which dates have data
   - Quick navigation to any date with conversation data
   - Shows most active day and date range of archive

2. **Daily View** (`/day/:date` route):
   - Displays conversations for a specific date
   - Chronologically sorted messages (fixed sorting in `dataTransformer.ts`)
   - Media display based on `media_locations` field (not `media_ids`)
   - Filters out STATUS messages completely
   - Conversations with only STATUS messages are hidden

3. **Dynamic Date Discovery**:
   - Custom Vite plugin serves `/api/available-dates` endpoint
   - Automatically detects all dates in `/public/days/` folder
   - Navigation adapts to available dates only
   - No hardcoded dates - fully dynamic based on user's data

### Data Flow

1. **User Data Structure** (in `/public/`):
   ```
   public/
   ├── index.json          # User/group metadata
   ├── days/              # Daily conversation data
   │   ├── YYYY-MM-DD/
   │   │   ├── conversations.json
   │   │   └── media/     # Media files for that day
   └── bitmoji/           # Bitmoji assets (optional)
   ```

2. **Data Loading Pipeline**:
   - `vite.config.ts`: Custom plugin provides available dates API
   - `dataLoader.ts`: Fetches and caches available dates dynamically
   - `dataTransformer.ts`:
     - Filters out STATUS messages
     - Sorts messages chronologically by timestamp
     - Removes conversations with zero messages after filtering

3. **Media Display Logic**:
   - Checks `media_locations` array for actual file paths
   - Shows media when files exist, snap indicators when they don't
   - Supports IMAGE, VIDEO, NOTE (audio), STICKER types

### State Management
Zustand store (`useArchiveStore`) manages:
- Current conversation and conversation list
- Search state (query, results, navigation)
- Media filtering and lightbox state
- Audio playback coordination across components
- Index data (users, groups, account owner)
- Available dates caching

### Component Architecture

1. **Routes**:
   - `Dashboard.tsx`: Landing page with archive overview
   - `DailyView.tsx`: Daily conversation view (no auto-redirect)

2. **Layout Components**:
   - `DailyHeader`: Navigation with Dashboard button, date picker, prev/next
   - `MainContent`: Chat/Media Gallery tab container
   - `ConversationList`: Sidebar with conversation filtering

3. **Media Components**:
   - `MediaGallery`: Grid view with vertical uncropped display
   - `OrphanedMediaView`: Shows media without messages
   - `MessageMedia`: Inline media in conversations
   - `Lightbox`: Fullscreen media viewer

4. **Message Components**:
   - `Message`: Individual message display with media detection
   - `SnapIndicator`: Shows opened snaps without saved media
   - `AudioPlayer`: Voice note playback with chaining

### Key Technical Decisions

1. **Path Aliasing**: `@/` is aliased to `src/` directory for cleaner imports
2. **Styling**: Tailwind CSS with custom theme colors (bg-primary, accent, etc.)
3. **Icons**: Lucide React for consistent iconography
4. **Date Handling**: date-fns for formatting and manipulation
5. **TypeScript**: Strict typing with interfaces in `src/types/index.ts`

### Critical Implementation Details

1. **Message Ordering**:
   - Messages are sorted by timestamp in `transformConversation()`
   - Uses `Date.parse()` on the `Created` field for chronological ordering

2. **Media Detection**:
   - **IMPORTANT**: Media display checks `media_locations` array, NOT `media_ids`
   - Empty `media_locations` shows snap indicators or placeholders
   - Populated `media_locations` displays actual media files

3. **STATUS Message Filtering**:
   - All messages with `Media Type: "STATUS"` are filtered out
   - Conversations with only STATUS messages are completely hidden
   - Stats are recalculated after filtering

4. **Search Implementation**:
   - Real-time text search within messages
   - Highlights matching terms with `<mark>` elements
   - Search state persists across conversation switches

5. **Keyboard Shortcuts**:
   - `/` - Focus search
   - `G` - Open media gallery
   - `ESC` - Close modals or clear search
   - Arrow keys for navigation

### Performance Considerations
- Dashboard loads data progressively (shows stats as available)
- Available dates are cached after first fetch
- Images use lazy loading
- Media gallery displays items vertically without cropping (better for varied aspect ratios)