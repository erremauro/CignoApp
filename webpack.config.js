const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/typescript/index.ts',
  output: {
    filename: 'js/bundle.min.js',
    path: path.resolve(__dirname, 'assets'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
        include: path.resolve(__dirname, 'src/sass'),
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/styles.min.css',
    }),
    new CssMinimizerPlugin(),
    new TerserPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
  },
  devServer: {
    static: path.resolve(__dirname, 'public'),
    liveReload: true,
    watchFiles: ['src/**/*', 'public/**/*'],
    open: true,
    port: 9200,
  },
  mode: 'development',
};
