const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    host: 'localhost',
    port: 8081,
    proxy: {
      '/api/v1/rsc': {
        target: 'http://127.0.0.1:8081',
        ws: true,
        changeOrigin: true
      }
    }
  },
  transpileDependencies: true
})
