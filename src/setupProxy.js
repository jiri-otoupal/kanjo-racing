const {createProxyMiddleware} = require('http-proxy-middleware');
const {pre_url} = require("./config");

module.exports = function (app) {
    const target = pre_url + window.location.hostname + ':9000';
    app.use(
        '/backend',
        createProxyMiddleware({
            target: target,
            changeOrigin: true,
        })
    );
};