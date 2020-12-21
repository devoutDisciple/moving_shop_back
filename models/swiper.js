/* jshint indent: 2 */

const Sequelize = require('sequelize');
module.exports = function (sequelize) {
	return sequelize.define(
		'swiper',
		{
			id: {
				type: Sequelize.INTEGER(11),
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			shop_id: {
				type: Sequelize.INTEGER(11),
				allowNull: false,
			},
			url: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			text: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			create_time: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			sort: {
				type: Sequelize.INTEGER(255),
				allowNull: true,
				defaultValue: '1',
			},
			is_delete: {
				type: Sequelize.STRING(255),
				allowNull: true,
				defaultValue: '1',
			},
		},
		{
			tableName: 'swiper',
			timestamps: false,
		},
	);
};
