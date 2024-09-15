const vscode = require("vscode");

class ColorsViewProvider {

    // static viewType = 'calicoColors.colorsView';
   
    constructor(extensionUri) {
     this._extensionUri = extensionUri;
     this._view = null;
     this.viewType = 'calicoColors.colorsView';
    }
   
    resolveWebviewView(webviewView, context, _token) {
     this._view = webviewView;
   
     webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
     };
   
     webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
   
     webviewView.webview.onDidReceiveMessage(data => {
      switch (data.type) {
       case 'colorSelected': {
        vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(`#${data.value}`));
        break;
       }
      }
     });
    }
   
    addColor() {
     if (this._view) {
      this._view.show(true); // Ensure compatibility with different VSCode versions
      this._view.webview.postMessage({ type: 'addColor' });
     }
    }
   
    clearColors() {
     if (this._view) {
      this._view.webview.postMessage({ type: 'clearColors' });
     }
    }
   
    _getHtmlForWebview(webview) {
     const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
     const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
     const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
     const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
   
     const nonce = getNonce();
   
     return `<!DOCTYPE html>
      <html lang="en">
      <head>
       <meta charset="UTF-8">
       <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <link href="${styleResetUri}" rel="stylesheet">
       <link href="${styleVSCodeUri}" rel="stylesheet">
       <link href="${styleMainUri}" rel="stylesheet">
       <title>Cat Colors</title>
      </head>
      <body>
       <ul class="color-list"></ul>
       <button class="add-color-button">Add Color</button>
       <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
    }
   }
   
   function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
     text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
   }
   

module.exports = ColorsViewProvider;