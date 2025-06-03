# PaperSide

A simple, elegant text widget application for macOS that allows you to quickly access and edit text files from your menu bar.

## Features

- 🚀 Quick access from menu bar
- 📝 Simple text editing interface
- 💾 Automatic saving
- 📂 Open or create new text files
- 🎯 Always on top window
- 🔄 Persistent content between sessions
- 🎯 Always on top
- 🎯 Tray icon for easy access
- 🎯 Remember last used file
- 🎯 Remember window position and size
- 🎯 Toggle text direction (LTR/RTL)
- 🎯 Keyboard shortcuts for quick date and time insertion

## Keyboard Shortcuts

When the app is focused:
- `Command + ;` - Insert current date
- `Command + Shift + ;` - Insert current time

## Installation

### From Release
1. Download the latest release from the `dist` folder
2. Double-click the `PaperSide-1.0.0-arm64.dmg` file
3. Drag the PaperSide app to your Applications folder
4. Launch the app from your Applications folder

### From Source
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the application:
   ```bash
   npm run build
   ```
4. The built application will be in the `dist` folder

## Usage

1. **Launch the App**
   - The app will appear in your menu bar with a text document icon
   - Click the icon to show/hide the widget

2. **Open/Create File**
   - Click the "Open/Create" button to select an existing file or create a new one
   - The file path will be displayed above the buttons

3. **Edit Text**
   - Type or paste your text in the text area
   - Content is automatically saved after 500ms of no typing
   - Use the "Save" button to manually save at any time

4. **Window Controls**
   - "Hide" button: Hides the window (app stays running)
   - "Close" button: Completely quits the application

5. **Direction Button**
   - Use the direction button to toggle between LTR and RTL text

6. **Keyboard Shortcuts**
   - Use keyboard shortcuts to quickly insert date and time

## Development

### Prerequisites
- Node.js
- npm
- Electron

### Project Structure
```
paperside/
├── main.js           # Main process file
├── index.html        # Renderer process UI
├── icon.svg          # App icon source
├── tray-icon.svg     # Tray icon source
├── convert-icon.js   # Icon conversion script
└── package.json      # Project configuration
```

### Building Icons
To rebuild the icons:
```bash
node convert-icon.js
```

### Running in Development
```bash
npm start
```

### Building for Production
```bash
npm run build
```

## Technical Details

- Built with Electron
- Uses native macOS features
- Auto-saves content
- Supports text files (.txt)
- Menu bar integration
- Always-on-top window

## License

ISC License

## Author

Esmaeil Mazahery

