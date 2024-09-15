const vscode = require("vscode");

class MyTreeDataProvider {

    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (!element) {
            return [new TreeItem('Root 1'), new TreeItem('Root 2')];
        }
        return element.getChildren();
    }

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(label) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
    }

    getChildren() {
        return [
            new TreeItem(`${this.label} - Child 1`),
            new TreeItem(`${this.label} - Child 2`)
        ];
    }
}

module.exports = MyTreeDataProvider;
