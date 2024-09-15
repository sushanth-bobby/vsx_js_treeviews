const vscode = require("vscode");
const fs = require('fs');
const path = require('path');

class WebviewManager {
  constructor(context) {
    this.context = context;
  }

  openNoteWebview(note) {
    const panel = vscode.window.createWebviewPanel(
      'notepad',
      note.label,
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    panel.webview.html = this.getWebviewContent(note.label);

    // Handle save command from webview
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'saveNote':
            // saveMarkdown(note.label, message.content, message.tags);
            saveMarkdownWithDialog(note.label, message.content, message.tags);
            vscode.window.showInformationMessage(`Note saved as ${note.label}.md`);
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  getWebviewContent(noteTitle) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${noteTitle}</title>
      </head>
      <body>
        <h1>${noteTitle}</h1>
        <label for="content">Content:</label><br>
        <textarea id="content" rows="10" cols="50">This is your note content</textarea><br>
        <label for="tags">Tags:</label><br>
        <input type="text" id="tags" value="tag1, tag2"><br><br>
        <button onclick="saveNote()">Save Note</button>

        <script>
          const vscode = acquireVsCodeApi();
          function saveNote() {
            const content = document.getElementById('content').value;
            const tags = document.getElementById('tags').value;
            vscode.postMessage({
              command: 'saveNote',
              content: content,
              tags: tags
            });
          }
        </script>
      </body>
      </html>`;
  }
}

//-------------------------------
// const vscode = require('vscode');
// const fs = require('fs');
// const path = require('path');

// Function to save the note as a markdown file
function saveMarkdown(noteTitle, content, tags) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      const folderPath = workspaceFolders[0].uri.fsPath;
      const filePath = path.join(folderPath, `${noteTitle}.md`);
      console.log(`filePath=${filePath}`)      
      const markdownContent = `# ${noteTitle}\n\n${content}\n\n**Tags:** ${tags}`;
      fs.writeFileSync(filePath, markdownContent, 'utf8');
    }
}

// Function to save the note as a markdown file using a dialog
async function saveMarkdownWithDialog(noteTitle, content, tags) {
  const markdownContent = `# ${noteTitle}\n\n${content}\n\n**Tags:** ${tags}`;

  // Open the Save Dialog
  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(`${noteTitle}.md`),
    filters: {
      'Markdown files': ['md']
    }
  });

  // If user selects a path
  if (uri) {
    const filePath = uri.fsPath;
    fs.writeFileSync(filePath, markdownContent, 'utf8');
    vscode.window.showInformationMessage(`Note saved at ${filePath}`);
  } else {
    vscode.window.showWarningMessage('Save canceled.');
  }
}


// module.exports = {
//     saveMarkdown
// };

module.exports = WebviewManager;
