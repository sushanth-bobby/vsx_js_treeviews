const vscode = require("vscode");

class SidebarProvider {
    constructor(context) {
        this.context = context;
    }

    resolveWebviewView(webviewView) {
        this.webviewView = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        // Set the HTML content for the webview
        webviewView.webview.html = this.getWebviewContent();

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'filterLines') {
                filterDocumentLines(message.text);
            }
        });
    }

    getWebviewContent() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Show Lines</title>
            </head>
            <body>
                <h1>Filter Lines in Active Document</h1>
                <input type="text" id="keyword" placeholder="Enter keyword" />
                <button id="execute">Show Lines</button>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('execute').addEventListener('click', () => {
                        const keyword = document.getElementById('keyword').value;
                        vscode.postMessage({ command: 'filterLines', text: keyword });
                    });
                </script>
            </body>
            </html>
        `;
    }
}

// Function to filter lines by keyword and copy matching lines to a new document
async function filterDocumentLines(keyword) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const { document } = editor;
    const totalLines = document.lineCount;
    const matchingLines = [];

    // Iterate over the lines and collect the ones that contain the keyword
    for (let i = 0; i < totalLines; i++) {
        const line = document.lineAt(i);
        if (line.text.includes(keyword)) {
            matchingLines.push(line.text);
        }
    }

    // Open a new untitled document and copy the matching lines to it
    if (matchingLines.length > 0) {
        const newDocument = await vscode.workspace.openTextDocument({
            content: matchingLines.join("\n"),
            language: document.languageId
        });
        vscode.window.showTextDocument(newDocument);
    } else {
        vscode.window.showInformationMessage('No lines matched the keyword.');
    }
}

module.exports = SidebarProvider;
