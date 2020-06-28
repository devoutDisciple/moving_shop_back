const express = require('express');
const router = express.Router();
const goodsService = require('../services/accountService');

// 商户app端登录
router.post('/login', (req, res) => {
	goodsService.login(req, res);
});

module.exports = router;
