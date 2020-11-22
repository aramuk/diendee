const { genBasicEmbed, removePinnedMessages } = require('../../utils/diendee');
const auth = require('../../auth.json');

/**
 * Prints documentation for the commands supported by Diendee
 * @param {Discord.Client} - Diendee Client reference
 * @param {Discord.Message} message - The message that triggered this lambda
 */
module.exports = (client, message) => {
    const message_text = 'Here are some ways you can talk to me:';
    //Remove old usage commands
    removePinnedMessages(client, message, message_text);
    //All the usage commands
    let embed = genBasicEmbed(client, message_text)
        .addField(`${auth.prefix}about`, 'Learn about me!')
        .addField(`${auth.prefix}usage`, 'Learn how to talk to me!')
        .addField(
            `${auth.prefix}roll _[dice{+dice}...]_`,
            "I'll roll the specified roll.\nRolls can be specifed as `$roll 2d6+d8+2d20`.\nYou can also specify multiple rolls, just seperate them with a space like so: `$roll d20 2d6+5`.\n"
        )
        .addField(
            `${auth.prefix}rollPC`,
            "I'll roll a new character for you. (4d6, drop the lowest, 6 times)"
        )
        .addField(
            `${auth.prefix}check _{stat|skill}_`,
            "I'll roll a check for your PC. Just specify a stats or skills.\nTry `$check Strength` or `$check Perception`"
        )
        .addField(
            `${auth.prefix}stats _{name ...}_`,
            "I'll look up some stats for you. I'll look up yours if you don't specify character(s)."
        )
        .addField(
            `${auth.prefix}bio _{name ...}_`,
            "I'll to look up some bios. I'll look up yours if you don't specify character(s)."
        )
        .addField(
            `${auth.prefix}readbio _{name ...}_`,
            "I'll send you some adventurer(s)'s life story. I'll find yours if you don't specify character(s)."
        )
        .addField(
            `${auth.prefix}get _attribute {name ...}_`,
            "I'll tell you the proficiencies for a given stat. I'll look up yours if you don't specify character(s)."
        )
        .addField(
            `${auth.prefix}initiative _{first.last:modifier ...}_`,
            "I'll roll initiative for you and pin it to the channel. I can roll NPCs too if you give me their name and initiative modifier."
        );
    //Pin usage commands to the channel
    message.channel.send(embed).then(message => message.pin());
};