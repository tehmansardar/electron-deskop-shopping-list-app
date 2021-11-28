const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

app.on('ready', function () {
	mainWindow = new BrowserWindow({});

	// Load html in window
	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, 'mainWindow.html'),
			protocol: 'file:',
			slashes: true,
		})
	);

	// Quit when app closed
	mainWindow.on('closed', function () {
		app.quit();
	});

	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	// Insert Menu
	Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
	addWindow = new BrowserWindow({
		width: 300,
		height: 200,
		title: 'Add Shopping List Item',
	});

	addWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, 'addWindow.html'),
			protocol: 'file:',
			slashes: true,
		})
	);
	// addWindow.setMenuBarVisibility(false);
	// Garbage Collection handle
	addWindow.on('close', function () {
		addWindow = null;
	});
}

// Catch item:add
ipcMain.on('item:add', async function (e, item) {
	console.log(item);
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
	// Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
	addWindow = null;
});

const mainMenuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
				label: 'Add Item',
				click() {
					createAddWindow();
				},
			},
			{
				label: 'Clear Items',
				click() {
					mainWindow.webContents.send('item:clear');
				},
			},
			{
				label: 'Quit ',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				},
			},
		],
	},
];

// if OSX, add empty object to menu
if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({});
}

// Add Developers Options in deve
if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				role: 'reload',
			},
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				},
			},
		],
	});
}
