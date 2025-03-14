'use client'

import React from 'react'
import AlphaVideoPlayer from '@/component/AlphaVideo'

export default function AlphaVideoPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f0f0'
    }}>
      <AlphaVideoPlayer
        videoSrc="http://audiopaytest.cos.tx.xmcdn.com/storages/d060-audiotest/93/D6/GKwaDAYLoHznAAYi_AAB1-t_.mp4"
        width={200}
        height={200}
        autoPlay={true}
        loop={false}
        onPlay={() => console.log('视频开始播放')}
        onError={() => console.log('视频加载错误')}
      />
    </div>
  )
} 