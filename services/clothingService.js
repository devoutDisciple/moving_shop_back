const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const clothing = require('../models/clothing');

const ClothingModel = clothing(sequelize);
const responseUtil = require('../util/responseUtil');

module.exports = {
	// 根据商店获取衣物
	getAllByShopid: async (req, res) => {
		try {
			const shopid = req.query.shopid;
			const clothings = await ClothingModel.findAll({
				where: { shopid },
				order: [['sort', 'DESC']],
			});
			const result = responseUtil.renderFieldsAll(clothings, ['id', 'shopid', 'typeid', 'name', 'price', 'sort']);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 增加衣物
	add: async (req, res) => {
		const body = req.body;
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
		const { id } = req.query;
		try {
			const detail = await ClothingModel.findOne({ where: { id } });
			const result = responseUtil.renderFieldsObj(detail, ['id', 'shopid', 'typeid', 'name', 'price', 'sort']);
			result.sort = String(result.sort);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error([]));
		}
	},

	// 更改衣物详情
	updateClothing: async (req, res) => {
		const { data } = req.body;
		try {
			await ClothingModel.update(
				{
					name: data.name,
					typeid: data.typeid,
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
