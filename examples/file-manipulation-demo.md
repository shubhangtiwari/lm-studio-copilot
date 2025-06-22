# File Manipulation Demo

This document demonstrates how to use the LM Studio Copilot extension's file manipulation features.

## Example Prompts

Try these prompts in the chat to see file manipulation in action:

### 1. Create a new file
```
Create a simple TypeScript utility file called `stringUtils.ts` with functions for capitalizing strings and checking if a string is empty.
```

### 2. Edit existing files
```
Add error handling to the main extension.ts file to catch and log any errors in the message handlers.
```

### 3. Refactor across multiple files
```
Create a proper project structure with separate folders for utilities, types, and constants. Move the appropriate code into these new files.
```

### 4. Configuration files
```
Create a .gitignore file appropriate for a TypeScript VS Code extension project.
```

### 5. Documentation updates
```
Update the README.md to include installation instructions and usage examples.
```

## Expected Behavior

When you submit any of these prompts, the AI should respond with:

1. A conversational explanation of what it will do
2. A "Proposed File Changes" section showing:
   - Action type (CREATE/EDIT/DELETE)
   - File path
   - Reason for the change
   - Preview and Apply buttons

3. Options to:
   - Preview individual changes (opens diff view)
   - Apply individual changes
   - Preview all changes
   - Apply all changes
   - Dismiss all changes

## Tips for Best Results

- Be specific about what you want changed
- Include context files when relevant
- Review the diff previews before applying changes
- Use "Apply All" for related changes that should be atomic
- The AI understands your project structure and coding conventions

## Technical Details

The extension uses VS Code's `WorkspaceEdit` API to ensure:
- Proper undo/redo support
- Integration with source control
- Atomic operations for multi-file changes
- Respect for VS Code's file watching and editor synchronization
