const accountController = require('./accountController');
const shopController = require('./shopController');
const orderController = require('./orderController');
const cabinetController = require('./cabinetController');
const clothingController = require('./clothingController');
const blillController = require('./blillController');
const versionController = require('./versionController');
const mockController = require('./mockController');
const addressController = require('./addressController');
const printerController = require('./printController');

const router = (app) => {
	// 账户相关
	app.use('/account', accountController);
	// 店铺相关
	app.use('/shop', shopController);
	// 订单相关
	app.use('/order', orderController);
	// 洗衣柜相关
	app.use('/cabinet', cabinetController);
	// 衣物相关
	app.use('/clothing', clothingController);
	// 金额相关
	app.use('/bill', blillController);
	// 打印相关
	app.use('/print', printerController);
	// 版本
	app.use('/version', versionController);
	// 地址相关
	app.use('/address', addressController);
	// mock相关
	app.use('/mock', mockController);
};
module.exports = router;
