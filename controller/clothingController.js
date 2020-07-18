const express = require('express');
const router = express.Router();
const clothingService = require('../services/clothingService');

// 获取衣物 根据商店id
router.get('/getAllByShopid', (req, res) => {
	clothingService.getAllByShopid(req, res);
});

// 增加衣物
router.post('/add', (req, res) => {
	clothingService.add(req, res);
});

// 删除衣物
router.post('/deleteById', (req, res) => {
	clothingService.deleteById(req, res);
});

// 更新衣物 updateClothing
router.post('/updateClothing', (req, res) => {
	clothingService.updateClothing(req, res);
});

// getDetailById
router.get('/getDetailById', (req, res) => {
	clothingService.getDetailById(req, res);
});

module.exports = router;
