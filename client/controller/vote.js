const Candidate = require("../../server/db/models/candidate");
const Vote = require("../../server/db/models/vote");
const {fn, col} = require("sequelize");
const percent = new Intl.NumberFormat("pt-BR", {style: "percent"});

module.exports = async (req, res, next) => {
    let {query: {id}} = req;
    try {
        let candidate;
        if (id) candidate = await Candidate.findByPk(id, {attributes: ["id", "name"]});
        let totalVotes = await Vote.count();
        let partials = await Candidate.findAll({
            attributes: [
                "id", "name",
                [fn("COUNT", col("votes.*")), "total"]
            ],
            include: [{
                model: Vote,
                attributes: [],
                required: true
            }],
            group: [col("id"), col("name")],
            order: [[col("id"), "ASC"]]
        });
        partials.forEach((partial, index)=>{
            partial = partial.toJSON();
            partial.total = Number(partial.total);
            partial.percent = partial.total/totalVotes;
            partial.percentString = percent.format(partial.percent);
            partials[index] = partial;
        });
        candidate = candidate.toJSON();
        return res.render("vote", {partials, candidate});
    } catch(e) {
        return next(e);
    }
};