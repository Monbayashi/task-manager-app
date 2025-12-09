const path = require('path');
const { optimize } = require('webpack');

module.exports = (options, webpack) => {
  const lazyImports = ['@nestjs/microservices/microservices-module', '@nestjs/websockets/socket-module'];

  return {
    ...options,
    externals: ['@aws-sdk/client-ses'], // node_modules もバンドルする ※SDKv3は除外
    target: 'node', // Node.js 向けにビルド
    devtool: 'source-map', // ソースマップ生成
    optimization: {
      splitChunks: false, // Lambdaではチャンク禁止
    },
    output: {
      ...options.output,
      libraryTarget: 'commonjs2', // Lambda は commonjs2 を想定
      path: path.resolve(__dirname, 'dist'), // 出力先
      filename: 'main.js', // Lambda ハンドラーとして使用
      clean: false,
    },
    plugins: [
      ...options.plugins,
      // Lazy imports を無視する設定
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource); // 解決できなければ無視
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
  };
};
