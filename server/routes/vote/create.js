const Candidate = require("../../db/models/candidate");
const Vote = require("../../db/models/vote");
const {fn, col} = require("sequelize");

const percent = new Intl.NumberFormat("pt-BR", {style: "percent"});

module.exports = async (req, res, next) => {
    let {body: {id}} = req;
    
    if (!id) return res.status(400).send({error: "Parameter 'id' is required in POST body"});
    
    try {
        let candidateExists = Boolean(await Candidate.findByPk(id, {attributes: ["id"], raw: true})); // using raw=true for better performance
        if (!candidateExists) return res.status(404).send({error: "Candidate not found"});
        let ip = req.ip || req.get("ip"); // some webservers send the remote client IP via 'ip' header
        let vote = await Vote.create({voterIp: ip, candidateId: id});
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
        return res.status(201).send({id: vote.candidateId, partials});
    } catch(e) {
        return next(e);
    }
};