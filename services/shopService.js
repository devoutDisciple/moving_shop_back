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
			let result = responseUtil.renderFieldsObj(shop, [
				'id',
				'name',
				'manager',
				'phone',
				'address',
				'longitude',
				'latitude',
				'key',
				'sn',
				'sort',
				'desc',
			]);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},

	updateShopDetail: async (req, res) => {
		try {
			let { key, value, shopid } = req.body,
				params = {};
			params[key] = value;
			await ShopModel.update(params, {
				where: {
					id: shopid,
				},
			});
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},
};
