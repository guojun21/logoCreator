import React, { useState } from 'react'
import './ControlPanel.css'

// 可折叠的控制组
function ControlGroup({ title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className={`control-group ${isOpen ? 'open' : 'closed'}`}>
      <div className="control-group-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="control-group-title">{title}</span>
        <span className="control-group-toggle">{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && <div className="control-group-content">{children}</div>}
    </div>
  )
}

// 滑块控制
function SliderControl({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }) {
  return (
    <div className="control-item">
      <div className="control-label">
        <span>{label}</span>
        <span className="control-value">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

// 颜色选择器
function ColorControl({ label, value, onChange }) {
  const [inputValue, setInputValue] = useState(value)
  
  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val)
    }
  }
  
  const handleColorChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    onChange(val)
  }
  
  return (
    <div className="control-item color-control">
      <span className="control-label">{label}</span>
      <div className="color-inputs">
        <input
          type="color"
          value={value}
          onChange={handleColorChange}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => setInputValue(value)}
          placeholder="#000000"
          className="color-text-input"
        />
      </div>
    </div>
  )
}

// 开关控制
function ToggleControl({ label, value, onChange }) {
  return (
    <div className="control-item toggle-control">
      <span className="control-label">{label}</span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  )
}

// 下拉选择
function SelectControl({ label, value, onChange, options }) {
  return (
    <div className="control-item">
      <span className="control-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function ControlPanel({
  squircleSettings,
  setSquircleSettings,
  shadowSettings,
  setShadowSettings,
  logoMarkSettings,
  setLogoMarkSettings,
  highlightSettings,
  setHighlightSettings,
  glowSettings,
  setGlowSettings,
  borderSettings,
  setBorderSettings
}) {
  // 渐变方向选项
  const gradientDirections = [
    { value: 'top-bottom', label: '从上到下' },
    { value: 'bottom-top', label: '从下到上' },
    { value: 'left-right', label: '从左到右' },
    { value: 'right-left', label: '从右到左' },
    { value: 'diagonal-tl', label: '左上到右下' },
    { value: 'diagonal-tr', label: '右上到左下' },
    { value: 'diagonal-bl', label: '左下到右上' },
    { value: 'diagonal-br', label: '右下到左上' },
    { value: 'radial', label: '中心向外' },
    { value: 'radial-outer', label: '外向中心' }
  ]
  
  // 混合模式选项
  const blendModes = [
    { value: 'normal', label: '正常' },
    { value: 'multiply', label: '正片叠底' },
    { value: 'screen', label: '滤色' },
    { value: 'overlay', label: '叠加' },
    { value: 'soft-light', label: '柔光' },
    { value: 'hard-light', label: '强光' },
    { value: 'color-dodge', label: '颜色减淡' },
    { value: 'color-burn', label: '颜色加深' },
    { value: 'difference', label: '差值' },
    { value: 'exclusion', label: '排除' }
  ]
  
  // 高光位置选项
  const highlightPositions = [
    { value: 'top', label: '顶部' },
    { value: 'bottom', label: '底部' }
  ]

  return (
    <div className="control-panel">
      {/* 透明边距 */}
      <ControlGroup title="📐 透明边距" defaultOpen={false}>
        <SliderControl
          label="边距大小"
          value={borderSettings.size}
          onChange={(v) => setBorderSettings(prev => ({ ...prev, size: v }))}
          min={0}
          max={15}
          step={0.5}
          unit="%"
        />
      </ControlGroup>
      
      {/* Squircle 设置 */}
      <ControlGroup title="🟦 Squircle 背景">
        <ToggleControl
          label="启用"
          value={squircleSettings.enabled}
          onChange={(v) => setSquircleSettings(prev => ({ ...prev, enabled: v }))}
        />
        
        <SliderControl
          label="大小"
          value={squircleSettings.size}
          onChange={(v) => setSquircleSettings(prev => ({ ...prev, size: v }))}
          min={50}
          max={100}
          unit="%"
        />
        
        <SliderControl
          label="圆角"
          value={squircleSettings.cornerRadius}
          onChange={(v) => setSquircleSettings(prev => ({ ...prev, cornerRadius: v }))}
          min={0}
          max={300}
          unit="px"
        />
        
        <div className="control-divider"></div>
        
        <ToggleControl
          label="渐变效果"
          value={squircleSettings.gradientEnabled}
          onChange={(v) => setSquircleSettings(prev => ({ ...prev, gradientEnabled: v }))}
        />
        
        <ColorControl
          label="颜色 1"
          value={squircleSettings.color1}
          onChange={(v) => setSquircleSettings(prev => ({ ...prev, color1: v }))}
        />
        
        {squircleSettings.gradientEnabled && (
          <>
            <ColorControl
              label="颜色 2"
              value={squircleSettings.color2}
              onChange={(v) => setSquircleSettings(prev => ({ ...prev, color2: v }))}
            />
            
            <SelectControl
              label="渐变方向"
              value={squircleSettings.gradientDirection}
              onChange={(v) => setSquircleSettings(prev => ({ ...prev, gradientDirection: v }))}
              options={gradientDirections}
            />
            
            <SelectControl
              label="混合模式"
              value={squircleSettings.blendMode}
              onChange={(v) => setSquircleSettings(prev => ({ ...prev, blendMode: v }))}
              options={blendModes}
            />
          </>
        )}
      </ControlGroup>
      
      {/* 阴影设置 */}
      <ControlGroup title="🌑 阴影效果">
        <ToggleControl
          label="启用"
          value={shadowSettings.enabled}
          onChange={(v) => setShadowSettings(prev => ({ ...prev, enabled: v }))}
        />
        
        <ColorControl
          label="颜色"
          value={shadowSettings.color}
          onChange={(v) => setShadowSettings(prev => ({ ...prev, color: v }))}
        />
        
        <SliderControl
          label="不透明度"
          value={shadowSettings.opacity}
          onChange={(v) => setShadowSettings(prev => ({ ...prev, opacity: v }))}
          min={0}
          max={100}
          unit="%"
        />
        
        <SliderControl
          label="模糊"
          value={shadowSettings.blur}
          onChange={(v) => setShadowSettings(prev => ({ ...prev, blur: v }))}
          min={0}
          max={100}
          unit="px"
        />
        
        <SliderControl
          label="X 偏移"
          value={shadowSettings.offsetX}
          onChange={(v) => setShadowSettings(prev => ({ ...prev, offsetX: v }))}
          min={-50}
          max={50}
          unit="px"
        />
        
        <SliderControl
          label="Y 偏移"
          value={shadowSettings.offsetY}
          onChange={(v) => setShadowSettings(prev => ({ ...prev, offsetY: v }))}
          min={-50}
          max={50}
          unit="px"
        />
      </ControlGroup>
      
      {/* 高光设置 */}
      <ControlGroup title="✨ 高光效果" defaultOpen={false}>
        <ToggleControl
          label="启用"
          value={highlightSettings.enabled}
          onChange={(v) => setHighlightSettings(prev => ({ ...prev, enabled: v }))}
        />
        
        <SliderControl
          label="不透明度"
          value={highlightSettings.opacity}
          onChange={(v) => setHighlightSettings(prev => ({ ...prev, opacity: v }))}
          min={0}
          max={50}
          unit="%"
        />
        
        <SelectControl
          label="位置"
          value={highlightSettings.position}
          onChange={(v) => setHighlightSettings(prev => ({ ...prev, position: v }))}
          options={highlightPositions}
        />
      </ControlGroup>
      
      {/* Logo Mark 设置 */}
      <ControlGroup title="🎨 Logo Mark">
        <div className="control-item">
          <span className="control-label">状态</span>
          <span className={`logo-status ${logoMarkSettings.image ? 'loaded' : 'empty'}`}>
            {logoMarkSettings.image ? '已加载' : '未加载'}
          </span>
        </div>
        
        <SliderControl
          label="大小"
          value={logoMarkSettings.size}
          onChange={(v) => setLogoMarkSettings(prev => ({ ...prev, size: v }))}
          min={20}
          max={100}
          unit="%"
        />
        
        <SliderControl
          label="X 偏移"
          value={logoMarkSettings.offsetX}
          onChange={(v) => setLogoMarkSettings(prev => ({ ...prev, offsetX: v }))}
          min={-200}
          max={200}
          unit="px"
        />
        
        <SliderControl
          label="Y 偏移"
          value={logoMarkSettings.offsetY}
          onChange={(v) => setLogoMarkSettings(prev => ({ ...prev, offsetY: v }))}
          min={-200}
          max={200}
          unit="px"
        />
      </ControlGroup>
      
      {/* 发光效果 */}
      <ControlGroup title="💫 发光效果" defaultOpen={false}>
        <ToggleControl
          label="启用"
          value={glowSettings.enabled}
          onChange={(v) => setGlowSettings(prev => ({ ...prev, enabled: v }))}
        />
        
        <ColorControl
          label="颜色"
          value={glowSettings.color}
          onChange={(v) => setGlowSettings(prev => ({ ...prev, color: v }))}
        />
        
        <SliderControl
          label="模糊"
          value={glowSettings.blur}
          onChange={(v) => setGlowSettings(prev => ({ ...prev, blur: v }))}
          min={0}
          max={100}
          unit="px"
        />
        
        <SliderControl
          label="不透明度"
          value={glowSettings.opacity}
          onChange={(v) => setGlowSettings(prev => ({ ...prev, opacity: v }))}
          min={0}
          max={100}
          unit="%"
        />
      </ControlGroup>
      
      {/* 预设 */}
      <ControlGroup title="📦 预设模板" defaultOpen={false}>
        <div className="preset-buttons">
          <button 
            className="preset-btn"
            onClick={() => {
              setSquircleSettings({
                enabled: true,
                size: 90,
                cornerRadius: 180,
                gradientEnabled: true,
                color1: '#1a1a1a',
                color2: '#2d2d2d',
                gradientDirection: 'top-bottom',
                blendMode: 'normal'
              })
            }}
          >
            深色
          </button>
          <button 
            className="preset-btn"
            onClick={() => {
              setSquircleSettings({
                enabled: true,
                size: 90,
                cornerRadius: 180,
                gradientEnabled: true,
                color1: '#ffffff',
                color2: '#f0f0f0',
                gradientDirection: 'top-bottom',
                blendMode: 'normal'
              })
            }}
          >
            浅色
          </button>
          <button 
            className="preset-btn"
            onClick={() => {
              setSquircleSettings({
                enabled: true,
                size: 90,
                cornerRadius: 180,
                gradientEnabled: true,
                color1: '#007AFF',
                color2: '#0051D5',
                gradientDirection: 'top-bottom',
                blendMode: 'normal'
              })
            }}
          >
            蓝色
          </button>
          <button 
            className="preset-btn"
            onClick={() => {
              setSquircleSettings({
                enabled: true,
                size: 90,
                cornerRadius: 180,
                gradientEnabled: true,
                color1: '#AF52DE',
                color2: '#8E44AD',
                gradientDirection: 'diagonal-tl',
                blendMode: 'normal'
              })
            }}
          >
            紫色
          </button>
          <button 
            className="preset-btn"
            onClick={() => {
              setSquircleSettings({
                enabled: true,
                size: 90,
                cornerRadius: 180,
                gradientEnabled: true,
                color1: '#FF6B35',
                color2: '#FF9966',
                gradientDirection: 'diagonal-tr',
                blendMode: 'normal'
              })
            }}
          >
            橙色
          </button>
          <button 
            className="preset-btn"
            onClick={() => {
              setSquircleSettings({
                enabled: true,
                size: 90,
                cornerRadius: 180,
                gradientEnabled: true,
                color1: '#34C759',
                color2: '#2ECC71',
                gradientDirection: 'radial',
                blendMode: 'normal'
              })
            }}
          >
            绿色
          </button>
        </div>
      </ControlGroup>
    </div>
  )
}

export default ControlPanel

