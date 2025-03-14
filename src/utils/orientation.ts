import { useEffect, useState } from 'react';

// 检查是否是移动设备
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof window !== 'undefined' ? window.navigator.userAgent : ''
  );
};

// 获取屏幕方向
export const useScreenOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      if (typeof window !== 'undefined') {
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;
        setOrientation(isLandscape ? 'landscape' : 'portrait');
      }
    };

    // 初始检查
    handleOrientationChange();

    // 监听屏幕旋转
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(orientation: landscape)');
      if (mediaQuery.addListener) {
        mediaQuery.addListener(handleOrientationChange);
      } else {
        mediaQuery.addEventListener('change', handleOrientationChange);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(orientation: landscape)');
        if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleOrientationChange);
        } else {
          mediaQuery.removeEventListener('change', handleOrientationChange);
        }
      }
    };
  }, []);

  return orientation;
}; 