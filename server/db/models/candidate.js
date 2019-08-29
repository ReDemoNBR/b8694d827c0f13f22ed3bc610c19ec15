const {DataTypes} = require("sequelize");

module.exports = require("../db").define("candidate", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        autoIncrementIdentity: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    indexes: [{fields: ["name"]}],
    tableName: "candidate"
});