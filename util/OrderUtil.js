const sequelize = require('../dataSource/MysqlPoolClass');
const order = require('../models/order');

const orderModel = order(sequelize);
const user = require('../models/user');

const userModel = user(sequelize);
orderModel.belongsTo(userModel, { foreignKey: 'userid', targetKey: 'id', as: 'userDetail' });

module.exports = {
	// 获取订单内要给用户发信息的手机号
	getOrderPhoneToUser: async (orderid) => {
		const orderDetail = await orderModel.findOne({
			where: { id: orderid },
			include: [
				{
					model: userModel,
					as: 'userDetail',
				},
			],
		});
		let phone = '';
		if (Number(orderDetail.order_type) === 1) phone = orderDetail.userDetail.phone;
		if (Number(orderDetail.order_type) === 2) phone = orderDetail.home_phone;
		if (Number(orderDetail.order_type) === 3) phone = orderDetail.intergral_phone;
		if (Number(orderDetail.order_type) === 4) phone = orderDetail.home_phone;
		if (Number(orderDetail.order_type) === 5) phone = orderDetail.userDetail.phone;
		return { phone, code: orderDetail.code };
	},
};
