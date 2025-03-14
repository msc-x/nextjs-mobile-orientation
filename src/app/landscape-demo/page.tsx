'use client'

import React from 'react';
import LandscapeContainer from '@/components/LandscapeContainer';

const LandscapeDemoPage = () => {
  return (
    <LandscapeContainer>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        color: 'white',
        textAlign: 'center',
        padding: '1.25rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '3rem',
            marginBottom: '1.25rem',
            fontWeight: 'bold'
          }}>横屏演示</h1>
          <p style={{ 
            fontSize: '2rem',
            marginBottom: '0.625rem'
          }}>这是一个强制横屏显示的页面示例</p>
          <p style={{ 
            fontSize: '2rem'
          }}>在移动设备上竖屏时会显示提示</p>
        </div>
      </div>
    </LandscapeContainer>
  );
};

export default LandscapeDemoPage; 