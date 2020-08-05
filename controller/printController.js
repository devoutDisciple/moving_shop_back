const express = require('express');
const router = express.Router();
const printerService = require('../services/printerService');

// 打印订单
router.post('/printOrder', (req, res) => {
	printerService.printOrder(req, res);
});

module.exports = router;
