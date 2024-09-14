const vscode = require('vscode');
const https = require('https');
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

let authToken = null;

function handleLoginWebview(context, tvData14) {
    const panel = vscode.window.createWebviewPanel(
        'loginWebview',
        'Login',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getLoginHtml(panel.webview, context.extensionUri);

    panel.webview.onDidReceiveMessage(
        async (message) => {
            if (message.command === 'login') {
                const { username, password } = message;
                console.log(`username:${username}, password:${password}`);
                try {
                    const response = await axios.post('http://localhost:3100/login', { username, password });
                    console.log(`response.status=${response.status}`);
                    if (response.status === 200) {
                        vscode.window.showInformationMessage('Login successful!');
                        tvData14.refresh();
                    } else {
                        vscode.window.showErrorMessage('Login failed. Please try again.');
                    }

                    authToken = response.data.token;
                    vscode.window.showInformationMessage('Login successful!');
                    panel.dispose();
                } catch (error) {
                    vscode.window.showErrorMessage('Login failed! Could be server issues');
                }
            }
        },
        undefined,
        context.subscriptions
    );
}

function getLoginHtml(webview, extensionUri) {
    let styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'login.css'));
    console.log(`styleUri=${styleUri}`);
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Login Page</title>
            <link rel="stylesheet" href="${styleUri}"> <!-- Link to the CSS file -->
        </head>
        <body>
            <div class="container">
                <h1>Enter admin:admin for testing login</h1>
                <form>
                    <input type="text" placeholder="racf" id="username" name="username">
                    <input type="password" placeholder="password" id="password" name="password">
                    <button type="submit" onclick="login()">Sign in</button>

                    <div class="agreement">
                        if credentials fail, do not retry, validate it outside vscode
                    </div>
                </form>
            </div>
            <script>
                const vscode = acquireVsCodeApi();

                function login() {
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;

                    vscode.postMessage({
                        command: 'login',
                        username,
                        password
                    });
                }
            </script>
        </body>
        </html>
    `;
}

module.exports = {
    handleLoginWebview,
    authToken
};
