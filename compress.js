const fs = require('fs');
const path = require('path');

// 更安全的HTML压缩函数，专门去除<script>标签内的所有注释
function minifyHTML(html) {
  // 移除HTML注释（不影响条件注释）
  let result = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
  // 压缩CSS（移除注释和多余空白）
  result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
    const minifiedCSS = css
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除CSS注释
      .replace(/\s{2,}/g, ' ') // 多空格变单空格
      .replace(/\n\s+/g, '\n') // 行首空格
      .replace(/;\s*\n/g, ';') // 分号后换行
      .replace(/{\s*/g, '{')
      .replace(/\s*}/g, '}')
      .replace(/:\s*/g, ':')
      .trim();
    return `<style>${minifiedCSS}</style>`;
  });
  // 专门处理<script>标签，去除所有注释
  result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
    // 去除多行注释 /* ... */
    let code = js.replace(/\/\*[\s\S]*?\*\//g, '');
    // 去除单行注释 // ...（只移除行首的注释，保留代码中的 //）
    code = code.replace(/^\s*\/\/.*$/gm, '');
    // 移除多余空行
    code = code.replace(/\n{2,}/g, '\n');
    // 保留换行和分号，避免所有代码变成一行
    return `<script>${code.trim()}</script>`;
  });
  // 标签间空白压缩
  result = result.replace(/>\s+</g, '><');
  // 行首行尾空白
  result = result.replace(/^\s+|\s+$/gm, '');
  // 多余换行
  result = result.replace(/\n{2,}/g, '\n');
  return result.trim();
}

// 读取原文件
const inputFile = path.join(__dirname, 'index.html');
const outputDir = path.join(__dirname, 'docs');
const outputFile = path.join(outputDir, 'index.html');

try {
  // 创建docs目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 读取并压缩HTML
  const htmlContent = fs.readFileSync(inputFile, 'utf8');
  const minifiedHTML = minifyHTML(htmlContent);
  
  // 计算压缩率
  const originalSize = Buffer.byteLength(htmlContent, 'utf8');
  const compressedSize = Buffer.byteLength(minifiedHTML, 'utf8');
  const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
  
  // 写入压缩后的文件
  fs.writeFileSync(outputFile, minifiedHTML, 'utf8');
  
  console.log('✅ 压缩完成！');
  console.log(`📁 输出目录: ${outputDir}`);
  console.log(`📄 原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`🗜️ 压缩大小: ${(compressedSize / 1024).toFixed(2)} KB`);
  console.log(`📉 压缩率: ${compressionRatio}%`);
  
} catch (error) {
  console.error('❌ 压缩失败:', error.message);
}
// 使用方法: 在项目根目录运行 `node compress.js`，压缩后的文件将输出到 `docs` 目录中。