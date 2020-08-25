const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const address = require('../models/address');
const responseUtil = require('../util/responseUtil');
const addressModel = address(sequelize);

module.exports = {
	// 获取用户默认收货地址
	getUserDefaultAddress: async (req, res) => {
		try {
			let { userid } = req.query;
			let address = await addressModel.findOne({
				where: {
					userid: userid,
					is_defalut: 2,
				},
			});
			let result = responseUtil.renderFieldsObj(address, ['id', 'username', 'phone', 'sex', 'area', 'street']);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},
};
