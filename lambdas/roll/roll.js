const { parseNat } = require('../../utils/auxlib');
const { parseRoll, rollDice, formatRolls } = require('../../utils/roller');
const { genBasicEmbed, genAuthoredEmbed } = require('../../utils/diendee');

/**
 * Rolls requested dice
 * @param {Discord.Client} - Diendee Client reference
 * @param {Discord.Message} message - The message where the roll was requested
 * @param {Array} args - Dice to be rolled
 */
const roll = (client, message, args) => {
    if (args.length < 1) {
        return message.channel.send('Please provide a valid roll command.');
    }
    try {
        let results = args.map(arg => {
            let cmds = arg.split('+');
            var total = 0;
            return (
                formatRolls(
                    cmds.map(cmd => {
                        let match = parseRoll(cmd);
                        if (match) {
                            var result = rollDice(parseNat(match[1]), match[2]);
                            total += result.total;
                            return result;
                        } else if (isNaN(cmd)) {
                            return { cmd: cmd, total: 0, result: [] };
                        }
                        const val = parseInt(cmd);
                        total += val;
                        return { cmd: cmd, total: val, result: [val] };
                    })
                ) + `\n**Total**: ${total}`
            );
        });

        let embed = genAuthoredEmbed(
            client.user.displayAvatarURL,
            message.author,
            `${message.author.username} rolled: `
        );
        for (var i = 0; i < results.length; i++) {
            embed.addField(`**${args[i]}**`, results[i], true);
        }
        message.channel.send(embed);
    } catch (e) {
        console.log(`Error rolling: ${e}`);
        message.channel.send(genBasicEmbed(client, "Sorry, I'm not quite sure how to roll that."));
    }
};

module.exports = roll;
