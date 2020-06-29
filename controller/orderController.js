const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// 获取订单统计销量和总金额
router.get('/getAllSalesNum', (req, res) => {
	orderService.getAllSalesNum(req, res);
});

// 获取订单分类数量
router.get('/getAllOrderNumByType', (req, res) => {
	orderService.getAllOrderNumByType(req, res);
});

module.exports = router;
