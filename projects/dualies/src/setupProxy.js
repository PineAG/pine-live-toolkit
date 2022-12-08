const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = function (app) {
    app.use(
      '/api',
      createProxyMiddleware("/api", {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/api":"/"
        }
      }),
    );
  };