/*
Note: vscode.window.visibleTextEditors - Doesn't show all editors
      https://stackoverflow.com/questions/63736783/how-to-get-a-list-of-all-open-files
*/

const vscode = require("vscode");

class MyTreeDataProvider {
  constructor() {
      this._onDidChangeTreeData = new vscode.EventEmitter();
      this.onDidChangeTreeData = this._onDidChangeTreeData.event;
      this.data = this.getMockData();
  }

  getTreeItem(element) {
      return element;
  }

  getChildren(element) {
      if (element) {
          return element.children || [];
      } else {
          return this.data;
      }
  }

  getMockData() {
      return [
          new Item('Item 1'),
          new Item('Item 2'),
          new Item('Item 3', [
              new Item('Item 3.1'),
              new Item('Item 3.2', [
                  new Item('Item 3.2.1'),
                  new Item('Item 3.2.2')
              ])
          ])
      ];
  }

  setCollapsibleState(element, state) {
      element.collapsibleState = state;
      if (element.children) {
          element.children.forEach(child => this.setCollapsibleState(child, state));
      }
  }

  refresh() {
      this._onDidChangeTreeData.fire(undefined);
  }
}

class Item extends vscode.TreeItem {
  constructor(label, children) {
      super(
          label,
          children && children.length
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None
      );
      this.children = children;
  }
}

async function collapseOrExpandTree(treeDataProvider, action) {
  const setState = (items, state) => {
      items.forEach(item => {
          treeDataProvider.setCollapsibleState(item, state);
      });
  };

  const state = action === 'collapse'
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.Expanded;

  const rootChildren = await treeDataProvider.getChildren();
  setState(rootChildren, state);
  treeDataProvider.refresh();
}

module.exports = {MyTreeDataProvider, collapseOrExpandTree};
