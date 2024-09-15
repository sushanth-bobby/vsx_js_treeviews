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

const DataProvider = require("./src/dataProvider.js"); //Tree View 1
const tv2_cars = require("./src/treeview2.js"); //Tree View 2
const tv3_json = require("./src/treeview3.js"); //Tree View 3
const tv4_json = require("./src/treeview4.js"); //Tree View 4
const tv5_userfiles = require("./src/treeview5.js"); //Tree View 5
const tv6_api = require("./src/treeview6.js"); //Tree View 6
const tv7_poll = require("./src/treeview7.js"); //Tree View 7
const tv8_pollAPI = require("./src/treeview8.js"); //Tree View 8

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

	//treeView5
	const userDirectory = path.join('C:\\Users', os.userInfo().username, 'Favorites', 'Downloads')
	console.log(userDirectory)
	let tvData5 = new tv5_userfiles(userDirectory);
	let tv5 = vscode.window.createTreeView("treeView5", {
		treeDataProvider: tvData5,
	  });
	context.subscriptions.push(tv5);

	//treeView6
	let tvData6 = new tv6_api('arrjson1');
	let tv6 = vscode.window.createTreeView("treeView6", {
		treeDataProvider: tvData6,
	  });
	context.subscriptions.push(tv6);

	vscode.commands.registerCommand('treeview6.urlClick', async (item) => {
		try {
			let response = await axios.get(item.url);
			let data = response.data;
			console.log(`treeview6 = ${JSON.stringify(response.headers)}`)
			let contentType = response['headers']['content-type']
			console.log(`contentType = ${contentType}`)
			let lang;
			if(contentType.includes('json')){
				lang = 'json'
				data = JSON.stringify(data, null, 2)
			}else{
				lang = 'text'
			}
			const document = await vscode.workspace.openTextDocument({				
				content: data,
				language: lang
			});

			await vscode.window.showTextDocument(document);
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to fetch data: ${error.message}`);
		}
	});

	//treeView7
	let tvData7 = new tv7_poll();
	let tv7 = vscode.window.createTreeView("treeView7", {
		treeDataProvider: tvData7,
		});
	setInterval(() => {
		tvData7.updateStatuses();
	}, 2000);		
	context.subscriptions.push(tv7);
	

	//treeView8
	let tvData8 = new tv8_pollAPI('poll');
	let tv8 = vscode.window.createTreeView("treeView8", {
		treeDataProvider: tvData8,
	  });
	
	// Update Status Every 10 seconds
	context.subscriptions.push(tv8);
	setInterval(() => {
		tvData8.updateStatuses();
	}, 10000);

	// treeview8 URL Clicks
	let documentMap = new Map();
	vscode.commands.registerCommand('treeview8.urlClick', async (item) => {
		try {
			console.log(`URL: ${item.url}`)

			console.log(`Before documentMap`)
			documentMap.forEach( (value, key) => {
				console.log(`${key}: ${JSON.stringify(value)}`); 
			});			
			// for (let doc of documentMap) { // the same as of .entries()
			// console.log(doc);
			// }						

			let document2 = documentMap.get(item.url);
			console.log(`document2 = ${JSON.stringify(document2)}`)

			if(document2){
				await vscode.window.showTextDocument(document2, vscode.ViewColumn.One);
			} else {
				document2 = await vscode.workspace.openTextDocument({ content: 'Fetching data...', language: 'plaintext' });
				await vscode.window.showTextDocument(document2, vscode.ViewColumn.One);
				documentMap.set(item.url, document2);
			}
			console.log(`After documentMap`)
			documentMap.forEach( (value, key) => {
				console.log(`${key}: ${JSON.stringify(value)}`); 
			});			

            let response = await axios.get(item.url);
			let data     = response.data
			// console.log(`data = ${JSON.stringify(data)}`)
			// console.log(`treeview8-headers = ${JSON.stringify(response.headers)}`)
			let contentType = response['headers']['content-type']
			console.log(`contentType = ${contentType}`)

			let lang;
			if(contentType.includes('json')){
				lang = 'json'
				data = JSON.stringify(data, null, 2)
			}else{
				lang = 'plaintext'
			}

			let edit = new vscode.WorkspaceEdit();
			let wholeDocumentRange = new vscode.Range(
				document2.positionAt(0),
				document2.positionAt(document2.getText().length)
			);

			edit.replace(document2.uri, wholeDocumentRange, data);
			await vscode.workspace.applyEdit(edit);
			await vscode.languages.setTextDocumentLanguage(document2, lang);	
            
            // await document2.save();

		} catch (error) {
			vscode.window.showErrorMessage(`Failed to fetch data: ${error.message}`);
		}
	});


}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
