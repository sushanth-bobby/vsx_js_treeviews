/*
Note: vscode.window.visibleTextEditors - Doesn't show all editors
      https://stackoverflow.com/questions/63736783/how-to-get-a-list-of-all-open-files
*/

const vscode = require("vscode");
const path = require('path');

class OpenFilesTreeDataProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  // https://github.com/atishay/vscode-allautocomplete/blob/master/src/extension.ts
  // https://stackoverflow.com/questions/72772981/how-do-i-get-all-the-tabs-in-a-visual-studio-code-window-as-an-array-of-filename

  getChildren(element) {
    if (!element) {
      // Get all open text documents
      let tabArray = vscode.window.tabGroups.all;
      let tabArray1 = tabArray.flatMap(group => group.tabs.map(tab => tab.label));
      console.log(`tabGroups = ${tabArray1}`);
      tabArray1 = tabArray.flatMap(group => group.tabs.map(tab => (tab.input['uri'])));
      console.log(`tabGroups uri = ${tabArray1}`);
      const documents = vscode.workspace.textDocuments;
      const items = documents.map(doc => {
        console.log(`doc = ${JSON.stringify(doc)}`)
        const uri = doc.uri;
        const isActive = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.toString() === uri.toString();
        return new FileItem(uri, isActive);
      });
      return Promise.resolve(items);
    }
    return Promise.resolve([]);
  }
}

class FileItem extends vscode.TreeItem {
  constructor(resourceUri, isActive) {
    super(resourceUri, vscode.TreeItemCollapsibleState.None);
    this.resourceUri = resourceUri;

    // Set the main label to the filename only
    this.label = path.basename(resourceUri.fsPath);

    // Set the description (small text) to show the full path
    this.description = vscode.workspace.asRelativePath(resourceUri.fsPath);

    // this.label = vscode.workspace.asRelativePath(resourceUri);
    this.command = {
      command: 'vscode.open',
      arguments: [resourceUri],
      title: 'Open File'
    };
    this.iconPath = vscode.ThemeIcon.File;

    // Add an indicator to the label if the file is active
    if (isActive) {
      this.label += ' (Active)';
    }
  }
}

module.exports = OpenFilesTreeDataProvider;
