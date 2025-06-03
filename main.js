const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let dataFile = null;
let mainWindow = null;
let tray = null;

// Hide dock icon
app.dock.hide();

// Get the path for storing the last file path and window state
const lastFilePath = path.join(app.getPath('userData'), 'last-file-path.txt');
const windowStatePath = path.join(app.getPath('userData'), 'window-state.json');
const directionStatePath = path.join(app.getPath('userData'), 'direction-state.txt');

// Load the last used file path
function loadLastFilePath() {
    try {
        if (fs.existsSync(lastFilePath)) {
            return fs.readFileSync(lastFilePath, 'utf8').trim();
        }
    } catch (error) {
        console.error('Error loading last file path:', error);
    }
    return null;
}

// Save the last used file path
function saveLastFilePath(filePath) {
    try {
        fs.writeFileSync(lastFilePath, filePath);
    } catch (error) {
        console.error('Error saving last file path:', error);
    }
}

// Load window state
function loadWindowState() {
    try {
        if (fs.existsSync(windowStatePath)) {
            const state = JSON.parse(fs.readFileSync(windowStatePath, 'utf8'));
            return state;
        }
    } catch (error) {
        console.error('Error loading window state:', error);
    }
    return null;
}

// Save window state
function saveWindowState() {
    if (!mainWindow) return;
    
    const state = {
        x: mainWindow.getPosition()[0],
        y: mainWindow.getPosition()[1],
        width: mainWindow.getSize()[0],
        height: mainWindow.getSize()[1]
    };
    
    try {
        fs.writeFileSync(windowStatePath, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving window state:', error);
    }
}

// Load direction state
function loadDirectionState() {
    try {
        if (fs.existsSync(directionStatePath)) {
            return fs.readFileSync(directionStatePath, 'utf8').trim();
        }
    } catch (error) {
        console.error('Error loading direction state:', error);
    }
    return 'ltr'; // Default to LTR
}

// Save direction state
function saveDirectionState(direction) {
    try {
        fs.writeFileSync(directionStatePath, direction);
    } catch (error) {
        console.error('Error saving direction state:', error);
    }
}

function createWindow() {
    // Load saved window state or use defaults
    const savedState = loadWindowState();
    const windowOptions = {
        width: savedState?.width || 300,
        height: savedState?.height || 400,
        x: savedState?.x,
        y: savedState?.y,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true // Hide from dock
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadFile('index.html');

    // Save window state when moved or resized
    mainWindow.on('moved', saveWindowState);
    mainWindow.on('resize', saveWindowState);

    // Hide window when closed instead of quitting
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

function createTray() {
  // Create tray icon with the smaller icon
  tray = new Tray(path.join(__dirname, 'tray-icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    // { 
    //   label: 'Show/Hide Widget', 
    //   click: () => {
    //     if (mainWindow.isVisible()) {
    //       mainWindow.hide();
    //     } else {
    //       mainWindow.show();
    //     }
    //   }
    // },
    // { type: 'separator' },
    // { 
    //   label: 'Quit', 
    //   click: () => {
    //     app.isQuitting = true;
    //     app.quit();
    //   }
    // }
  ]);

  tray.setToolTip('Text Widget');
  tray.setContextMenu(contextMenu);

  // Toggle window on tray icon click
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

async function selectOrCreateFile() {
  var isVisible=mainWindow.isVisible();
  mainWindow.hide();
  const { filePath } = await dialog.showSaveDialog({
    title: 'Open or Create File',
    defaultPath: path.join(app.getPath('documents'), 'new-file.txt'),
    filters: [
      { name: 'Text Files', extensions: ['txt'] }
    ],
    properties: ['createDirectory']
  });

  if (filePath) {
    dataFile = filePath;
    // Save the last used file path
    saveLastFilePath(filePath);
    // Create file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }
    // Read and send file content immediately
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      mainWindow.webContents.send('file-selected', filePath, content);
    } catch (error) {
      console.error('Error reading file:', error);
    }
    if(isVisible){
      mainWindow.show();
    }
    return filePath;
  }

  if(isVisible){
    mainWindow.show();
  }
  return null;
}

app.whenReady().then(async () => {
  createWindow();
  createTray();
  
  // Register local keyboard shortcuts
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Check for Command (meta) key instead of Control
      if (input.meta && input.key === ';' && !input.shift) {
        event.preventDefault();
        mainWindow.webContents.send('insert-date');
      } else if (input.meta && input.key === ';' && input.shift) {
        event.preventDefault();
        mainWindow.webContents.send('insert-time');
      }
    });
  });

  // Wait for window to be ready
  mainWindow.webContents.on('did-finish-load', async () => {
    // Try to load the last used file
    const lastFile = loadLastFilePath();
    if (lastFile && fs.existsSync(lastFile)) {
      dataFile = lastFile;
      try {
        const content = fs.readFileSync(lastFile, 'utf8');
        mainWindow.webContents.send('file-selected', lastFile, content);
      } catch (error) {
        console.error('Error reading last file:', error);
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle saving content
ipcMain.on('save-content', (event, content) => {
  if (dataFile) {
    fs.writeFileSync(dataFile, content);
  }
});

// Handle loading content
ipcMain.handle('load-content', () => {
  if (dataFile) {
    try {
      return fs.readFileSync(dataFile, 'utf8');
    } catch (error) {
      return '';
    }
  }
  return '';
});

// Handle open or create file
ipcMain.handle('open-or-create-file', async () => {
  const filePath = await selectOrCreateFile();
  if (filePath) {
    return filePath;
  }
  return null;
});

// Handle hide window
ipcMain.on('hide-window', () => {
  mainWindow.hide();
});

// Handle quit app
ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

// Add new IPC handler for saving direction
ipcMain.on('save-direction', (event, direction) => {
    saveDirectionState(direction);
});

// Add new IPC handler for loading direction
ipcMain.handle('load-direction', () => {
    return loadDirectionState();
}); 