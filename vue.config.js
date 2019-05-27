module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/~mcintydeac/'
    : '/',
  outputDir: '../public_html',
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "scss",
    }
  }
};