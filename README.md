# LM Studio Copilot VS Code Extension

A full-featured Copilot-like chat extension for VS Code, powered by your local LM Studio server (OpenAI Chat API compatible).

## ✨ Features
- **Chat panel** with streaming LLM responses and multi-turn memory
- **File context selection**: include files/folders as context for the LLM
- **Inline code actions**: apply code blocks from chat directly at your cursor
- **Workspace-wide refactor**: LLM can suggest and apply multi-file edits, with diff preview and approval
- **Command palette integration**: start chat or apply suggestions from anywhere
- **File operations**: read, update, and create files from chat suggestions
- **Beautiful, modern UI** with chat bubbles and suggestions

## 🚀 Getting Started
1. Make sure [LM Studio](https://lmstudio.ai/) is running locally at `http://localhost:1234` and exposes the OpenAI Chat Completion API.
2. Install this extension in VS Code.
3. Open the Command Palette and run `LM Studio Copilot: Start Chat`.
4. Select files for context, chat with the LLM, and apply suggestions or code blocks as needed.

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
