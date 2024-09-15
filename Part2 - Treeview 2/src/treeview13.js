const vscode = require("vscode");
const https = require('https');
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
    })
});

class TreeViewProvider {
    constructor(url) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        // Local URL to get JSON file for sidebar
        this.url = url;
        this.data = [];
        this.getSidebarData();
    }

    async getGetDataFromAPI() {
        let config = {
            method: 'get',
            url: this.url
        };

        try {
            const response = await axios(config);
            this.data = this.transformApiResponse(response.data);
        } catch (error) {
            console.log(`Error: ${JSON.stringify(error)}`)
            let errorMessage = 'Failed to retrieve data';
            if (error.message === '') {
                errorMessage = 'Not able to connect to API. Check if that server is available';
            }
            vscode.window.showErrorMessage(`${errorMessage}, URL: ${this.url}`);
            this.data = [new MessageTreeItem(`${errorMessage}`, 'error')];
        }
    }

    async getSidebarData() {
        const loadingTimeout = setTimeout(() => {
            vscode.window.showWarningMessage('Loading data... Please wait... Response is taking longer than expected');
            this.data = [new MessageTreeItem('Loading...', 'warn')];
            this._onDidChangeTreeData.fire();
        }, 5000);

        await this.getGetDataFromAPI();
        clearTimeout(loadingTimeout); // Clear timeout if response comes back in time

        this._onDidChangeTreeData.fire();
    }

    transformApiResponse(apiData) {
        return apiData.map(item => new TreeItem(item));
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.data);
        }
        return Promise.resolve(element.children || []);
    }

    startAutoRefresh(interval = 5000) {
        setInterval(() => {
            this.updateStatuses();
        }, interval);
    }

    async updateStatuses() {
        await this.getGetDataFromAPI();
        this._onDidChangeTreeData.fire();
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(data, parentUri = '') {
        super(
            data.label,
            data.children && data.children.length > 0
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None
        );
        this.contextValue = 'TreeItem';
        // this.children = data.children;
        this.children = data.children ? data.children.map(child => new TreeItem(child, this.resourceUri ? this.resourceUri.path : '')) : [];
        this.url = data.url;
        this.status = data.status;

        // Use a consistent URI schema
        this.resourceUri = vscode.Uri.parse(`${parentUri}/${data.label}`);

        this.updateItemAppearance();       
        this.command = {
            command: 'treeView13.urlClick',
            title: 'Open Link',
            arguments: [{ label: this.label, url: this.url }] // Pass the current item
        };
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
    }
}

class FileDecorationProvider {
    constructor(treeDataProvider) {
        this.treeDataProvider = treeDataProvider;
        this._onDidChangeFileDecorations = new vscode.EventEmitter();
        this.onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
    }

    provideFileDecoration(uri) {
        const treeItem = this.findTreeItemByUri(uri, this.treeDataProvider.data);
        if (!treeItem) {
            return;
        }

        return this.getDecorationForStatus(treeItem.status);
    }

    getDecorationForStatus(status) {
        switch (status) {
            case 'success':
                return {
                    badge: '✔️',
                    tooltip: 'Success',
                    color: new vscode.ThemeColor('charts.green'),
                };
            case 'failure':
                return {
                    badge: '❌',
                    tooltip: 'Failed',
                    color: new vscode.ThemeColor('charts.red'),
                };
            case 'in-progress':
                return {
                    badge: '⭕',
                    tooltip: 'In Progress',
                    color: new vscode.ThemeColor('charts.orange'),
                };
            default:
                return {
                    badge: '?',
                    tooltip: 'Unknown',
                    color: new vscode.ThemeColor('foreground'),
                };
        }
    }

/*
    refresh(uri) {
        this._onDidChangeFileDecorations.fire(uri);
    }
*/
    findTreeItemByUri(uri, items) {
        for (const item of items) {
            if (item.resourceUri.toString() === uri.toString()) {
                return item;
            }
            if (item.children) {
                const found = this.findTreeItemByUri(uri, item.children);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    refreshAll() {
        this._onDidChangeFileDecorations.fire(undefined);
    }

}

class MessageTreeItem extends vscode.TreeItem {
    constructor(message, indicator) {
        super(
            message,
            vscode.TreeItemCollapsibleState.None
        );

        this.contextValue = 'messageItem';
        this.description = message;
        this.tooltip = message;
        if (indicator === 'warn') {
            this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('terminal.ansiBrightYellow'));
        } else if (indicator === 'error') {
            this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
        }
    }
}

module.exports = { TreeViewProvider, FileDecorationProvider };
