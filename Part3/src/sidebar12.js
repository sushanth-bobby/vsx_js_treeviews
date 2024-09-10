const vscode = require("vscode");
const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})


class APIWebViewProvider {
  static register(context) {
    const provider = new APIWebViewProvider(context);
    vscode.window.registerWebviewViewProvider('view_sidebar1', provider);
  }

  constructor(context) {
    this.context = context;
    this.apiData = null;
  }

  async resolveWebviewView(webviewView) {
    console.log("IN resolveWebviewView()")
    webviewView.webview.options = {
      enableScripts: true,
    };

    console.log("Webview resolving...");

    // Fetch API Data using axios
    // this.apiData = await this.fetchAPIData();
    this.apiData = [
      { "label": "Example 1", "url": "https://example.com/1" },
      { "label": "Example 2", "url": "https://example.com/2" }
      ]
    

      if (this.apiData && this.apiData.length > 0) {
        // Update the webview content with anchor links
        webviewView.webview.html = this.getWebviewContent(this.apiData);
        console.log("Webview content updated");
      } else {
        vscode.window.showErrorMessage('No data fetched from the API.');
        console.log("No data fetched from API");
      }    

    // Handle anchor click events from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'fetchUrl') {
        const data = await this.fetchUrlData(message.url);
        this.openNewWebview(message.label, data);
      }
    });
  }

  // Fetch API data using axios
  async fetchAPIData() {
    try {
      console.log("Fetching API data...");
      const response = await axios.get('https://api.example.com/data');
      return response.data; // Expected format: [{label: "Example 1", url: "https://example.com/1"}, ...]
    } catch (error) {
      vscode.window.showErrorMessage(`Error fetching API data: ${error}`);
      return [];
    }
  }

  // Fetch URL data using axios
  async fetchUrlData(url) {
    try {
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      vscode.window.showErrorMessage(`Error fetching data from ${url}: ${error}`);
      return 'Error fetching data';
    }
  }

  getWebviewContent(apiData) {
    console.log("IN getWebviewContent")
    const links = apiData
      .map((item) => {
        return `<li><a href="#" onclick="handleClick('${item.label}', '${item.url}')">${item.label}</a></li>`;
      })
      .join('');

    return `
      <html>
      <body>
        <ul>${links}</ul>
        <script>
          const vscode = acquireVsCodeApi();
          function handleClick(label, url) {
            vscode.postMessage({ command: 'fetchUrl', label: label, url: url });
          }
        </script>
      </body>
      </html>
    `;
  }

  openNewWebview(label, data) {
    const panel = vscode.window.createWebviewPanel(
      'apiDataView',
      label,
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    panel.webview.html = `<html><body><pre>${data}</pre></body></html>`;
  }
}

module.exports = APIWebViewProvider;