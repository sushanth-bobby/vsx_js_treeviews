const path = require('path');
const os = require('os');
const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const tv9_fileExplorer = require("./src/treeview9.js"); //Tree View 9
const { uppercaseDocument, uppercaseSelection } = require('./src/Doc_RightClickUpperCase.js');

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
	const disposable = vscode.commands.registerCommand('js-treeviews.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from js_TreeViews!');
	});
	context.subscriptions.push(disposable);

	//treeView9
	// view/item/context - Sidebar, Right-Click on file
	let tvData9 = new tv9_fileExplorer();
	let tv9 = vscode.window.createTreeView("treeView9", {
		treeDataProvider: tvData9,
		});
		context.subscriptions.push(
			vscode.window.onDidChangeActiveTextEditor(() => {
				tvData9.refresh();
			}),
			vscode.workspace.onDidCloseTextDocument(() => {
				tvData9.refresh();
			}),
			vscode.workspace.onDidOpenTextDocument(() => {
				tvData9.refresh();
			}),
			vscode.window.onDidChangeVisibleTextEditors(() => {
				tvData9.refresh();
			}),
			vscode.window.tabGroups.onDidChangeTabs(() => {
				tvData9.refresh();
			}),
			vscode.commands.registerCommand('treeView9.postDocument', () => {
			  tvData9.postActiveDocument();
			})			
		);

	// Right-Click on Active Document and select 'Convert Document to Uppercase' 
	// editor/context - Document Right-Click
	let contextUCDoc = vscode.commands.registerCommand('extension.uppercaseDocument', function () {
		uppercaseDocument();
	 });	
	 context.subscriptions.push(contextUCDoc);

	 let contextUCSel = vscode.commands.registerCommand('extension.uppercaseSelection', function () {
		uppercaseSelection();
	 });	
	 context.subscriptions.push(contextUCSel);


}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
