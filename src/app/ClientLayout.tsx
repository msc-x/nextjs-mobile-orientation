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

  return (
    <div className={styles.layoutContainer}>
      <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} />
      <main className={`${styles.mainContent} ${collapsed ? styles.expanded : ''}`}>
        {children}
      </main>
    </div>
  );
} 