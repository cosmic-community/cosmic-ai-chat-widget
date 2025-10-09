const fs = require('fs');
const path = require('path');

function injectScript(htmlPath) {
  try {
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    if (html.includes('dashboard-console-capture.js')) {
      return;
    }
    
    const scriptTag = '<script src="/dashboard-console-capture.js"></script>';
    
    if (html.includes('</head>')) {
      html = html.replace('</head>', `  ${scriptTag}\n</head>`);
    } else if (html.includes('<body>')) {
      html = html.replace('<body>', `<body>\n  ${scriptTag}`);
    }
    
    fs.writeFileSync(htmlPath, html);
    console.log(`Injected console capture script into ${htmlPath}`);
  } catch (error) {
    console.error(`Error processing ${htmlPath}:`, error);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html')) {
      injectScript(filePath);
    }
  });
}

const buildDir = path.join(process.cwd(), '.next');
if (fs.existsSync(buildDir)) {
  processDirectory(buildDir);
}