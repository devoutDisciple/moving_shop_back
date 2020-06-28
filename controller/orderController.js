const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// 根据店铺id获取店铺信息 getShopDetailById
router.get('/getShopDetailById', (req, res) => {
	orderService.getShopDetailById(req, res);
});

module.exports = router;
