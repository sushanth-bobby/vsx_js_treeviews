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
const tv9_fileExplorer = require("./src/treeview9.js"); //Tree View 9
const { uppercaseDocument, uppercaseSelection } = require('./src/Doc_RightClickUpperCase.js');

// Destructuring
const {StatusTreeViewProvider: tv10_tiColor
	, FileDecorationProvider: tv10_fdp} = require("./src/treeview10.js"); //Tree View 10
// (OR) Below is the alternative approach
// const c10 = require('./src/treeview10.js');
// var tv10_fdp = new c10.FileDecorationProvider();
// var tv10_tiColor = new c10.StatusTreeViewProvider();

const tv11_icons = require("./src/treeview11.js"); //Tree View 11
const tv12_tdp = require('./src/treeview12.js'); //Tree View 12

const {TreeViewProvider: tv13_tiColor
	, FileDecorationProvider: tv13_fdp} = require("./src/treeview13.js"); //Tree View 13

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


	//treeView10
	let tvData10 = new tv10_tiColor();
	vscode.window.createTreeView("treeView10", {
		treeDataProvider: tvData10,
	});

	// Register the file decoration provider
	const fdp1 = new tv10_fdp(tvData10);
    context.subscriptions.push(vscode.window.registerFileDecorationProvider(fdp1));

	//treeView11
	// https://github.com/vscode-icons/vscode-icons
    // Set the custom icon theme - Below itself should change the icon for all the filetypes globally
    // vscode.workspace.getConfiguration().update('workbench.iconTheme', 'myIconTheme', true);

	let tvData11 = new tv11_icons();
	vscode.window.createTreeView("treeView11", {
		treeDataProvider: tvData11,
	});

	//treeView12
    const tvData12 = new tv12_tdp();
    vscode.window.registerTreeDataProvider('treeView12', tvData12);
	const tv12 = vscode.window.createTreeView('treeView12', {
        treeDataProvider: tvData12,
		showCollapseAll: true
    });

    // Register the refresh command
    vscode.commands.registerCommand('treeView12.refresh', () => {
        tvData12.refresh();
    });
    context.subscriptions.push(tv12)

	//treeView13
	let url = `http://localhost:3100/poll`
	let tvData13 = new tv13_tiColor(url);

    // Register the TreeDataProvider
    vscode.window.registerTreeDataProvider('treeView13', tvData13);
    // Register the FileDecorationProvider
    const decorationProvider = new tv13_fdp(tvData13);
    context.subscriptions.push(vscode.window.registerFileDecorationProvider(decorationProvider));

    tvData13.onDidChangeTreeData(() => {
        decorationProvider.refreshAll();
    });

    // Start auto-refresh : When setting to 5000(5Sec), there are Timeouts
    tvData13.startAutoRefresh(7000);

//	

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
