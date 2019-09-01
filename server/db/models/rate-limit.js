const {DataTypes} = require("sequelize");

module.exports = require("../db").define("rateLimit", {
    namespace: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: "namespace_key",
        defaultValue: "default"
    },
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: "namespace_key"
    },
    hits: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: "rate_limit"
});