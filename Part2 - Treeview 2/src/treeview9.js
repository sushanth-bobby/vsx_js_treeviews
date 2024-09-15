/*
Note: vscode.window.visibleTextEditors - Doesn't show all editors
      https://stackoverflow.com/questions/63736783/how-to-get-a-list-of-all-open-files
*/

const vscode = require("vscode");
const path = require('path');

const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})


class OpenEditorsTreeDataProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (!element) {
      // Get all tabs across all tab groups
      const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
      const items = tabs.map(tab => {
        // console.log(`${tab.label}, ${tab.label.split('.').pop()}`)
        const uri = tab.input['uri'];
        const isActive = tab.isActive;
        return new EditorItem(uri, isActive);
      }).filter(item => item.resourceUri);  // Filter out any non-file tabs
      return Promise.resolve(items);
    }
    return Promise.resolve([]);
  }

  async postActiveDocument() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      console.log(`${document.fileName}, ${document.languageId}, ${document.fileName.split('.').pop()}`)
      const content = document.getText();
      console.log(`content: ${content}`)

      let url = "http://localhost:3100/post"

      let content_type;
      if(document['languageId'].indexOf('json') >= 0){
        content_type = 'application/json'
      } else {
        content_type = 'text/plain'
      }      
      console.log(`content_type=${content_type}`)
      const config = {
        headers: {
            'Content-Type': `${content_type}`
        }
      };      

      // Send the POST request using axios
      await axios.post(url, content, config).then(response => {
          console.log('Response Status:', response.status);
          console.log('Response Data:', response.data);
          vscode.window.showInformationMessage('Document posted successfully!');
      })
      .catch(error => {
          console.error('Error occurred:', error);
          vscode.window.showErrorMessage('Failed to post document: ' + error);
      });

    } else {
      vscode.window.showWarningMessage('No active document to post.');
    }
  }  
}

class EditorItem extends vscode.TreeItem {
  constructor(resourceUri, isActive) {
    super(resourceUri, vscode.TreeItemCollapsibleState.None);
    this.resourceUri = resourceUri;

    // Set the main label to the filename only
    this.label = path.basename(resourceUri.fsPath);

    // Set the description (small text) to show the full path
    this.description = vscode.workspace.asRelativePath(resourceUri.fsPath);

    this.command = {
      command: 'vscode.open',
      arguments: [resourceUri],
      title: 'Open File'
    };
    this.iconPath = vscode.ThemeIcon.File;

    // Add an indicator to the label if the file is active
    if (isActive) {
      this.label += ' (Active)';
    }


    // Add context value to use in when clause for context menu
    this.contextValue = 'editorItem';    
  }
}

module.exports = OpenEditorsTreeDataProvider;
