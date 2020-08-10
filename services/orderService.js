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

const moment = require('moment');
const CountUtil = require('../util/CountUtil');
const ObjectUtil = require('../util/ObjectUtil');
const cabinetUtil = require('../util/cabinetUtil');
const responseUtil = require('../util/responseUtil');

const PostMessage = require('../util/PostMessage');

module.exports = {
	// 获取订单统计销量和总金额
	getAllSalesNum: async (req, res) => {
		try {
			let shopid = req.query.shopid;
			let orderTotalNum = await orderModel.count({ where: { shopid: shopid } });
			let orderMoneyTotalMoney = await orderModel.sum('money', { where: { shopid: shopid, status: 5 } });
			let orderSendMoneyTotalMoney = await orderModel.sum('send_money', { where: { shopid: shopid, status: 5 } });
			let totalMoney = (Number(orderMoneyTotalMoney) + Number(orderSendMoneyTotalMoney)).toFixed(2);
			console.log(orderMoneyTotalMoney, orderSendMoneyTotalMoney);
			res.send(resultMessage.success({ orderTotalNum, totalMoney }));
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
			let orderType3 = await orderModel.count({ where: { shopid: shopid, status: [3, 4] } });
			// 用户未收取订单
			let orderType4 = await orderModel.count({ where: { shopid: shopid, status: [3, 4] } });
			// 已完成订单
			let orderType5 = await orderModel.count({ where: { shopid: shopid, status: 5 } });
			// 上门取衣订单
			let orderType6 = await orderModel.count({ where: { shopid: shopid, status: [6, 8] } });
			// 积分兑换订单
			let orderType7 = await orderModel.count({ where: { shopid: shopid, status: 7 } });
			// 待派送订单
			let orderType9 = await orderModel.count({ where: { shopid: shopid, status: 9 } });
			res.send(resultMessage.success({ orderType1, orderType2, orderType3, orderType4, orderType5, orderType6, orderType7, orderType9 }));
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
			if (status == 6) status = [6, 8];
			if (status == 3) status = [3, 4];
			if (status == 4) status = [3, 4];
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
				if (item.order_type === 2 || item.order_type === 4) {
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
				'origin_money',
				'money',
				'pre_pay',
				'send_money',
				'discount',
				'desc',
				'status',
				'order_type',
				'cabinetId',
				'cellid',
				'is_sure',
				'create_time',
			]);
			result.create_time = moment(result.create_time).format('YYYY-MM-DD HH:mm:ss');
			result.weekDay = moment(result.create_time).day();
			if (result.order_type === 1) {
				result.cabinetAddress = order.cabinetDetail ? order.cabinetDetail.address : '';
				result.cabinetUrl = order.cabinetDetail ? order.cabinetDetail.url : '';
			}
			//上门取衣
			if (result.order_type === 2 || result.order_type === 4) {
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
			let { orderId, status, optid } = req.body;
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
			let result = await cabinetUtil.openCellGet(cabinetId, boxid, cellid, token, optid);
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
			let { cabinetId, orderId, type, status, userid } = req.body;
			// 获取token
			let boxLoginDetail = await cabinetUtil.getToken();
			boxLoginDetail = JSON.parse(boxLoginDetail);
			let token = boxLoginDetail.data || '';
			if (!token) return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
			// 打开柜子
			let result = await cabinetUtil.openCellSave(cabinetId, token, type, userid);
			if (!result) {
				return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
			}
			if (result && result.code !== 200) {
				return res.send(resultMessage.error(result.message));
			}
			// 打开后可用的格子的数量
			let used = result.used;
			console.log(used);
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
			// 查询订单详情 , 发送信息
			let cabinetDetail = await cabinetModel.findOne({ where: { id: cabinetId } });
			let orderDetail = await orderModel.findOne({
				where: { id: orderId },
				include: [
					{
						model: userModel,
						as: 'userDetail',
					},
				],
			});
			let phone = '';
			if (orderDetail.order_type == 1) phone = orderDetail.userDetail.phone;
			if (orderDetail.order_type == 2) phone = orderDetail.home_phone;
			if (orderDetail.order_type == 3) phone = orderDetail.intergral_phone;
			if (!phone) return;
			PostMessage.sendMessageSaveClothingToUser(phone, orderDetail.code, cabinetDetail.address);
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 店员确定订单
	sureOrder: async (req, res) => {
		try {
			// originMoney: originPrice,
			// discount: discount,
			let { orderId, goods, totalPrice, originMoney, discount } = req.body;
			// 更新订单状态
			await orderModel.update(
				{
					goods: JSON.stringify(goods),
					money: totalPrice,
					is_sure: 2,
					origin_money: originMoney,
					discount,
				},
				{ where: { id: orderId } },
			);
			res.send(resultMessage.success('success'));
			// message_sureOrderMoneyToUser
			let order = await orderModel.findOne({
				where: { id: orderId },
				include: [
					{
						model: userModel,
						as: 'userDetail',
					},
				],
			});
			let phone = '';
			if (order.order_type == 1) phone = order.userDetail.phone;
			if (order.order_type == 2) phone = order.home_phone;
			if (order.order_type == 3) phone = order.intergral_phone;
			if (!phone) return;
			PostMessage.sendMessageSureMoneyToUser(phone, order.code);
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 店员录入订单
	addOrderByShoper: async (req, res) => {
		try {
			let { home_username, home_phone, home_address, money, desc, shopid, userid } = req.body;
			let code = ObjectUtil.createOrderCode();
			// 更新订单状态
			await orderModel.create({
				code,
				shopid,
				goods: '[]',
				home_username,
				home_phone,
				home_address,
				desc,
				money,
				order_type: 4,
				send_people: userid, // 是谁录入的
				is_sure: 2,
				status: 2,
				create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
			});
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},
};
