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

// 通过商店id获取分页数据 getOrderByShopidAndPage
router.get('/getOrderByShopidAndPage', (req, res) => {
	orderService.getOrderByShopidAndPage(req, res);
});

// 通过订单id获取订单详情 getOrderById
router.get('/getOrderById', (req, res) => {
	orderService.getOrderById(req, res);
});

// 打开指定格口的柜子
router.post('/openCellById', (req, res) => {
	orderService.openCellById(req, res);
});

module.exports = router;
