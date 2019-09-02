const Candidate = require("../../server/db/models/candidate");
const {col} = require("sequelize");

module.exports = async (req, res, next) => {
    try {
        let candidates = await Candidate.findAll({
            attributes: ["id", "name"],
            order: [[col("id"), "ASC"]],
            limit: 2 //forcing limit 2
        });
        return res.render("home", {candidates});
    } catch(e) {
        return next(e);
    }
};