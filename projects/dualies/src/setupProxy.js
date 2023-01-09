const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = function (app) {
    app.use(
      '/api/',
      createProxyMiddleware("/api/", {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true,
        // pathRewrite: {
        //   "^/api/":"/"
        // }
      }),
    );
  };