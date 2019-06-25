const skills = require("../data/skills.json");
const { formatArg } = require("./auxlib");

const isStat = function(value) {
    return skills.hasOwnProperty(value);
};

const isSkill = function(value) {
    for (key in skills) {
        if (skills[key].includes(value)) {
            return true;
        }
    }
    return false;
};

const getStatValue = function(pc, stat) {
    return pc.stats[stat].value;
};

const getBonus = function(pc, stat) {
    return Math.floor((getStatValue(pc, stat) - 10) / 2);
};

const getSkillValue = function(pc, skill) {
    skill = formatArg(skill);
    for (key in skills) {
        if (skills[key].indexOf(skill) !== -1) {
            let bonus = pc.proficiency_bonus;
            let profs = pc.stats[key].proficiencies;
            return (
                getBonus(pc, key) +
                (profs.hasOwnProperty(skill)
                    ? profs[skill]
                        ? 2 * bonus
                        : bonus
                    : 0)
            );
        }
    }
    return null;
};

module.exports = { isStat, isSkill, getBonus, getStatValue, getSkillValue };
