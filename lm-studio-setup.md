# LM Studio Configuration Guide

## How to Configure Your LM Studio Model

### 1. System Prompt Setup

In LM Studio, when loading your model, set the system prompt to one of the following:

#### Option A: Use the Concise Version
Copy the contents of `system-prompt-concise.txt` into your LM Studio system prompt field.

#### Option B: Use the Full Version  
Copy the system prompt section from `system-prompt.md` into your LM Studio system prompt field.

### 2. Model Parameters

Recommended settings for optimal performance:

```
Temperature: 0.3-0.7
Top-p: 0.8-0.95
Max Tokens: 4096
Repeat Penalty: 1.1
```

### 3. Model Recommendations

**Best Performance:**
- CodeLlama 13B+ (Instruct variants)
- Deepseek Coder 6.7B/13B/33B
- WizardCoder 15B/34B
- Phind CodeLlama 34B

**Good Performance:**
- Mistral 7B Instruct
- OpenHermes 2.5 Mistral 7B
- CodeT5+ Models

### 4. Testing Your Setup

After configuring your model, test with these prompts:

#### Basic File Creation Test:
```
Create a simple TypeScript function in a new file called `test.ts` that adds two numbers.
```

Expected response should include a `filechanges` block.

#### Multi-file Test:
```
Create a React component with a separate CSS file for styling.
```

Should create both `.tsx` and `.css` files.

### 5. Troubleshooting

**Issue: Model doesn't use filechanges format**
- Solution: Ensure system prompt is properly set
- Try adding examples in your first message

**Issue: Invalid JSON in filechanges**
- Solution: Use a model with better instruction following
- Increase temperature slightly

**Issue: Incomplete file content**
- Solution: Increase max tokens parameter
- Use "complete file content" in your requests

**Issue: Wrong file paths**
- Solution: Always provide context about your project structure
- Include current working directory in your prompts

### 6. Advanced Configuration

For better results, you can also:

1. **Fine-tune the prompt** for your specific project type
2. **Add project-specific guidelines** to the system prompt
3. **Include common file templates** in the system prompt
4. **Set up model presets** for different types of work

### 7. Example LM Studio Setup

1. Open LM Studio
2. Load your preferred coding model
3. Go to the Chat interface
4. Click the system prompt field
5. Paste the system prompt from `system-prompt-concise.txt`
6. Set parameters as recommended above
7. Save as a preset for easy reuse

### 8. VS Code Extension Connection

Make sure:
- LM Studio is running on `http://localhost:1234`
- The server is started in LM Studio
- Your model is loaded and ready
- The VS Code extension is installed and activated

Your model should now be able to suggest and implement file changes through the VS Code extension interface!
