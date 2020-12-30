const Core = require('@alicloud/pop-core');
const config = require('../config/AppConfig');

const requestOption = {
	method: 'POST',
};

const client = new Core({
	accessKeyId: config.message_accessKeyId,
	accessKeySecret: config.message_accessKeySecret,
	endpoint: config.message_endpoint,
	apiVersion: config.message_apiVersion,
});

module.exports = {
	// 发送验证信息
	postLoginMessage: (phoneNum, code) => {
		const params = {
			RegionId: 'cn-hangzhou',
			PhoneNumbers: phoneNum,
			SignName: config.message_loginyanzhengma,
			TemplateCode: config.message_loginyanzhengma,
			TemplateParam: JSON.stringify({ code }),
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				(result) => {
					console.log(JSON.stringify(result), '发送失败');
					resolve({ phoneNum, code });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 发送订单确认金额通知给用户
	sendMessageSureMoneyToUser: (phoneNum, code) => {
		const params = {
			RegionId: 'cn-hangzhou',
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.message_sureOrderMoneyToUser,
			TemplateParam: JSON.stringify({ code }),
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				() => {
					resolve({ phoneNum });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 发送存放衣物通知给用户
	sendMessageSaveClothingToUser: (phoneNum, code, address) => {
		const params = {
			RegionId: 'cn-hangzhou',
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.message_saveClothingToUser,
			TemplateParam: JSON.stringify({ code, address }),
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				() => {
					resolve({ phoneNum });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 完成清洗发送信息给用户
	sendMessageSuccessClearToUser: (phoneNum) => {
		const params = {
			RegionId: 'cn-hangzhou',
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.message_successClearToUser,
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				() => {
					resolve({ phoneNum });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 完成订单发送信息给用户
	sendMessageSuccessOrderToUser: (phoneNum) => {
		const params = {
			RegionId: 'cn-hangzhou',
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.message_successOrderToUser,
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				() => {
					resolve({ phoneNum });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 随机的验证码
	getMessageCode: () => {
		// eslint-disable-next-line
		let numArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
		let str = '';
		for (let i = 0; i < 6; i++) {
			const random = Math.floor(Math.random() * numArr.length);
			str += numArr[random];
		}
		return str;
	},
};
