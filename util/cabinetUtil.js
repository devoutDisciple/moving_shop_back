const md5 = require('md5');
const moment = require('moment');
const request = require('request');
const config = require('../config/AppConfig');
const sequelize = require('../dataSource/MysqlPoolClass');
const ObjectUtil = require('./ObjectUtil');
const cabinet = require('../models/cabinet');

const CabinetModel = cabinet(sequelize);
const except = require('../models/exception');

const exceptionModel = except(sequelize);
const saveException = async (result, userid, boxid, cabinetid, cellid) => {
	try {
		const data = JSON.parse(result);
		let flag = 2; // 默认失败
		if (data && data.code === 200) {
			flag = 1;
		}
		exceptionModel.create({
			success: flag,
			result,
			optid: userid,
			user_type: 1,
			boxid,
			cabinetid,
			cellid,
			create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
		});
	} catch (error) {
		exceptionModel.create({
			success: 2,
			result: String(result),
			optid: userid,
			user_type: 1,
			boxid,
			cabinetid,
			cellid,
			create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
		});
	}
};

module.exports = {
	// 获取token
	getToken: () => {
		return new Promise((resolve, reject) => {
			try {
				request(
					{
						url: config.box_login_url,
						method: 'POST',
						form: { userid: config.box_userid, password: config.box_password },
					},
					function (error, response, body) {
						if (error) return reject(body);
						resolve(body);
					},
				);
			} catch (error) {
				console.log(error);
				reject(error);
			}
		});
	},

	// 查看柜体状态
	getState: async (token, boxid) => {
		return new Promise((resolve, reject) => {
			try {
				const params = {
					mtype: config.box_mtype,
					boxid,
					mtoken: token,
					time: moment().format('YYYY-MM-DD HH:mm:ss'),
					skey: config.box_skey,
				};
				const str = md5(params.boxid + params.time + params.skey).toLowerCase();
				params.sign = str;
				request(
					{
						url: config.box_getState_url,
						method: 'POST',
						headers: params,
						form: { boxid },
					},
					function (error, response, body) {
						if (error) return reject(body);
						resolve(body);
					},
				);
			} catch (error) {
				console.log(error);
				reject(error);
			}
		});
	},

	// 存放衣物打开柜子
	openCellSave: (cabinetId, token, type, userid) => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await CabinetModel.findOne({
					where: {
						id: cabinetId,
					},
				});
				const boxid = data.boxid;
				const used = JSON.parse(data.used);
				const allBox = type === 'smallBox' ? config.box_samll_num : config.box_big_num;
				const emptyCell = [];
				allBox.forEach((item) => {
					if (!used.includes(item)) emptyCell.push(item);
				});
				if (emptyCell.length === 0)
					return resolve({
						code: 500,
						success: false,
						data: '暂无格口可用',
						message: '暂无格口可用',
					});
				const cellid = emptyCell[0];
				const params = {
					mtype: config.box_mtype,
					boxid,
					mtoken: token,
					time: moment().format('YYYY-MM-DD HH:mm:ss'),
					skey: config.box_skey,
					cellid,
				};
				const str = md5(params.boxid + params.cellid + params.time + params.skey).toLowerCase();
				params.sign = str;
				request(
					{
						url: config.box_open_url,
						method: 'POST',
						headers: params,
						form: { boxid, cellid },
					},
					(error, response, body) => {
						// {"code":400,"message":"BUSY","value":0,"data":null} 错误
						// let data = '{ "code": 200, "message": "No Box Information" }'; // 测试环境
						console.log(body);
						saveException(body, userid, boxid, cabinetId, cellid);
						if (error) {
							console.log(error, ' ---网络错误');
							return reject(body);
						}
						const result = JSON.parse(body);
						if (result && result.code === 200) {
							used.push(cellid);
							return resolve({ code: 200, success: true, data: cellid, used, boxid });
						}
						console.log(body, ' ---打开格口失败');
						return reject({ code: 400, success: false, message: '打开格子失败，请稍后重试' });
					},
				);
			} catch (error) {
				console.log(error);
				reject({ code: 400, success: false, message: '打开格子失败，请稍后重试' });
			}
		});
	},

	// 取出衣物
	openCellGet: (cabinetId, boxid, cellid, token, userid) => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await CabinetModel.findOne({
					where: {
						id: cabinetId,
					},
				});
				let used = JSON.parse(data.used);
				const params = {
					mtype: config.box_mtype,
					boxid,
					mtoken: token,
					time: moment().format('YYYY-MM-DD HH:mm:ss'),
					skey: config.box_skey,
					cellid,
				};
				const str = md5(params.boxid + params.cellid + params.time + params.skey).toLowerCase();
				params.sign = str;
				request(
					{
						url: config.box_open_url,
						method: 'POST',
						headers: params,
						form: { boxid, cellid },
					},
					(error, response, body) => {
						// {"code":400,"message":"BUSY","value":0,"data":null} 错误
						// let data = '{ "code": 200, "message": "No Box Information" }'; // 测试环境
						console.log(body);
						saveException(body, userid, boxid, cabinetId, cellid);
						if (error) return reject(body);
						const result = JSON.parse(body);
						if (result && result.code === 200) {
							used = ObjectUtil.arrRemove(used, cellid);
							return resolve({ code: 200, success: true, data: cellid, used });
						}
						return reject({ code: 400, success: false, message: '打开格子失败，请稍后重试' });
					},
				);
			} catch (error) {
				console.log(error);
				reject({ code: 400, success: false, message: '打开格子失败，请稍后重试' });
			}
		});
	},

	// 获取可用格子
	getBoxUsedState: (usedArr) => {
		const { box_big_num, box_samll_num } = config;
		let big_box_used_num = 0;
		let small_box_empty_num = 0;
		box_big_num.forEach((item) => {
			if (usedArr.includes(item)) big_box_used_num++;
		});
		box_samll_num.forEach((item) => {
			if (usedArr.includes(item)) small_box_empty_num++;
		});
		return {
			bigBox: {
				used: big_box_used_num,
				empty: box_big_num.length - big_box_used_num,
			},
			samllBox: {
				used: small_box_empty_num,
				empty: box_samll_num.length - small_box_empty_num,
			},
		};
	},
};
