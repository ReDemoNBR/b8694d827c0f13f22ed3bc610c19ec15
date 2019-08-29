const {DataTypes} = require("sequelize");

const Vote = require("../db").define("vote", {
    voterIp: {
        type: DataTypes.INET,
        allowNull: false,
        field: "voter_ip"
    }
}, {
    indexes: [
        {fields: ["voter_ip"]},
        {fields: ["candidate_id"]},
    ],
    tableName: "vote"
});

Vote.removeAttribute("id"); //to remove the "id" primary key from the table

module.exports = Vote;