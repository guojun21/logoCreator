import React, { useState, useRef, useCallback, useEffect } from 'react'
import './App.css'
import CanvasPreview from './components/CanvasPreview'
import ControlPanel from './components/ControlPanel'

function App() {
  // Canvas 设置（固定）
  const canvasSize = 1024
  
  // Squircle 设置
  const [squircleSettings, setSquircleSettings] = useState({
    enabled: true,
    size: 90, // 占画布百分比
    cornerRadius: 180, // 圆角大小
    // 渐变设置
    gradientEnabled: true,
    color1: '#1a1a1a',
    color2: '#2d2d2d',
    gradientDirection: 'top-bottom', // top-bottom, left-right, diagonal-tl, diagonal-tr, radial
    blendMode: 'normal' // normal, multiply, screen, overlay, soft-light
  })
  
  // 阴影设置
  const [shadowSettings, setShadowSettings] = useState({
    enabled: true,
    offsetX: 0,
    offsetY: 20,
    blur: 40,
    spread: 0,
    color: '#000000',
    opacity: 25
  })
  
  // Logo Mark 设置
  const [logoMarkSettings, setLogoMarkSettings] = useState({
    image: null,
    size: 65, // 占画布百分比
    offsetX: 0,
    offsetY: 0
  })
  
  // 高光设置
  const [highlightSettings, setHighlightSettings] = useState({
    enabled: true,
    opacity: 15,
    position: 'top' // top, bottom
  })
  
  // 发光设置
  const [glowSettings, setGlowSettings] = useState({
    enabled: false,
    color: '#00d4ff',
    blur: 20,
    opacity: 50
  })
  
  // 透明边距
  const [borderSettings, setBorderSettings] = useState({
    size: 5 // 百分比
  })

  const canvasRef = useRef(null)

  // 导入 Logo Mark
  const handleImportLogo = useCallback(async () => {
    if (window.electronAPI) {
      const dataUrl = await window.electronAPI.importImage()
      if (dataUrl) {
        setLogoMarkSettings(prev => ({ ...prev, image: dataUrl }))
      }
    } else {
      // 浏览器环境 fallback
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/png,image/jpeg,image/webp'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            setLogoMarkSettings(prev => ({ ...prev, image: event.target.result }))
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    }
  }, [])

  // 导出 PNG
  const handleExportPng = useCallback(async () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      if (window.electronAPI) {
        const success = await window.electronAPI.exportPng(dataUrl)
        if (success) {
          console.log('PNG 导出成功')
        }
      } else {
        // 浏览器环境 fallback
        const link = document.createElement('a')
        link.download = 'icon.png'
        link.href = dataUrl
        link.click()
      }
    }
  }, [])

  // 导出 ICNS（macOS 专用）
  const handleExportIcns = useCallback(async () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      if (window.electronAPI) {
        const result = await window.electronAPI.exportIcns(dataUrl)
        if (result.success) {
          console.log('ICNS 导出成功')
        } else if (result.error) {
          console.error('ICNS 导出失败:', result.error)
          alert('ICNS 导出失败: ' + result.error)
        }
      } else {
        alert('ICNS 导出仅在 Electron 环境中可用')
      }
    }
  }, [])

  // 清除 Logo Mark
  const handleClearLogo = useCallback(() => {
    setLogoMarkSettings(prev => ({ ...prev, image: null }))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-drag-region"></div>
        <h1>Logo Creator</h1>
        <p className="subtitle">macOS 图标创建工具</p>
      </header>
      
      <main className="app-main">
        <div className="preview-section">
          <CanvasPreview
            ref={canvasRef}
            canvasSize={canvasSize}
            squircleSettings={squircleSettings}
            shadowSettings={shadowSettings}
            logoMarkSettings={logoMarkSettings}
            highlightSettings={highlightSettings}
            glowSettings={glowSettings}
            borderSettings={borderSettings}
          />
          
          <div className="preview-actions">
            <button className="secondary" onClick={handleImportLogo}>
              导入 Logo Mark
            </button>
            {logoMarkSettings.image && (
              <button className="secondary danger" onClick={handleClearLogo}>
                清除 Logo
              </button>
            )}
            <button onClick={handleExportPng}>
              导出 PNG
            </button>
            <button className="icns" onClick={handleExportIcns}>
              导出 ICNS
            </button>
          </div>
          
          <div className="preview-info">
            <span>画布尺寸: {canvasSize}×{canvasSize}px</span>
            <span>透明边距: {borderSettings.size}%</span>
          </div>
        </div>
        
        <div className="control-section">
          <ControlPanel
            squircleSettings={squircleSettings}
            setSquircleSettings={setSquircleSettings}
            shadowSettings={shadowSettings}
            setShadowSettings={setShadowSettings}
            logoMarkSettings={logoMarkSettings}
            setLogoMarkSettings={setLogoMarkSettings}
            highlightSettings={highlightSettings}
            setHighlightSettings={setHighlightSettings}
            glowSettings={glowSettings}
            setGlowSettings={setGlowSettings}
            borderSettings={borderSettings}
            setBorderSettings={setBorderSettings}
          />
        </div>
      </main>
    </div>
  )
}

export default App

