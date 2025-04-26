/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src'],
    prependData: `@import "@/styles/variables.scss";`,
  },
  webpack: (config, { isServer }) => {
    // 优化视频文件处理
    config.module.rules.push({
      test: /\.(mp4|webm|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media/',
          outputPath: 'static/media/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    // 添加 worker-loader 支持（如果需要 WebGL worker）
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: {
        loader: 'worker-loader',
        options: {
          filename: 'static/[hash].worker.js',
          publicPath: '/_next/',
        },
      },
    });

    // 解决 Atlassian Pragmatic Drag-and-Drop 包的 ESM/CJS 兼容性问题
    config.resolve.alias = {
      ...config.resolve.alias,
      '@atlaskit/pragmatic-drag-and-drop/element/adapter': 
        './node_modules/@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/adapter.js',
      '@atlaskit/pragmatic-drag-and-drop/combine': 
        './node_modules/@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/combine.js',
    };

    return config;
  },
  // 确保 Atlassian 包被正确转译
  transpilePackages: [
    '@atlaskit/pragmatic-drag-and-drop',
    '@atlaskit/pragmatic-drag-and-drop-hitbox',
  ],
  // 允许跨域资源
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      }
    ]
  },
  images: {
    domains: ['audiopaytest.cos.tx.xmcdn.com'],
  },
}

export default nextConfig;
