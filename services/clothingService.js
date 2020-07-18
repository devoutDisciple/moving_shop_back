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
			let result = responseUtil.renderFieldsAll(clothings, ['id', 'shopid', 'name', 'price', 'sort']);
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

	// 获取衣物详情
	getDetailById: async (req, res) => {
		let { id } = req.query;
		try {
			let detail = await ClothingModel.findOne({ where: { id: id } });
			let result = responseUtil.renderFieldsObj(detail, ['id', 'shopid', 'name', 'price', 'sort']);
			result.sortNum = String(result.sort);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error([]));
		}
	},

	// 更改衣物详情
	updateClothing: async (req, res) => {
		let { data } = req.body;
		try {
			await ClothingModel.update(
				{
					name: data.name,
					price: data.price,
					sort: data.sort,
				},
				{
					where: {
						id: data.id,
					},
				},
			);
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
