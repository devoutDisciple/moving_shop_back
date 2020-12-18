const express = require('express');

const router = express.Router();
const addressService = require('../services/addressService');

// 获取用户默认收货地址
router.get('/getUserDefaultAddress', (req, res) => {
	addressService.getUserDefaultAddress(req, res);
});

module.exports = router;
