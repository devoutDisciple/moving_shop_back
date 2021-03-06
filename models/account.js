/* jshint indent: 2 */

const Sequelize = require('sequelize');

module.exports = sequelize => {
	return sequelize.define(
		'account',
		{
			id: {
				type: Sequelize.INTEGER(11),
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			phone: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			username: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			password: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			shopid: {
				type: Sequelize.INTEGER(11),
				allowNull: false,
			},
			role: {
				type: Sequelize.INTEGER(11),
				allowNull: true,
				defaultValue: '2',
			},
			send_message: {
				type: Sequelize.INTEGER(11),
				allowNull: true,
				defaultValue: '1',
			},
			is_delete: {
				type: Sequelize.STRING(255),
				allowNull: false,
				defaultValue: '1',
			},
		},
		{
			tableName: 'account',
			timestamps: false,
		},
	);
};
