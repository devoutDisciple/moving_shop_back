const moment = require('moment');
const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const MoneyUtil = require('../util/MoneyUtil');

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
const ObjectUtil = require('../util/ObjectUtil');
const cabinetUtil = require('../util/cabinetUtil');
const responseUtil = require('../util/responseUtil');
const orderUtil = require('../util/OrderUtil');

const PostMessage = require('../util/PostMessage');

const config = require('../config/AppConfig');

module.exports = {
	// 获取订单统计销量和总金额
	getAllSalesNum: async (req, res) => {
		try {
			const shopid = req.query.shopid;
			const orderTotalNum = await orderModel.count({ where: { shopid } });
			// const orderMoneyTotalMoney = await orderModel.sum('money', { where: { shopid, status: 5 } });
			const ordersList = await orderModel.findAll({ where: { shopid, status: 5 } });
			let orderMoneyTotalMoney = 0;
			ordersList.forEach((item) => {
				MoneyUtil.countMoney(item);
				orderMoneyTotalMoney += Number(item.payMoney);
			});
			const orderSendMoneyTotalMoney = await orderModel.sum('send_money', { where: { shopid, status: 5 } });
			const totalMoney = (Number(orderMoneyTotalMoney) + Number(orderSendMoneyTotalMoney)).toFixed(2);
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
			const shopid = req.query.shopid;
			// 店铺待收取订单
			const orderType1 = await orderModel.count({ where: { shopid, status: 1 } });
			// 清洗中订单
			const orderType2 = await orderModel.count({ where: { shopid, status: 2 } });
			// 待付款订单
			const orderType3 = await orderModel.count({ where: { shopid, status: [3, 4] } });
			// 用户未收取订单
			const orderType4 = await orderModel.count({ where: { shopid, status: [3, 4] } });
			// 已完成订单
			const orderType5 = await orderModel.count({ where: { shopid, status: 5 } });
			// 上门取衣订单
			const orderType6 = await orderModel.count({ where: { shopid, status: [6, 8] } });
			// 积分兑换订单
			const orderType7 = await orderModel.count({ where: { shopid, status: 7 } });
			// 待派送订单
			const orderType9 = await orderModel.count({ where: { shopid, status: 9 } });
			res.send(resultMessage.success({ orderType1, orderType2, orderType3, orderType4, orderType5, orderType6, orderType7, orderType9 }));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},

	// 更改订单状态
	updateOrderStatus: async (req, res) => {
		try {
			const { orderid, status } = req.body;
			await orderModel.update({ status }, { where: { id: orderid } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 分页获取订单 通过shopid
	getOrderByShopidAndPage: async (req, res) => {
		try {
			const { current = 1, pagesize = 10, shopid } = req.query;
			let { status } = req.query;
			if (Number(status) === 6) status = [6, 8];
			if (Number(status) === 3) status = [3, 4];
			if (Number(status) === 4) status = [3, 4];
			const offset = CountUtil.getInt((current - 1) * pagesize);
			const orders = await orderModel.findAll({
				where: {
					shopid,
					status,
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
			const result = responseUtil.renderFieldsAll(orders, [
				'id',
				'code',
				'userid',
				'shopid',
				'goods',
				'money',
				'desc',
				'status',
				'urgency',
				'is_sure',
				'discount',
				'create_time',
				'modify_time',
				'send_status',
				'order_type',
				'money',
				'cellid',
			]);
			result.forEach((item, index) => {
				item.create_time = moment(item.create_time).format('YYYY-MM-DD HH:mm:ss');
				if (item.modify_time) item.modify_time = moment(item.modify_time).format('YYYY-MM-DD HH:mm:ss');
				item.shopName = orders[index].shopDetail ? orders[index].shopDetail.name || '' : '';
				item.cabinetId = orders[index].cabinetDetail ? orders[index].cabinetDetail.id || '' : '';
				item.cabinetUrl = orders[index].cabinetDetail ? orders[index].cabinetDetail.url || '' : '';
				item.cabinetName = orders[index].cabinetDetail ? orders[index].cabinetDetail.name || '' : '';
				item.cabinetAdderss = orders[index].cabinetDetail ? orders[index].cabinetDetail.address || '' : '';
				item.cabinetBoxId = orders[index].cabinetDetail ? orders[index].cabinetDetail.boxid || '' : '';
				MoneyUtil.countMoney(item);
				// 上门取衣
				if (item.order_type === 2 || item.order_type === 4) {
					item.home_address = orders[index] ? orders[index].home_address || '' : '';
					item.home_username = orders[index] ? orders[index].home_username || '' : '';
					item.home_phone = orders[index] ? orders[index].home_phone || '' : '';
					item.home_time = orders[index] ? moment(orders[index].home_time).format('YYYY-MM-DD HH:mm:ss') || '' : '';
				}
				// 积分兑换
				if (item.order_type === 3) {
					item.intergral_address = orders[index] ? orders[index].intergral_address || '' : '';
					item.intergral_phone = orders[index] ? orders[index].intergral_phone || '' : '';
					item.intergral_username = orders[index] ? orders[index].intergral_username || '' : '';
					item.intergral_num = orders[index] ? orders[index].intergral_num || '' : '';
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
			const orderDetail = await orderModel.findOne({
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
			const result = responseUtil.renderFieldsObj(orderDetail, [
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
				'urgency',
				'status',
				'order_type',
				'cabinetId',
				'cellid',
				'is_sure',
				'send_status',
				'create_time',
				'modify_time',
			]);
			result.create_time = moment(result.create_time).format('YYYY-MM-DD HH:mm:ss');
			result.modify_time = result.modify_time ? moment(result.modify_time).format('YYYY-MM-DD HH:mm:ss') : '';
			result.weekDay = moment(result.create_time).day();
			result.cabinetAddress = orderDetail.cabinetDetail ? orderDetail.cabinetDetail.address : '';
			result.cabinetName = orderDetail.cabinetDetail ? orderDetail.cabinetDetail.name : '';
			result.cabinetUrl = orderDetail.cabinetDetail ? orderDetail.cabinetDetail.url : '';
			MoneyUtil.countMoney(result);
			// 上门取衣
			if (result.order_type === 2 || result.order_type === 4) {
				result.home_address = orderDetail ? orderDetail.home_address || '' : '';
				result.home_username = orderDetail ? orderDetail.home_username || '' : '';
				result.home_phone = orderDetail ? orderDetail.home_phone || '' : '';
				result.home_time = orderDetail ? moment(orderDetail.home_time).format('YYYY-MM-DD HH:mm:ss') || '' : '';
			}
			// 积分兑换
			if (result.order_type === 3) {
				result.intergral_address = orderDetail ? orderDetail.intergral_address || '' : '';
				result.intergral_phone = orderDetail ? orderDetail.intergral_phone || '' : '';
				result.intergral_username = orderDetail ? orderDetail.intergral_username || '' : '';
				result.intergral_num = orderDetail ? orderDetail.intergral_num || '' : '';
			}
			result.userDetail = {};
			result.userDetail.id = orderDetail && orderDetail.userDetail ? orderDetail.userDetail.id : '';
			result.userDetail.username = orderDetail && orderDetail.userDetail ? orderDetail.userDetail.username : '';
			result.userDetail.phone = orderDetail && orderDetail.userDetail ? orderDetail.userDetail.phone : '';
			result.userDetail.addresss = orderDetail && orderDetail.userDetail ? orderDetail.userDetail.addresss : '';
			result.userDetail.age = orderDetail && orderDetail.userDetail ? orderDetail.userDetail.age : '';
			result.userDetail.member = orderDetail && orderDetail.userDetail ? orderDetail.userDetail.member : '';
			result.userDetail.sex = orderDetail && orderDetail.userDetail ? orderDetail.userDetail.member : '';
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 打开柜子, 取出衣物
	openCellById: async (req, res) => {
		try {
			const { orderId, status, optid } = req.body;
			const orderDetail = await orderModel.findOne({
				where: { id: orderId },
			});
			const { cellid, boxid, cabinetId } = orderDetail;
			// 获取token
			let boxLoginDetail = await cabinetUtil.getToken();
			boxLoginDetail = JSON.parse(boxLoginDetail);
			const token = boxLoginDetail.data || '';
			if (!token) return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
			// 打开柜子
			const result = await cabinetUtil.openCellGet(cabinetId, boxid, cellid, token, optid);
			// 打开后可用的格子的数量
			const used = result.used;
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
			await orderModel.update({ status }, { where: { id: orderId } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 店员存放衣物 随机打开柜子
	openCellByRandomByCabinetId: async (req, res) => {
		try {
			const { cabinetId, orderId, type, status, userid } = req.body;
			// 获取token
			let boxLoginDetail = await cabinetUtil.getToken();
			boxLoginDetail = JSON.parse(boxLoginDetail);
			const token = boxLoginDetail.data || '';
			if (!token) return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
			// 打开柜子
			const result = await cabinetUtil.openCellSave(cabinetId, token, type, userid);
			if (!result) {
				return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
			}
			if (result && result.code !== 200) {
				return res.send(resultMessage.error(result.message));
			}
			// 打开后可用的格子的数量
			const used = result.used;
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
					status,
					boxid: result.boxid,
					cabinetId,
					cellid: result.data,
					modify_time: moment().format('YYYY-MM-DD HH:mm:ss'),
				},
				{ where: { id: orderId } },
			);
			res.send(resultMessage.success('success'));

			if (config.send_message_flag === 2) return;

			// 查询订单详情 , 发送信息
			const cabinetDetail = await cabinetModel.findOne({ where: { id: cabinetId } });
			const orderDetail = await orderUtil.getOrderPhoneToUser(orderId);
			if (!orderDetail.phone) return;
			// 发送存衣服通知给用户
			PostMessage.sendMessageSaveClothingToUser(orderDetail.phone, orderDetail.code, cabinetDetail.address);
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
			const { orderId, goods, totalPrice, originMoney, discount } = req.body;
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

			if (config.send_message_flag === 2) return;

			// message_sureOrderMoneyToUser
			const orderDetail = await orderUtil.getOrderPhoneToUser(orderId);
			if (!orderDetail.phone) return;
			// 发送订单金额已确定通知给用户
			PostMessage.sendMessageSureMoneyToUser(orderDetail.phone, orderDetail.code);
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 完成派送
	successSendByHomeOrder: async (req, res) => {
		try {
			const { orderid } = req.body;
			await orderModel.update({ send_home: 2, status: 3 }, { where: { id: orderid } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 店员录入订单
	addOrderByShoper: async (req, res) => {
		try {
			const { home_username, home_phone, home_address, desc, shopid, userid, urgency } = req.body;
			const code = ObjectUtil.createOrderCode();
			// 更新订单状态
			await orderModel.create({
				code,
				shopid,
				goods: '[]',
				home_username,
				home_phone,
				home_address,
				desc,
				order_type: 4,
				send_people: userid, // 是谁录入的
				is_sure: 2,
				status: 2,
				urgency,
				create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
			});
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 完成清洗 店员录入 店内下单
	complateClear: async (req, res) => {
		try {
			const { orderid } = req.body;
			await orderModel.update({ status: 4 }, { where: { id: orderid } });
			res.send(resultMessage.success('success'));

			if (config.send_message_flag === 2) return;

			const orderDetail = await orderUtil.getOrderPhoneToUser(orderid);
			if (!orderDetail.phone) return;
			PostMessage.sendMessageSuccessClearToUser(orderDetail.phone);
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 用户取到订单 店员录入 店内下单
	successOrder: async (req, res) => {
		try {
			const { orderid } = req.body;
			await orderModel.update({ status: 5 }, { where: { id: orderid } });
			res.send(resultMessage.success('success'));
			if (config.send_message_flag === 2) return;
			const orderDetail = await orderUtil.getOrderPhoneToUser(orderid);
			if (!orderDetail.phone) return;
			PostMessage.sendMessageSuccessOrderToUser(orderDetail.phone);
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 删除订单
	deleteOrder: async (req, res) => {
		try {
			const { orderid } = req.body;
			await orderModel.destroy({ where: { id: orderid } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},
};
