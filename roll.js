/**
 * Rolls the specified die
 * @param {natural number} sides    The number of sides on the die
 */
const rollDie = function(sides) {
    return Math.floor(Math.random() * sides) + 1;
};

/**
 * Rolls the specified dice and returns the results & the sum
 * @param {natural number} dice        The number of dice to roll
 * @param {natural number} sides       The number of sides on said dice
 * @param {boolean} dropLowest     Optional; Removes total from the sum
 */
const rollDice = function(dice, sides, dropLowest = false) {
    var roll = {
        cmd: `${dice}d${sides}` + dropLowest ? " drop the lowest" : "",
        total: 0,
        result: []
    };
    for (var d = 0; d < dice; d++) {
        roll.result.push(rollDie(sides));
    }
    roll.total = roll.result.reduce((a, b) => a + b, 0);
    roll.total -= dropLowest ? Math.min(...roll.result) : 0;
    return roll;
};

/**
 * "4d6 drop the lowest", 6 times
 */
const rollPC = function() {
    var stats = [];
    for (var s = 0; s < 6; s++) {
        stats.push(rollDice(4, 6, true));
    }
    return stats;
};

/**
 * Turns an array of rolls into a string.
 * See rollDice() for an example of a roll
 * @param {object} rolls
 */
function formatRolls(rolls) {
    output = "";
    rolls.forEach(function(roll) {
        output +=
            `**${roll.cmd}:** ${roll.total}` +
            ` _(${roll.result.join(", ")})_\n`;
    });
    return output;
}

module.exports = { rollDie, rollDice, rollPC, formatRolls };
