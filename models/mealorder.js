'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mealOrder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.mealOrder.belongsTo(models.user)

    }
  };
  mealOrder.init({
    userId: DataTypes.INTEGER,
    days: DataTypes.INTEGER,
    protein: DataTypes.STRING,
    pasta: DataTypes.INTEGER,
    quinoa: DataTypes.INTEGER,
    rice: DataTypes.INTEGER,
    potatoes: DataTypes.INTEGER,
    asparagus: DataTypes.INTEGER,
    carrots: DataTypes.INTEGER,
    medley: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mealOrder',
  });
  return mealOrder;
};
