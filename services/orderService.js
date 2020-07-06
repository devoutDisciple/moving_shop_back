const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const order = require('../models/order');
const orderModel = order(sequelize);

const cabinet = require('../models/cabinet');
const cabinetModel = cabinet(sequelize);
orderModel.belongsTo(cabinetModel, { foreignKey: 'cabinetId', targetKey: 'id', as: 'cabinetDetail' });

const shop = require('../models/shop');
const shopModel = shop(sequelize);
orderModel.belongsTo(shopModel, { foreignKey: 'shopid', targetKey: 'id', as: 'shopDetail' });

const user = require('../models/user');
const userModel = user(sequelize);
orderModel.belongsTo(userModel, { foreignKey: 'userid', targetKey: 'id', as: 'userDetail' });

const CountUtil = require('../util/CountUtil');
const responseUtil = require('../util/responseUtil');
const moment = require('moment');
const cabinetUtil = require('../util/cabinetUtil');

module.exports = {
	// 获取订单统计销量和总金额
	getAllSalesNum: async (req, res) => {
		try {
			let shopid = req.query.shopid;
			let orderTotalNum = await orderModel.count({ where: { shopid: shopid } });
			let orderTotalMoney = await orderModel.sum('money', { where: { shopid: shopid, status: 5 } });
			console.log(orderTotalNum, orderTotalMoney);
			res.send(resultMessage.success({ orderTotalNum, orderTotalMoney }));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},

	// 获取订单分类数量
	// 1-存储在柜子 2-店员取货，清洗中 3-待付款 4-待取货 5-已完成 6-预约上门等待店员取货 7-积分兑换
	getAllOrderNumByType: async (req, res) => {
		try {
			let shopid = req.query.shopid;
			// 店铺待收取订单
			let orderType1 = await orderModel.count({ where: { shopid: shopid, status: 1 } });
			// 清洗中订单
			let orderType2 = await orderModel.count({ where: { shopid: shopid, status: 2 } });
			// 待付款订单
			let orderType3 = await orderModel.count({ where: { shopid: shopid, status: 3 } });
			// 用户未收取订单
			let orderType4 = await orderModel.count({ where: { shopid: shopid, status: 4 } });
			// 已完成订单
			let orderType5 = await orderModel.count({ where: { shopid: shopid, status: 5 } });
			// 上门取衣订单
			let orderType6 = await orderModel.count({ where: { shopid: shopid, status: 6 } });
			// 积分兑换订单
			let orderType7 = await orderModel.count({ where: { shopid: shopid, status: 7 } });
			res.send(resultMessage.success({ orderType1, orderType2, orderType3, orderType4, orderType5, orderType6, orderType7 }));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},

	// 更改订单状态
	updateOrderStatus: async (req, res) => {
		try {
			let { orderid, status } = req.body;
			await orderModel.update({ status: status }, { where: { id: orderid } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 分页获取订单 通过shopid
	getOrderByShopidAndPage: async (req, res) => {
		try {
			let { current = 1, pagesize = 10, shopid, status } = req.query;
			let offset = CountUtil.getInt((current - 1) * pagesize);
			let orders = await orderModel.findAll({
				where: {
					shopid: shopid,
					status: status,
				},
				include: [
					{
						model: userModel,
						as: 'userDetail',
					},
					{
						model: cabinetModel,
						as: 'cabinetDetail',
					},
				],
				order: [['create_time', 'DESC']],
				limit: Number(pagesize),
				offset: Number(offset),
			});
			let result = responseUtil.renderFieldsAll(orders, [
				'id',
				'code',
				'userid',
				'shopid',
				'goods',
				'money',
				'desc',
				'status',
				'is_sure',
				'create_time',
				'order_type',
				'money',
				'cellid',
			]);
			result.forEach((item, index) => {
				item.create_time = moment(item.create_time).format('YYYY-MM-DD HH:mm:ss');
				item.shopName = orders[index]['shopDetail'] ? orders[index]['shopDetail']['name'] || '' : '';
				// 快递柜下单
				if (item.order_type === 1) {
					item.cabinetId = orders[index]['cabinetDetail'] ? orders[index]['cabinetDetail']['id'] || '' : '';
					item.cabinetUrl = orders[index]['cabinetDetail'] ? orders[index]['cabinetDetail']['url'] || '' : '';
					item.cabinetName = orders[index]['cabinetDetail'] ? orders[index]['cabinetDetail']['name'] || '' : '';
					item.cabinetAdderss = orders[index]['cabinetDetail'] ? orders[index]['cabinetDetail']['address'] || '' : '';
					item.cabinetBoxId = orders[index]['cabinetDetail'] ? orders[index]['cabinetDetail']['boxid'] || '' : '';
				}
				//上门取衣
				if (item.order_type === 2) {
					item.home_address = orders[index] ? orders[index]['home_address'] || '' : '';
					item.home_username = orders[index] ? orders[index]['home_username'] || '' : '';
					item.home_phone = orders[index] ? orders[index]['home_phone'] || '' : '';
					item.home_time = orders[index] ? moment(orders[index]['home_time']).format('YYYY-MM-DD HH:mm:ss') || '' : '';
				}
				// 积分兑换
				if (item.order_type === 3) {
					item.intergral_address = orders[index] ? orders[index]['intergral_address'] || '' : '';
					item.intergral_phone = orders[index] ? orders[index]['intergral_phone'] || '' : '';
					item.intergral_username = orders[index] ? orders[index]['intergral_username'] || '' : '';
					item.intergral_num = orders[index] ? orders[index]['intergral_num'] || '' : '';
				}
			});
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 获取某个订单详情
	getOrderById: async (req, res) => {
		try {
			let order = await orderModel.findOne({
				where: {
					id: req.query.id,
				},
				include: [
					{
						model: cabinetModel,
						as: 'cabinetDetail',
					},
					{
						model: userModel,
						as: 'userDetail',
					},
				],
			});
			let result = responseUtil.renderFieldsObj(order, [
				'id',
				'code',
				'boxid',
				'shopid',
				'goods',
				'money',
				'pre_pay',
				'send_money',
				'desc',
				'status',
				'order_type',
				'cabinetId',
				'cellid',
				'is_sure',
				'create_time',
			]);
			result.create_time = moment(result.create_time).format('YYYY-MM-DD HH:mm:ss');
			if (result.order_type === 1) {
				result.cabinetAddress = order.cabinetDetail ? order.cabinetDetail.address : '';
				result.cabinetUrl = order.cabinetDetail ? order.cabinetDetail.url : '';
			}
			//上门取衣
			if (result.order_type === 2) {
				result.home_address = order ? order['home_address'] || '' : '';
				result.home_username = order ? order['home_username'] || '' : '';
				result.home_phone = order ? order['home_phone'] || '' : '';
				result.home_time = order ? moment(order['home_time']).format('YYYY-MM-DD HH:mm:ss') || '' : '';
			}
			// 积分兑换
			if (result.order_type === 3) {
				result.intergral_address = order ? order['intergral_address'] || '' : '';
				result.intergral_phone = order ? order['intergral_phone'] || '' : '';
				result.intergral_username = order ? order['intergral_username'] || '' : '';
				result.intergral_num = order ? order['intergral_num'] || '' : '';
			}
			result.userDetail = {};
			result.userDetail.username = order && order['userDetail'] ? order.userDetail.username : '';
			result.userDetail.phone = order && order['userDetail'] ? order.userDetail.phone : '';
			result.userDetail.addresss = order && order['userDetail'] ? order.userDetail.addresss : '';
			result.userDetail.age = order && order['userDetail'] ? order.userDetail.age : '';
			result.userDetail.member = order && order['userDetail'] ? order.userDetail.member : '';
			result.userDetail.sex = order && order['userDetail'] ? order.userDetail.member : '';
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 打开柜子
	openCellById: async (req, res) => {
		try {
			let { orderId, status } = req.body;
			let order = await orderModel.findOne({
				where: { id: orderId },
			});
			let { cellid, boxid, cabinetId } = order;
			// 获取token
			let boxLoginDetail = await cabinetUtil.getToken();
			boxLoginDetail = JSON.parse(boxLoginDetail);
			let token = boxLoginDetail.data || '';
			if (!token) return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
			// 打开柜子
			let result = await cabinetUtil.openCellGet(cabinetId, boxid, cellid, token);
			// 打开后可用的格子的数量
			let used = result.used;
			// 更新可用格子状态
			await cabinetModel.update(
				{ used: JSON.stringify(used) },
				{
					where: {
						id: cabinetId,
					},
				},
			);
			// 更新订单状态
			await orderModel.update({ status: status }, { where: { id: orderId } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 店员存放衣物 随机打开柜子
	openCellByRandomByCabinetId: async (req, res) => {
		try {
			let { cabinetId, orderId, type } = req.body;
			// 获取token
			let boxLoginDetail = await cabinetUtil.getToken();
			boxLoginDetail = JSON.parse(boxLoginDetail);
			let token = boxLoginDetail.data || '';
			if (!token) return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
			// 打开柜子
			let result = await cabinetUtil.openCellSave(cabinetId, token, type);
			// 打开后可用的格子的数量
			let used = result.used;
			// 更新可用格子状态
			await cabinetModel.update(
				{ used: JSON.stringify(used) },
				{
					where: {
						id: cabinetId,
					},
				},
			);
			// 更新订单状态
			await orderModel.update(
				{
					status: status,
					boxid: result.boxid,
					cabinetId: cabinetId,
					cellid: result.cellid,
					modify_time: moment().format('YYYY-MM-DD HH:mm:ss'),
				},
				{ where: { id: orderId } },
			);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 店员确定订单
	sureOrder: async (req, res) => {
		try {
			let { orderId, goods, totalPrice } = req.body;
			// 更新订单状态
			await orderModel.update(
				{
					goods: JSON.stringify(goods),
					money: totalPrice,
					is_sure: 2,
				},
				{ where: { id: orderId } },
			);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},
};
