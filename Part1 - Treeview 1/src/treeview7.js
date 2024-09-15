const vscode = require("vscode");

class CircularArray {
    constructor(items) {
      this.items = items;
      this.currentIndex = 0;
    }
  
    next(item) {
      this.currentIndex = this.items.indexOf(item);
      // console.log(this.currentIndex, this.items.length)
      this.currentIndex = this.currentIndex+1 == this.items.length ? 0 : this.currentIndex + 1
      item = this.items[this.currentIndex];    
      // this.currentIndex = (this.currentIndex + 1) % this.items.length;
      return item;
    }
}  

class StatusTreeItem extends vscode.TreeItem {
    constructor(label, status) {
        super(label);
        this.status = status;
        this.updateIcon();
    }

    updateIcon() {
        switch (this.status) {
            case 'success':
                this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconPassed'));
                break;
            case 'failure':
                this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconFailed'));
                break;
            case 'in-progress':
                this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconQueued'));
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('circle-outline');
                break;
        }
    }

    setStatus(status) {
        this.status = status;
        this.updateIcon();
    }
}

class StatusTreeViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        this.items = [
            new StatusTreeItem('Task 1', 'in-progress'),
            new StatusTreeItem('Task 2', 'success'),
            new StatusTreeItem('Task 3', 'failure')
        ];
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if(!element){
            return this.items;
        }
    }

    refresh() {
        console.log("Hit Refresh")
        this._onDidChangeTreeData.fire();
    }

    async updateStatuses() {
        for (const item of this.items) {
            const newStatus = await this.pollStatus(item.status);
            item.setStatus(newStatus);
        }
        this.refresh();
    }

    pollStatus(status) {
        return new Promise(resolve => {
            const statusArray = new CircularArray(["in-progress", "success", "failure"]);
            const next_status = statusArray.next(status)
            // const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            resolve(next_status);
        });
    }
}

module.exports = StatusTreeViewProvider;
