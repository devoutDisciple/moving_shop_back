const resultMessage = require('../util/resultMessage');
const responseUtil = require('../util/responseUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const shop = require('../models/shop');
const ShopModel = shop(sequelize);

module.exports = {
	// 获取店铺信息
	getShopDetailById: async (req, res) => {
		try {
			let shopid = req.query.shopid;
			let shop = await ShopModel.findOne({
				where: {
					id: shopid,
				},
				order: [['sort', 'DESC']],
			});
			let result = responseUtil.renderFieldsObj(shop, ['id', 'name', 'manager', 'phone', 'address', 'longitude', 'latitude', 'sort', 'desc']);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},
};
