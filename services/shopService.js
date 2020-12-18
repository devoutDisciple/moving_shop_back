const fs = require('fs');
const resultMessage = require('../util/resultMessage');
const responseUtil = require('../util/responseUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const AppConfig = require('../config/AppConfig');
const shop = require('../models/shop');
const ObjectUtil = require('../util/ObjectUtil');

const ShopModel = shop(sequelize);
const filePath = AppConfig.shopImgFilePath;
const shopImgUrl = AppConfig.shopImgUrl;

module.exports = {
	// 获取店铺信息
	getShopDetailById: async (req, res) => {
		try {
			const shopid = req.query.shopid;
			const shopDetail = await ShopModel.findOne({
				where: {
					id: shopid,
				},
				order: [['sort', 'DESC']],
			});
			const result = responseUtil.renderFieldsObj(shopDetail, [
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
			const { key, value, shopid } = req.body;
			const params = {};
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
			const { img, shopid } = req.body;
			const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
			// eslint-disable-next-line no-buffer-constructor
			const dataBuffer = new Buffer(base64Data, 'base64');
			const filename = `shop_${ObjectUtil.getName()}_${Date.now()}.jpg`;
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
