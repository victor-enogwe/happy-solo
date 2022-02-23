import BrowserSync from 'browser-sync-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CspHtmlWebpack from 'csp-html-webpack-plugin'
import HtmlWebpack from 'html-webpack-plugin'
import HtmlWebpackTags from 'html-webpack-tags-plugin'
import MiniCssExtract from 'mini-css-extract-plugin'
import { resolve } from 'path'
import { Configuration, WebpackPluginInstance } from 'webpack'
import { bsConfigApp } from './browsersync.config'

const scssConfig = [
  { loader: MiniCssExtract.loader },
  { loader: 'css-loader' },
  { loader: 'sass-loader', options: { sassOptions: { outputStyle: 'compressed' }, sourceMap: true } }
]

const gFontCdn = "https://fonts.googleapis.com https://fonts.gstatic.com"
const unsafe = "'unsafe-inline'"
const scriptSrc = `script-src 'self'`
const viewport = 'width=device-width, initial-scale=1, shrink-to-fit=no user-scalable=no'
const content = `default-src 'self'; ${scriptSrc}; img-src 'self' data:; style-src 'self' ${unsafe} ${gFontCdn}; font-src ${gFontCdn}`
const cspMeta = { 'http-equiv': 'Content-Security-Policy', content }
const xCspMeta = { 'http-equiv': 'X-Content-Security-Policy', content }
const htmlMeta = { charset: 'UTF-8', viewport, 'X-Content-Security-Policy': xCspMeta, 'Content-Security-Policy': cspMeta }

const htmlConfig: HtmlWebpack.Options = {
  title: 'Happy Solo',
  template:  resolve(__dirname, 'src', 'frontend', 'index.html'),
  hash: false,
  filename: 'index.html',
  meta: htmlMeta,
  inject: 'body'
}

const fonts = ['https://fonts.googleapis.com/css?family=Montserrat:300,400,600,700&amp;lang=en']

const HtmlWebpackPlugin = new HtmlWebpack(htmlConfig)

const HtmlWebpackTagsPlugin = new HtmlWebpackTags({ links: fonts })

const CspHtmlWebpackPlugin = new CspHtmlWebpack()

const BrowserSyncPlugin = new BrowserSync(bsConfigApp)

const ExtractScssPlugin = new MiniCssExtract({ filename: '[name].css', chunkFilename: '[id].css' })

const commonConfig: Configuration = {
  mode: 'development',
  devtool: 'source-map',
  context: resolve(__dirname, 'src'),
  plugins: [
    new CleanWebpackPlugin(),
  ],
  output: {
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader', exclude: /node_modules|dist/ },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
    ]
  }
}

const webConfig: Configuration = {
  ...commonConfig,
  target: 'web',
  entry: {
    react: './frontend/v2/index.tsx',
    vanilla: './frontend/v1/index.ts'
  },
  output: {
    ...commonConfig.output,
    path: resolve(__dirname, 'dist', 'frontend'),
    libraryTarget: 'this'
  },
  plugins: [
    ...(commonConfig?.plugins ?? []),
    ExtractScssPlugin,
    HtmlWebpackPlugin,
    HtmlWebpackTagsPlugin,
    CspHtmlWebpackPlugin,
    BrowserSyncPlugin as unknown as WebpackPluginInstance
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['node_modules']
  },
  module: {
    ...commonConfig?.module,
    rules: [
      ...(commonConfig?.module?.rules ?? []),
      { test: /\.scss$/, exclude: /node_modules|dist/, use: scssConfig }
    ]
  }
}

const nodeConfig: Configuration = {
  ...commonConfig,
  target: 'node',
  entry: {
    server: './backend/index.ts'
  },
  output: {
    ...commonConfig.output,
    path: resolve(__dirname, 'dist', 'backend'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules']
  }
}

export default [webConfig, nodeConfig]
