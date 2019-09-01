const Candidate = require("../../db/models/candidate");
const Vote = require("../../db/models/vote");

module.exports = async (req, res, next) => {
    let {body: {id}} = req;
    
    if (!id) return res.status(400).send({error: "Parameter 'id' is required in POST body"});
    
    try {
        let candidateExists = Boolean(await Candidate.findByPk(id, {attributes: ["id"], raw: true})); // using raw=true for better performance
        if (!candidateExists) return res.status(404).send({error: "Candidate not found"});
        let ip = req.ip || req.get("ip"); // some webservers send the remote client IP via 'ip' header
        let vote = await Vote.create({voterIp: ip, candidateId: id});
        return res.status(201).send(vote);
    } catch(e) {
        return next(e);
    }
};