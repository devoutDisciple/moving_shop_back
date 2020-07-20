const express = require('express');
const router = express.Router();
const accountService = require('../services/accountService');

// 商户app端登录
router.post('/login', (req, res) => {
	accountService.login(req, res);
});

// 发送验证码 sendMessage
router.post('/sendMessage', (req, res) => {
	accountService.sendMessage(req, res);
});

module.exports = router;
