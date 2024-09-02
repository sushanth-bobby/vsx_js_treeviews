const vscode = require("vscode");
const path = require('path');

class OpenEditorsTreeDataProvider {
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

  getChildren(element) {
    if (!element) {
      // Get all open (visible) editors
      const editors = vscode.window.visibleTextEditors;
      const items = editors.map(editor => {
        const uri = editor.document.uri;
        const isActive = editor === vscode.window.activeTextEditor;
        return new EditorItem(uri, isActive);
      });
      return Promise.resolve(items);
    }
    return Promise.resolve([]);
  }
}

class EditorItem extends vscode.TreeItem {
  constructor(resourceUri, isActive) {
    super(resourceUri, vscode.TreeItemCollapsibleState.None);
    this.resourceUri = resourceUri;

    // Set the main label to the filename only
    this.label = path.basename(resourceUri.fsPath);

    // Set the description (small text) to show the full path
    this.description = vscode.workspace.asRelativePath(resourceUri.fsPath);

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

module.exports = OpenEditorsTreeDataProvider;
