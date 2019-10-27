const { loadData, formatObj } = require('./auxlib');
const { genBasicEmbed, genAuthoredEmbed } = require('./diendee');

/**
 * Creates a bio card for the passed character
 * @param {Discord.Client} client - Diendee Client reference 
 * @param {String} character - The name of the character to load
 */
const genBioCard = (client, character) => {
    return loadData(BASE_PATH + '/pcs/' + character + '.json')
        .then(data => {
            var acct = client.users.get(data.player);

            var stats = {};
            Object.entries(data.stats).forEach(stat => {
                const [name, value] = stat;
                stats[name] = value.score;
            });

            const combatStr =
                `**HP:** ${data.combat.hp.current}/${data.combat.hp.max}\n` +
                `**Temp HP:** ${data.combat.temp_hp}\n` +
                `**AC:** ${data.combat.ac}\n` +
                `**Speed:** ${data.combat.speed}\n` +
                `**Initiative:** ${data.combat.initiative}\n` +
                `**Death Saves:** (${data.combat.death_saves.successes} S | ${data.combat.death_saves.failures} F)`;

            let embed = genAuthoredEmbed(client.user.displayAvatarURL, acct, acct.username)
                .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`)
                //Character portrait
                .setThumbnail('attachment://image.png')
                //Print character Stats
                .setDescription(
                    `**Total XP**: ${data.xp.total} · **XP to Next Lvl**: ${data.xp.next}`
                )
                //Print characteristics and statistics
                .addField('**Characteristics**', formatObj(data.characteristics), true)
                .addField('**Statistics**', formatObj(stats), true)
                .addField('**Combat**', combatStr, true)
                .addBlankField()
                //Print a preview to the bio
                .addField(
                    '**Bio Preview**',
                    data.bio_preview + '\n\nUse the `$readbio` command to continue reading.'
                )
                .setColor(data.color);

            return {
                embed,
                files: [{ attachment: BASE_PATH + data.icon, name: 'image.png' }],
            };
        })
        .catch(err => {
            console.log('Error getting bio:', err);
            return genBasicEmbed(client, `I couldn't find a PC named ${character}.`);
        });
};

module.exports = { genBioCard };
