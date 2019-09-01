const {underscore} = require("inflection");

const db = require("./db");

const Candidate = require("./models/candidate");
const Vote = require("./models/vote");
const RateLimit = require("./models/rate-limit"); // orphaned model

const fk = name=>({foreignKey: {name, field: underscore(name), unique: false, allowNull: false}});

// creating database relations
Candidate.hasMany(Vote, fk("candidateId"));
Vote.belongsTo(Candidate, fk("candidateId"));

module.exports = db;