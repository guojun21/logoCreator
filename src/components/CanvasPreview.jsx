import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import './CanvasPreview.css'

// Squircle 路径生成（Apple 风格的连续圆角）
function createSquirclePath(ctx, x, y, width, height, radius) {
  const k = 0.5522847498 // 贝塞尔曲线魔数
  const r = Math.min(radius, width / 2, height / 2)
  
  // 使用更平滑的 superellipse 近似
  const n = 5 // 超椭圆参数，值越大越接近矩形
  const steps = 100
  
  ctx.beginPath()
  
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI - Math.PI / 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    
    // Superellipse 公式
    const signCos = cos >= 0 ? 1 : -1
    const signSin = sin >= 0 ? 1 : -1
    
    const px = x + width / 2 + signCos * Math.pow(Math.abs(cos), 2 / n) * (width / 2 - r) + signCos * r * Math.pow(Math.abs(cos), 2 / n)
    const py = y + height / 2 + signSin * Math.pow(Math.abs(sin), 2 / n) * (height / 2 - r) + signSin * r * Math.pow(Math.abs(sin), 2 / n)
    
    if (i === 0) {
      ctx.moveTo(px, py)
    } else {
      ctx.lineTo(px, py)
    }
  }
  
  ctx.closePath()
}

// 简化版 Squircle（使用 roundRect 但调整圆角）
function createSimpleSquircle(ctx, x, y, width, height, radius) {
  // 使用 canvas 原生 roundRect
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.closePath()
}

// 创建渐变
function createGradient(ctx, x, y, width, height, settings) {
  const { gradientDirection, color1, color2 } = settings
  let gradient
  
  const centerX = x + width / 2
  const centerY = y + height / 2
  
  switch (gradientDirection) {
    case 'top-bottom':
      gradient = ctx.createLinearGradient(centerX, y, centerX, y + height)
      break
    case 'bottom-top':
      gradient = ctx.createLinearGradient(centerX, y + height, centerX, y)
      break
    case 'left-right':
      gradient = ctx.createLinearGradient(x, centerY, x + width, centerY)
      break
    case 'right-left':
      gradient = ctx.createLinearGradient(x + width, centerY, x, centerY)
      break
    case 'diagonal-tl':
      gradient = ctx.createLinearGradient(x, y, x + width, y + height)
      break
    case 'diagonal-tr':
      gradient = ctx.createLinearGradient(x + width, y, x, y + height)
      break
    case 'diagonal-bl':
      gradient = ctx.createLinearGradient(x, y + height, x + width, y)
      break
    case 'diagonal-br':
      gradient = ctx.createLinearGradient(x + width, y + height, x, y)
      break
    case 'radial':
      gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2)
      break
    case 'radial-outer':
      gradient = ctx.createRadialGradient(centerX, centerY, width / 2, centerX, centerY, 0)
      break
    default:
      gradient = ctx.createLinearGradient(centerX, y, centerX, y + height)
  }
  
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)
  
  return gradient
}

// 应用混合模式
function applyBlendMode(ctx, blendMode) {
  const modeMap = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft-light': 'soft-light',
    'hard-light': 'hard-light',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'difference': 'difference',
    'exclusion': 'exclusion'
  }
  ctx.globalCompositeOperation = modeMap[blendMode] || 'source-over'
}

const CanvasPreview = forwardRef(({
  canvasSize,
  squircleSettings,
  shadowSettings,
  logoMarkSettings,
  highlightSettings,
  glowSettings,
  borderSettings
}, ref) => {
  const canvasRef = useRef(null)
  const logoImageRef = useRef(null)
  
  // 暴露 canvas 引用给父组件
  useImperativeHandle(ref, () => canvasRef.current)
  
  // 加载 Logo 图片
  useEffect(() => {
    if (logoMarkSettings.image) {
      const img = new Image()
      img.onload = () => {
        logoImageRef.current = img
        renderCanvas()
      }
      img.src = logoMarkSettings.image
    } else {
      logoImageRef.current = null
      renderCanvas()
    }
  }, [logoMarkSettings.image])
  
  // 渲染 Canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const size = canvasSize
    
    // 清空画布
    ctx.clearRect(0, 0, size, size)
    
    // 计算透明边距
    const border = (borderSettings.size / 100) * size
    
    // 计算 Squircle 尺寸和位置
    const squircleSize = ((squircleSettings.size / 100) * size) - (border * 2)
    const squircleX = (size - squircleSize) / 2
    const squircleY = (size - squircleSize) / 2
    
    // 1. 绘制阴影
    if (shadowSettings.enabled && squircleSettings.enabled) {
      ctx.save()
      ctx.shadowColor = shadowSettings.color
      ctx.shadowBlur = shadowSettings.blur
      ctx.shadowOffsetX = shadowSettings.offsetX
      ctx.shadowOffsetY = shadowSettings.offsetY
      ctx.globalAlpha = shadowSettings.opacity / 100
      
      createSimpleSquircle(
        ctx, 
        squircleX, 
        squircleY, 
        squircleSize, 
        squircleSize, 
        squircleSettings.cornerRadius
      )
      ctx.fillStyle = '#000'
      ctx.fill()
      ctx.restore()
    }
    
    // 2. 绘制 Squircle 背景
    if (squircleSettings.enabled) {
      ctx.save()
      applyBlendMode(ctx, squircleSettings.blendMode)
      
      createSimpleSquircle(
        ctx, 
        squircleX, 
        squircleY, 
        squircleSize, 
        squircleSize, 
        squircleSettings.cornerRadius
      )
      
      if (squircleSettings.gradientEnabled) {
        ctx.fillStyle = createGradient(
          ctx, 
          squircleX, 
          squircleY, 
          squircleSize, 
          squircleSize, 
          squircleSettings
        )
      } else {
        ctx.fillStyle = squircleSettings.color1
      }
      
      ctx.fill()
      ctx.restore()
    }
    
    // 3. 绘制高光
    if (highlightSettings.enabled && squircleSettings.enabled) {
      ctx.save()
      ctx.globalAlpha = highlightSettings.opacity / 100
      
      const highlightHeight = squircleSize * 0.4
      const highlightY = highlightSettings.position === 'top' 
        ? squircleY 
        : squircleY + squircleSize - highlightHeight
      
      // 创建高光渐变
      const highlightGradient = ctx.createLinearGradient(
        squircleX + squircleSize / 2,
        highlightSettings.position === 'top' ? squircleY : squircleY + squircleSize,
        squircleX + squircleSize / 2,
        highlightSettings.position === 'top' ? squircleY + highlightHeight : squircleY + squircleSize - highlightHeight
      )
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      // 裁剪到 Squircle 内
      createSimpleSquircle(
        ctx, 
        squircleX, 
        squircleY, 
        squircleSize, 
        squircleSize, 
        squircleSettings.cornerRadius
      )
      ctx.clip()
      
      ctx.fillStyle = highlightGradient
      ctx.fillRect(squircleX, highlightY, squircleSize, highlightHeight)
      ctx.restore()
    }
    
    // 4. 绘制 Logo Mark
    if (logoImageRef.current) {
      ctx.save()
      
      const logoSize = (logoMarkSettings.size / 100) * size
      const logoX = (size - logoSize) / 2 + logoMarkSettings.offsetX
      const logoY = (size - logoSize) / 2 + logoMarkSettings.offsetY
      
      // 发光效果
      if (glowSettings.enabled) {
        ctx.shadowColor = glowSettings.color
        ctx.shadowBlur = glowSettings.blur
        ctx.globalAlpha = glowSettings.opacity / 100
        
        // 绘制多次以增强发光
        for (let i = 0; i < 3; i++) {
          ctx.drawImage(logoImageRef.current, logoX, logoY, logoSize, logoSize)
        }
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
      
      // 绘制 Logo
      ctx.drawImage(logoImageRef.current, logoX, logoY, logoSize, logoSize)
      ctx.restore()
    }
  }
  
  // 监听设置变化重新渲染
  useEffect(() => {
    renderCanvas()
  }, [
    canvasSize,
    squircleSettings,
    shadowSettings,
    logoMarkSettings,
    highlightSettings,
    glowSettings,
    borderSettings
  ])
  
  // 计算预览尺寸（缩放显示）
  const previewSize = Math.min(480, canvasSize)
  const scale = previewSize / canvasSize
  
  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          width: previewSize,
          height: previewSize,
          display: 'block',
          borderRadius: '8px'
        }}
      />
      <div className="size-indicator">
        {canvasSize}×{canvasSize}px
      </div>
    </div>
  )
})

CanvasPreview.displayName = 'CanvasPreview'

export default CanvasPreview

