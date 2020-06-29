const accountController = require('./accountController');
const shopController = require('./shopController');
const orderController = require('./orderController');
const cabinetController = require('./cabinetController');

const router = (app) => {
	// 账户相关
	app.use('/account', accountController);
	// 店铺相关
	app.use('/shop', shopController);
	// 订单相关
	app.use('/order', orderController);
	// 洗衣柜相关
	app.use('/cabinet', cabinetController);
};
module.exports = router;
