const { app, BrowserWindow, dialog } = require('electron')
const electronIpcMain = require('electron').ipcMain;
const { SVG } = require('@svgdotjs/svg.js');
const fs = require('fs');


const path = require('node:path')

let win;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
        .then(() => { win.show() });

    return win;
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

electronIpcMain.on('message:fromRender', (e, message) => {
    console.log(message);
})

electronIpcMain.on("save-json", async (event, jsonData) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Save JSON File',
        defaultPath: path.join(app.getPath('userData'), 'data.json'),
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ]
    });

    console.log(filePath);
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
            event.reply('save-json-reply', 'error');
        } else {
            event.reply('save-json-reply', 'success');
        }
    })
})

electronIpcMain.on('load-json', async (event, jsonData) => {
    const { filePath } = await dialog.showOpenDialog({
        title: "Load JSON File",
        defaultPath: app.getPath('userData'),
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ]
    })

    fs.readFile(filePath, (err, data) => {
        if (err) {
            event.reply('load-json-reply', null);
        } else {
            event.reply('load-json-reply', JSON.parse(data));
        }

    })

})