const {BrowserWindow, app, ipcMain, screen, powerMonitor} = require("electron");

let window=null;
const mainWindow = () => {
    let {height, width} = screen.getPrimaryDisplay().workAreaSize;
    window = new BrowserWindow({
        width: width,
        height: height,
        autoHideMenuBar: true,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    // window.setMenu(null);
    window.maximize();
    window.loadFile(process.cwd()+"/public/html/index.html");
}

app.on("ready", mainWindow);


ipcMain.on("logout", (event, data) => {
    window.loadFile(process.cwd()+"./public/html/index.html");
})


ipcMain.on("navigate", (event, path, sendBackListener) => {
    window.loadFile(process.cwd()+"./public"+path);
});





powerMonitor.on("lock-screen", (e) => {
    window.loadFile(process.cwd()+"./public/html/index.html");
})