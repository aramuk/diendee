const skills = require('../data/skills.json');
const { capitalize } = require('./auxlib');
const { parseRoll } = require('./roller');

/**
 * Reformats a command line arg as needed
 * @param {string} arg - The string to reformat
 * @return {string}- Reformatted argument
 */
const formatArg = arg => {
    arg = arg.replace(/\_/g, ' ').toLowerCase();
    if (arg == 'sleight of hand') {
        return 'Sleight of Hand';
    } else if (parseRoll(arg)) {
        console.log(parseRoll(arg));
        return parseRoll(arg);
    }
    return capitalize(arg);
};

/**
 * Tells whether the passed value is a stat
 * @param {string} value        The value to check
 * @return {bool} Whether it is or isn't a stat
 */
const isStat = value => {
    return skills.hasOwnProperty(value);
};

/**
 * Tells whether the passed value is a skill
 * @param {string} value        The value to check
 * @return {bool} Whether it is or isn't a skill
 */
const isSkill = value => {
    for (key in skills) {
        if (skills[key].includes(value)) {
            return true;
        }
    }
    return false;
};

/**
 * Gets the raw stat value for a desired pc & stat
 * @param {string} pc           The pc to get the value for
 * @param {string} stat         The stat in question
 * @return {Integer} The raw value for the desired stat
 */
const getStatValue = (pc, stat) => {
    return pc.stats[stat].value;
};

/**
 * Calculates the bonus granted by a given stat value
 * @param {Integer} score - A stat value
 */
const getBonus = score  => {
    return Math.floor((score - 10) / 2);
};

/**
 * Calculates the bonus for a given skill
 * @param {Object} skill - The skill in consideration
 * @param {Number} statValue - The value of the parent stat for the skill
 * @param {Number} profMod - The proficiency modifier of the character
 */
const calcSkillValue = (skill, statValue, profMod) => {
    let modifier = 0;
    if (skill.expertise) {
        modifier = 2 * profMod;
    } else if(skill.proficient) {
        modifier = profMod;
    } else if(skill.jack_of_all_trades) {
        modifier = 0.5 * profMod;
    }
    return getBonus(statValue) + modifier;
};

/**
 * Gets the bonus for the desired pc & skill
 * @param {string} pc           The pc to get the value for
 * @param {string} skill        The skill in question
 * @return {Integer} The bonus, or null if a value could not be found
 */
const getSkillValue = (pc, skill) => {
    skill = formatArg(skill);
    for (key in skills) {
        if (skills[key].indexOf(skill) !== -1) {
            let bonus = pc.proficiency_bonus;
            let profs = pc.stats[key].proficiencies;
            return (
                getBonus(pc, key) +
                (profs.hasOwnProperty(skill) ? (profs[skill] ? 2 * bonus : bonus) : 0)
            );
        }
    }
    return null;
};

module.exports = {
    formatArg,
    isStat,
    isSkill,
    getBonus,
    getStatValue,
    getSkillValue,
    calcSkillValue,
};
