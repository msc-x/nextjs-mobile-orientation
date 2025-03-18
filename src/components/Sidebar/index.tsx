import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './sidebar.module.scss';
import ChatIcon from '@mui/icons-material/Chat';

interface RouteItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const routes: RouteItem[] = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/chat', label: 'AI聊天', icon: <ChatIcon fontSize="small" /> },
  { path: '/landscape-demo', label: '横屏示例', icon: '🖥️' },
  { path: '/alpha-video', label: 'Alpha视频', icon: '🎬' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapse }) => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  
  // 检查是否是首页
  const isHomePage = pathname === '/';

  // 检测设备类型
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 在移动设备上点击链接后自动关闭侧边栏
  const handleLinkClick = () => {
    if (isMobile && !collapsed) {
      toggleCollapse();
    }
  };

  // 如果不是首页，则不显示侧边栏
  if (!isHomePage) {
    return null;
  }

  return (
    <>
      {/* 移动设备上的菜单按钮 */}
      {isMobile && collapsed && (
        <button 
          className={styles.mobileMenuButton}
          onClick={toggleCollapse}
          aria-label="Open menu"
        >
          <div className={styles.menuIcon}>
            <span></span>
            <span></span>
          </div>
        </button>
      )}

      {/* 移动设备上的背景覆盖层 */}
      {isMobile && !collapsed && (
        <div 
          className={`${styles.mobileOverlay} ${collapsed ? styles.hidden : ''}`}
          onClick={toggleCollapse}
        />
      )}

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {collapsed && !isMobile ? 'N' : 'Next.js'}
          </div>
          {/* 在桌面端显示的折叠按钮 */}
          {!isMobile && (
            <button onClick={toggleCollapse} className={styles.collapseButton}>
              {collapsed ? '→' : '←'}
            </button>
          )}
          {/* 在移动端显示搜索图标 */}
          {isMobile && !collapsed && (
            <div className={styles.searchIcon}></div>
          )}
        </div>
        
        <nav className={styles.nav}>
          <ul className={styles.menu}>
            {routes.map((route) => (
              <li key={route.path} className={styles.menuItem}>
                <Link
                  href={route.path}
                  className={`${styles.link} ${pathname === route.path ? styles.active : ''}`}
                  title={collapsed && !isMobile ? route.label : undefined}
                  onClick={handleLinkClick}
                >
                  {route.icon && <span className={styles.icon}>{route.icon}</span>}
                  {(!collapsed || isMobile) && <span className={styles.label}>{route.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={styles.sidebarFooter}>
          {(!collapsed || isMobile) && <span>© 2024 Next.js App</span>}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;