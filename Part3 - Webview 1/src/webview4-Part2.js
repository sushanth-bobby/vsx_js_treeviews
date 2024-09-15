const vscode = require("vscode");

class KeywordHighlighterView {
  constructor() {
      this.keywords = []; // Track keywords and their colors
      this.keywordDecorations = {}; // Store text decorations for each keyword
  }

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
                  const color = this.getRandomColor();
                  this.keywords.push({ keyword, color });
                  this.highlightKeyword(keyword, color);
                  this.updateWebview(webviewView.webview);
              }
          } else if (message.command === 'changeColor') {
              const { keyword, newColor } = message;
              this.changeKeywordColor(keyword, newColor);
              this.updateWebview(webviewView.webview);
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
              <div id="keywordsList"></div>

              <script>
                  const vscode = acquireVsCodeApi();

                  document.getElementById('searchButton').addEventListener('click', () => {
                      const keyword = document.getElementById('keyword').value;
                      vscode.postMessage({ command: 'search', keyword });
                  });

                  window.addEventListener('message', event => {
                      const keywords = event.data.keywords;
                      const listDiv = document.getElementById('keywordsList');
                      listDiv.innerHTML = '';

                      keywords.forEach(({ keyword, color }) => {
                          const keywordDiv = document.createElement('div');
                          keywordDiv.innerHTML = \`
                              <span style="background-color: \${color}; padding: 3px;">\${keyword}</span>
                              <input type="color" value="\${color}" />
                          \`;

                          // Handle color change
                          keywordDiv.querySelector('input').addEventListener('change', (e) => {
                              vscode.postMessage({
                                  command: 'changeColor',
                                  keyword: keyword,
                                  newColor: e.target.value
                              });
                          });

                          listDiv.appendChild(keywordDiv);
                      });
                  });
              </script>
          </body>
          </html>`;
  }

  updateWebview(webview) {
      // Send keywords and their colors back to the webview
      webview.postMessage({
          keywords: this.keywords
      });
  }

  // Highlight the keyword with a specific color
  highlightKeyword(keyword, color) {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) return;

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

      // Highlight the ranges in the editor with the given color
      const decorationType = vscode.window.createTextEditorDecorationType({
          backgroundColor: color
      });

      this.keywordDecorations[keyword] = decorationType;
      activeEditor.setDecorations(decorationType, keywordRanges);
  }

  // Change the color of a highlighted keyword
  changeKeywordColor(keyword, newColor) {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || !this.keywordDecorations[keyword]) return;

      // Remove old decoration
      const oldDecoration = this.keywordDecorations[keyword];
      activeEditor.setDecorations(oldDecoration, []);

      // Highlight again with the new color
      this.highlightKeyword(keyword, newColor);

      // Update the color in the tracked keywords
      const keywordIndex = this.keywords.findIndex(k => k.keyword === keyword);
      if (keywordIndex !== -1) {
          this.keywords[keywordIndex].color = newColor;
      }
  }

  // Generate a random color for highlighting
  getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }
}


module.exports = KeywordHighlighterView;