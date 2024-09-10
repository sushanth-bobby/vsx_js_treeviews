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
const sb1_sbp = require("./src/sidebar1.js"); //Sidebar 1
const sb1_sbp2 = require("./src/sidebar12.js"); //Sidebar 1

// const { uppercaseDocument, uppercaseSelection } = require('./src/Doc_RightClickUpperCase.js');

// Destructuring
// const {StatusTreeViewProvider: tv10_tiColor
// 	, FileDecorationProvider: tv10_fdp} = require("./src/treeview10.js"); //Tree View 10

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
        if (item.label === 'Login') {
            const panel = vscode.window.createWebviewPanel(
                'loginWebview', 
                'Login', 
                vscode.ViewColumn.One, 
                { enableScripts: true }
            );

            panel.webview.html = getLoginHtml();

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
                            vscode.window.showErrorMessage('Login failed!');
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

    // Sidebar - Twitter
    /*
    const sbp1 = new sb1_sbp(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('sidebar1', sbp1)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.openLink', async (url) => {
            try {
                const response = await axios.get(url);
                const panel = vscode.window.createWebviewPanel(
                    'dataView', 
                    'Data View', 
                    vscode.ViewColumn.Beside, 
                    {}
                );
                panel.webview.html = `<pre>${response.data}</pre>`;
            } catch (error) {
                vscode.window.showErrorMessage('Failed to fetch data from the URL');
            }
        })
    );    
    */
      // Register command to open sidebar webview
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.openSidebar', () => {
            console.log("Executing sb1_sbp2")
            sb1_sbp2.register(context);
        })
    );

	//

}

// This method is called when your extension is deactivated
function deactivate() {}


// ------------------ Functions ------------------
function getLoginHtml() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
    </head>
    <body>
        <h1>Login</h1>
        <form id="login-form">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username"><br><br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password"><br><br>
			<input type="button" value="Submit" onclick="login()">
        </form>

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
