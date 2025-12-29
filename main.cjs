const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

let mainWindow

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 }
  })

  // 开发环境加载 vite 服务器
  const isDev = !app.isPackaged
  if (isDev) {
    // 尝试找到可用的 Vite 服务器端口（5173, 5199-5210）
    const http = require('http')
    let devUrl = null
  const ports = [5230, 5173, 5199, 5200, 5201, 5202, 5203, 5204, 5205, 5206, 5207, 5208, 5209, 5210]
    
    for (let port of ports) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(`http://127.0.0.1:${port}`, (res) => {
            resolve()
          })
          req.on('error', reject)
          req.setTimeout(1000, () => {
            req.destroy()
            reject(new Error('timeout'))
          })
        })
        devUrl = `http://127.0.0.1:${port}`
        console.log(`✅ Found Vite dev server at: ${devUrl}`)
        break
      } catch (err) {
        // 继续尝试下一个端口
      }
    }
    
    if (!devUrl) {
    devUrl = 'http://127.0.0.1:5230'
      console.log(`⚠️ Using default URL: ${devUrl}`)
    }
    
    console.log(`🚀 Loading Vite dev server: ${devUrl}`)
    await mainWindow.loadURL(devUrl)
    // mainWindow.webContents.openDevTools() // 注释掉以避免覆盖内容
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC: 导入图片
ipcMain.handle('import-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }
    ]
  })
  
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  
  const filePath = result.filePaths[0]
  const imageData = fs.readFileSync(filePath)
  const base64 = imageData.toString('base64')
  const ext = path.extname(filePath).slice(1)
  return `data:image/${ext};base64,${base64}`
})

// IPC: 导出 PNG 图片
ipcMain.handle('export-png', async (event, dataUrl) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'icon.png',
    filters: [
      { name: 'PNG Image', extensions: ['png'] }
    ]
  })
  
  if (result.canceled || !result.filePath) {
    return false
  }
  
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
  fs.writeFileSync(result.filePath, Buffer.from(base64Data, 'base64'))
  return true
})

// IPC: 导出 ICNS 图标（macOS 专用）
ipcMain.handle('export-icns', async (event, dataUrl) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'icon.icns',
    filters: [
      { name: 'macOS Icon', extensions: ['icns'] }
    ]
  })
  
  if (result.canceled || !result.filePath) {
    return { success: false }
  }
  
  try {
    // 创建临时目录用于生成 iconset
    const tempDir = path.join(app.getPath('temp'), `iconset_${Date.now()}`)
    const iconsetPath = path.join(tempDir, 'icon.iconset')
    fs.mkdirSync(iconsetPath, { recursive: true })
    
    // 保存原始 1024x1024 PNG
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
    const originalPngPath = path.join(tempDir, 'original.png')
    fs.writeFileSync(originalPngPath, Buffer.from(base64Data, 'base64'))
    
    // macOS iconset 需要的尺寸
    const sizes = [
      { name: 'icon_16x16.png', size: 16 },
      { name: 'icon_16x16@2x.png', size: 32 },
      { name: 'icon_32x32.png', size: 32 },
      { name: 'icon_32x32@2x.png', size: 64 },
      { name: 'icon_128x128.png', size: 128 },
      { name: 'icon_128x128@2x.png', size: 256 },
      { name: 'icon_256x256.png', size: 256 },
      { name: 'icon_256x256@2x.png', size: 512 },
      { name: 'icon_512x512.png', size: 512 },
      { name: 'icon_512x512@2x.png', size: 1024 }
    ]
    
    // 使用 sips 命令生成各种尺寸的图标（macOS 自带）
    for (const { name, size } of sizes) {
      const outputPath = path.join(iconsetPath, name)
      execSync(`sips -z ${size} ${size} "${originalPngPath}" --out "${outputPath}"`, { stdio: 'pipe' })
    }
    
    // 使用 iconutil 生成 icns 文件（macOS 自带）
    execSync(`iconutil -c icns "${iconsetPath}" -o "${result.filePath}"`, { stdio: 'pipe' })
    
    // 清理临时文件
    fs.rmSync(tempDir, { recursive: true, force: true })
    
    return { success: true }
  } catch (error) {
    console.error('ICNS 导出失败:', error)
    return { success: false, error: error.message }
  }
})

// IPC: 选择文件夹
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    buttonLabel: 'Select'
  })
  
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  
  return result.filePaths[0]
})

// IPC: 读取项目信息
ipcMain.handle('read-project-info', async (event, projectPath) => {
  try {
    const projectName = path.basename(projectPath)
    const packageJsonPath = path.join(projectPath, 'package.json')
    let description = `A project: ${projectName}`
    
    // 尝试从 package.json 读取描述
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        if (packageJson.description) {
          description = packageJson.description
        }
      } catch (err) {
        console.error('Failed to parse package.json:', err)
      }
    }
    
    // 尝试从 README.md 读取描述
    const readmePath = path.join(projectPath, 'README.md')
    if (fs.existsSync(readmePath)) {
      try {
        const readmeContent = fs.readFileSync(readmePath, 'utf8')
        const firstLine = readmeContent.split('\n')[0]
        if (firstLine && firstLine.trim()) {
          description = firstLine.replace(/^#+\s*/, '').trim()
        }
      } catch (err) {
        console.error('Failed to read README.md:', err)
      }
    }
    
    return {
      name: projectName,
      path: projectPath,
      description: description
    }
  } catch (error) {
    console.error('Failed to read project info:', error)
    throw error
  }
})

