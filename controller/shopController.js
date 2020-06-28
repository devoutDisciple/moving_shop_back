const express = require('express');
const router = express.Router();
const shopService = require('../services/shopService');

// 根据店铺id获取店铺信息 getShopDetailById
router.get('/getShopDetailById', (req, res) => {
	shopService.getShopDetailById(req, res);
});

module.exports = router;
