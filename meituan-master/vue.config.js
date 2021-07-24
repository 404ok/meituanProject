const path = require('path');
// _dirname 总是指向被执行 js 文件的绝对路径,也就是说你在E:\vue-meituan\vue.config.js中写__dirname那么路径就是E:\vue-meituan
// reslove('src') : 指向 E:\vue-meituan\src
function resolve(dir) {
    return path.join(__dirname, dir);
}
module.exports = {
    lintOnSave: true,  // true 开启每次保存都进行检测，效果与warning一样
    devServer: {
        open: true,                                 //配置自动启动浏览器
        host: '127.0.0.1',
        port: 8080,                                 // 端口号
        https: false,
        hotOnly: false,                             // https:{type:Boolean}                             // 配置跨域处理,只有一个代理
    },
    // 配置路径简写： E:\vue-meituan\src == @
    chainWebpack: (config) => {
        config.resolve.alias
            .set('@', resolve('src'))
            .set('@assets',resolve('src/assets'))
    }
};
