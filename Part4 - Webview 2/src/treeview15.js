const vscode = require('vscode');

class NotepadProvider {
  constructor() {
    // Initialize with some notes
    this.notes = ['Untitled Note', 'To Do', 'Projects', 'Scratchpad'];
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    return Promise.resolve(this.notes.map(note => new NotepadItem(note)));
  }

  // Method to add a new note
  addNote(noteName) {
    this.notes.push(noteName);
    this._onDidChangeTreeData.fire(); // Refresh the tree view
  }
}


class NotepadItem extends vscode.TreeItem {
  constructor(label) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: 'notepad.openNote',
      title: 'Open Note',
      arguments: [this]
    };
    this.iconPath = new vscode.ThemeIcon('note');
  }
}


module.exports = NotepadProvider;
