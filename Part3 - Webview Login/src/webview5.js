const vscode = require("vscode");

class SidebarProvider {
    // static viewType = 'foldingSidebar';

    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = undefined;
        this.viewType = 'foldingSidebar';
    }

    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active text editor found.');
                return;
            }

            const { command, keyword } = message;
            const document = editor.document;
            const rangesToFold = [];

            for (let i = 0; i < document.lineCount; i++) {
                const lineText = document.lineAt(i).text;
                if ((command === 'show' && !lineText.includes(keyword)) || 
                    (command === 'exclude' && lineText.includes(keyword))) {
                    rangesToFold.push(new vscode.Range(i, 0, i, 0));
                }
            }

            editor.selections = [];
            await vscode.commands.executeCommand('editor.fold', {
                ranges: rangesToFold,
                direction: command === 'show' ? vscode.FoldingRangeKind.Region : undefined
            });
        });
    }

    getHtmlForWebview(webview) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Folding Sidebar</title>
            </head>
            <body>
                <h3>Enter Command</h3>
                <input type="text" id="inputBox" placeholder="show <keyword> or exclude <keyword>"/>
                <button id="executeButton">Execute</button>

                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('executeButton').addEventListener('click', () => {
                        const input = document.getElementById('inputBox').value.trim();
                        if (input.startsWith('show ')) {
                            const keyword = input.slice(5);
                            vscode.postMessage({ command: 'show', keyword });
                        } else if (input.startsWith('exclude ')) {
                            const keyword = input.slice(8);
                            vscode.postMessage({ command: 'exclude', keyword });
                        } else {
                            vscode.postMessage({ command: 'invalid' });
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}


module.exports = SidebarProvider;