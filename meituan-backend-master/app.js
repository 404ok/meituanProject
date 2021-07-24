import express from 'express';
import './mongodb/db.js';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
// 服务端保存登录信息的中间件
import session from 'express-session';
import connectMongo from 'connect-mongo';
// 使用该中间件不需要再对请求头中的数据类型进行判断再处理，直接调用他的方法就可以处理
import bodyParser from 'body-parser'
import multer from 'multer';
// import history from 'connect-history-api-fallback';
import config from './config'
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, 'public'))); // 1.可通过访问后端服务器+public下的文件地址，直接访问到这些文件2.引用path的目的是避免启动文件路径发生改变，写的是绝对路径

// 设置上传的图片存储的位置以及文件名称
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload_imgs')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
});

let upload = multer({storage: storage});

// all代表请求可以是get、post、options
app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies
  res.header("X-Powered-By", '3.2.1');
  res.header("Cache-Control", "public,max-age=60000");
  // 任何请求之前有一个预请求，预请求后无其他回调处理，其他请求要进入下一个回调
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

const MongoStore = connectMongo(session);
// 对get请求类型的参数，按照这个格式去解析
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json({}));
// 解析cookie的数据类型
app.use(cookieParser());
app.use(session({
  name: 'mt-session',
  secret: 'meituan',
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  },
  store: new MongoStore({
    url: config.sessionStorageURL
  })
}));
router(app);
// app.use(history());
console.log('*********************************')
console.log(`service start on ${config.port}`)
console.log('*********************************')
app.listen(config.port);

module.exports = app;
