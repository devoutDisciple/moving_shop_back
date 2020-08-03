const fs = require('fs');
const resultMessage = require('../util/resultMessage');
const responseUtil = require('../util/responseUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const AppConfig = require('../config/AppConfig');
const shop = require('../models/shop');
const ObjectUtil = require('../util/ObjectUtil');
const ShopModel = shop(sequelize);
let filePath = AppConfig.shopImgFilePath;
let shopImgUrl = AppConfig.shopImgUrl;

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
				'url',
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

	addPhoto: async (req, res) => {
		try {
			let { img, shopid } = req.body;
			var base64Data = img.replace(/^data:image\/\w+;base64,/, '');
			var dataBuffer = new Buffer(base64Data, 'base64');
			let filename = 'shop_' + ObjectUtil.getName() + '_' + Date.now() + '.jpg';
			await fs.writeFileSync(`${filePath}/${filename}`, dataBuffer);
			await ShopModel.update(
				{ url: `${shopImgUrl + filename}` },
				{
					where: {
						id: shopid,
					},
				},
			);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},
};
