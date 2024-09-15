const vscode = require("vscode");
const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})


class WebView6DataProvider {
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

      webviewView.webview.html = this.getHtmlForWebview(webviewView.webview, this._context.extensionUri);

      // Handle link click messages
      webviewView.webview.onDidReceiveMessage(async (message) => {
          if (message.command === 'linkClick') {
              const url = message.url;
              const data = await this.fetchDataFromUrl(url);
              this.showDataInNewWebview(url, data);
          }
      });
  }

  getHtmlForWebview(webview, extensionUri) {
      console.log(`IN getHtmlForWebview`)
      let styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'webview7.css'))
      console.log(`styleUri=${styleUri}`)    
      return `
    <html>
        <head>
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <link rel="stylesheet" href="${styleUri}"> 
        </head>
        <body>

            <!-- No Repository Detected Container (file1.html) -->

            <div>  
            <div class="icon-wrapper">
              <i class="fas fa-question-circle icon"></i>
              <i class="fas fa-folder-open icon"></i>
              <i class="fas fa-code-branch icon"></i>
              <i class="fas fa-external-link-alt icon"></i>
              <i class="fas fa-share-alt icon"></i>
            </div>

            <div class="container">
              <div class="content">
                <h2>No repository detected</h2>
                <p>To use GitLens, open a folder containing a git repository or clone from a URL from the Explorer.</p>
                <button class="action-button">Open a Folder or Repository</button>
                <p>If you have opened a folder with a repository, please let us know by <a href="#">creating an Issue.</a></p>
              </div>
            </div>
            </div>
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
              <pre><span style="font-size: 16px;">
              ${data}

              </span></pre>
          </body>
          </html>
      `;
  }
}


module.exports = WebView6DataProvider;