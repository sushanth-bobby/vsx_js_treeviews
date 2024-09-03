// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

function uppercaseDocument() {
    const editor = vscode.window.activeTextEditor;
  
    if (editor) {
       const document = editor.document;
       const entireText = document.getText();

       // Convert the entire text to uppercase
       const upperCaseText = entireText.toUpperCase();

       // Create an edit to replace the document content
       editor.edit(editBuilder => {
          const firstLine = document.lineAt(0);
          const lastLine = document.lineAt(document.lineCount - 1);
          const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

          // Replace the entire content with the uppercase text
          editBuilder.replace(textRange, upperCaseText);
       });
    }

}

function uppercaseSelection() {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const document = editor.document;
        const selection = editor.selection;

        // Get the text within the selection
        const selectedText = document.getText(selection);

        // Convert the selected text to uppercase
        const upperCaseText = selectedText.toUpperCase();

        // Replace the selected text with the uppercase text
        editor.edit(editBuilder => {
            editBuilder.replace(selection, upperCaseText);
        });
    }
}

module.exports = {
    uppercaseDocument
    , uppercaseSelection
 };