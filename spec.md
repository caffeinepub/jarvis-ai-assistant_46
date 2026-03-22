# JARVIS AI Assistant

## Current State
Fully functional JARVIS chat app with:
- Groq → Gemini → OpenAI → DeepSeek auto-fallback
- Voice input (hands-free), TTS output
- Multi-language support (EN/HI/HG)
- Chat scroll + scroll-to-bottom button
- Settings panel with "What Jarvis Can Do" dropdown
- Simple name entry (no login)

## Requested Changes (Diff)

### Add
- **Google Search integration**: Detect search commands ("search for X", "google X", "find X") in user input; open `https://www.google.com/search?q=X` in a new tab; JARVIS responds with a confirmation message in chat.
- **Clear Chat History button**: A trash/clear icon button in the chat input bar area that resets messages back to just the JARVIS greeting. Show a confirm dialog or immediate clear with a brief undo moment.

### Modify
- `App.tsx`: Add `handleClearChat` function that resets messages to initial greeting. Pass it down to `ChatView`.
- `ChatView.tsx`: Add a clear-chat button (trash icon) in the input bar. Add `onClearChat` prop.
- `useGemini.ts` or `App.tsx`: Add `detectSearchCommand` utility to extract search query from user input and trigger `window.open` + JARVIS response.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `detectSearchCommand(text)` utility in `App.tsx` that returns search query string or null.
2. In `handleSendMessage`, check for search command before AI call: open Google search tab and add JARVIS confirmation message.
3. Add `onClearChat` prop to `ChatView` and render a clear button (trash icon) next to the send button.
4. Add `handleClearChat` in `App.tsx` that resets messages to greeting.
