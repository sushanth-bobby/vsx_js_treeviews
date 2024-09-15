// New document is opened each time "Execute" is clicked

const vscode = require("vscode");

class SidebarProvider {
    constructor(context) {
        this.context = context;
        this.keywords = []; // Store the keywords entered by the user
        this.isShowMode = true; // Default to "SHOW" mode
    }

    resolveWebviewView(webviewView) {
        this.webviewView = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        // Set the HTML content for the webview
        webviewView.webview.html = this.getWebviewContent(webviewView.webview, this.context.extensionUri);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'addKeyword') {
                this.keywords.push(message.text);
                this.updateWebview(webviewView.webview, this.context.extensionUri);
                this.executeFilterFunction();
            } else if (message.command === 'removeKeyword') {
                this.keywords = this.keywords.filter(keyword => keyword !== message.text);
                this.updateWebview(webviewView.webview, this.context.extensionUri);
                this.executeFilterFunction();
            } else if (message.command === 'searchWithCurrentKeywords') {
                this.executeFilterFunction();
            } else if (message.command === 'toggleMode') {
                this.isShowMode = message.showMode;
                // this.executeFilterFunction();
            }
        });
    }

    // Execute the appropriate filter function based on the toggle state
    async executeFilterFunction() {
        if (this.isShowMode) {
            await matchingLines(this.keywords);
        } else {
            await nonMatchingLines(this.keywords);
        }
    }

    // Update the webview content dynamically to show the list of keywords
    updateWebview(webview, extensionUri) {
        const nonce = getNonce();
        let scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'toggle.js'));
        let styleUri  = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'vscode.css'));

        const keywordList = this.keywords.map(keyword => `
            <li>
                ${keyword}
                <button class="vscode-button vscode-button-inline" onclick="removeKeyword('${keyword}')">Remove</button>
            </li>
        `).join('');
        const newContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Show Lines</title>
                <link rel="stylesheet" href="${styleUri}"> <!-- Link to the CSS file -->
            </head>
            <body>
                <h3>Copy lines containing keywords to new document</h3>
                <input type="text" id="keyword" placeholder="Enter keyword" />

                <div class="switch-container"> <!-- OFF-Show, ON-Exclude -->
                    <label class="switch-label switch-label-off" id="label-off-1" for="toggle1">SHOW</label>
                    <label class="switch">
                        <input type="checkbox" id="toggle1">
                        <span class="slider"></span>
                    </label>
                    <label class="switch-label switch-label-on" id="label-on-1" for="toggle1">EXCLUDE</label>
                </div>
                
                <button class="primary" id="execute">Execute</button>
                <h3>Keywords:</h3>
                <ul>${keywordList}</ul>
                <script>
                    const vscode = acquireVsCodeApi();

                    document.getElementById('execute').addEventListener('click', () => {
                        const keyword = document.getElementById('keyword').value;
                        if (keyword) {
                            vscode.postMessage({ command: 'addKeyword', text: keyword });
                        } else {
                            vscode.postMessage({ command: 'searchWithCurrentKeywords' });
                        }
                    });

                    function removeKeyword(keyword) {
                        vscode.postMessage({ command: 'removeKeyword', text: keyword });
                    }

                    function handleToggleChange(showMode) {
                        vscode.postMessage({ command: 'toggleMode', showMode: showMode });
                    }
                </script>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
        this.webviewView.webview.html = newContent;
    }

    // Initial webview content (first time load)
    getWebviewContent(webview, extensionUri) {
        const nonce = getNonce();

        let scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'toggle.js'));
        let styleUri  = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'vscode.css'));

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Show Lines</title>
                <link rel="stylesheet" href="${styleUri}"> <!-- Link to the CSS file -->
            </head>
            <body>
                <h1>Filter Lines in Active Document</h1>
                <input type="text" id="keyword" placeholder="Enter keyword" />

                <div class="switch-container"> <!-- OFF-Show, ON-Exclude -->
                    <label class="switch-label switch-label-off" id="label-off-1" for="toggle1">SHOW</label>
                    <label class="switch">
                        <input type="checkbox" id="toggle1">
                        <span class="slider"></span>
                    </label>
                    <label class="switch-label switch-label-on" id="label-on-1" for="toggle1">EXCLUDE</label>
                </div>

                <button class="primary" id="execute">Show Lines</button>
                <h3>Keywords:</h3>
                <ul></ul>
                <script>
                    const vscode = acquireVsCodeApi();

                    document.getElementById('execute').addEventListener('click', () => {
                        const keyword = document.getElementById('keyword').value;
                        if (keyword) {
                            vscode.postMessage({ command: 'addKeyword', text: keyword });
                        } else {
                            vscode.postMessage({ command: 'searchWithCurrentKeywords' });
                        }
                    });

                    function removeKeyword(keyword) {
                        vscode.postMessage({ command: 'removeKeyword', text: keyword });
                    }
                </script>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }
}

// Function to filter lines by multiple keywords and copy matching lines to a new document
async function matchingLines(keywords) {
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

// Function to filter lines by multiple keywords and copy non-matching lines to a new document
async function nonMatchingLines(keywords) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const { document } = editor;
    const totalLines = document.lineCount;
    const nonMatchingLines = [];

    // Iterate over the lines and collect the ones that do not match any of the keywords
    for (let i = 0; i < totalLines; i++) {
        const line = document.lineAt(i);
        if (!keywords.some(keyword => line.text.includes(keyword))) {
            nonMatchingLines.push(line.text);
        }
    }

    // Open a new untitled document and copy the non-matching lines to it
    if (nonMatchingLines.length > 0) {
        const newDocument = await vscode.workspace.openTextDocument({
            content: nonMatchingLines.join("\n"),
            language: document.languageId
        });
        vscode.window.showTextDocument(newDocument);
    } else {
        vscode.window.showInformationMessage('All lines matched the keywords.');
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

module.exports = SidebarProvider;
