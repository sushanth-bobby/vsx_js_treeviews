// New Document is opened only once

const vscode = require("vscode");

class SidebarProvider {
    constructor(context) {
        this.context = context;
        this.keywords = []; // Store the keywords entered by the user
        this.isShowMode = true; // Default to "SHOW" mode
        this.openedDocument = null; // Track the opened document
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
            await this.updateLines(matchingLines);
        } else {
            await this.updateLines(nonMatchingLines);
        }
    }

    // Open or update the document based on the current state
    async updateLines(filterFunction) {
        if (this.openedDocument) {
            // Update existing document
            const document = this.openedDocument;
            const editor = await vscode.window.showTextDocument(document);
            const content = await filterFunction(this.keywords, document);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), content);
            await vscode.workspace.applyEdit(edit);
        } else {
            // Open a new document
            const content = await filterFunction(this.keywords);
            const newDocument = await vscode.workspace.openTextDocument({
                content: content,
                language: vscode.window.activeTextEditor.document.languageId
            });
            this.openedDocument = newDocument;
            await vscode.window.showTextDocument(newDocument);
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
                <title>Filter Lines</title>
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
                <title>Filter Lines</title>
                <link rel="stylesheet" href="${styleUri}"> <!-- Link to the CSS file -->
            </head>
            <body>
                <h3>Filter Lines in Active Document</h3>
                <input type="text" id="keyword" placeholder="Enter keyword" />

                <div class="switch-container"> <!-- OFF-Show, ON-Exclude -->
                    <label class="switch-label switch-label-off" id="label-off-1" for="toggle1">SHOW</label>
                    <label class="switch">
                        <input type="checkbox" id="toggle1">
                        <span class="slider"></span>
                    </label>
                    <label class="switch-label switch-label-on" id="label-on-1" for="toggle1">EXCLUDE</label>
                </div>

                <button class="primary" id="execute">Filter Lines</button>
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
async function matchingLines(keywords, document) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return '';
    }

    const { document: activeDocument } = editor;
    const totalLines = activeDocument.lineCount;
    const matchingLines = [];

    // Iterate over the lines and collect the ones that match any of the keywords
    for (let i = 0; i < totalLines; i++) {
        const line = activeDocument.lineAt(i);
        if (keywords.some(keyword => line.text.includes(keyword))) {
            matchingLines.push(line.text);
        }
    }

    return matchingLines.join("\n");
}

// Function to filter lines by multiple keywords and copy non-matching lines to a new document
async function nonMatchingLines(keywords, document) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return '';
    }

    const { document: activeDocument } = editor;
    const totalLines = activeDocument.lineCount;
    const nonMatchingLines = [];

    // Iterate over the lines and collect the ones that do not match any of the keywords
    for (let i = 0; i < totalLines; i++) {
        const line = activeDocument.lineAt(i);
        if (!keywords.some(keyword => line.text.includes(keyword))) {
            nonMatchingLines.push(line.text);
        }
    }

    return nonMatchingLines.join("\n");
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
