'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sOsOrder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.sOsOrder.belongsTo(models.user)
    }
  };
  sOsOrder.init({
    userId: DataTypes.INTEGER,
    cheesecakeFlavor: DataTypes.STRING,
    slice: DataTypes.INTEGER,
    eight: DataTypes.INTEGER,
    ten: DataTypes.INTEGER,
    twelve: DataTypes.INTEGER,
    granola: DataTypes.INTEGER,
    yogurt: DataTypes.INTEGER,
    bbq: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'sOsOrder',
  });
  return sOsOrder;
};