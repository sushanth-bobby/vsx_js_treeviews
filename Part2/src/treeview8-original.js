const vscode = require("vscode");
const https = require('https')
const axios = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})


class APIDataProvider {

    constructor(route) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        // Local URL to get JSON file for sidebar
        this.url = `http://localhost:3100/${route}`
        this.data = []
        this.server_data = []
        this.getSidebarData();

    }

    async getGetDataFromAPI(){
        let config = {
            method: 'get',
            url: this.url
        }

        let error_message = ""
        this.data = await axios(config).then( response =>{
            // this.data = this.transformApiResponse(response.data)            
            return response.data
        }).then( data =>{
            this.server_data = data
            return this.transformApiResponse(data)
        }).catch( (error) =>{
            if(error.message == ''){
                error.message = 'Not able to connect to API. Check if that server is available' //This will get triggered when API Server is not run                
            }
            this.server_data = []
            // this.data = [new MessageTreeItem(`${error.message}`, 'error')]
            vscode.window.showErrorMessage(`Failed to retreive sidebar JSON data: ${error_message}, url: ${this.url}`)
            // return []
            return [new MessageTreeItem(`${error.message}`, 'error')]
        });
        
    }

    async getSidebarData(){
        const loadingTimeout = setTimeout( () =>{
            vscode.window.showWarningMessage('Loading data... Pleas wait... Response is taking longer than expected');
            this.data = [new MessageTreeItem('Loading...', 'warn')]
            this._onDidChangeTreeData.fire()
        }, 5000)

        await this.getGetDataFromAPI();
        clearTimeout(loadingTimeout) // Clear timeout if response comes back in time

        // Refresh the tree view - Below is the essential for .catch - this.data message
        this._onDidChangeTreeData.fire()
    }

    transformApiResponse(apiData){
        console.log(`apiData=${apiData}`)
        return apiData.map(item => new TreeItem(item))
    }

    getTreeItem(element) {
        console.log(`IN getTreeItem ${JSON.stringify(element)}`);
        return element;
    }

    getChildren(element) {
        console.log(`IN getChildren ${JSON.stringify(element)}`);

        // Return top-level items if no parent
        if (!element) {
            // Top-level items
            return Promise.resolve(this.data);
        }

        // Return children of current directory
        return Promise.resolve(
            (element.children || []).map(child => new TreeItem(child))
        )
    }    

    refresh() {
        console.log("Hit Refresh")
        this._onDidChangeTreeData.fire();
    }

    async updateStatuses() {
        await this.getGetDataFromAPI();
        this.refresh();
    }

}


class TreeItem extends vscode.TreeItem {
    constructor(data) {
        super(
            data.label,
            data.children && data.children.length > 0
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None
        );
        
        this.contextValue = 'TreeItem'
        this.children = data.children        
        this.url = data.url
        this.status = data.status
        this.updateIcon()
        this.command = {
            command: 'treeview6.urlClick',
            title: 'Open Link',
            arguments: [{ label: this.label, url: this.url}] // Pass the current item
        };
    
    }

    updateIcon() {
        switch (this.status) {
            case 'success':
                this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconPassed'));
                break;
            case 'failure':
                this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconFailed'));
                break;
            case 'in-progress':
                this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconQueued'));
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('circle-outline');
                break;
        }
    }

    setStatus(status) {
        this.status = status;
        this.updateIcon();
    }

}

class MessageTreeItem extends vscode.TreeItem{
    constructor(message, indicator){
        super(
            message,
            vscode.TreeItemCollapsibleState.None
        );        

        this.contextValue = 'messageItem';
        this.description = message;
        this.tooltip = message;
        if(indicator == 'warn'){
            this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('terminal.ansiBrightYellow'))
        } else if(indicator =='error'){
            this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'))
        }
    }
}


module.exports = APIDataProvider;
