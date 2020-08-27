const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const account = require('../models/account');
const accountModel = account(sequelize);
const shop = require('../models/shop');
const shopModel = shop(sequelize);
accountModel.belongsTo(shopModel, { foreignKey: 'shopid', targetKey: 'id', as: 'shopDetail' });
const PostMessage = require('../util/PostMessage');

module.exports = {
	// 用户登录
	login: async (req, res) => {
		try {
			let { username, password } = req.body;
			let user = await accountModel.findOne({
				where: {
					username: username,
				},
				include: [
					{
						model: shopModel,
						as: 'shopDetail',
					},
				],
			});
			if (!user || password != user.password) return res.send(resultMessage.error('用户名或密码错误!'));
			res.send(
				resultMessage.success({
					id: user.id,
					username: user.username,
					shopid: user.shopid,
					role: user.role,
				}),
			);
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error([]));
		}
	},

	// 发送登录验证码
	sendMessage: async (req, res) => {
		try {
			let { phoneNum } = req.body;
			let code = PostMessage.getMessageCode();
			// 发送验证码
			await PostMessage.postLoginMessage(phoneNum, code);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},
};
