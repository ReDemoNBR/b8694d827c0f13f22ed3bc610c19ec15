const Candidate = require("../../db/models/candidate");
const Vote = require("../../db/models/vote");
const {fn, col} = require("sequelize");
const percent = new Intl.NumberFormat("pt-BR", {style: "percent"});

function hourlyStats(id) {
    return Vote.findAll({
        attributes: [
            [fn("DATE_TRUNC", "hour", col("created")), "hour"],
            [fn("COUNT", col("*")), "total"]
        ],
        group: [col("hour")],
        where: {candidateId: id}
    });
}

module.exports = async (req, res, next) => {
    try {
        let [total, candidates] = await Promise.all([
            Vote.findOne({attributes: [[fn("COUNT", col("*")), "total"]]}),
            Candidate.findAll({
                attributes: [
                    "id", "name",
                    [fn("COUNT", col("votes.*")), "total"],
                ],
                include: [{
                    model: Vote,
                    attributes: [],
                    required: true //for inner join
                }],
                group: [col("candidate.id"), col("candidate.name")],
                order: [[col("id"), "ASC"]]
            })
        ]);
        total = Number(total.toJSON().total);
        candidates.forEach((candidate, index)=>{
            candidate = candidate.toJSON();
            candidate.total = Number(candidate.total);
            candidate.percent = candidate.total/total;
            candidate.percentString = percent.format(candidate.percent);
            
            // its a promise...
            // could use and 'await' but prefered to consume more DB connections for better API performance
            // as there will be only 2 candidates, this will consume only 2 DB connections
            // but if there were more candidates, the best would be to await each one in order to consume only 1 DB connection
            candidate.hourly = hourlyStats(candidate.id);
            
            candidates[index] = candidate;
        });
        // await for all hourly stats promises to finish 
        let hourlyData = await Promise.all(candidates.map(candidate=>candidate.hourly));
        hourlyData.forEach((hourly, index)=>candidates[index].hourly = hourly);
        return res.send({candidates, total});
    } catch(e) {
        return next(e);
    }
};