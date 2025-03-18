'use client';

import { ReactNode, useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.scss';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  
  // 在移动设备上默认折叠侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    
    // 初始检查
    handleResize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 加载自动IP配置（如果存在）
  useEffect(() => {
    // 尝试动态导入自动IP配置脚本 (使用require方式避免TypeScript错误)
    if (typeof window !== 'undefined') {
      try {
        // 动态加载，忽略类型检查
        const importModule = async () => {
          try {
            // @ts-ignore - 文件可能不存在，这是预期行为
            await import('@/utils/autoIp.js');
          } catch (err) {
            console.debug('自动IP配置未加载，可能未使用dev:ip启动');
          }
        };
        
        importModule();
      } catch (err) {
        // 忽略错误
      }
    }
  }, []);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} />
      <main className={`${styles.mainContent} ${collapsed ? styles.expanded : ''}`}>
        {children}
      </main>
    </div>
  );
} 