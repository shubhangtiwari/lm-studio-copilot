# LM Studio Copilot VS Code Extension

A full-featured Copilot-like chat extension for VS Code, powered by your local LM Studio server (OpenAI Chat API compatible). **Now with direct file manipulation capabilities!**

## ✨ Features
- **Chat panel** with streaming LLM responses and multi-turn memory
- **File context selection**: include files/folders as context for the LLM
- **Direct file manipulation**: AI can create, edit, and delete files with your approval
- **Line-based updates**: Precise targeting of specific lines for efficient modifications
- **Diff preview**: see exactly what changes will be made before applying them
- **Batch operations**: preview and apply multiple file changes at once
- **Inline code actions**: apply code blocks from chat directly at your cursor
- **Workspace-wide refactor**: LLM can suggest and apply multi-file edits
- **Command palette integration**: start chat or apply suggestions from anywhere
- **File operations**: read, update, and create files from chat suggestions
- **Beautiful, modern UI** with chat bubbles, file change previews, and notifications

## 🎯 How File Changes Work

When you ask the AI to modify files, it will respond with proposed changes displayed in a user-friendly interface:

1. **File Change Cards**: Each proposed change shows:
   - Action type (CREATE, EDIT, LINE UPDATE, or DELETE)
   - File path and name
   - For line updates: specific line ranges being modified
   - Reason for the change
   - Preview and Apply buttons

2. **Change Types**:
   - **CREATE**: Generate new files with complete content
   - **EDIT**: Replace entire file content (legacy support)
   - **LINE UPDATE**: Modify only specific lines (preferred for efficiency)
   - **DELETE**: Remove files

3. **Individual Actions**:
   - **Preview**: Opens a diff view showing current vs. proposed content
   - **Apply**: Applies the single change immediately

4. **Batch Actions**:
   - **Preview All**: Shows diff views for all proposed changes
   - **Apply All**: Applies all changes at once
   - **Dismiss**: Cancels all proposed changes

5. **Safe Operations**: All file changes use VS Code's native workspace editing APIs, ensuring proper undo/redo support and integration with source control.

## 💬 Example Usage

Try asking the AI things like:
- "Create a new React component called UserProfile"
- "Add error handling to all API calls in this project"
- "Refactor this class to use TypeScript interfaces"
- "Create a configuration file for ESLint"
- "Update all import statements to use relative paths"

## 🚀 Getting Started
1. Make sure [LM Studio](https://lmstudio.ai/) is running locally at `http://localhost:1234` and exposes the OpenAI Chat Completion API.
2. Install this extension in VS Code.
3. Open the Command Palette and run `LM Studio Copilot: Start Chat`.
4. Select files for context, chat with the LLM, and approve file changes as needed.

## 🖥️ Screenshots
<!-- Add screenshots of the chat panel, file context selection, and diff preview here -->

## ⚙️ Requirements
- VS Code 1.80+
- LM Studio server running locally at `http://localhost:1234` (OpenAI API compatible)

## 🛠️ Extension Settings
_No custom settings yet. All features are available out of the box._

## 📝 Known Issues
- TypeScript lint errors in `extension.ts` are expected due to embedded HTML/JS and do not affect runtime.
- Streaming requires LM Studio server to support OpenAI streaming API.

## 📢 Release Notes
### 1.0.0
- Initial release: Copilot-like chat, file context, inline code, workspace refactor, streaming, and more!

---

## 🤝 Contributing
PRs and feedback welcome! See the code for extension points.

## 📚 License
MIT
