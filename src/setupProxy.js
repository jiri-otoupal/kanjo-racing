const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/backend',
        createProxyMiddleware({
            target: 'http://' + window.location.hostname + ':9000',
            changeOrigin: true,
        })
    );
};