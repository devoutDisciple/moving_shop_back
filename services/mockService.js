const resultMessage = require('../util/resultMessage');

module.exports = {
	// 是否开启mock
	getMockFlag: async (req, res) => {
		try {
			// 要审核的app版本 跳转到mock页面
			let versionList = ['0.3.1'],
				flag = 1,
				{ version } = req.query;
			if (versionList.includes(version)) {
				flag = 2; // app要审核
			}
			res.send(resultMessage.success(flag));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error([]));
		}
	},
};
