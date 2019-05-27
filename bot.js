//Dependencies
const Discord = require("discord.js");
const fs = require('fs-extra');

global.BASE_PATH = __dirname;
const client = new Discord.Client();
const auth = require(BASE_PATH + '/auth.json');

//D&D Data
const mapping = require(BASE_PATH + '/data/mapping.json');
const skills = require(BASE_PATH + '/data/skills.json');
const levels = require(BASE_PATH + '/data/levels.json');

//On bot start
client.on("ready", function(){
    console.log("I am ready!");
});

//Listen for bot commands
client.on("message", function(message){
    if (message.author.bot) return;
    if (message.content.substring(0, 1) == auth.prefix) {
        const args = message.content.slice(auth.prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        //Commands to listen for 
        switch(cmd) {
            //$hellothere
            case 'hellothere':
                helloThere(message);
                break;
            //$roll
            case 'roll':
                roll(message, args);
                break;
            //$about
            case 'about':
                about(message);
                break;
            //$usage
            case 'usage':
                usage(message);
                break;
            //$stats
            case 'stats':
                stats(message, args);
                break;
            //$get
            case 'get':
                get(message, args);
                break;
            //$bio
            case 'bio':
                bio(message, args);
                break;
            //$readbio
            case 'readbio':
                readbio(message, args);
                break;
            //$hp
            case 'hp':
                hp(message, args);
                break;
            case 'xp':
                xp(message, args);
                break;
            //$initiative
            case 'initiative':
                initiative(message, args);
                break;
        }
    }
});

//Responds to a comment $hellothere in the only acceptable way.
function helloThere(message){
    message.channel.send('General Kenobi!\nYou are a bold one.\nhttps://www.youtube.com/watch?v=frszEJb0aOo');
}

//Checks if a Discord user is permitted to use the command
function isPermitted(uid){
    return (uid == 190515236434870272 || uid == 190355784859779073);
    // return uid != 190515236434870272
}

//Create a basic embed format for Diendee
function genBasicEmbed(text){
    let embed = new Discord.RichEmbed()
        .setThumbnail(client.user.displayAvatarURL)
        .setTitle(`**${client.user.username} says:**`)
        .setColor('#fcce63');
    if(text){
        embed.setDescription(text);
    }
    return embed;
}

//Remove all pinned messages sent by Diendee that start with the specified text
function removePinnedMessages(message, start_text){
    message.channel.fetchPinnedMessages().then(function(messages){
        messages = messages.array();
        messages.forEach(function(mes){
            if(mes.author.id == client.user.id && mes.embeds[0].description.substring(0,start_text.length) == start_text){
                mes.unpin();
            }
        });
    });
}

//Converts a string to a Natural number; Returns 1 if there's an error
function parseNat(val){
    val = parseInt(val);
    if(!isNaN(val) && val > 0){
        return val;
    }
    return 1;
}

//Given a hash, return all key-value pairs in a single string, seperated by newlines
function formatHash(hash){
    var output = ``;
    for(key in hash){
        output += `**${key}:** ${hash[key]}\n`;
    }
    return output;
}

//Loads a JSON from memory
function loadData(path){
    return new Promise(function(resolve, reject){
        fs.readFile(path, 'utf-8', function(err, data){
            if(err){
                console.log("Error", err);
                reject(err);
            }
            else{
                resolve(JSON.parse(data));
            }
        });
    });
}

function roll(message, args){
    if(args.length < 1){
        message.channel.send('Please specify die/dice to roll.');
        return;
    }
    let embed = new Discord.RichEmbed()
        //Set thumbnail to Diendee's profile pic
        .setThumbnail(client.user.displayAvatarURL)
        //Set author to the person who requested the roll
        .setAuthor(message.author.username + ' rolled: ', message.author.displayAvatarURL)
        .setColor('#fcce63');
    const RE = /^(\d*)(?:d(\d+))?$/;
    var results = new Promise(function(resolve, reject){
        args.forEach(async function(arg){
            arg = arg.replace(/\./g, ' ');
            //Parse the roll commands and roll them
            var pendingRolls = [];
            var cmd = arg[0].toUpperCase() + arg.slice(1).toLowerCase();
            if(isStat(cmd) || isSkill(cmd)){
                var bonus = await getRequestedValue(cmd, [mapping['u' + message.author.id]]);
                bonus = parseInt(bonus[0].value);
                var roll = rollDice(1,20);
                roll.total += bonus;
                roll.rolls.push(bonus);
                pendingRolls.push({'cmd': 'd20+' + bonus, 'result': roll});
            }
            else {
                arg.split('+').forEach(function(inp){
                    cmds = RE.exec(inp);
                    if(cmds){
                        var sides = parseNat(cmds[2]);
                        var quant = parseNat(cmds[1]);
                        pendingRolls.push({'cmd': cmds[0], 'result': sides == 1 ? {'total': quant, 'rolls': [quant]} : rollDice(quant, sides)});
                    }
                    else{
                        message.channel.send(genBasicEmbed(`Sorry, I could not roll _${inp}_.`));
                        resolve(false);
                        return;
                    }
                });
            }
            //Print the results
            const rolls = await Promise.all(pendingRolls);
            if(rolls.length > 0){
                var total = 0;
                rolls.forEach(function(roll){
                    total += roll.result.total;
                });
                embed.addField(`**${arg}**`, formatRolls(rolls) + `**Total: ${total}**\n`, true);
            }
            resolve(true);
        });
    });
    results.then(function(send){
        if(send){
            message.channel.send(embed);
        }
    }).catch(function(err){
        console.log('Error rolling dice')
        message.channel.send(genBasicEmbed('I ran into some trouble rolling those dice'));
    });
}

//Rolls {dice}, each with {sides}
function rollDice(dice, sides){
    var rolls = [];
    for(d = 0; d < dice; d++){
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return {'total': rolls.reduce((a,b) => a + b, 0), 'rolls': rolls};
}

//Turns a JSON of roll results into a string
function formatRolls(rolls){
    output = ''
    rolls.forEach(function(roll){
        output += `**${roll.cmd}:** ${roll.result.total} _(${roll.result.rolls.join(', ')})_\n`
    });
    return output
}

//Gets the index of the lowest value in the array
function getMinIndex(rolls){
    var minI = 0;
    for(m = 0; m < rolls.length; m++){
        if(rolls[m] < rolls[minI]){
            minI = m;
        }
    }
    return minI;
}

//Print information about Diendee
function about(message){
    var owner = client.users.get(auth.owner);
    let embed = genBasicEmbed('Greetings adventurer!\nMy name is Diendee and I will aid you on your journey.\n\nType `' + auth.prefix + 'usage` to learn how to talk to me!')
        //Add signature to the bot.
        .setFooter(`This bot was created by ${owner.username}`, owner.displayAvatarURL);

    message.channel.send(embed);
}

//Print information about using Diendee
function usage(message){
    const message_text = 'Here are some ways you can talk to me:';
    //Remove old usage commands
    removePinnedMessages(message, message_text);
    //All the usage commands
    let embed = genBasicEmbed(message_text)
        .addField(`${auth.prefix}about`, "Learn about me!")
        .addField(`${auth.prefix}usage`, "Learn how to talk to me!")
        .addField(`${auth.prefix}roll _[dice{+dice...}|attribute]_`, 
            "I'll roll the specified roll.\nRolls can be specifed as `$roll 2d6+d8+2d20`.\nYou can specify multiple rolls, just seperate them with a space like so: `$roll d20 2d6+5`.\nYou can also roll by attributes. Try `$roll Strength` to make a Strength check.")
        .addField(`${auth.prefix}stats _{name ...}_`, "I'll look up some stats for you. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}bio _{name ...}_`, "I'll to look up some bios. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}readbio _{name ...}_`, "I'll send you some adventurer(s)'s life story. I'll find yours if you don't specify character(s).")
        .addField(`${auth.prefix}get _attribute {name ...}_`, "I'll tell you the proficiencies for a given stat. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}initiative _{first.last:modifier ...}_`, "I'll roll initiative for you and pin it to the channel. I can roll NPCs too if you give me their name and initiative modifier.");
    //Pin usage commands to the channel
    message.channel.send(embed).then(function(message){
        message.pin();
    });
}

function isStat(value){
    return skills.hasOwnProperty(value);
}

function getStatValue(data, value) {
    return Math.floor((data.stats[value].value-10)/2);
}

function isSkill(value){
    for(key in skills){
        if(skills[key].includes(value)){
            return true;
        }
    }
    return false;
}

function getSkillValue(data, skill, stat=undefined){
    if(!stat){
        for(key in skills){
            if(skills[key].includes(skill)){
                stat = key;
                break;
            }
        }
    }
    var val = Math.floor((data.stats[stat].value - 10)/2);
    if(data.stats[stat].proficiencies.hasOwnProperty(skill)){
        val += (data.stats[stat].proficiencies[skill] ? data.proficiency_bonus * 2 : data.proficiency_bonus);
    }
    return val;
}

//Print the requested stats
function stats(message, characters){
    //Print the stats of all the specified characters
    if(characters.length > 0){
        characters.forEach(function(character){
            printStats(character, message);
        });
    }
    //If no character was specified, print the sender's character's stats
    else{
        var pc = mapping['u' + message.author.id];
        printStats(pc, message);
    }
}

//Prints the stats of the specified character
function printStats(character, message){
    //Load character data
    loadData(BASE_PATH + '/pcs/'+ character + '.json').then(function(data){
        let embed = new Discord.RichEmbed()
            .setThumbnail('attachment://image.png')
            .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.subclass})`)
            .setColor(data.color)
            .setDescription(`**HP:** ${data.hp.current}/${data.hp.max} · **AC:** ${data.combat.ac} · **Speed:** ${data.combat.speed}`);
        //Get the values for each main stat
        for(key in data.stats){
            //Constitution has no associated skills
            if(key == "Constitution"){                
                embed.addField(`**${key}: ${data.stats[key].value}**`, "_None_", true);
            }
            else{
                var vals = {}
                //Get the values for each proficiency within the main stat
                skills[key].forEach(function(skill){
                    vals[skill] = getSkillValue(data, skill, key);
                });    
                //Add formatted values to the embed to be outputted
                embed.addField(`**${key}: ${data.stats[key].value}**`, formatHash(vals), true);
            }
        }
        //Send values to the channel
        message.channel.send({embed, files: [{ attachment: BASE_PATH + data.icon, name: 'image.png' }]});
    }).catch(function(e){
        message.channel.send(genBasicEmbed(`I couldn't find a PC named ${character}.`));
        console.log(e);
    });
}

function get(message, params){
    //If there was no choice specified
    if(params.length < 1){
        message.channel.send(genBasicEmbed(`You must specify a value to get and optionally, which PCs to search.`));
        return;
    }

    //Print the stats of all the specified characters
    var choice = params.shift().toLowerCase();
    choice = choice.charAt(0).toUpperCase() + choice.slice(1);

    //Make sure supplied choice is valid
    if(!isSkill(choice) && !isStat(choice)){
        message.channel.send(genBasicEmbed(`I couldn't find a value named _${choice}_.`));
        return;
    }
    //If no character was specified, print the sender's character's stats
    if(params.length == 0){
        params = [mapping['u' + message.author.id]];
    }
    getRequestedValue(choice, params, message).then(function(characters){
        // Print all the requested stat values
        if(characters.length > 0){
            var output = ''
            characters.forEach(function(character){
                output += '**' + character.name + '**: ' + character.value + '\n';
            });
            message.channel.send(genBasicEmbed(`Here are the values for _${choice}_:\n\n${output}`));
        }
    }).catch(function(error){
        console.log(error);
        message.channel.send(genBasicEmbed(`I ran into some trouble getting ${choice} for ${params}`));
    });
}

//Gets the proficiency values for some characters in a particular skill
async function getRequestedValue(value, characters){
    //Find the stat value for each character
    promises = characters.map(async character => {
        const data = await loadData(BASE_PATH + '/pcs/' + character + '.json');
        return {"name": data.name, "value": `${isStat(value) ? getStatValue(data, value) : getSkillValue(data, value)}`};
    });
    return await Promise.all(promises);
}

//Print the requested bios.
function bio(message, characters){
    //Print the bios of all the specified characters
    if(characters.length > 0){
        characters.forEach(function(character){
            printBio(character, message);
        });
    }
    //If no character was specified, print the sender's character's bio
    else{
        var pc = mapping['u' + message.author.id];
        printBio(pc, message);
    }
}

//Prints the bio of a specified chracter
function printBio(character, message){
    loadData(BASE_PATH + '/pcs/' + character + '.json').then(function(data){
        var acct = client.users.get(data.player)
        var stats = {}
        for(key in data.stats){
            stats[key] = data.stats[key].value;
        }

        let embed = new Discord.RichEmbed()
            .setAuthor(acct.username, acct.displayAvatarURL)
            .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.subclass})`)
            //Character portrait
            .setThumbnail('attachment://image.png')
            //Print character Stats
            .setDescription(`**Total XP**: ${data.xp.total} · **XP to Next Lvl**: ${data.xp.next}`)
            //Print characteristics and statistics
            .addField('**Characteristics**', formatHash(data.characteristics), true)
            .addField('**Statistics**', formatHash(stats), true)
            .addField('**Combat**', `**HP:** ${data.hp.current}/${data.hp.max}\n**AC:** ${data.combat.ac}\n**Speed:** ${data.combat.speed}\n` +
                `**Initiative:** ${data.initiative_bonus}\n**Size:** ${data.combat.size}\n`, true)
            .addBlankField()
            //Print a preview to the bio
            .addField('**Bio Preview**', data.bio_preview + "\n\nUse the `$readbio` command to continue reading.")
            .setColor(data.color);

        message.channel.send({embed, files: [{ attachment: BASE_PATH + data.icon, name: 'image.png' }]});
    }).catch(function(e){
        message.channel.send(genBasicEmbed(`I couldn't find a PC named ${character}.`));
        console.log(e);
    });
}

//Dms the bio of the specified characters to the requester
function readbio(message, characters){
    //Format and print some flavor text
    message.author.send(genBasicEmbed(`${genFlavorText()}`));

    //Print the bio of each of the specified character's
    if(characters.length > 0){
        for(j = 0; j < characters.length; j++){
            sendFullBio(characters[j], message);
        }
    }
    //If no character was specified, print the sender's character's bio
    else{
        var pc = mapping['u' + message.author.id];
        sendFullBio(pc, message);
    }
}

//Sends the full bio of a character to the requester
function sendFullBio(character, message){
    //Read the full bio from a file
    fs.readFile(BASE_PATH + '/pcs/bios/' + character + '.txt', 'utf-8', function(err, data){
        if(err){
            console.log("Error loading file: ", err);
        }
        else{
            paragraphs = data.split("\n\n");
            //Add the title of the character's name
            output = `**${paragraphs[0]}**\n\n`;
            //Print each paragraph of the character's bio
            for(p = 1; p < paragraphs.length; p++){
                //Max message length for Discord is 2000, so split a paragraph if necessary
                if(output.length + paragraphs[p].length > 1970){
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

//Generate some flavor text for Diendee to say before sending a bio
function genFlavorText(){
    //Get a random num and plug it into a switch
    var num = Math.floor(Math.random() * 5) + 1;
    switch(num){
        case 1:
            return "You'd better get cozy. This is a long one.";
        case 2:
            return "A nice, quick read.";
        case 3:
            return "This one may take you a while. Good Luck!";
        case 4:
            return "Not much to learn here, I'm afraid, but you can take a look.";
        case 5:
            return "I hope you find what you are looking for.";
    }
}

//Update the HP values of the requested characters
async function hp(message, params){
    //Check to see if the user is authorized to use the command
    if(!isPermitted(message.author.id)){
        message.channel.send(genBasicEmbed('You are not authorized to use that command.'));
        return;
    };
    //Check if all parameters were specified
    if(params.length < 1){
        message.channel.send('You must specify character(s) and a value.');
        return;
    }
    //Get the amount to increment the hp by and check if its valid
    const results = params.map(async param =>{
        var cmd = param.split(/\:/g);
        var val = parseInt(cmd[1]);
        //Check to see if the hp command is valid, before trying to update
        if(cmd[1] == 'max' || !isNaN(val)){
            if(cmd[1] == 'max'){
                val = cmd[1];
            }
            var path = BASE_PATH + '/pcs/' + cmd[0].toLowerCase() + '.json';
            //Edit the HP and record whether it works
            return {'pc': cmd[0], 'success': await editHP(path, val)};
        }
        else{
            return {'pc': cmd[0], 'success': false};
        }
    });
    const pcs = await Promise.all(results);
    var success = []
    var errors = [];
    pcs.forEach(function(pc){
        if(pc.success){
            success.push(pc.pc);
        }
        else{
            errors.push(pc.pc);
        }
    });
    //Confirm HP update
    var description = 'I updated HP for: ' + success;
    if(errors.length > 0){
        description += '\nI ran into some trouble updating HP for ' + errors;
    }
    message.channel.send(genBasicEmbed(description));
}

//Edits the HP of the requested characters
function editHP(path, value){
    //Load PC data if possible
    return new Promise(function(resolve, reject){
        loadData(path).then(function(data){
            //Update the HP to the appropriate value
            if(value == 'max' || data.hp.current + value > data.hp.max){
                data.hp.current = data.hp.max;
            }
            else{
                data.hp.current += value;
                if(data.hp.current < 0){
                    data.hp.current = 0;
                }
            }
            //Write the updated data to the file
            fs.writeFile(path,  JSON.stringify(data, null, 4), function(err){
                if(err){
                    console.log("Error writing JSON: ", err);
                    resolve(false);
                }
                else{
                    resolve(true);
                }
            });
        }).catch(function(err){
            console.log('Error editing hp', err);
            resolve(false);
        });
    });
}

//Update the XP values of the requested characters
async function xp(message, params){
    //Check to see if the user is authorized to use the command
    if(!isPermitted(message.author.id)){
        message.channel.send(genBasicEmbed('You are not authorized to use that command.'));
        return;
    };
    //Check if all parameters were specified
    if(params.length < 1){
        message.channel.send('You must specify character(s) and a value.');
        return;
    }
    var results = params.map(async param => {
        var cmd = param.split(/\:/g);
        var val = parseInt(cmd[1]);
        //Check to see if the xp value is valid, before trying to update
        if(!isNaN(val)){
            var path = BASE_PATH + '/pcs/' + cmd[0].toLowerCase() + '.json';
            return {'pc': cmd[0], 'success': await editXP(path, val)};
        }
        else{
            return {'pc': cmd[0], 'success': false};
        }
    });
    const pcs = await Promise.all(results);
    var success = []
    var errors = [];
    pcs.forEach(function(pc){
        if(pc.success){
            success.push(pc.pc);
        }
        else{
            errors.push(pc.pc);
        }
    });
    //Confirm XP update
    var description = 'I updated XP for: ' + success;
    if(errors.length > 0){
        description += '\nI ran into some trouble updating XP for ' + errors;
    }
    message.channel.send(genBasicEmbed(description));
}

//Edits the XP of the requested characters
function editXP(path, value){
    //Load PC data if possible
    return new Promise(function(resolve, reject){
        loadData(path).then(function(data){
            //Update the XP to the appropriate value; Change values if level up occurs
            /* Known bugs
                Can only gain 1 level at a time
            */
            data.xp.total += value;
            while (data.xp.total >= levels[data.level + 1].xp){
                data.level += 1;
            }
            while (data.xp.total < levels[data.level].xp){
                data.level -= 1;
            }
            data.xp.next = levels[data.level+1].xp - data.xp.total;
            data.proficiency_bonus = levels[data.level].prof;
            data.hp.hit_dice = data.level;

            //Write the updated data to the file
            fs.writeFile(path,  JSON.stringify(data, null, 4), function(err){
                if(err){
                    console.log("Error writing JSON: ", err);
                    resolve(false);
                }
                else{
                    resolve(true);
                }
            });
        }).catch(function(err){
            console.log('Error editing xp', err);
            resolve(false);
        });
    });
}

//Roll for initiative and pin results to channel
function initiative(message, npcs){
    const message_text = 'Here are the initiative values: ';
    removePinnedMessages(message, message_text);//Remove old pinned initiative values
    getInitiativeRoll(npcs).then(function(vals){//Generate initiative values
        //Format initiative rolls
        output = '';
        vals.forEach(function(elem){
            output += '**' + elem.name + '**: ' + elem.initiative + '\n';
        });
        //Send the initiative values to the channel and pin them
        message.channel.send(genBasicEmbed(`${message_text}\n${output}`)).then(function(message){
            message.pin();
        });
    });
}

//Rolls initiative for all PCs and any requested NPCs
async function getInitiativeRoll(npcs){
    var pcs = [];
    for(key in mapping){
        pcs.push(mapping[key]);
    }
    const promises = pcs.map(async pc => {
        const data = await loadData(BASE_PATH + '/pcs/' + pc + '.json');
        return {name: data.name, initiative: rollDice(1,20).total + data.initiative_bonus};
    });
    const initiatives = await Promise.all(promises);
    //Check to see if any NPCs were specifed and roll for them if applicable
    if(npcs){
        npcs.forEach(function(npc){
            params = npc.replace('.', ' ').split(/\:/g);
            if(params.length == 2 && !isNaN(params[1])){
                params[1] = parseInt(params[1]);
                initiatives.push({name: params[0], initiative: rollDice(1,20).total + params[1]});
            }
        });
    }
    //Sort the initiative values least to greatest
    initiatives.sort(function(a, b){
        return b.initiative - a.initiative;
    })
    return initiatives;
}

//Bot login
client.login(auth.token);