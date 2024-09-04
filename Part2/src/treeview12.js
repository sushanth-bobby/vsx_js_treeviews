const vscode = require("vscode");

class MyTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.items = [
            new TreeItem('Root 1'),
            new TreeItem('Root 2')
        ];
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (!element) {
            return this.items;
        }
        return element.children;
    }

    refresh() {
        // Toggle the case of each tree item's label
        this.items.forEach(item => {
            item.label = this.toggleCase(item.label);
            item.children.forEach(child => {
                child.label = this.toggleCase(child.label);
            });
        });

        this._onDidChangeTreeData.fire(undefined);
    }

    toggleCase(str) {
        return str === str.toUpperCase() ? str.toLowerCase() : str.toUpperCase();
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(label) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.children = [
            new vscode.TreeItem(`${label} - Child 1`, vscode.TreeItemCollapsibleState.None),
            new vscode.TreeItem(`${label} - Child 2`, vscode.TreeItemCollapsibleState.None)
        ];
    }
}


module.exports = MyTreeDataProvider;
