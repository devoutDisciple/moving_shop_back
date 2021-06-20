module.exports = {
	// 200 成功
	// 500 系统错误
	// 400 指定错误
	// 401 没有登录 或者 登录超时
	success: (data) => {
		const resData = { code: 200, success: true, data };
		console.info('请求成功');
		return resData;
	},
	error: (err) => {
		const resData = { code: 500, success: false, message: err.message || err };
		console.info(`请求错误：data: ${JSON.stringify(resData)}`);
		return resData;
	},
	errorMsg: (data) => {
		const resData = { code: 400, success: false, message: data };
		console.info(`请求错误：data: ${JSON.stringify(resData)}`);
		return resData;
	},
	loginError: (data) => {
		const resData = { code: 401, success: false, message: data || '请重新登录!' };
		console.info(`重新登录：data: ${JSON.stringify(resData)}`);
		return resData;
	},
	specilError: (code, data) => {
		const resData = { code, success: false, message: data };
		console.info(`重新登录：data: ${JSON.stringify(resData)}`);
		return resData;
	},
};
