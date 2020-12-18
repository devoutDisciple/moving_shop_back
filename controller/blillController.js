const express = require('express');

const router = express.Router();
const billService = require('../services/billService');

// 查看店铺支付总金额
router.get('/getAllMoneyByShopid', (req, res) => {
	billService.getAllMoneyByShopid(req, res);
});

module.exports = router;
