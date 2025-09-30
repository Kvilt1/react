# Snapchat Archive Viewer - React

A pixel-perfect React conversion of the Snapchat archive viewer, built with modern best practices and full accessibility support.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **API Mocking**: MSW (Mock Service Worker)
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React
- **Linting**: ESLint + Prettier

## Setup & Run

### Installation

```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install

# Using yarn
yarn install
```

### Development

```bash
# Start development server (with MSW)
npm run dev
# or
pnpm dev

# Server will run on http://localhost:3000
```

### Testing

```bash
# Run tests
npm test
# or
pnpm test

# Run tests with UI
npm run test:ui
# or
pnpm test:ui
```

### Build

```bash
# Build for production
npm run build
# or
pnpm build

# Preview production build
npm run preview
# or
pnpm preview
```

### Code Quality

```bash
# Lint code
npm run lint
# or
pnpm lint

# Format code
npm run format
# or
pnpm format
```

## Project Structure

```
react/
├── src/
│   ├── components/        # React components
│   │   ├── ChatHeader.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ConversationItem.tsx
│   │   ├── ConversationList.tsx
│   │   ├── DailyHeader.tsx
│   │   ├── KeyboardHint.tsx
│   │   ├── Lightbox.tsx
│   │   ├── MainContent.tsx
│   │   ├── MediaGallery.tsx
│   │   ├── Message.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageMedia.tsx
│   │   ├── OrphanedMediaModal.tsx
│   │   └── SnapIndicator.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useKeyboardShortcuts.ts
│   ├── lib/              # Utilities and API client
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── mocks/            # MSW mock server
│   │   ├── browser.ts
│   │   ├── handlers.ts
│   │   └── data/
│   │       └── 2025-07-27.json
│   ├── routes/           # Route components
│   │   └── DailyView.tsx
│   ├── store/            # Zustand state management
│   │   └── useArchiveStore.ts
│   ├── styles/           # Global styles
│   │   └── globals.css
│   ├── tests/            # Test setup
│   │   └── setup.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Root app component
│   └── main.tsx          # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features

### Pixel-Perfect Conversion
- Exact visual matching of original HTML/CSS design
- All spacing, colors, typography preserved
- Responsive behavior maintained
- Custom scrollbar styling
- Smooth transitions and animations

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

### Keyboard Shortcuts
- `/` - Focus search input
- `G` - Open media gallery
- `ESC` - Close lightbox/modal/gallery or clear search
- `↑/↓` - Navigate conversations
- `←/→` - Navigate media in lightbox

### Interactive Features
- Conversation list with search
- Real-time message search with highlighting
- Media gallery with filtering (All, Images, Videos, Voice Notes)
- Lightbox for media viewing with navigation
- Orphaned media viewer
- Tab switching (Chat / Media Gallery)

## Selector → Component Mapping

| Original Selector/Class | React Component |
|------------------------|-----------------|
| `.daily-header` | `DailyHeader.tsx` |
| `.conversation-list` | `ConversationList.tsx` |
| `.conversation-item` | `ConversationItem.tsx` |
| `.main-content` | `MainContent.tsx` |
| `.chat-window` | `ChatWindow.tsx` |
| `.chat-header` | `ChatHeader.tsx` |
| `.chat-messages` | `MessageList.tsx` |
| `.message` | `Message.tsx` |
| `.message-media` | `MessageMedia.tsx` |
| `.snap-indicator-box` | `SnapIndicator.tsx` |
| `.media-gallery` | `MediaGallery.tsx` |
| `.lightbox` | `Lightbox.tsx` |
| `.orphaned-media-modal` | `OrphanedMediaModal.tsx` |
| `.keyboard-hint` | `KeyboardHint.tsx` |

## CSS Porting Notes

### Tailwind Utilities
Most original CSS has been converted to Tailwind utility classes:
- Colors: Custom color palette in `tailwind.config.js`
- Spacing: Standard Tailwind spacing scale
- Typography: System font stack preserved
- Borders: Border colors and radii
- Transitions: Standard transition utilities

### Custom CSS (in globals.css)
The following styles remain as custom CSS:
- Scrollbar styling (webkit-specific)
- Portrait video optimization
- Audio/video controls customization
- Complex gradients for media placeholders
- Highlight effects for search results

### CSS Variables
Original CSS variables converted to Tailwind theme:
```javascript
colors: {
  'bg-primary': '#000000',
  'bg-secondary': '#1a1a1a',
  'bg-tertiary': '#2a2a2a',
  'text-primary': '#ffffff',
  'text-secondary': '#b4b4b4',
  'text-tertiary': '#808080',
  'accent': '#fffc00',
  // ... etc
}
```

## API & Data

### Mock API Endpoints
- `GET /api/day/:date` - Fetch day data with conversations and media

### Mock Data
Mock data is stored in `src/mocks/data/2025-07-27.json` and includes:
- Conversations list
- Messages with media
- Orphaned media information
- Statistics

### Extending Mock Data
To add more mock data:
1. Create new JSON files in `src/mocks/data/`
2. Update handlers in `src/mocks/handlers.ts`
3. Import and use in components

## State Management

Uses Zustand for global state:
- Current conversation
- Conversations list
- Account username detection
- Search state
- Media filter state
- Lightbox state
- Modal visibility

## Verification Steps

### Visual Comparison
1. Open original HTML file in browser
2. Open React app at http://localhost:3000
3. Compare at different viewport sizes:
   - Desktop: 1920x1080
   - Tablet: 768x1024
   - Mobile: 375x667

### Functional Testing
1. **Conversation Selection**
   - Click conversations in sidebar
   - Verify active state
   - Check conversation header updates

2. **Message Search**
   - Type in search box
   - Verify results count
   - Check text highlighting

3. **Media Gallery**
   - Switch to Media Gallery tab
   - Test media filters
   - Click media items
   - Verify lightbox opens

4. **Lightbox Navigation**
   - Open lightbox from gallery
   - Use arrow keys to navigate
   - Test ESC to close
   - Try double-click for fullscreen (video)

5. **Orphaned Media**
   - Click orphaned media button (if shown)
   - Test filter buttons
   - View media in lightbox

### Accessibility Smoke Test
1. **Keyboard Navigation**
   - Tab through focusable elements
   - Verify focus indicators visible
   - Test keyboard shortcuts

2. **Screen Reader**
   - Use VoiceOver (Mac) or NVDA (Windows)
   - Verify ARIA labels announced
   - Check button and link descriptions

3. **Color Contrast**
   - Text on backgrounds meets WCAG AA
   - Accent color readable
   - Focus indicators visible

## Known Parity Gaps

### None
The React conversion achieves complete pixel parity with the original HTML/CSS/JS implementation with no known deviations.

### Future Enhancements (Not in Original)
These features could be added but weren't in the original:
- Real backend API integration
- Data persistence
- User authentication
- Export functionality
- Advanced search filters
- Media download

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Mobile

## Performance

- Code-split routes with React Router
- Lazy loading for images (`loading="lazy"`)
- Memoization for expensive computations
- Efficient state updates with Zustand
- Virtual scrolling candidates: conversation list, message list (not implemented but recommended for large datasets)

## License

This is a conversion of an existing archive viewer. Please refer to the original project's license.
