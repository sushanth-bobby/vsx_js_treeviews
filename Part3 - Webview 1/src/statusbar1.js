const vscode = require('vscode');

class CircularArray{
    constructor(arr) {
        this.arr = arr;
        this.index = 0;
    }

    get() {
        const value = this.arr[this.index];
        this.index = (this.index + 1) % this.arr.length;
        return value;
    }
}

let colorChangeInterval;
let snoozeTimeout;
let countdownInterval;
let isSnoozed = false;
let originalColor = null;

const themeColors = [
    'statusBarItem.errorBackground',
    'statusBarItem.warningBackground'
]
let nextColor = new CircularArray(themeColors);

// Function to start the interval that changes the status bar color
function startColorChangeInterval(statusBarItem) {
    console.log("IN startColorChangeInterval")
    // Captures original color once 
    if(!originalColor){
        originalColor = statusBarItem.backgroundColor;
    }

    colorChangeInterval = setInterval(() => {
        changeStatusBarColor(statusBarItem);
    }, 0.1 * 60 * 1000); // Change color every 5 minutes
}

// Function to change the status bar color
function changeStatusBarColor(statusBarItem) {
    console.log("IN changeStatusBarColor")    
    let colorName = nextColor.get()
    console.log(`colorName=${colorName}`)
    statusBarItem.backgroundColor = new vscode.ThemeColor(colorName);
    statusBarItem.text = `$(paintcan) Color changed!`;
}

// Function to snooze color changes for 5 mins
function snoozeColorChange(statusBarItem) {
    console.log("IN snoozeColorChange")
    if (isSnoozed) {
        vscode.window.showInformationMessage('Already snoozed!');
        return;
    }
    
    isSnoozed = true;
    vscode.window.showInformationMessage('Snoozed for 30 seconds');
    
    if (colorChangeInterval) {
        clearInterval(colorChangeInterval);
    }
    
    // set back to original color
    let remainingSeconds = (0.3 * 60 * 1000) / 1000;  // 18 seconds
    statusBarItem.backgroundColor = originalColor;
    statusBarItem.text = `$(clock) Snoozed(${formatTime(remainingSeconds)})`

    /*
    snoozeTimeout = setTimeout(() => {
        vscode.window.showInformationMessage('Snooze period over. Resuming color change.');
        startColorChangeInterval(statusBarItem);
        isSnoozed = false;        
    }, 0.3 * 60 * 1000); // Snooze - timing in milliseconds
    */
   
    // Update countdown every second
    countdownInterval = setInterval( () =>{
        remainingSeconds--;
        statusBarItem.text = `$(clock) Snoozed(${formatTime(remainingSeconds)}`

        if(remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            vscode.window.showInformationMessage('Snooze period over. Resuming color change.');
            startColorChangeInterval(statusBarItem);
            isSnoozed = false;                    
        }    
    }, 1000); // Update every second
}

// Helper function(HF) to format the time for the countdown (mm:ss)
function formatTime(seconds) {
    console.log(`formatTime: ${seconds}`)
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`
}


// Functions to clean up intervals and timeouts
function deactivateColorChange() {
    console.log("IN deactivateColorChange")
    if (colorChangeInterval) {
        clearInterval(colorChangeInterval);
    }

    if (countdownInterval) {
        clearTimeout(countdownInterval);
    }
    
    if (snoozeTimeout) {
        clearTimeout(snoozeTimeout);
    }
}


module.exports = {
    startColorChangeInterval,
    changeStatusBarColor,
    snoozeColorChange,
    deactivateColorChange
}