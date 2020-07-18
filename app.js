const express = require('express');
const app = express();
const logger = require('morgan');
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const sessionParser = require('express-session');
const bodyParser = require('body-parser');
const controller = require('./controller/index');
const path = require('path');
const config = require('./config/AppConfig');
const EnvConfig = require('./config/Env');

// 解析cookie和session还有body
app.use(cookieParser()); // 挂载中间件，可以理解为实例化
app.use(
	sessionParser({
		secret: config.cookieSign, // 签名，与上文中cookie设置的签名字符串一致，
		cookie: {
			maxAge: 90000,
		},
		name: 'session_id', // 在浏览器中生成cookie的名称key，默认是connect.sid
	}),
);

app.use(express.static(EnvConfig.env ? '/root/asserts' : path.join(__dirname, './public')));

app.use(function (req, res, next) {
	if (req.url === '/pay/getAlipayResult') {
		req.headers['content-type'] = 'application/x-www-form-urlencoded';
	}
	next();
});

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// 打印日志
app.use(logger(':method :url :status :res[content-length] - :response-time ms'));

app.all('*', (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
	res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Credentials', true); //可以带cookies
	res.header('X-Powered-By', '3.2.1');
	next();
});

// 路由 controller层
controller(app);

// 启动服务器，监听对应的端口
// httpsServer.listen(443, () => {
// 	console.log(chalk.yellow('moving洗衣店：server is listenning 443'));
// });

// 监听3001端口
app.listen(3002, () => {
	console.log(chalk.yellow('moving商家端：server is listenning 3002'));
});
