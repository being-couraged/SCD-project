const { ipcRenderer } = require("electron")


const logout = () => {
    ipcRenderer.send("logout", true);
    ipcRenderer.on("logout-error", (event, res) => {
        
    })
}