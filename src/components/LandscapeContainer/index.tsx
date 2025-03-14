'use client'

import React, { ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';
import '@/styles/orientation.scss';

interface LandscapeContainerProps {
  children: ReactNode;
  forceLandscape?: boolean;
  showTip?: boolean;
  tipText?: string;
  breakpoint?: number;
}

const LandscapeContainer: React.FC<LandscapeContainerProps> = ({
  children,
  forceLandscape = true,
  showTip = true,
  tipText = '为了更好的体验，请将手机横屏使用',
  breakpoint = 768
}) => {
  const isMobile = useMediaQuery({ maxWidth: breakpoint });
  const isPortrait = useMediaQuery({ orientation: 'portrait' });

  return (
    <>
      <div className={`landscape-container ${forceLandscape ? 'force-landscape' : ''}`}>
        {children}
      </div>
      {isMobile && showTip && isPortrait && (
        <div className="orientation-mask show">
          <div className="icon">🔄</div>
          <div className="text">{tipText}</div>
        </div>
      )}
    </>
  );
};

export default LandscapeContainer; 