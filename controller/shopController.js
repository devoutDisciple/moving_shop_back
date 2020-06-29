const express = require('express');
const router = express.Router();
const shopService = require('../services/shopService');

// 根据店铺id获取店铺信息
router.get('/getShopDetailById', (req, res) => {
	shopService.getShopDetailById(req, res);
});

// 更新店铺信息
router.post('/updateShopDetail', (req, res) => {
	shopService.updateShopDetail(req, res);
});

module.exports = router;
