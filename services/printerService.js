const resultMessage = require('../util/resultMessage');
const PrintUtil = require('../util/PrintUtil');

module.exports = {
	// 打印订单
	printOrder: async (req, res) => {
		try {
			let { orderid } = req.body;
			await PrintUtil.printOrderByOrderId(orderid);
			res.send(resultMessage.success('true'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error([]));
		}
	},
};
