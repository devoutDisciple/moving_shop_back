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

// 通过商店id获取分页数据
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

// 店员确定订单
router.post('/sureOrder', (req, res) => {
	orderService.sureOrder(req, res);
});

// 店员存放衣物 随机打开柜子
router.post('/openCellByRandomByCabinetId', (req, res) => {
	orderService.openCellByRandomByCabinetId(req, res);
});

// 更改衣物状态
router.post('/updateOrderStatus', (req, res) => {
	orderService.updateOrderStatus(req, res);
});

// 店员录入订单 addOrderByShoper
router.post('/addOrderByShoper', (req, res) => {
	orderService.addOrderByShoper(req, res);
});

// 完成派送 上门取衣
router.post('/successSendByHomeOrder', (req, res) => {
	orderService.successSendByHomeOrder(req, res);
});

// 完成清洗 店内下单 店员录入 complateClear
router.post('/complateClear', (req, res) => {
	orderService.complateClear(req, res);
});

// 用户取到衣物
router.post('/successOrder', (req, res) => {
	orderService.successOrder(req, res);
});

// 用户取到衣物
router.post('/deleteOrder', (req, res) => {
	orderService.deleteOrder(req, res);
});

module.exports = router;
