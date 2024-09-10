const vscode = require("vscode");
const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})


class MySidebarProvider {
  constructor(context) {      
      this._context = context;
  }

  resolveWebviewView(webviewView) {
      console.log(`IN resolveWebviewView`)
      this._view = webviewView;

      webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [this._context.extensionUri],
      };

      webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

      // Handle link click messages
      webviewView.webview.onDidReceiveMessage(async (message) => {
          if (message.command === 'linkClick') {
              const url = message.url;
              const data = await this.fetchDataFromUrl(url);
              this.showDataInNewWebview(url, data);
          }
      });
  }

  getHtmlForWebview(webview) {
      console.log(`IN getHtmlForWebview`)
      return `
          <html>
          <body>
              <ul>
                  <li><a href="#" onclick="handleLinkClick('https://jsonplaceholder.typicode.com/posts/1')">Link 1</a></li>
                  <li><a href="#" onclick="handleLinkClick('https://jsonplaceholder.typicode.com/posts/2')">Link 2</a></li>
                  <li><a href="#" onclick="handleLinkClick('https://jsonplaceholder.typicode.com/posts/3')">Link 3</a></li>
                  <li><a href="#" onclick="handleLinkClick('https://jsonplaceholder.typicode.com/posts/4')">Link 4</a></li>
                  <li><a href="#" onclick="handleLinkClick('https://jsonplaceholder.typicode.com/posts/5')">Link 5</a></li>
              </ul>
              <script>
                  const vscode = acquireVsCodeApi();

                  function handleLinkClick(url) {
                      vscode.postMessage({ command: 'linkClick', url });
                  }
              </script>
          </body>
          </html>
      `;
  }

  async fetchDataFromUrl(url) {
      try {
          const response = await axios.get(url);
          return JSON.stringify(response.data, null, 2); // Pretty print JSON data
      } catch (error) {
          return `Error fetching data: ${error.message}`;
      }
  }

  showDataInNewWebview(url, data) {
      const panel = vscode.window.createWebviewPanel(
          'dataView',
          `Data from ${url}`,
          vscode.ViewColumn.One,
          { enableScripts: true }
      );

      panel.webview.html = `
          <html>
          <body>
              <h2>Data from ${url}</h2>
              <pre>${data}</pre>
          </body>
          </html>
      `;
  }
}


module.exports = MySidebarProvider;