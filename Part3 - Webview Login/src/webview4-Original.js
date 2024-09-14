const vscode = require("vscode");

class KeywordHighlighterView {
  resolveWebviewView(webviewView) {
      webviewView.webview.options = {
          enableScripts: true
      };

      webviewView.webview.html = this.getWebviewContent();

      // Handle messages from the webview
      webviewView.webview.onDidReceiveMessage(async message => {
          if (message.command === 'search') {
              const keyword = message.keyword;
              if (keyword) {
                  this.highlightKeyword(keyword);
              }
          }
      });
  }

  // Generate HTML for the webview
  getWebviewContent() {
      return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Keyword Highlighter</title>
          </head>
          <body>
              <h2>Search and Highlight</h2>
              <input type="text" id="keyword" placeholder="Enter keyword" />
              <button id="searchButton">Search</button>

              <script>
                  const vscode = acquireVsCodeApi();

                  document.getElementById('searchButton').addEventListener('click', () => {
                      const keyword = document.getElementById('keyword').value;
                      vscode.postMessage({ command: 'search', keyword });
                  });
              </script>
          </body>
          </html>`;
  }

  // Function to search and highlight keyword
  highlightKeyword(keyword) {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
          return;
      }

      const text = activeEditor.document.getText();
      const keywordRanges = [];
      let match;

      // Create a regex to match the keyword globally
      const regex = new RegExp(keyword, 'gi');
      while ((match = regex.exec(text)) !== null) {
          const startPos = activeEditor.document.positionAt(match.index);
          const endPos = activeEditor.document.positionAt(match.index + match[0].length);
          const range = new vscode.Range(startPos, endPos);
          keywordRanges.push(range);
      }

      // Highlight the ranges in the editor
      const highlightDecoration = vscode.window.createTextEditorDecorationType({
          backgroundColor: 'yellow'
      });
      activeEditor.setDecorations(highlightDecoration, keywordRanges);
  }
}
 

module.exports = KeywordHighlighterView;