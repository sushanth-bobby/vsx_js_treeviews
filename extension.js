const path = require('path');

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const DataProvider = require("./src/dataProvider.js"); //Tree View 1
const tv2_cars = require("./src/treeview2.js"); //Tree View 2
const tv3_json = require("./src/treeview3.js"); //Tree View 3
const tv4_json = require("./src/treeview4.js"); //Tree View 4

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

	//treeView1
	let tvData1 = new DataProvider();
	let tv1 = vscode.window.createTreeView("treeView1", {
		treeDataProvider: tvData1
	  });
	context.subscriptions.push(tv1);
	
	//treeView2
	let tvData2 = new tv2_cars();
	let tv2 = vscode.window.createTreeView("treeView2", {
		treeDataProvider: tvData2,
	  });
	context.subscriptions.push(tv2);

	vscode.commands.registerCommand('myTreeView.itemClick', (node) => {
		const parentLabel = node.parentLabel ? node.parentLabel : 'None';
		vscode.window.showInformationMessage(`Clicked Node: ${node.label}, Parent: ${parentLabel}`);
	});

	//treeView3
	let tvData3 = new tv3_json(path.join(__dirname, 'data', 'tv3_data.json'));
	let tv3 = vscode.window.createTreeView("treeView3", {
		treeDataProvider: tvData3,
	  });
	context.subscriptions.push(tv3);
	
	//treeView4
	let tvData4 = new tv4_json(path.join(__dirname, 'data', 'tv4_data.json'));
	let tv4 = vscode.window.createTreeView("treeView4", {
		treeDataProvider: tvData4,
	  });
	context.subscriptions.push(tv4);

	vscode.commands.registerCommand('myTreeView.itemClickOpen', (node) => {
		if (node.filePath) {
			vscode.workspace.openTextDocument(node.filePath)
				.then(document => vscode.window.showTextDocument(document))
				// .catch(err => vscode.window.showErrorMessage(`Failed to open file: ${err.message}`));
				// Note: vscode doesn't have standard .catch method, so got to use .then chaining to handle errors
				//       'undefined' is passed for the first argument(success handler), so it skips directly to error handling part				
				.then(undefined, error => vscode.window.showErrorMessage(`Failed to open file: ${error.message}`));
		} else {
			vscode.window.showInformationMessage(`File path not available for: ${node.label}`);
		}
	});

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
