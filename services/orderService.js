const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const order = require('../models/order');
const orderModel = order(sequelize);

module.exports = {
	// 获取店铺销售信息
	getAllSalesNum: async (req, res) => {
		try {
			let shopid = req.query.shopid;
			let orderNum = await orderModel.count({ where: { id: shopid } });
			let orderMoney = await orderModel.sum('total_price', { where: { id: shopid } });
			console.log(orderNum, orderMoney);
			res.send(resultMessage.success({ orderNum, orderMoney }));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},
};
