const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const clothing = require('../models/clothing');
const ClothingModel = clothing(sequelize);
const responseUtil = require('../util/responseUtil');

module.exports = {
	// 根据商店获取衣物
	getAllByShopid: async (req, res) => {
		try {
			let shopid = req.query.shopid;
			let clothings = await ClothingModel.findAll({
				where: {
					shopid: shopid,
				},
				order: [['sort', 'DESC']],
			});
			let result = responseUtil.renderFieldsAll(clothings, ['id', 'shopid', 'name', 'price']);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 增加衣物
	add: async (req, res) => {
		let body = req.body;
		try {
			await ClothingModel.create(body);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error([]));
		}
	},

	// 删除衣物
	deleteById: async (req, res) => {
		try {
			await ClothingModel.destroy({
				where: {
					id: req.body.id,
				},
			});
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error([]));
		}
	},
};
