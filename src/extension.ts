// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const path = require('path');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "lm-studio-copilot" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('lm-studio-copilot.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from LM Studio Copilot!');
	});

	context.subscriptions.push(disposable);

	const chatDisposable = vscode.commands.registerCommand('lm-studio-copilot.openChat', () => {
		const mediaRoot = vscode.Uri.file(path.join(__dirname, '../media'));
		const panel = vscode.window.createWebviewPanel(
			'lmStudioCopilotChat',
			'LM Studio Copilot Chat',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [mediaRoot]
			}
		);

		panel.webview.html = getWebviewContent(panel);

		let chatHistory: { role: string, content: string }[] = [];
		let currentAbortController: AbortController | null = null;

		panel.webview.onDidReceiveMessage(async (message) => {
			switch (message.type) {
				case 'chat': {
					let contextFiles: { path: string, content: string }[] = [];
					if (message.files && message.files.length) {
						for (const file of message.files) {
							try {
								const uri = vscode.Uri.file(file);
								const content = (await vscode.workspace.fs.readFile(uri)).toString();
								contextFiles.push({ path: file, content });
							} catch {}
						}
					}
					chatHistory.push({ role: 'user', content: message.prompt });
					// Only send the new chunk to the webview, not the accumulated text
					const onPartial = (chunk: string) => {
						panel.webview.postMessage({ type: 'chatPartial', response: chunk });
					};
					// Create and store AbortController
					currentAbortController = new AbortController();
					const response = await chatWithLmStudio(message.prompt, contextFiles, chatHistory, onPartial, currentAbortController.signal);
					chatHistory.push({ role: 'assistant', content: response.text });
					panel.webview.postMessage({ type: 'chatResponse', response: response.text, suggestions: response.suggestions });
					currentAbortController = null;
					break;
				}
				case 'stop': {
					if (currentAbortController) {
						currentAbortController.abort();
						currentAbortController = null;
						panel.webview.postMessage({ type: 'chatStopped' });
					}
					break;
				}
				case 'listFiles': {
					const files = await vscode.workspace.findFiles('**/*.{ts,js,py,md,txt,json}', '**/node_modules/**', 100);
					panel.webview.postMessage({ type: 'fileList', files: files.map(f => f.fsPath) });
					break;
				}
				case 'approveSuggestion': {
					const s = message.suggestion;
					if (Array.isArray(s)) {
						// Multi-file suggestions
						for (const sug of s) {
							await handleFileSuggestion(sug, panel);
						}
					} else {
						await handleFileSuggestion(s, panel);
					}
					break;
				}
				case 'readFile': {
					try {
						const uri = vscode.Uri.file(message.path);
						const content = (await vscode.workspace.fs.readFile(uri)).toString();
						panel.webview.postMessage({ type: 'fileContent', path: message.path, content });
					} catch (e: any) {
						panel.webview.postMessage({ type: 'fileError', path: message.path, error: e?.message || String(e) });
					}
					break;
				}
				case 'writeFile': {
					try {
						const uri = vscode.Uri.file(message.path);
						await vscode.workspace.fs.writeFile(uri, Buffer.from(message.content));
						panel.webview.postMessage({ type: 'fileWritten', path: message.path });
					} catch (e: any) {
						panel.webview.postMessage({ type: 'fileError', path: message.path, error: e?.message || String(e) });
					}
					break;
				}
				case 'createFile': {
					try {
						const uri = vscode.Uri.file(message.path);
						await vscode.workspace.fs.writeFile(uri, Buffer.from(message.content || ''));
						panel.webview.postMessage({ type: 'fileCreated', path: message.path });
					} catch (e: any) {
						panel.webview.postMessage({ type: 'fileError', path: message.path, error: e?.message || String(e) });
					}
					break;
				}
				case 'listFiles': {
					const files = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(''));
					const fileNames = files.map(([fileName, fileType]) => fileName);
					panel.webview.postMessage({ type: 'fileList', files: fileNames });
					break;
				}
				case 'approveSuggestion': {
					// Handle suggestion approval
					break;
				}
				case 'applyInlineCode': {
					const editor = vscode.window.activeTextEditor;
					if (editor) {
						editor.edit(editBuilder => {
							const selections = editor.selections;
							for (const sel of selections) {
								editBuilder.replace(sel, message.code);
							}
						});
						vscode.window.showInformationMessage('Code applied at cursor.');
					}
					break;
				}
				case 'showFilePicker': {
					// Use showQuickPick to let user select a file from the workspace
					const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 500);
					const items = files.map(f => ({ label: vscode.workspace.asRelativePath(f), fsPath: f.fsPath }));
					const picked = await vscode.window.showQuickPick(items, {
						placeHolder: 'Select a file to add as context',
						matchOnDescription: true,
						matchOnDetail: true,
						canPickMany: false
					});
					if (picked) {
						panel.webview.postMessage({ type: 'filePicked', file: picked.fsPath });
					}
					break;
				}
			}
		});
	});
	context.subscriptions.push(chatDisposable);

	// Register additional commands for command palette integration
	context.subscriptions.push(vscode.commands.registerCommand('lm-studio-copilot.startChat', () => {
		vscode.commands.executeCommand('lm-studio-copilot.openChat');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('lm-studio-copilot.applyLastSuggestion', async () => {
		// This command applies the last suggestion from the last chat session if available
		const panel = vscode.window.visibleTextEditors.length ? vscode.window.visibleTextEditors[0] : undefined;
		if (!panel) {
			vscode.window.showInformationMessage('No active editor for applying suggestion.');
			return;
		}
		// This is a placeholder: in a real implementation, you would persist the last suggestion
		vscode.window.showInformationMessage('Use the chat panel to apply suggestions.');
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(panel?: vscode.WebviewPanel): string {
  // Read the HTML file from media/chatPanel.html
  const htmlPath = path.join(__dirname, '../media/chatPanel.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  // No need to replace or inject JS/CSS, as all logic is inline in chatPanel.html
  return html;
}

async function chatWithLmStudio(prompt: string, contextFiles: { path: string, content: string }[], chatHistory: { role: string, content: string }[], onPartial?: (chunk: string) => void, abortSignal?: AbortSignal): Promise<{ text: string, suggestions?: any[] }> {
  try {
    const systemMsg = contextFiles && contextFiles.length ?
      'Context files:\n' + contextFiles.map(f => `File: ${f.path}\n${f.content}`).join('\n\n') : '';
    const messages = [
      ...(systemMsg ? [{ role: 'system', content: systemMsg }] : []),
      ...chatHistory,
      { role: 'user', content: prompt }
    ];
    const res = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'lm-studio',
        messages,
        stream: true
      }),
      signal: abortSignal
    });
    let text = '';
    let suggestions = undefined;
    const reader = res.body?.getReader();
    if (reader) {
      let done = false;
      let buffer = '';
      let lastSentLength = 0;
      while (!done) {
        try {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            buffer += new TextDecoder().decode(value);
            // Split by newlines, process each line
            let lines = buffer.split(/\r?\n/);
            // Keep the last line in buffer if it's incomplete
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const jsonStr = line.slice(5).trim();
                if (jsonStr && jsonStr !== '[DONE]') {
                  try {
                    const data = JSON.parse(jsonStr);
                    const content = data.choices?.[0]?.delta?.content;
                    if (content) {
                      text += content;
                      if (onPartial) {
                        // Only send the new chunk
                        const newChunk = text.slice(lastSentLength);
                        if (newChunk) {
                          onPartial(newChunk);
                          lastSentLength = text.length;
                        }
                      }
                    }
                  } catch {}
                }
              }
            }
          }
        } catch (e) {
          // If abort, just break loop and return what we have so far
          if (abortSignal && abortSignal.aborted) {
            break;
          } else {
            throw e;
          }
        }
      }
    } else {
      text = await res.text();
    }
    try {
      const match = text.match(/```suggestion([\s\S]*?)```/);
      if (match) {
        suggestions = JSON.parse(match[1]);
        text = text.replace(match[0], '').trim();
      }
    } catch {}
    return { text, suggestions };
  } catch (e: any) {
    // If aborted, just return what we have so far (no error)
    if (abortSignal && abortSignal.aborted) {
      return { text: '', suggestions: undefined };
    }
    return { text: 'Error: ' + (e?.message || String(e)) };
  }
}

// Helper for file suggestions with diff preview
async function handleFileSuggestion(s: any, panel: vscode.WebviewPanel) {
	if ((s.action === 'edit' || s.action === 'create') && s.path && s.content !== undefined) {
		const uri = vscode.Uri.file(s.path);
		let oldContent = '';
		try {
			oldContent = (await vscode.workspace.fs.readFile(uri)).toString();
		} catch {}
		const diffTitle = s.action === 'edit' ? `Edit: ${s.path}` : `Create: ${s.path}`;
		const left = vscode.Uri.parse(`untitled:Old - ${s.path}`);
		const right = vscode.Uri.parse(`untitled:New - ${s.path}`);
		await vscode.workspace.openTextDocument(left).then(doc => vscode.window.showTextDocument(doc, { preview: false, preserveFocus: true }));
		await vscode.workspace.openTextDocument(right).then(doc => vscode.window.showTextDocument(doc, { preview: false, preserveFocus: true }));
		await vscode.commands.executeCommand('vscode.diff', left, right, diffTitle);
		// Write new content to right doc
		const editors = vscode.window.visibleTextEditors;
		for (const editor of editors) {
			if (editor.document.uri.toString() === right.toString()) {
				await editor.edit(editBuilder => {
					editBuilder.replace(new vscode.Range(0, 0, editor.document.lineCount, 0), s.content);
				});
			}
			if (editor.document.uri.toString() === left.toString()) {
				await editor.edit(editBuilder => {
					editBuilder.replace(new vscode.Range(0, 0, editor.document.lineCount, 0), oldContent);
				});
			}
		}
		// Ask user to confirm
		const confirm = await vscode.window.showInformationMessage(`Apply change to ${s.path}?`, 'Yes', 'No');
		if (confirm === 'Yes') {
			await vscode.workspace.fs.writeFile(uri, Buffer.from(s.content));
			panel.webview.postMessage({ type: s.action === 'edit' ? 'fileWritten' : 'fileCreated', path: s.path });
		}
	}
}
