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

	// 获取订单分类数量
	// 1-存储在柜子 2-店员取货，清洗中 3-待付款 4-待取货 5-已完成 6-预约上门等待店员取货 7-积分兑换
	getAllOrderNumByType: async (req, res) => {
		try {
			let shopid = req.query.shopid;
			// 店铺待收取订单
			let orderType1 = await orderModel.count({ where: { shopid: shopid, status: 1 } });
			// 清洗中订单
			let orderType2 = await orderModel.count({ where: { shopid: shopid, status: 2 } });
			// 待付款订单
			let orderType3 = await orderModel.count({ where: { shopid: shopid, status: 3 } });
			// 用户未收取订单
			let orderType4 = await orderModel.count({ where: { shopid: shopid, status: 4 } });
			// 已完成订单
			let orderType5 = await orderModel.count({ where: { shopid: shopid, status: 5 } });
			// 上门取衣订单
			let orderType6 = await orderModel.count({ where: { shopid: shopid, status: 6 } });
			// 积分兑换订单
			let orderType7 = await orderModel.count({ where: { shopid: shopid, status: 7 } });
			res.send(resultMessage.success({ orderType1, orderType2, orderType3, orderType4, orderType5, orderType6, orderType7 }));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},
};
