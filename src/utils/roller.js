const { loadData, capitalize, parseNat } = require('./auxlib');
const logger = require('./logger');

/**
 * @typedef Roll
 * @property {string} cmd the command rolled.
 * @property {number} total the sum of all outcomes, accounting for drops.
 * @property {[number]} result the list of all roll outcomes.
 * @property {[bool]} kept
 */

/**
 * Matches an expression of dice commands and constants.
 * example matches:
 *  - d20
 *  - 1d20
 *  - 2d8+1d6
 *  - 1d20-2d4+3
 *  - 25+4d6-1d6
 * */
const rollRegex = /^(?:(?:\d*d\d+(?:k[hl]\d+)?)|(?:[+-]?\d+))(?:[+-](?:(?:\d*d\d+(?:k[hl]\d+)?)|(?:\d+)))*$/;

/**
 * Given a specific dice command or constant, parses and
 * computes the value of the command.
 * @param {string} roll some dice command or constant.
 * @return {RollResult} the result of the command.
 */
const parseRoll = roll => {
  const dIdx = roll.indexOf('d');
  if (dIdx < 0) {
    const num = parseInt(roll);
    return {
      total: num,
      result: [num],
      cmd: roll,
      kept: [true],
    };
  }
  const sides = dIdx === 0 ? 1 : parseNat(roll.substring(0, dIdx));
  const kIdx = roll.indexOf('k');
  if (kIdx < 0) {
    const dice = parseNat(roll.substring(dIdx + 1));
    return rollDice(sides, dice);
  } else {
    const dice = parseNat(roll.substring(dIdx + 1, kIdx));
    const rollResult = rollDice(sides, dice);
    const keepCount = Math.min(parseNat(roll.substring(kIdx + 2)), rollResult.result.length);
    keep(rollResult, keepCount, roll[kIdx + 1]);
    return rollResult;
  }
};

/**
 * Given an expression of dice rolls and constants, parses and
 * computes the value of the expression.
 * @param {string} expr expression to be parsed.
 * @return {[Rolls,...]} the result of each command in the expression.
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
 * Rolls the specified die.
 * @param {number} sides the number of sides on the die.
 * @return {number} integer in [1, sides].
 */
const rollDie = sides => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Throws the specified dice and returns a Roll.
 * @param {number} dice the number of dice to roll.
 * @param {number} sides the number of sides on said dice.
 * @return {Roll} Outcome of the desired roll
 */
const rollDice = (dice, sides) => {
  let total = 0;
  const result = [];
  for (var d = 0; d < dice; d++) {
    result.push(rollDie(sides));
    total += result[result.length - 1];
  }
  return {
    cmd: `${dice}d${sides}`,
    total,
    result,
    kept: result.map(() => true),
  };
};

/**
 * Modifies a roll to keep only the highest or lowest N values.
 * @param {Roll} roll the result of some roll.
 * @param {number} keepCount the number of rolls to retain.
 * @param {'h' | 'l'} mode 'h' to keep the highest, 'l' to keep the lowest.
 */
const keep = (roll, keepCount, mode = 'h') => {
  const idxs = Array.from(roll.result.keys());
  idxs.sort((a, b) =>
    mode === 'h' ? roll.result[b] - roll.result[a] : roll.result[a] - roll.result[b]
  );
  for (let i = keepCount; i < idxs.length; i++) {
    roll.kept[idxs[i]] = false;
    roll.total -= roll.result[idxs[i]];
  }
  roll.cmd += `k${mode}${keepCount}`;
};

/**
 * Rolls a new character as 4d6k3 6 times.
 * @return {[Roll]} Rolled stats for a new character.
 */
const rollCharacter = () => {
  return [1, 2, 3, 4, 5, 6].map(() => {
    const roll = rollDice(4, 6);
    keep(roll, 3, 'h');
    return roll;
  });
};

/**
 * Turns an array of Rolls into a string.
 * @param {[Roll]} rolls
 */
const formatRolls = rolls => {
  return rolls
    .map(
      roll =>
        `**${roll.cmd}**: ${roll.total}` +
        ` _(${roll.kept
          .map((shouldKeep, i) => (shouldKeep ? roll.result[i] : `~~${roll.result[i]}~~`))
          .join(', ')})_`
    )
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
