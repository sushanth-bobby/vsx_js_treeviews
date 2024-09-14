const vscode = require("vscode");

class SidebarProvider {
    constructor(context) {
        this.context = context;
        this.keywords = []; // Store the keywords entered by the user
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
                // Add the keyword to the list and update the webview content
                this.keywords.push(message.text);
                this.updateWebview();
                filterDocumentLines(this.keywords);
            }
        });
    }

    // Update the webview content dynamically to show the list of keywords
    updateWebview() {
        const keywordList = this.keywords.map(keyword => `<li>${keyword}</li>`).join('');
        const newContent = `
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
                <h3>Keywords:</h3>
                <ul>${keywordList}</ul>
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
        this.webviewView.webview.html = newContent;
    }

    // Initial webview content (first time load)
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
                <h3>Keywords:</h3>
                <ul></ul>
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

// Function to filter lines by multiple keywords and copy matching lines to a new document
async function filterDocumentLines(keywords) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const { document } = editor;
    const totalLines = document.lineCount;
    const matchingLines = [];

    // Iterate over the lines and collect the ones that match any of the keywords
    for (let i = 0; i < totalLines; i++) {
        const line = document.lineAt(i);
        if (keywords.some(keyword => line.text.includes(keyword))) {
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
        vscode.window.showInformationMessage('No lines matched the keywords.');
    }
}

module.exports = SidebarProvider;
