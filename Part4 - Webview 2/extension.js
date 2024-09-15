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
const wv6_dp = require("./src/webview6.js"); //webview 6
const wv7_dp = require("./src/webview7.js"); //webview 7

const tv15_dp = require('./src/treeview15.js');
const wv8_dp = require('./src/webview8.js');

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

    // webview6 - GitLens Setups
    const wv6_register_dp = new wv6_dp(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('wv6_id', wv6_register_dp)
    );

    // webview7 - GitLens No Repo
    const wv7_register_dp = new wv7_dp(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('wv7_id', wv7_register_dp)
    );

	// webview8, treeview15
    const tv15Data = new tv15_dp();
    const wv8Data = new wv8_dp(context);
  
    vscode.window.registerTreeDataProvider('notepadView', tv15Data);
  
    // Command to add a new note
    const addNoteCommand = vscode.commands.registerCommand('notepad.addNote', () => {
      vscode.window.showInputBox({ prompt: 'Enter note name' }).then(noteName => {
        if (noteName) {
          tv15Data.addNote(noteName);
        }
      });
    });
  
    // Command to open the note in a webview
    const openNoteCommand = vscode.commands.registerCommand('notepad.openNote', (note) => {
      wv8Data.openNoteWebview(note);
    });
  
    context.subscriptions.push(addNoteCommand);
    context.subscriptions.push(openNoteCommand);  

}

// This method is called when your extension is deactivated
function deactivate() {}


// ------------------ Functions ------------------

module.exports = {
	activate,
	deactivate
}
