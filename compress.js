const fs = require('fs');
const path = require('path');

// 简单的HTML压缩函数
function minifyHTML(html) {
  return html
    // 移除注释
    .replace(/<!--[\s\S]*?-->/g, '')
    // 移除多余的空白字符
    .replace(/\s+/g, ' ')
    // 移除标签间的空格
    .replace(/>\s+</g, '><')
    // 移除行首行尾空格
    .trim()
    // 压缩CSS
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
      const minifiedCSS = css
        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除CSS注释
        .replace(/\s+/g, ' ') // 压缩空白
        .replace(/;\s*}/g, '}') // 移除最后一个分号
        .replace(/\s*{\s*/g, '{') // 压缩大括号
        .replace(/;\s*/g, ';') // 压缩分号
        .replace(/:\s*/g, ':') // 压缩冒号
        .trim();
      return `<style>${minifiedCSS}</style>`;
    })
    // 压缩JavaScript
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
      const minifiedJS = js
        .replace(/\/\/.*$/gm, '') // 移除单行注释
        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
        .replace(/\s+/g, ' ') // 压缩空白
        .replace(/;\s*}/g, ';}') // 保持语法正确
        .trim();
      return `<script>${minifiedJS}</script>`;
    });
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