#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const os = require('os');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const net = require('net');

// 尝试安装open包，用于打开浏览器
try {
  require.resolve('open');
} catch (e) {
  console.log('正在安装必要的依赖...');
  execSync('npm install open --save-dev', { stdio: 'inherit' });
  console.log('依赖安装完成!');
}

const open = require('open');

// 获取本地IP地址
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let ipAddress = '';
  
  // 遍历所有网络接口
  Object.keys(interfaces).forEach((interfaceName) => {
    // 跳过回环接口和非IPv4接口
    interfaces[interfaceName].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddress = iface.address;
      }
    });
  });
  
  return ipAddress || 'localhost';
}

// 检查端口是否被占用
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        // 端口被占用
        resolve(true);
      })
      .once('listening', () => {
        // 端口可用
        server.close();
        resolve(false);
      })
      .listen(port, '0.0.0.0');
  });
}

// 找到可用端口
async function findAvailablePort(startPort) {
  let port = startPort;
  while (await isPortInUse(port)) {
    console.log(`${chalk.yellow('警告:')} 端口 ${port} 已被占用，尝试端口 ${port + 1}`);
    port++;
    // 设置上限，防止无限循环
    if (port > startPort + 10) {
      console.error(`${chalk.red('错误:')} 无法找到可用端口`);
      process.exit(1);
    }
  }
  return port;
}

// 获取本地IP
const localIp = getLocalIpAddress();

// 保存IP到localStorage，供前端使用
if (localIp !== 'localhost') {
  // 创建一个简单的脚本，会在前端运行时将IP存入localStorage
  const scriptContent = `
// 自动设置本地IP
if (typeof window !== 'undefined' && localStorage) {
  localStorage.setItem('localNetworkIp', '${localIp}');
  console.log('本地网络IP已自动设置为:', '${localIp}');
}
  `;
  
  // 确保目录存在
  const dir = path.join(process.cwd(), 'src', 'utils');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // 写入脚本文件
  fs.writeFileSync(
    path.join(dir, 'autoIp.js'),
    scriptContent
  );
  
  console.log('已生成自动IP配置文件');
}

// 自动查找可用端口并启动服务器
async function startServer() {
  // 启动Next.js开发服务器
  console.log(`\n${chalk.cyan('启动开发服务器...')}\n`);

  const defaultPort = parseInt(process.env.PORT || '3000', 10);
  const port = await findAvailablePort(defaultPort);
  
  const nextDev = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '-p', port], { 
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true
  });

  let serverStarted = false;
  let serverUrl = '';

  // 处理输出，替换localhost为本地IP
  nextDev.stdout.on('data', (data) => {
    const output = data.toString();
    // 替换输出中的localhost为实际IP
    const modifiedOutput = output.replace(/http:\/\/localhost/g, `http://${localIp}`);
    process.stdout.write(modifiedOutput);
    
    // 检查服务器是否已启动
    if (!serverStarted && modifiedOutput.includes('- Local:')) {
      serverStarted = true;
      
      // 提取URL
      const urlMatch = modifiedOutput.match(/http:\/\/[^\s]+/);
      if (urlMatch) {
        serverUrl = urlMatch[0];
        
        // 延迟2秒打开浏览器，确保服务器已完全启动
        setTimeout(() => {
          console.log(`\n${chalk.green('自动打开浏览器:')} ${serverUrl}\n`);
          open(serverUrl).catch(err => {
            console.log(`${chalk.yellow('警告:')} 无法自动打开浏览器，请手动访问 ${serverUrl}`);
          });
        }, 2000);
      }
    }
  });

  // 处理退出
  nextDev.on('close', (code) => {
    console.log(`\n${chalk.yellow('开发服务器已关闭')} ${code ? `退出码: ${code}` : ''}`);
    process.exit(code || 0);
  });

  // 处理终止信号
  process.on('SIGINT', () => {
    nextDev.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    nextDev.kill('SIGTERM');
  });
}

// 启动服务器
startServer(); 