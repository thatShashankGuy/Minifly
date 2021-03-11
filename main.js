const path = require('path')
const os = require('os')
const { app, BrowserWindow, Menu,globalShortcut,ipcMain,shell,dialog} = require("electron")
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant  = require('imagemin-pngquant')
const slash = require('slash')

process.env.NODE_ENV = 'development'

const isDev  = process.env.NODE_ENV !== 'production' ? true : false
const isWindow = process.platform === 'win32' ? true : false

let mainWindow
let aboutWindow

function createMainWindow() {
 mainWindow = new  BrowserWindow({
        height : 650, 
        width : 450,
        title : "MiniFly",
        icon : 'C:/Users/chetna singgh/Documents/REACT/Electron/assets/icons/Icon_256x256.png',
        backgroundColor : '#ccccff',
        resizable : isDev ? true : false,
        webPreferences : {
                nodeIntegration : true,
                }        
})  
mainWindow.loadFile('./app/index.html')
}

function createAboutWindow() {
        aboutWindow = new  BrowserWindow({
               height : 300, 
               width : 300,
               title : "Image Shrink",
               icon : 'C:/Users/chetna singgh/Documents/REACT/Electron/assets/icons/Icon_256x256.png',
               backgroundColor : '#ccccff',
               resizable : false
       })  
       aboutWindow.loadFile('./app/about.html')
       }

app.on("ready",() => {
        createMainWindow()
        
        const mainMenu = Menu.buildFromTemplate(menu)
        Menu.setApplicationMenu(mainMenu)
        mainWindow.on('closed', () => null)
})

const menu = [
        {
                role : 'fileMenu'
        },
       
...(isDev ? [{
                label : 'Developer',
                        submenu : [{role : 'reload'},
                        {role : 'forcereload'},
                        {role : 'seperator'},
                        {role : 'toggledevtools'}]}]: [] ),

      {label : 'help',
              submenu  : [{
                              label : 'About',
                              click : createAboutWindow}]}
]

ipcMain.on('image:minimize',(e,data)=> {
       data.dest = path.join(os.homedir(),"MiniFlySaves")        
        minifyFunc(data)
})

async function minifyFunc({imgpath,quality,dest}){
        try {
                const pngQuality = quality/100
                const files = await imagemin([slash(imgpath)],{
                        destination : dest,
                        plugins : [
                           imageminMozjpeg({ quality }),
                           imageminPngquant({
                                   quality : [pngQuality, pngQuality]
                           })]
                })
                shell.openPath(dest) 
                mainWindow.webContents.send('image:done')       
        }
        catch (error) {
          console.log(error)      
        }
}