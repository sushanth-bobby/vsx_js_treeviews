(function() {
    const vscode = acquireVsCodeApi();

    document.getElementById('postButton').addEventListener('click', () => {
        const title = document.getElementById('title').value;
        const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
        const description = document.getElementById('description').value;
        const content = document.getElementById('content').value;

        vscode.postMessage({
            command: 'postData',
            data: { title, tags, description, content }
        });
    });

    document.getElementById('saveButton').addEventListener('click', () => {
        const title = document.getElementById('title').value;
        const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
        const description = document.getElementById('description').value;
        const content = document.getElementById('content').value;

        const markdownContent = `# ${title}\n\n## Tags\n${tags.join(', ')}\n\n## Description\n${description}\n\n## Content\n${content}`;

        vscode.postMessage({
            command: 'saveMarkdown',
            data: markdownContent
        });
    });
})();
