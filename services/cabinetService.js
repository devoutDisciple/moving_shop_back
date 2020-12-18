const resultMessage = require('../util/resultMessage');
const responseUtil = require('../util/responseUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const cabinet = require('../models/cabinet');
const cabinetUtil = require('../util/cabinetUtil');

const cabinetModal = cabinet(sequelize);

module.exports = {
	// 获取洗衣柜信息
	getAllByShopId: async (req, res) => {
		try {
			const shopid = req.query.shopid;
			const cabinets = await cabinetModal.findAll({
				where: {
					shopid,
				},
				order: [['sort', 'DESC']],
			});
			const result = responseUtil.renderFieldsAll(cabinets, ['id', 'name', 'address', 'boxid', 'url', 'used', 'total']);
			result.forEach((item) => {
				const usedNum = JSON.parse(item.used).length;
				item.usedNum = usedNum;
				item.abledNum = 29 - usedNum;
				item.usedState = cabinetUtil.getBoxUsedState(item.used);
			});
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error({}));
		}
	},
};
