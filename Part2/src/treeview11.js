const vscode = require("vscode");
const path = require('path');


class MyTreeViewProvider {

  getTreeItem(element) {
      const treeItem = new vscode.TreeItem(element.label);
      treeItem.iconPath = this.getIconForFile(element.label);
      return treeItem;
  }

  getChildren(element) {
      return Promise.resolve([
          { label: 'file.js' },
          { label: 'index.html' },
          { label: 'styles.css' },
          { label: 'stocks.json' },
          { label: 'worknotes.txt' }
      ]);
  }

  getIconForFile(fileName) {
      console.log(`endsWith = ${fileName}, path=${__dirname + '/icons/'}`)
      if (fileName.endsWith('.js')) {
          return {
              light: vscode.Uri.file(path.join(__dirname, '..', '/themes/icons/file_type_js.svg')),
              dark: vscode.Uri.file(path.join(__dirname, '..', '/themes/icons/file_type_js.svg'))
          };
      } else if (fileName.endsWith('.html')) {
          return {
              light: vscode.Uri.file(path.join(__dirname, '..', '/themes/icons/file_type_html.svg')),
              dark: vscode.Uri.file(path.join(__dirname, '..', '/themes/icons/file_type_html.svg'))
          };
      } else if (fileName.endsWith('.json')) {
        return {
            light: vscode.Uri.file(path.join(__dirname, '..', '/themes/icons/file_type_json.svg')),
            dark: vscode.Uri.file(path.join(__dirname, '..', '/themes/icons/file_type_json.svg'))
        };
      } else if (fileName.endsWith('.txt')) {
        return {
            light: vscode.Uri.file(path.join(__dirname, '..', '/themes/icons/file_type_text.svg')),
            dark: vscode.Uri.file(path.join(__dirname, '..', '/themes/icons/file_type_text.svg'))
        };        
      } else {
          return vscode.ThemeIcon.File;
      }
  }
}


module.exports = MyTreeViewProvider;
