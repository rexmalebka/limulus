import {app, BrowserWindow } from 'electron'

function createWindow(){
	const win = new BrowserWindow()
	win.loadFile('../../static/index.html')
	win.maximize()
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

function run_ui(){
	app.whenReady().then(() => {
		createWindow()
	})
}


export default run_ui 

