const { loadData, capitalize, parseNat } = require('./auxlib');

/**
 * Matches an expression of dice commands and constants.
 * example matches:
 *  - d20
 *  - 1d20
 *  - 2d8+1d6
 *  - 1d20-2d4+3
 *  - 25+4d6-1d6
 * */
const rollRegex = /^(?:(?:\d*d\d+?)|(?:\d+))(?:[+-](?:(?:\d*d\d+?)|(?:\d+)))*$/;

/**
 * Given a specific dice command or constant, parses and
 * computes the value of the command.
 * @param {string} roll some dice command or constant.
 * @return {RollResult} the result of the command.
 */
const parseRoll = roll => {
  const dIdx = roll.indexOf('d');
  if (dIdx < 0) {
    const num = parseNat(roll);
    return {
      total: num,
      result: [num],
      cmd: roll,
    };
  }
  const sides = dIdx === 0 ? 1 : parseNat(roll.substring(0, dIdx));
  const dice = parseNat(roll.substring(dIdx + 1));
  return rollDice(sides, dice);
};

/**
 * Given an expression of dice rolls and constants, parses and
 * computes the value of the expression.
 * @param {string} expr expression to be parsed.
 * @return {[RollResults,...]} the result of each command in the expression.
 */
const parseRollExpr = expr => {
  let start = 0,
    end = 1,
    sign = 1;
  let grandTotal = 0;
  const rolls = [];
  while (end < expr.length) {
    while (end < expr.length && expr[end] !== '+' && expr[end] !== '-') {
      end++;
    }
    if (start != 0) {
      sign = expr[start++] === '+' ? 1 : -1;
    }
    rolls.push(parseRoll(expr.substring(start, end)));
    grandTotal += sign * rolls[rolls.length - 1].total;
    start = end;
    end = start + 1;
  }
  return { grandTotal, rolls };
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
  parseRollExpr,
  rollDie,
  rollDice,
  rollCharacter,
  rollRegex,
  formatRolls,
  rollInitiative,
};
