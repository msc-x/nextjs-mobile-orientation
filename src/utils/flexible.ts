/**
 * 移动端适配方案 (vw + rem)
 * 设计稿宽度：375px
 * 1rem = 100px
 * HTML fontSize = 26.67vw (100/375*100)
 */
export function setRootFontSize() {
  if (typeof document === 'undefined') return;

  // 清理已存在的样式
  const existingStyle = document.getElementById('root-font-size');
  if (existingStyle) {
    existingStyle.remove();
  }

  // 创建新样式
  const styleElement = document.createElement('style');
  styleElement.id = 'root-font-size';
  
  // 核心样式设置
  styleElement.innerHTML = `
    :root {
      /* 基础字体大小设置 (1rem = 100px) */
      font-size: 26.67vw;
    }

    /* 375px 以上的屏幕 */
    @media screen and (min-width: 375px) {
      :root {
        /* 限制最大字体大小 */
        font-size: min(26.67vw, 64px);
      }
    }

    /* 320px 以下的屏幕 */
    @media screen and (max-width: 320px) {
      :root {
        /* 限制最小字体大小 */
        font-size: max(26.67vw, 32px);
      }
    }

    /* 横屏模式 */
    @media screen and (orientation: landscape) {
      :root {
        /* 使用视口高度作为参考 */
        font-size: 26.67vh;
      }
    }
  `;

  // 添加样式到文档
  document.head.appendChild(styleElement);
}