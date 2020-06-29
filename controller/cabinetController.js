const express = require('express');
const router = express.Router();
const cabinetService = require('../services/cabinetService');

// 根据店铺id获取洗衣柜信息
router.get('/getAllByShopId', (req, res) => {
	cabinetService.getAllByShopId(req, res);
});

module.exports = router;
