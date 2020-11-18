const { loadData, capitalize } = require('./auxlib');

/**
 * Matches to a roll command in string format
 * @param {string} cmd      Some roll command
 * @return {Object} null or an appropriate match object for the regex
 */
const parseRoll = cmd => {
    const rollRegex = /^(\d*)(?:d(\d+))$/;
    return rollRegex.exec(cmd);
};

/**
 * Rolls the specified die
 * @param {integer > 0} sides    The number of sides on the die
 * @return {integer} in [1, sides]
 */
const rollDie = sides => {
    return Math.floor(Math.random() * sides) + 1;
};

/**
 * @typedef Roll
 * @property {string} cmd           The command rolled
 * @property {integer} total        The sum of all outcomes, accounting for drops
 * @property {[integer,]} result    The list of all roll outcomes
 */

/**
 * Rolls the specified dice and returns the results & the sum
 * @param {natural number} dice        The number of dice to roll
 * @param {natural number} sides       The number of sides on said dice
 * @param {boolean} dropLowest     Optional; Removes total from the sum
 * @return {Roll} Outcome of the desired roll
 */
const rollDice = (dice, sides, dropLowest = false) => {
    var roll = {
        cmd: `${dice}d${sides}` + (dropLowest ? ' drop the lowest' : ''),
        total: 0,
        result: [],
    };
    for (var d = 0; d < dice; d++) {
        roll.result.push(rollDie(sides));
    }
    roll.total = roll.result.reduce((a, b) => a + b, 0);
    roll.total -= dropLowest ? Math.min(...roll.result) : 0;
    return roll;
};

/**
 * Rolls a PC
 * @return {[Roll,]} "4d6 drop the lowest", 6 times
 */
const rollCharacter = () => {
    return [1, 2, 3, 4, 5, 6].map(() => rollDice(4, 6, true));
};

/**
 * Turns an array of rolls into a string.
 * See rollDice() for an example of a roll
 * @param {[Roll,]} rolls
 */
const formatRolls = rolls => {
    return rolls
        .map(roll => `**${roll.cmd}**: ${roll.total}` + ` _(${roll.result.join(', ')})_`)
        .join('\n');
};

/**
 * Roll initiative
 * @param {*} pcs           A list of PCs
 * @param {*} filePath      The path to where that PC data is stored
 * @return {Array}  An array of { character: NAME, initiative: ROLL }
 */
const rollInitiative = (pcs, filePath) => {
    return pcs.map(pc => {
        return loadData(`${filePath}/${pc}.json`)
            .then(data => {
                return {
                    character: capitalize(pc),
                    initiative: rollDie(20) + data.initiative_bonus,
                };
            })
            .catch(err => {
                console.log('Error loading data:', err);
                return { character: capitalize(pc), initiative: 'ERROR' };
            });
    });
};

module.exports = {
    parseRoll,
    rollDie,
    rollDice,
    rollCharacter,
    formatRolls,
    rollInitiative,
};
