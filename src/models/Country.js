// src/models/Country.js
const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Country = sequelize.define('Country', {
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  capital: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  population: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  currency_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  exchange_rate: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  estimated_gdp: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  flag_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_refreshed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'countries',
  timestamps: false,
});

module.exports = Country;
