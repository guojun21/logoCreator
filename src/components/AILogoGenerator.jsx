import React, { useState } from 'react';
import { generateLogoMark } from '../services/aiLogoGenerator';
import './AILogoGenerator.css';

/**
 * AI Logo Generator Component
 * 提供生成 logo mark prompt 的界面
 */
export default function AILogoGenerator({ onLogoGenerated }) {
  const [projectPath, setProjectPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState(null);

  /**
   * 选择项目文件夹
   */
  const handleSelectFolder = async () => {
    if (window.electronAPI && window.electronAPI.selectFolder) {
      const folderPath = await window.electronAPI.selectFolder();
      if (folderPath) {
        setProjectPath(folderPath);
        setError(null);
        setSuccess(null);
      }
    } else {
      // 浏览器环境的处理
      alert('Folder selection is only available in Electron environment');
    }
  };

  /**
   * 生成 logo mark prompt
   */
  const handleGeneratePrompt = async () => {
    if (!projectPath) {
      setError('Please select a project folder first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedPrompt(null);

    try {
      const result = await generateLogoMark(projectPath);

      if (result.success) {
        setSuccess(result.message);
        setGeneratedPrompt(result.prompt);
      } else {
        setError(result.message || 'Failed to generate prompt');
      }
    } catch (err) {
      setError(err.message || 'Unknown error occurred');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理项目路径输入
   */
  const handlePathInput = (e) => {
    setProjectPath(e.target.value);
    setError(null);
  };

  /**
   * 复制 prompt 到剪贴板
   */
  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt).then(() => {
        setSuccess('Prompt copied to clipboard!');
        setTimeout(() => setSuccess(null), 2000);
      });
    }
  };

  return (
    <div className="ai-logo-generator">
      <div className="generator-header">
        <h3>🤖 AI Logo Mark Prompt Generator</h3>
        <p className="generator-subtitle">Generate AI prompts for professional logo marks</p>
      </div>

      <div className="generator-content">
        {/* 项目路径输入 */}
        <div className="input-group">
          <label htmlFor="projectPath">Project Folder Path:</label>
          <div className="path-input-wrapper">
            <input
              id="projectPath"
              type="text"
              value={projectPath}
              onChange={handlePathInput}
              placeholder="/path/to/your/project"
              className="path-input"
              disabled={isLoading}
            />
            <button
              className="folder-button"
              onClick={handleSelectFolder}
              disabled={isLoading}
              title="Select folder"
            >
              📁
            </button>
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          className="generate-button"
          onClick={handleGeneratePrompt}
          disabled={isLoading || !projectPath}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            '✨ Generate Prompt'
          )}
        </button>

        {/* 错误信息 */}
        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* 成功信息 */}
        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* 生成的 Prompt 预览 */}
        {generatedPrompt && (
          <div className="prompt-section">
            <h4>Generated Prompt:</h4>
            <div className="prompt-preview">
              <p>{generatedPrompt}</p>
            </div>
            <div className="prompt-actions">
              <button
                className="copy-button"
                onClick={handleCopyPrompt}
              >
                📋 Copy Prompt
              </button>
              <p className="prompt-instruction">
                💡 Use this prompt with your favorite AI image generator (Midjourney, DALL-E, etc.) to create the logo mark.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 说明文本 */}
      <div className="generator-help">
        <details>
          <summary>ℹ️ How it works</summary>
          <ul>
            <li>Select your project folder</li>
            <li>AI will generate a custom prompt for your logo mark</li>
            <li>Copy the prompt and use it with your favorite AI image generator</li>
            <li>Once you have the generated image, import it into logoCreator</li>
            <li>Adjust colors and effects using the control panel</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
