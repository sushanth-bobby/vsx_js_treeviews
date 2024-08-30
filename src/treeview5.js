const vscode = require("vscode");
const fs = require('fs');
const path = require('path');

class UserFilesOpenOnClickDataProvider {

    constructor(rootPath) {
        this.rootPath = rootPath;
        // this._onDidChangeTreeData = new vscode.EventEmitter();
        // this.onDidChangeTreeData = this._onDidChangeTreeData.event;
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
            return Promise.resolve(this.getFilesAndDirectories(this.rootPath));
        }

        // Return children of current directory
        if (element.isDirectory){
            return Promise.resolve(this.getFilesAndDirectories(element.filePath))
        }

        // No children if the element is a file
        return Promise.resolve([]);
    }

    getFilesAndDirectories(directoryPath) {
        try {
            const files = fs.readdirSync(directoryPath, { withFileTypes: true });

            return files
                .filter(file => file.isDirectory() || this.isValidFile(file.name))
                .map(file => new FileTreeItem(file.name, path.join(directoryPath, file.name), file.isDirectory()));
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to read directory: ${error.message}`);
            return [];
        }
    }

    isValidFile(fileName) {
        // Filter only JSON and text files
        const validExtensions = ['.json', '.txt'];
        return validExtensions.includes(path.extname(fileName).toLowerCase());
    }    
}


class FileTreeItem extends vscode.TreeItem {
    constructor(label, filePath, isDirectory) {
        super(
            label,
            isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        );

        this.contextValue = 'fileTreeItem';
        this.filePath = filePath;
        this.isDirectory = isDirectory;

        if(!isDirectory){
            this.command = {
                command: 'myTreeView.itemClickOpen',
                title: 'Open File',
                arguments: [{ label: this.label, filePath: this.filePath}] // Pass the current item
            };
    
        }
    }
}


module.exports = UserFilesOpenOnClickDataProvider;
