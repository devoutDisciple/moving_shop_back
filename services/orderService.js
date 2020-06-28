const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const order = require('../models/order');
const orderModel = order(sequelize);

module.exports = {
	// 获取订单统计销量和总金额
	getAllSalesNum: async (req, res) => {
		try {
			let shopid = req.query.shopid;
			let orderTotalNum = await orderModel.count({ where: { shopid: shopid } });
			let orderTotalMoney = await orderModel.sum('money', { where: { shopid: shopid, status: 5 } });
			console.log(orderTotalNum, orderTotalMoney);
			res.send(resultMessage.success({ orderTotalNum, orderTotalMoney }));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},
};
