const express = require('express');
const router = express.Router();
const mockService = require('../services/mockService');

// 是否使用mock页面
router.get('/getMockFlag', (req, res) => {
	mockService.getMockFlag(req, res);
});

module.exports = router;
