const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const bill = require('../models/bill');

const billModel = bill(sequelize);

module.exports = {
	// 查看店铺支付总金额
	getAllMoneyByShopid: async (req, res) => {
		try {
			const { shopid } = req.query;
			const totalMoney = await billModel.sum('money', { where: { shopid } });
			res.send(resultMessage.success(totalMoney));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error([]));
		}
	},
};
