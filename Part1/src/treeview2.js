const vscode = require("vscode");

class CarsDataProvider {
    // After commenting below also works
    // constructor() {
    //     this._onDidChangeTreeData = new vscode.EventEmitter();
    //     this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    // }

    getTreeItem(element) {
        // console.log(`IN getTreeItem ${JSON.stringify(element)}`);
        return element;
    }

    getChildren(element) {
        // console.log(`IN getChildren ${JSON.stringify(element)}`);
        if (!element) {
            // Top-level items
            return Promise.resolve([
                new TreeItem('Parent 1', vscode.TreeItemCollapsibleState.Collapsed, null),
                new TreeItem('Parent 2', vscode.TreeItemCollapsibleState.Collapsed, null)
            ]);
        }

        if (element.label == 'Parent 1') {
            // Second-level items
            return Promise.resolve([
                new TreeItem('Child 1', vscode.TreeItemCollapsibleState.Collapsed, element.label),
                new TreeItem('Child 2', vscode.TreeItemCollapsibleState.Collapsed, element.label)
            ]);
        }
        if (element.label == 'Parent 2') {
          // Second-level items
          return Promise.resolve([
              new TreeItem('Child 1', vscode.TreeItemCollapsibleState.Collapsed, element.label)
          ]);
      }

        if (element.label.startsWith('Child')) {
            // Third-level items
            return Promise.resolve([
                new TreeItem('Grandchild 1', vscode.TreeItemCollapsibleState.None, element.label),
                new TreeItem('Grandchild 2', vscode.TreeItemCollapsibleState.None, element.label)
            ]);
        }

        return Promise.resolve([]);
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState, parentLabel) {
        super(label, collapsibleState);        
        // this.contextValue = 'treeItem'; //After commenting this also works

        console.log(parentLabel, label)
        this.parentLabel = parentLabel;
        this.command = {
          command: 'myTreeView.itemClick',
          title: 'Click Node',
          arguments: [{ label: this.label, parentLabel: this.parentLabel}]
        }  
    }
}

module.exports = CarsDataProvider;
