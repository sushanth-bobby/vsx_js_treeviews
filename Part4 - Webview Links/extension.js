/*
const path = require('path');
const os = require('os');

const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})
*/


// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');


// Local Requires
const sb1_sbp3 = require("./src/sidebar13.js"); //Sidebar 1



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
   /*
      // Register command to open sidebar webview
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.openSidebar', () => {
            console.log("Executing sb1_sbp2")
            sb1_sbp2.register(context);
        })
    );
*/

    const mySidebarProvider = new sb1_sbp3(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('mySidebarView', mySidebarProvider)
    );

	//

}

// This method is called when your extension is deactivated
function deactivate() {}


// ------------------ Functions ------------------

module.exports = {
	activate,
	deactivate
}
