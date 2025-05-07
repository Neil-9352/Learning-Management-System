const { app, BrowserWindow } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;
let serverProcess;

app.whenReady().then(() => {
    // Start the Express server
    serverProcess = exec("node server.js", (error, stdout, stderr) => {
        if (error) {
            console.error(`Server error: ${error.message}`);
            return;
        }
        if (stderr) console.error(`Server stderr: ${stderr}`);
        console.log(`Server stdout: ${stdout}`);
    });

    // Create Electron window
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1300,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false, // Keep it false for security
            contextIsolation: true,
        },
    });

    // Load the app from Express server
    mainWindow.loadURL("http://localhost:3000");

    mainWindow.on("closed", () => {
        mainWindow = null;
        if (serverProcess) serverProcess.kill();
    });
});

app.on("window-all-closed", () => {
    if (serverProcess) serverProcess.kill(); // Stop server when app is closed
    if (process.platform !== "darwin") app.quit();
});
