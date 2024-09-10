const vscode = require("vscode");

class SidebarProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        this._setWebviewMessageListener(webviewView.webview);
    }

    _getHtmlForWebview(webview) {
        return `
            <html>
            <body>
                <ul>
                    <li><a href="#" onclick="openLink('https://localhost:3100/text')">Label 1</a></li>
                    <li><a href="#" onclick="openLink('https://localhost:3100/text')">Label 2</a></li>
                </ul>
                <script>
                    const vscode = acquireVsCodeApi();

                    function openLink(url) {
                        vscode.postMessage({ command: 'openLink', url: url });
                    }
                </script>
            </body>
            </html>`;
    }

    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'openLink':
                    vscode.commands.executeCommand('extension.openLink', message.url);
                    break;
            }
        });
    }
}

module.exports = SidebarProvider;
