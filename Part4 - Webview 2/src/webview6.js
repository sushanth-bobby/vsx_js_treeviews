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
      let styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'webview6.css'))
      console.log(`styleUri=${styleUri}`)    
      return `
    <html>
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <link rel="stylesheet" href="${styleUri}"> 
        </head>
        <body>
        
            <!-- GitLens Container (file2.html) -->
            <div class="gitlens-container">
                <div class="content">
                <h3>Get Started with GitLens</h3>
                <p>Explore all of the powerful features in GitLens</p>
                <div class="button-container">
                    <button class="primary-button">Start Here (Welcome)</button>
                    <button class="secondary-button">Walkthrough</button>
                    <button class="secondary-button">
                    <i class="fas fa-book"></i> Tutorial
                    </button>
                </div>
                </div>
                <div class="setup">
                <h4>SETUP</h4>
                <div class="setup-option">
                    <i class="fas fa-cog"></i> Open GitLens Settings
                </div>
                <div class="setup-option">
                    <i class="fas fa-link"></i> Connect an Integration
                </div>
                </div>

                <div class="setup">
                <h4>SETUP</h4>
                <div class="setup-option">
                    <i class="fas fa-cog"></i> Open GitLens Settings
                </div>
                <div class="setup-option">
                    <i class="fas fa-link"></i> Connect an Integration
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