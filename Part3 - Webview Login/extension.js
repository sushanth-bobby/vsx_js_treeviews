/*
const path = require('path');
const os = require('os');
*/
const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})


// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');


// Local Requires
const tv14_tdp = require("./src/treeview14.js"); //Tree View 9

let authToken = null;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "js-treeviews" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('js-treeviews.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from js_TreeViews!');
	});
	context.subscriptions.push(disposable);

	//
    const tvData14 = new tv14_tdp();
    vscode.window.createTreeView('webviewLogin', { treeDataProvider: tvData14 });

    let tv14_dispos = vscode.commands.registerCommand('treeView14.itemClick', async (item) => {
        console.log(`context.extensionUri=${context.extensionUri}`)
        if (item.label === 'Login') {
            const panel = vscode.window.createWebviewPanel(
                'loginWebview', 
                'Login', 
                vscode.ViewColumn.One, 
                { enableScripts: true }
            );

            panel.webview.html = getLoginHtml(panel.webview, context.extensionUri);

            panel.webview.onDidReceiveMessage(
                async (message) => {
                    if (message.command === 'login') {
                        const { username, password } = message;
						console.log(`username:${username}, password:${password}`)
                        try {
                            const response = await axios.post('http://localhost:3100/login', { username, password });
                            console.log(`response.status=${response.status}`)
                            if (response.status === 200) {
                                vscode.window.showInformationMessage('Login successful!');
                                // treeDataProvider.isLoggedIn = true;
                                tvData14.refresh();
                            } else {
                                vscode.window.showErrorMessage('Login failed. Please try again.');
                            }
							
                            authToken = response.data.token;
                            vscode.window.showInformationMessage('Login successful!');
                            panel.dispose();
                        } catch (error) {
                            vscode.window.showErrorMessage('Login failed! Could be server issues');
                        }
                    }
                },
                undefined,
                context.subscriptions
            );
        } else if (authToken) {
            try {
                /*
                const response = await axios.get('https://example.com/api/protected', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });*/
                vscode.window.showInformationMessage(`Action successful! Data`);
            } catch (error) {
                vscode.window.showErrorMessage('Action failed! Please log in again.');
            }
        } else {
            vscode.window.showErrorMessage('You need to log in first.');
        }
    });

    context.subscriptions.push(tv14_dispos);
	//

}

// This method is called when your extension is deactivated
function deactivate() {}


// ------------------ Functions ------------------
function getLoginHtml(webview, extensionUri) {
    let styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'login.css'))
    console.log(`styleUri=${styleUri}`)
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Login Page</title>
            <link rel="stylesheet" href="${styleUri}"> <!-- Link to the CSS file -->
        </head>
        <body>
            <div class="container">
                <h1>Enter admin:admin for testing login</h1>
                <form>
                    <input type="text" placeholder="racf" id="username" name="username">
                    <input type="password" placeholder="password" id="password" name="password">
                    <button type="submit" onclick="login()">Sign in</button>

                    <!-- div class="or-divider">or</div -->

                    <div class="agreement">
                        if credentials fail, do not retry, validate it outside vscode
                    </div>
                </form>
            </div>
            <script>
                const vscode = acquireVsCodeApi();

                function login() {
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;

                    vscode.postMessage({
                        command: 'login',
                        username,
                        password
                    });
                }
            </script>

        </body>
        </html>
    `;
}



module.exports = {
	activate,
	deactivate
}
