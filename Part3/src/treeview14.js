const vscode = require("vscode");

/*
const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})
*/

class TreeItemWithLogin extends vscode.TreeItem {
    constructor(label) {
        super(label);

        this.command = {
            command: 'treeView14.itemClick',
            title: 'Click Node',
            arguments: [{ label: this.label}] // Pass the current item
        };
    
    }

}

class TreeViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        this.items = [
            new TreeItemWithLogin('Login'),
            new TreeItemWithLogin('Protected Action 1'),
            new TreeItemWithLogin('Protected Action 2')
        ];
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        return this.items;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }
}

module.exports = TreeViewProvider;
