const { loadData, formatObj } = require('./auxlib');
const { genBasicEmbed, genCharacterEmbed } = require('./diendee');
const { calcSkillValue } = require('./dndtools');

/**
 * Creates a bio card for the passed character
 * @param {Discord.Client} client - Diendee Client reference
 * @param {string} character - The name of the character to load
 */
const genBioCard = (client, character) => {
    return loadData(BASE_PATH + '/pcs/' + character + '.json')
        .then(data => {
            const acct = client.users.get(data.player);

            const combatStr =
                `**HP:** ${data.combat.hp.current}/${data.combat.hp.max}\n` +
                `**Temp HP:** ${data.combat.temp_hp}\n` +
                `**AC:** ${data.combat.ac}\n` +
                `**Speed:** ${data.combat.speed}\n` +
                `**Initiative:** ${data.combat.initiative}\n` +
                `**Death Saves:** (${data.combat.death_saves.successes} S | ${data.combat.death_saves.failures} F)`;
            let embed = genCharacterEmbed(
                'attachment://image.png',
                `**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`,
                `**Total XP**: ${data.xp.total} · **XP to Next Lvl**: ${data.xp.next}`,
                data.color
            )
                .setAuthor(acct.username, acct.displayAvatarURL)
                //Print characteristics and statistics
                .addField('**Characteristics**', formatObj(data.characteristics), true)
                .addField(
                    '**Statistics**',
                    formatObj(
                        Object.entries(data.stats).reduce((acc, stat) => {
                            const [name, value] = stat;
                            acc[name] = value.score;
                            return acc;
                        }, {})
                    ),
                    true
                )
                .addField('**Combat**', combatStr, true)
                .addBlankField()
                //Print a preview to the backstory
                .addField(
                    '**Bio Preview**',
                    data.bio_preview + '\n\nUse the `$readbio` command to continue reading.'
                );

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

/**
 * Creates a stat card for the passed character
 * @param {Discord.Client} client - Diendee client reference
 * @param {string} character - The character to get data for
 */
const genStatCard = (client, character) => {
    //Load character data
    return loadData(BASE_PATH + '/pcs/' + character + '.json')
        .then(data => {
            let embed = genCharacterEmbed(
                'attachment://image.png',
                `**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`,
                `**HP:** ${data.combat.hp.current}/${data.combat.hp.max} · **AC:** ${data.combat.ac} · ` +
                    `**Speed:** ${data.combat.speed} · **Initiative:** ${data.combat.initiative}`,
                data.color
            );

            // Add values for each stat and skill to the embed
            Object.entries(data.stats)
                // Sort by # of skills under that stat
                .sort((a, b) => Object.keys(a[1].skills).length - Object.keys(b[1].skills).length)
                .forEach(entry => {
                    const [name, stat] = entry;
                    //Add formatted values to the embed to be outputted
                    embed.addField(
                        `**${name}: ${stat.score} [${stat.saves ? '+' : ' '}]**`,
                        formatObj(
                            Object.entries(stat.skills).reduce((acc, skill) => {
                                acc[skill[0]] = calcSkillValue(
                                    skill[1],
                                    stat.score,
                                    data.proficiency_bonus
                                );
                                return acc;
                            }, {})
                        ) || '_None_',
                        true
                    );
                });
            // Return value to send to channel
            return {
                embed,
                files: [{ attachment: BASE_PATH + data.icon, name: 'image.png' }],
            };
        })
        .catch(err => {
            console.log('Error getting stats:', err);
            return genBasicEmbed(client, `I couldn't find a PC named ${character}.`);
        });
};

module.exports = { genBioCard, genStatCard };
