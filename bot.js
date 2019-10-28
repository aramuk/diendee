//Dependencies
const Discord = require('discord.js');
const fs = require('fs-extra');
const uuid = require('uuid/v4');

global.BASE_PATH = __dirname;
const auth = require(`${BASE_PATH}/auth.json`);

// Local dependencies from /utils
const { formatObj, loadData, capitalize } = require(`${BASE_PATH}/utils/auxlib`);
const {
    genBasicEmbed,
    removePinnedMessages,
    genFlavorText,
} = require(`${BASE_PATH}/utils/diendee`);
const {
    formatArg,
    isStat,
    isSkill,
    getBonus,
    getStatValue,
    getSkillValue,
} = require(`${BASE_PATH}/utils/dndtools`);
const { rollDie, formatRolls, rollInitiative } = require(`${BASE_PATH}/utils/roller`);

// Lambdas for each command
const about = require(`${BASE_PATH}/lambdas/about/about`);
const usage = require(`${BASE_PATH}/lambdas/about/usage`);
const roll = require(`${BASE_PATH}/lambdas/roll/roll`);
const rollPC = require(`${BASE_PATH}/lambdas/roll/rollPC`);
const bio = require(`${BASE_PATH}/lambdas/characters/bio`);
const stats = require(`${BASE_PATH}/lambdas/characters/stats`);

const client = new Discord.Client();

// D&D Data
// const mapping = require(BASE_PATH + "/data/mapping.json");
const skills = require(BASE_PATH + '/data/skills.json');
const levels = require(BASE_PATH + '/data/levels.json');
var campaigns = require(BASE_PATH + '/data/campaigns.json');
var guilds = require(BASE_PATH + '/data/guilds.json');

//On bot start
client.on('ready', () => console.log('I am ready!'));

//Listen for bot commands
client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.substring(0, 1) == auth.prefix) {
        const args = message.content
            .slice(auth.prefix.length)
            .trim()
            .split(/ +/g);
        const cmd = args.shift().toLowerCase();

        //Commands to listen for
        switch (cmd) {
            // Easter Eggs
            case 'hellothere':
                helloThere(message);
                break;
            // Bot Details
            case 'about':
                about(client, message);
                break;
            case 'usage':
                usage(client, message);
                break;
            // Campaign Management
            case 'campaign':
                getCampaign(message);
                break;
            case 'load':
                loadCampaign(message, args);
                break;
            case 'start':
                startCampaign(message, args);
                break;
            // Rolls
            case 'roll':
                roll(client, message, args);
                break;
            case 'rollpc':
                rollPC(client, message);
                break;
            case 'check':
                check(message, args);
                break;
            case 'initiative':
                initiative(message, args);
                break;
            // View Character Info
            case 'stats':
                stats(client, message, args);
                break;
            case 'get':
                get(message, args);
                break;
            case 'bio':
                bio(client, message, args);
                break;
            case 'readbio':
                readbio(message, args);
                break;
            case 'hp':
                hp(message, args);
                break;
            case 'xp':
                xp(message, args);
                break;
        }
    }
});

//Responds to a comment $hellothere in the only acceptable way.
function helloThere(message) {
    message.channel.send(
        'General Kenobi!\nYou are a bold one.\nhttps://www.youtube.com/watch?v=frszEJb0aOo'
    );
}

const recacheCampaignJSON = () => {
    delete require.cache[require.resolve(BASE_PATH + '/data/campaigns.json')];
    campaigns = require(BASE_PATH + '/data/campaigns.json');
};

const recacheGuildJSON = () => {
    delete require.cache[require.resolve(BASE_PATH + '/data/guilds.json')];
    guilds = require(BASE_PATH + '/data/guilds.json');
};

function getCampaign(message) {
    var server = message.channel.guild.id;
    if (guilds[server]) {
        var campaign = guilds[server];
        message.channel.send(
            'This guild is currently playing: _' + guilds[server].main.name + '_.'
        );
    } else {
        message.channel.send(
            'No campaign is associated with this guild. Type `$start [name]` to make one.'
        );
    }
}

function loadCampaign(message, args) {
    if (args.length != 1) {
        message.channel.send('You must specify a single campaign to load');
        return;
    }
    let server = message.channel.guild.id;
    var name = args[0].replace(/\_/g, ' ');
    var history = guilds[server].all;
    for (i = 0; i < history.length; i++) {
        var entry = history[i];
        if (campaigns[entry].name == name) {
            guilds[server].main = campaigns[entry];
            message.channel.send('I just loaded _' + campaigns[entry].name + '_ in this guild.');
            return;
        }
    }
    message.channel.send(
        'I could not find a campaign named _' + name + "_ in this guild's history."
    );
}

function startCampaign(message, args) {
    if (args.length != 1) {
        message.channel.send('Please specify a name for the new campaign.');
        return;
    }
    let name = args[0].replace(/\_/g, ' ');
    const oldCampaigns = campaigns;
    const oldGuilds = guilds;
    var campaignUuid = uuid();
    campaigns[campaignUuid] = {
        name: name,
        mapping: {},
    };
    fs.writeFile(BASE_PATH + '/data/campaigns.json', JSON.stringify(campaigns, null, 4))
        .then(() => {
            guilds[message.channel.guild.id].all.push(campaignUuid);
            fs.writeFile(BASE_PATH + '/data/guilds.json', JSON.stringify(guilds, null, 4))
                .then(() => {
                    recacheCampaignJSON();
                    recacheGuildJSON();
                    message.channel.send(
                        `_${name}_ has been added to this guild. Type \`$load ${
                            args[0]
                        }\` to load this campaign.`
                    );
                })
                .catch(err => {
                    guilds = oldGuilds;
                    campaigns = oldCampaigns;
                    console.log('Error writing guilds:', err);
                    message.channel.send('Sorry. There was an error creating your campaign');
                });
        })
        .catch(err => {
            campaigns = oldCampaigns;
            console.log('Error writing campagins:', err);
            message.channel.send('Sorry. There was an error creating your campaign');
        });
}

//Checks if a Discord user is permitted to use the command
function isPermitted(uid) {
    return uid == 190515236434870272 || uid == 190355784859779073;
    // return uid != 190515236434870272
}

async function check(message, args) {
    if (message.channel.guild === null || message.channel.guild === undefined) {
        return message.channel.send('I can not do that for you in a direct message channel.');
    }
    let server = message.channel.guild.id;
    if (!guilds.hasOwnProperty(server) || guilds[server].main === undefined) {
        return message.channel.send(
            "There doesn't appear to be an active campaign in this server."
        );
    }
    let mapping = guilds[server].main.mapping;
    let choice = formatArg(args[0]);
    let playerId = 'u' + message.author.id;
    if (!mapping.hasOwnProperty(playerId)) {
        return message.channel.send(
            `I'm having some trouble finding a PC associated with ${message.author.username}`
        );
    } else if (!isSkill(choice) && !isStat(choice)) {
        return message.channel.send(`I'm not quite sure how to roll ${choice}.`);
    }
    let path = `${BASE_PATH}/pcs/${mapping[playerId]}.json`;
    loadData(path)
        .then(data => {
            const roll = rollDie(20);
            const bonus = isStat(choice) ? getBonus(data, choice) : getSkillValue(data, choice);
            var result = {
                cmd: `d20+${bonus}`,
                total: roll + bonus,
                result: [roll],
            };

            let embed = new Discord.RichEmbed()
                .setThumbnail(client.user.displayAvatarURL)
                .setAuthor(message.author.username + ' rolled: ', message.author.displayAvatarURL)
                .setColor('#fcce63')
                .addField(`**${choice}**:`, formatRolls([result]));

            message.channel.send(embed);
        })
        .catch(error => {
            console.log(`ERROR rolling ${choice}:`, error);
            return message.channel.send(`I ran into some issues rolling ${choice}.`);
        });
}

function get(message, params) {
    //If there was no choice specified
    if (params.length < 1) {
        return message.channel.send(
            genBasicEmbed(
                client,
                `You must specify a value to get and optionally, which PCs to search.`
            )
        );
    }

    //Print the stats of all the specified characters
    var choice = params.shift().toLowerCase();
    choice = choice.charAt(0).toUpperCase() + choice.slice(1);

    //Make sure supplied choice is valid
    if (!isSkill(choice) && !isStat(choice)) {
        return message.channel.send(
            genBasicEmbed(client, `I couldn't find a value named _${choice}_.`)
        );
    }
    //If no character was specified, print the sender's character's stats
    if (params.length == 0) {
        params = [mapping['u' + message.author.id]];
    }
    getRequestedValue(choice, params, message)
        .then(characters => {
            // Print all the requested stat values
            if (characters.length > 0) {
                var output = characters
                    .map(character => `**${character.name}**: ${character.value}`)
                    .join('\n');
                message.channel.send(
                    genBasicEmbed(client, `Here are the values for _${choice}_:\n\n${output}`)
                );
            }
        })
        .catch(err => {
            console.log('Error getting value:', err);
            message.channel.send(
                genBasicEmbed(client, `I ran into some trouble getting ${choice} for ${params}`)
            );
        });
}

//Gets the proficiency values for some characters in a particular skill
async function getRequestedValue(value, characters) {
    //Find the stat value for each character
    promises = characters.map(async character => {
        const data = await loadData(BASE_PATH + '/pcs/' + character + '.json');
        return {
            name: data.name,
            value: `${isStat(value) ? getStatValue(data, value) : getSkillValue(data, value)}`,
        };
    });
    return await Promise.all(promises);
}

//Dms the bio of the specified characters to the requester
function readbio(message, characters) {
    //Format and print some flavor text
    message.author.send(genBasicEmbed(`${genFlavorText()}`));

    //Print the bio of each of the specified character's
    if (characters.length > 0) {
        for (j = 0; j < characters.length; j++) {
            sendFullBio(characters[j], message);
        }
    }
    //If no character was specified, print the sender's character's bio
    else {
        var pc = mapping['u' + message.author.id];
        sendFullBio(pc, message);
    }
}

//Sends the full bio of a character to the requester
function sendFullBio(character, message) {
    //Read the full bio from a file
    fs.readFile(`${BASE_PATH}/pcs/bios/${character}.txt`, 'utf-8', (err, data) => {
        if (err) {
            console.log('Error loading file: ', err);
        } else {
            paragraphs = data.split('\n\n');
            //Add the title of the character's name
            output = `**${paragraphs[0]}**\n\n`;
            //Print each paragraph of the character's bio
            for (p = 1; p < paragraphs.length; p++) {
                //Max message length for Discord is 2000, so split a paragraph if necessary
                if (output.length + paragraphs[p].length > 1970) {
                    message.author.send(output);
                    output = `\n`;
                }
                output += `${paragraphs[p]}\n\n`;
            }
            //Send the remaining part of the bio
            message.author.send(`${output}`);
        }
    });
}

//Update the HP values of the requested characters
async function hp(message, params) {
    //Check to see if the user is authorized to use the command
    if (!isPermitted(message.author.id)) {
        return message.channel.send(
            genBasicEmbed(client, 'You are not authorized to use that command.')
        );
    }
    //Check if all parameters were specified
    if (params.length < 1) {
        return message.channel.send('You must specify character(s) and a value.');
    }
    //Get the amount to increment the hp by and check if its valid
    const results = params.map(async param => {
        var cmd = param.split(/\:/g);
        var val = parseInt(cmd[1]);
        //Check to see if the hp command is valid, before trying to update
        if (cmd[1] == 'max' || !isNaN(val)) {
            if (cmd[1] == 'max') {
                val = cmd[1];
            }
            var path = BASE_PATH + '/pcs/' + cmd[0].toLowerCase() + '.json';
            //Edit the HP and record whether it works
            return { pc: cmd[0], success: await editHP(path, val) };
        } else {
            return { pc: cmd[0], success: false };
        }
    });
    const pcs = await Promise.all(results);
    var success = [];
    var errors = [];
    pcs.forEach(pc => {
        if (pc.success) {
            success.push(pc.pc);
        } else {
            errors.push(pc.pc);
        }
    });
    //Confirm HP update
    var description = 'I updated HP for: ' + success;
    if (errors.length > 0) {
        description += '\nI ran into some trouble updating HP for ' + errors;
    }
    message.channel.send(genBasicEmbed(client, description));
}

//Edits the HP of the requested characters
function editHP(path, value) {
    //Load PC data if possible
    return new Promise((resolve, reject) => {
        loadData(path)
            .then(data => {
                //Update the HP to the appropriate value
                if (value == 'max' || data.hp.current + value > data.hp.max) {
                    data.hp.current = data.hp.max;
                } else {
                    data.hp.current += value;
                    if (data.hp.current < 0) {
                        data.hp.current = 0;
                    }
                }
                //Write the updated data to the file
                fs.writeFile(path, JSON.stringify(data, null, 4), err => {
                    if (err) {
                        console.log('Error writing JSON: ', err);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            })
            .catch(err => {
                console.log('Error editing hp:', err);
                resolve(false);
            });
    });
}

//Update the XP values of the requested characters
async function xp(message, params) {
    //Check to see if the user is authorized to use the command
    if (!isPermitted(message.author.id)) {
        return message.channel.send(
            genBasicEmbed(client, 'You are not authorized to use that command.')
        );
    }
    //Check if all parameters were specified
    if (params.length < 1) {
        return message.channel.send('You must specify character(s) and a value.');
    }
    var results = params.map(async param => {
        var cmd = param.split(/\:/g);
        var val = parseInt(cmd[1]);
        //Check to see if the xp value is valid, before trying to update
        if (!isNaN(val)) {
            var path = BASE_PATH + '/pcs/' + cmd[0].toLowerCase() + '.json';
            return { pc: cmd[0], success: await editXP(path, val) };
        } else {
            return { pc: cmd[0], success: false };
        }
    });
    const pcs = await Promise.all(results);
    var success = [];
    var errors = [];
    pcs.forEach(pc => {
        if (pc.success) {
            success.push(pc.pc);
        } else {
            errors.push(pc.pc);
        }
    });
    //Confirm XP update
    var description = 'I updated XP for: ' + success;
    if (errors.length > 0) {
        description += '\nI ran into some trouble updating XP for ' + errors;
    }
    message.channel.send(genBasicEmbed(client, description));
}

//Edits the XP of the requested characters
function editXP(path, value) {
    //Load PC data if possible
    return new Promise(resolve, reject => {
        loadData(path)
            .then(data => {
                //Update the XP to the appropriate value; Change values if level up occurs
                /* Known bugs
                Can only gain 1 level at a time
            */
                data.xp.total += value;
                while (data.xp.total >= levels[data.level + 1].xp) {
                    data.level += 1;
                }
                while (data.xp.total < levels[data.level].xp) {
                    data.level -= 1;
                }
                data.xp.next = levels[data.level + 1].xp - data.xp.total;
                data.proficiency_bonus = levels[data.level].prof;
                data.hp.hit_dice = data.level;

                //Write the updated data to the file
                fs.writeFile(path, JSON.stringify(data, null, 4), err => {
                    if (err) {
                        console.log('Error writing JSON: ', err);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            })
            .catch(err => {
                console.log('Error editing xp', err);
                resolve(false);
            });
    });
}

//Roll for initiative and pin results to channel
async function initiative(message, npcs) {
    let server = message.channel.guild.id;
    const mapping = guilds[server].main.mapping;

    Promise.all(rollInitiative(Object.values(mapping), `${BASE_PATH}/pcs`))
        .then(rolls => {
            if (npcs) {
                npcs.forEach(npc => {
                    const [name, bonus] = npc.split(/\:/g);
                    rolls.push({
                        character: capitalize(name),
                        initiative: rollDie(20) + parseInt(bonus),
                    });
                });
            }
            rolls.sort((a, b) => b.initiative - a.initiative);

            const message_text = 'Here are the initiative values: ';
            removePinnedMessages(client, message, message_text); //Remove old pinned initiative values
            const output = rolls
                .map(roll => `**${roll.character}**: ${roll.initiative}`)
                .join('\n');

            message.channel
                .send(genBasicEmbed(client, `${message_text}\n${output}`))
                .then(message => message.pin());
        })
        .catch(err => {
            console.log('Error rolling pcs: ', err);
            return message.channel.send('I ran into some errors rolling initiative');
        });
}

//Bot login
client.login(auth.token);
