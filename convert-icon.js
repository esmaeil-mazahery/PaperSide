const sharp = require('sharp');
const fs = require('fs');

// Convert app icon
const appSvgBuffer = fs.readFileSync('icon.svg');
sharp(appSvgBuffer)
  .resize(512, 512, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png({
    quality: 100,
    compressionLevel: 9
  })
  .toFile('icon.png')
  .then(() => {
    console.log('App icon converted successfully');
  })
  .catch(err => {
    console.error('Error converting app icon:', err);
  });

// Convert tray icon
const traySvgBuffer = fs.readFileSync('tray-icon.svg');
sharp(traySvgBuffer)
  .resize(32, 32, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png({
    quality: 100,
    compressionLevel: 9
  })
  .toFile('tray-icon.png')
  .then(() => {
    console.log('Tray icon converted successfully');
  })
  .catch(err => {
    console.error('Error converting tray icon:', err);
  }); 