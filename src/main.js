const { platform } = require('os')
const { app } = require('electron')
const { openWindow } = require('./gui/gui');
const { getJavaVersion, downloadJava } = require('./java');
const { exit } = require('process');
const { autoUpdater } = require('electron-updater');
const electronIsDev = require('electron-is-dev');
const { getDirectory } = require('./util');

if (!electronIsDev) {
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
}

console.log(getDirectory())
console.log(getJavaVersion())
downloadJava(console.log)

if (platform() == 'win32' || platform() == 'linux') {
    app.whenReady().then(openWindow)
} else {
    console.log('Your OS is not supported')
    exit(1)
}