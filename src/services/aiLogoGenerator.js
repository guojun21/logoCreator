/**
 * AI Logo Mark Generator Service
 * 使用 Poe API 生成 logo mark
 */

// Poe API Configuration
// 注意：生产环境应该使用环境变量
const getPoeConfig = () => {
  // 在浏览器环境中获取环境变量
  const apiKey = typeof process !== 'undefined' ? process.env.REACT_APP_POE_API_KEY : window.__POE_API_KEY__;
  const apiUrl = typeof process !== 'undefined' ? process.env.REACT_APP_POE_API_URL : window.__POE_API_URL__;
  
  return {
    key: apiKey || "W4HQGO1TRCOcZzRv-8vB84REwnexAshVRVVhyZ9dpII",
    url: apiUrl || "https://api.poe.com/v1"
  };
};

const { key: POE_API_KEY, url: POE_API_BASE_URL } = getPoeConfig();

/**
 * 获取项目信息（从项目路径读取）
 * @param {string} projectPath - 项目路径
 * @returns {Promise<Object>} 项目信息
 */
export async function getProjectInfo(projectPath) {
  try {
    // 如果是 Electron 环境
    if (window.electronAPI && window.electronAPI.readProjectInfo) {
      return await window.electronAPI.readProjectInfo(projectPath);
    }
    
    // 浏览器环境下的默认处理
    const projectName = projectPath.split('/').pop();
    return {
      name: projectName,
      path: projectPath,
      description: `A project: ${projectName}`
    };
  } catch (error) {
    console.error('Failed to get project info:', error);
    throw error;
  }
}

/**
 * 生成 logo mark prompt
 * @param {string} projectName - 项目名称
 * @param {string} projectDescription - 项目描述
 * @returns {string} 完整的 prompt
 */
export function generateLogoMarkPrompt(projectName, projectDescription) {
  const systemPrompt = `You are an expert icon designer. Create a professional, minimalist logo mark that represents "${projectName}".

${projectDescription || ''}

DESIGN REQUIREMENTS:
- Canvas: 1024x1024 px with completely transparent background
- Logo Mark Size: 600-700px (occupies 60-70% of canvas, centered)
- Transparent Border: 15-20% on all sides (about 150-200px)
- Style: Modern, geometric, minimalist, professional
- SIMPLICITY: Very important - keep it simple and clean, avoid complex details

VISUAL CONCEPT:
Create a minimalist icon that represents the essence of this project:
1. Use geometric shapes and clean lines
2. Consider incorporating symbolic elements related to the project's function
3. Color: Use a single bold color (recommend: bright cyan #00D4FF, or gradient-ready single color like white #FFFFFF or dark #1a1a1a)
4. Design Style: Flat geometric, no gradients (gradients will be added separately), no shadows
5. Simplicity: Use minimal strokes and shapes - think of iconic symbols like Apple's app icons, not complex illustrations

TECHNICAL SPECS:
- Format: PNG with transparent background
- Colors: Single solid color (not gradient)
- Line Weight: Clean, consistent strokes (no hairlines)
- Padding: All visual content must stay within center 600-700px area
- Corners: Sharp/geometric (no heavy rounded corners needed)
- Complexity: Maximum 3-5 basic shapes (circles, rectangles, lines, curves)

WHAT NOT TO INCLUDE:
- No background colors or squircle
- No drop shadows or 3D effects
- No textures or patterns
- No text or typography
- No multiple colors
- No complex details, decorations, or intricate patterns
- Avoid over-designing - simpler is always better for app icons

SIMPLICITY GUIDELINES:
- Think iconic, not decorative
- Each element should serve a purpose
- Negative space is your friend
- If it takes more than 5 basic shapes to describe, it's too complex
- Test: Can you describe the logo in one sentence? If not, simplify it.

Generate a logo mark that is immediately recognizable, works well at small sizes, and represents the essence of this project through SIMPLE, CLEAN DESIGN. Generate the image directly, do not provide any explanation or description.`;

  return systemPrompt;
}

/**
 * 调用 Poe API 生成图像
 * @param {string} prompt - 生成提示
 * @param {string} model - 使用的模型（默认使用支持图像生成的模型）
 * @returns {Promise<string>} 生成的图像 URL 或 base64 数据
 */
export async function generateLogoMarkWithPoe(prompt, model = "Claude-3-5-Sonnet") {
  try {
    // 检查 API key 是否存在
    if (!POE_API_KEY) {
      throw new Error("POE_API_KEY is not configured. Please set REACT_APP_POE_API_KEY environment variable.");
    }

    console.log("Calling Poe API with model:", model);
    console.log("API URL:", `${POE_API_BASE_URL}/chat`);

    // 调用 Poe API
    const response = await fetch(`${POE_API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${POE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const responseText = await response.text();
      console.error("Error response:", responseText);
      throw new Error(`Poe API error: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const responseText = await response.text();
    console.log("Raw response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      throw new Error(`Invalid JSON response from Poe API: ${responseText.substring(0, 200)}`);
    }
    
    console.log("Parsed data:", data);
    
    // 提取生成的内容
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      console.log("Generated content:", content);
      
      // 如果返回的是图像 URL
      if (content.includes("http")) {
        return content;
      }
      
      // 如果返回的是 base64 编码的图像
      if (content.includes("data:image")) {
        return content;
      }
      
      // 否则尝试从响应中提取图像信息
      return content;
    }

    throw new Error("No response from Poe API");
  } catch (error) {
    console.error("Failed to generate logo mark with Poe:", error);
    throw error;
  }
}

/**
 * 生成 logo mark 的完整流程
 * @param {string} projectPath - 项目路径
 * @returns {Promise<Object>} 包含生成结果的对象 { prompt, success, message }
 */
export async function generateLogoMark(projectPath) {
  try {
    // 1. 获取项目信息
    console.log("Step 1: Fetching project info from:", projectPath);
    const projectInfo = await getProjectInfo(projectPath);
    console.log("Project info:", projectInfo);

    // 2. 生成 prompt
    console.log("Step 2: Generating prompt...");
    const prompt = generateLogoMarkPrompt(
      projectInfo.name,
      projectInfo.description
    );
    console.log("Prompt generated");

    return {
      success: true,
      prompt: prompt,
      projectInfo: projectInfo,
      message: `Successfully generated prompt for "${projectInfo.name}"`
    };
  } catch (error) {
    console.error("Error in generateLogoMark:", error);
    return {
      success: false,
      error: error.message,
      message: `Failed to generate prompt: ${error.message}`
    };
  }
}
