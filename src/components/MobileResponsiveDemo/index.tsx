'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const MobileResponsiveDemo = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // 初始检查
    checkMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        响应式设计测试 - PostCSS PxToRem
      </Typography>
      
      <Paper className="mobile-card" sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          当前设备: {isMobile ? '移动设备' : '桌面设备'}
        </Typography>
        <Typography className="mobile-text">
          这段文字在移动设备上会使用 rem 单位（通过 postcss-pxtorem 转换）。
        </Typography>
        <Typography>
          这段文字将保持原有样式，不会受到移动端适配的影响。
        </Typography>
      </Paper>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Button variant="contained" className="mobile-button">
          移动端样式按钮
        </Button>
        
        <Button variant="outlined">
          常规样式按钮
        </Button>
        
        <Box className="mobile-space-medium" sx={{ bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
          <Typography>
            这个盒子在移动端有特定的内边距和外边距
          </Typography>
        </Box>
        
        <Box className="mobile-chat-bubble" sx={{ bgcolor: 'primary.light', color: 'white' }}>
          这是一个聊天气泡示例，在移动端会有不同的尺寸和圆角
        </Box>
      </Box>
    </Box>
  );
};

export default MobileResponsiveDemo; 