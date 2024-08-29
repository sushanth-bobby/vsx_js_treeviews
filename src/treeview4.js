const vscode = require("vscode");
const fs = require('fs');


class JSONOpenClickedFileDataProvider {

    constructor(jsonFilePath) {
        this.jsonFilePath = jsonFilePath;
        // this._onDidChangeTreeData = new vscode.EventEmitter();
        // this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        // Load JSON data from file
        this.data = this.loadJsonData();
    }

    loadJsonData() {
        try {
            const fileContent = fs.readFileSync(this.jsonFilePath, 'utf8');
            return JSON.parse(fileContent);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load JSON data: ${error.message}`);
            return [];
        }
    }


    getTreeItem(element) {
        console.log(`IN getTreeItem ${JSON.stringify(element)}`);
        return element;
    }

    getChildren(element) {
        console.log(`IN getChildren ${JSON.stringify(element)}`);

        // Return top-level items if no parent
        if (!element) {
            // Top-level items
            return Promise.resolve(this.data.map(item => new TreeItem(item)));
        }

        // Return children of current element
        return Promise.resolve(
            (element.children || []).map(child => new TreeItem(child))
        );

    }

}


class TreeItem extends vscode.TreeItem {
    constructor(data) {
        super(
            data.label,
            data.children && data.children.length > 0
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None
        );

        this.contextValue = 'treeItem';
        this.children = data.children;
        this.filePath = data.filePath; // Store the file path
        this.command = {
            command: 'myTreeView.itemClickOpen',
            title: 'Open File',
            // arguments: [this] // Pass the current item - Error: Converting circular structure to JSON --> starting at object with constructor 'TreeItem' | property 'command' -> object with constructor 'Object' | property 'arguments' -> object with constructor 'Array' --- index 0 closes the circle
            arguments: [{ label: this.label, filePath: this.filePath}]
        };

    }
}


module.exports = JSONOpenClickedFileDataProvider;
