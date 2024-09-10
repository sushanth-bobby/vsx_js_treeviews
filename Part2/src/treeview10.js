const vscode = require("vscode");


class StatusTreeViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.items = this.getItems();
    }

    getItems() {
        // Here we instantiate the tree items with predefined labels and statuses
        return [
            new StatusTreeItem('Task 1', 'success'),
            new StatusTreeItem('Task 2', 'failure'),
            new StatusTreeItem('Task 3', 'in-progress'),
            new StatusTreeItem('Task 4', 'success'),
            new StatusTreeItem('Task 5', 'failure')
        ];
    }    

    refresh() {
        this.items = this.getItems();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        // return Promise.resolve(this.items);
        if(!element){
            return this.items;
        }
    }

}

class StatusTreeItem extends vscode.TreeItem {
    constructor(label, status) {
        super(label);
        this.status = status;
        this.updateItemAppearance();        
        this.resourceUri = vscode.Uri.file(label); // This is used for decoration        
    }

    updateItemAppearance() {
        switch (this.status) {
            case 'success':
                this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
                this.tooltip = 'Operation Successful';
                this.description = '(Success)';
                break;
            case 'failure':
                this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
                this.description = '(Failed)';
                this.tooltip = 'Operation Failed';
                break;
            case 'in-progress':
                this.iconPath = new vscode.ThemeIcon('sync', new vscode.ThemeColor('charts.orange'));
                this.description = '(In Progress)';
                this.tooltip = 'Operation In Progress';
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('question');
                this.description = '(Unknown)';
        }

        // Customizing the background and foreground colors (Experimental API)
        // this.resourceUri = vscode.Uri.parse(`file:///dummy-path/${this.label}`);
        // vscode.workspace.getConfiguration('workbench.colorCustomizations').update(`tree.${this.label}.foreground`, this.getColor());
    }

}

class FileDecorationProvider {
    constructor(treeDataProvider) {
        this.treeDataProvider = treeDataProvider;
    }

    provideFileDecoration(uri) {
        console.log(JSON.stringify(uri))
        const treeItem = this.treeDataProvider.items.find(item => item.resourceUri.path === uri.path);
        if (!treeItem) {
            return;
        }
        console.log(`treeItem = ${JSON.stringify(treeItem)}`)

        switch (treeItem.status) {
            case 'success':
                return {
                    badge: '✔️',
                    tooltip: 'Success',
                    color: new vscode.ThemeColor('charts.green'),
                    propagate: true
                };
            case 'failure':
                return {
                    badge: '❌',
                    tooltip: 'Failed',
                    color: new vscode.ThemeColor('charts.red'),
                    propagate: true
                };
            case 'in-progress':
                return {
                    badge: '🔄',
                    tooltip: 'In Progress',
                    color: new vscode.ThemeColor('charts.yellow'),
                    propagate: true
                };
            default:
                return {
                    badge: '?',
                    tooltip: 'Unknown',
                    color: new vscode.ThemeColor('foreground'),
                    propagate: true
                };
        }
    }

}


module.exports = {StatusTreeViewProvider, FileDecorationProvider};
