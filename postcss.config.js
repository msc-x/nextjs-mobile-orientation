module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375, // iPhone 6/7/8 为基准
      viewportHeight: 667,
      unitPrecision: 5,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      mediaQuery: true,
      exclude: [/node_modules/], // 排除第三方库
      selectorBlackList: ['.ignore-'], // 以 ignore- 开头的类名不转换
      minPixelValue: 1,
      // 横屏配置
      landscape: true,
      landscapeUnit: 'vh',
      landscapeWidth: 667
    }
  }
};