# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
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
This is a **Snapchat Archive Viewer** built as a single-page React application that displays conversation history and media from Snapchat archives. The app follows these architectural patterns:

1. **Routing**: React Router v6 handles client-side navigation
   - Main route: `/` and `/day/:date` both render `DailyView`
   - Date-based navigation for viewing different days' conversations

2. **State Management**: Zustand store (`useArchiveStore`) manages global state including:
   - Current conversation and conversation list
   - Search state (query, results, navigation)
   - Media filtering and lightbox state
   - Audio playback coordination across components
   - Index data (users, groups, account owner)

3. **Data Loading**: Static JSON files served from `/public/days/` directory
   - `loadIndexData()`: Loads user/group metadata from `/index.json`
   - `loadDayData(date)`: Loads conversations for specific dates from `/days/YYYY-MM-DD/conversations.json`
   - Data transformation happens in `dataTransformer.ts` to convert raw JSON to typed interfaces

4. **Component Organization**:
   - **Container Components**: `DailyView` orchestrates the main layout
   - **Layout Components**: `DailyHeader`, `MainContent`, `ConversationList`, `ChatWindow`
   - **Feature Components**: `MediaGallery`, `Lightbox`, `AudioPlayer`, `DatePickerPopup`
   - **UI Components**: `Message`, `MessageMedia`, `ConversationItem`, `KeyboardHint`

5. **Media Handling**:
   - Images/videos/audio files are referenced by paths in JSON data
   - `MessageMedia` component handles different media types with appropriate players
   - Lightbox provides fullscreen media viewing with keyboard navigation
   - Audio playback is centrally managed to prevent multiple simultaneous plays

### Key Technical Decisions

1. **Path Aliasing**: `@/` is aliased to `src/` directory for cleaner imports
2. **Styling**: Tailwind CSS for utility-first styling with custom theme colors
3. **Icons**: Lucide React for consistent iconography
4. **Date Handling**: date-fns for date formatting and manipulation
5. **TypeScript**: Strict typing throughout with interfaces in `src/types/index.ts`

### Important Patterns

1. **Custom Hooks**:
   - `useKeyboardShortcuts`: Centralized keyboard shortcut management with proper cleanup

2. **Color Assignment**:
   - `colorAssignment.ts`: Assigns consistent colors to users based on hash of their ID

3. **Search Implementation**:
   - Real-time text search within messages with result highlighting
   - Search state managed globally to persist across conversation switches

4. **Media Gallery**:
   - Filters media by type (All/Images/Videos/Voice Notes)
   - Orphaned media (media without associated messages) displayed separately

### Testing Approach
- Unit tests use Vitest + React Testing Library
- Test setup in `src/tests/setup.ts`
- Mock Service Worker (MSW) for API mocking during development (currently unused but configured)

### Performance Considerations
- Components use React.memo where appropriate for re-render optimization
- Lazy loading for images with `loading="lazy"`
- Zustand for efficient state updates without prop drilling
- Consider implementing virtual scrolling for large conversation/message lists (noted as future enhancement)