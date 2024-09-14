const vscode = require('vscode');

class LineNumberCodeLensProvider {
    provideCodeLenses(document, token) {
        // Get the number of lines in the document
        const totalLines = document.lineCount;
        const lenses = [];

        for (let i = 0; i < totalLines; i++) {
            // Create a CodeLens for each line
            const lineNumber = i + 1;
            const range = new vscode.Range(i, 0, i, 0);
            const codeLens = new vscode.CodeLens(range, {
                title: `Line ${lineNumber}`,
                command: '', // No command associated with the CodeLens
            });
            lenses.push(codeLens);
        }

        return lenses;
    }
}

module.exports = LineNumberCodeLensProvider;
