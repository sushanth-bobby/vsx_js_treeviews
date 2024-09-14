const vscode = require('vscode');


// Local Requires
const tv14_tdp = require("./src/treeview14.js");
const { handleLoginWebview, authToken } = require('./src/webview1.js');

const wv2_dp = require("./src/webview2.js"); //Webview 2
const wv3_dp = require("./src/webview3.js"); //Webview 3

// statusbar
const {startColorChangeInterval, snoozeColorChange,
    deactivateColorChange } = require("./src/statusbar1.js")

const wv4_dp = require("./src/webview4.js"); //Webview 4
const wv5_dp = require("./src/webview5.js"); //Webview 5

// Local Functions

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {

    console.log('Congratulations, your extension "js-treeviews" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json   
    let disposable = vscode.commands.registerCommand('js-treeviews.helloWorld', function () {
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from js_TreeViews!');
    });
    context.subscriptions.push(disposable);

    // Treeview 14 - Webview 1
    const tvData14 = new tv14_tdp();
    vscode.window.createTreeView('wv1_id', { treeDataProvider: tvData14 });

    let tv14_dispos = vscode.commands.registerCommand('treeView14.itemClick', async (item) => {
        if (item.label === 'Login') {
            handleLoginWebview(context, tvData14);
        } else if (authToken) {
            try {
                vscode.window.showInformationMessage(`Action successful!`);
            } catch (error) {
                vscode.window.showErrorMessage('Action failed! Please log in again.');
            }
        } else {
            vscode.window.showErrorMessage('You need to log in first.');
        }
    });

    context.subscriptions.push(tv14_dispos);

    // Webview 2 - API Links
    const wv1_register_dp = new wv2_dp(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('wv2_id', wv1_register_dp)
    );

    // Webview 3 - Calico Colors
    const wv2_register_dp = new wv3_dp(context.extensionUri);

    context.subscriptions.push(
     vscode.window.registerWebviewViewProvider(wv2_register_dp.viewType, wv2_register_dp)
    );
   
    context.subscriptions.push(
     vscode.commands.registerCommand('calicoColors.addColor', () => {
      wv2_register_dp.addColor();
     })
    );
   
    context.subscriptions.push(
     vscode.commands.registerCommand('calicoColors.clearColors', () => {
      wv2_register_dp.clearColors();
     })
    );

    // statusbar 1 - Color Change
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(clock) Change Color';
    statusBarItem.tooltip = 'Click to Snooze';
    statusBarItem.show();

    statusBarItem.command = 'extension.snoozeColorChange';
    context.subscriptions.push(statusBarItem);

    // Command to snooze the color change
    const snoozeCommand = vscode.commands.registerCommand('extension.snoozeColorChange', () => {
        snoozeColorChange(statusBarItem);
    });

    context.subscriptions.push(snoozeCommand);

    startColorChangeInterval(statusBarItem)

    // Webview 4 - Search & Highlight
    const wv4_register_dp = new wv4_dp();    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('keywordHighlighterView', wv4_register_dp)
    );

    // Webview 5 - Show and Exclude 
    const wv5_register_dp = new wv5_dp(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(wv5_register_dp.viewType, wv5_register_dp)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.openSidebar', () => {
            // No need to call createOrShow; registration is automatic with the view provider
        })
    );    

}

function deactivate() {
    deactivateColorChange();
}

module.exports = {
    activate,
    deactivate
};
