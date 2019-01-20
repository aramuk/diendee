const Discord = require("discord.js");
const fs = require('fs-extra');
const auth = require('./auth.json');

//D&D Data
const mapping = require('./data/mapping.json');
const skills = require('./data/skills.json');
const levels = require('./data/levels.json');

const client = new Discord.Client();

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

//Loads a file from memory
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
    var send = false;
    let embed = new Discord.RichEmbed()
            //Set thumbnail to Diendee's profile pic
            .setThumbnail(client.user.displayAvatarURL)
            //Set author to the person who requested the roll
            .setAuthor(message.author.username + ' rolled: ', message.author.displayAvatarURL)
            .setColor('#fcce63');
    /*Known bugs:
        20, results in a roll of 2 and 0
    */
    const RE = /^(\d*)d?(\d+)$/;
    args.forEach(function(arg){
        var rolls = [];
        //Parse the roll commands and roll them
        arg.split('+').forEach(function(inp){
            cmds = RE.exec(inp);
            // console.log('['+inp+']', cmds);
            if(!cmds){
                message.channel.send('Could not roll: ' + inp);
            }
            else{
                rolls.push({'cmd': cmds[0], 'result': rollDice(parseNat(cmds[1]), parseNat(cmds[2]))});
            }
        });
        //Print the results
        if(rolls.length > 0){
            var total = 0;
            rolls.forEach(function(roll){
                total += roll.result.total;
            });
            embed.addField(`**${arg}**`, formatRolls(rolls) + `**Total: ${total}**\n`, true);
        }
    });
    if(send){
        message.channel.send(embed);
    }
}

//Rolls {dice}, each with {sides}
function rollDice(dice, sides){
    var rolls = [];
    for(d = 0; d < dice; d++){
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    function add(a, b) {
        return a + b;
    }
    return {'total': rolls.reduce(add, 0), 'rolls': rolls};
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
        .addField(`${auth.prefix}about`, "Learn about me")
        .addField(`${auth.prefix}usage`, "Learn how to talk to me")
        .addField(`${auth.prefix}roll (dice{+dice...})+ [--drop]`, 
            "I'll roll the specified roll.\nRolls can be specifed as `2d6+d8+2d20`.\nYou can specify multiple rolls, just seperate them with a space like so: `d20 2d6+5`.\n`--drop` is optional, but if you add it I will drop the lowest roll.")
        .addField(`${auth.prefix}stats {name ...}`, "I'll look up some stats for you. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}bio {name1 ...}`, "I'll to look up some bios. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}readbio {name1 ...}`, "I'll send you some adventurer(s)'s life story. I'll find yours if you don't specify character(s).")
        .addField(`${auth.prefix}get stat {name1 ...}`, "I'll tell you the proficiencies for a given stat. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}initiative {first_last:modifier ...}`, "I'll roll initiative for you and pin it to the channel. I can roll NPCs too if you give me their name and initiative modifier.");
    //Pin usage commands to the channel
    message.channel.send(embed).then(function(message){
        message.pin();
    });
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

function getSkillValue(data, stat, skill){
    var val = Math.floor((data.stats[stat].value - 10)/2);
    if(data.stats[stat].proficiencies.hasOwnProperty(skill)){
        val += (data.stats[key].proficiencies[skill] ? data.proficiency_bonus * 2 : data.proficiency_bonus);
    }
    return val;
}

//Prints the stats of the specified character
function printStats(character, message){
    //Load character data
    loadData('./pcs/'+ character + '.json').then(function(data){
        let embed = new Discord.RichEmbed()
            .setThumbnail('attachment://image.png')
            .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`)
            .setColor(data.color)
            .setDescription(`**HP:** ${data.hp.current}/${data.hp.max} · **AC:** ${data.combat.ac} · **Speed:** ${data.combat.speed}`);
        //Get the values for each main stat
        for(key in data.stats){
            var vals = {}
            //Get the values for each proficiency within the main stat
            skills[key].forEach(function(skill){
                vals[skill] = getSkillValue(data, key, skill);
            });

            //Constitution has no associated skills
            if(key == "Constitution"){
                embed.addField(`**${key}: ${data.stats[key].value}**`, "_None_", true);
            }
            else{
                //Add formatted values to the embed to be outputted
                embed.addField(`**${key}: ${data.stats[key].value}**`, formatHash(vals), true);
            }
        }
        //Send values to the channel
        message.channel.send({embed, files: [{ attachment: data.icon, name: 'image.png' }]});
    }).catch(function(e){
        message.channel.send(`${character} isn't here.`);
        console.log(e);
    });
}

function get(message, params){
    //Print the stats of all the specified characters
    if(params.length >= 1){
        var choice = params.shift().toLowerCase();
        choice = choice.charAt(0).toUpperCase() + choice.slice(1);
        var values = [];
        //If no character was specified, print the sender's character's stats
        if(params.length == 0){
            params = [mapping['u' + message.author.id]];
        }
        getRequestedSkill(choice, params, message).then(function(values){
            // Print all the requested stat values
            if(values.length > 0){
                var output = ''
                values.forEach(function(value){
                    output += '**' + value.name + '**: ' + value.stat + '\n';
                });
                message.channel.send(genBasicEmbed(`Here are the values for _${choice}_:\n\n${output}`));
            }
            else{
                console.log('Error getting', choice, 'for', params);
                message.channel.send(genBasicEmbed(`I couldn't find _${choice}_ for ${params}.`));
            }
        }).catch(function(error){
            console.log(error);
        });
    }
    //If there was no statistic specified
    else{
        message.channel.send('You must specify a statistic.');
    }
}

//Gets the proficiency values for some characters in a particular skill
async function getRequestedSkill(skill, characters, message){
    //Make sure stat is valid before proceeding
    var stat = ''
    for(key in skills){
        if(key == skill || skills[key].includes(skill)){
            stat = key;
            break;
        }
    }
    var promises = [];
    if(stat == ''){
        return promises;
    }
    //Find the stat value for each character
    promises = characters.map(async character => {
        const data = await loadData('./pcs/' + character + '.json');
        var val = 0;
        //Get the value if the requested value is a stat
        if(stat == skill){
            val = data.stats[stat].value;
        }
        //Get the value if the requested value is a stat
        else{
            val = getSkillValue(data, stat, skill);
        }
        return {"name": data.name, "stat": `${val}`};
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
    loadData('./pcs/' + character + '.json').then(function(data){
        var acct = client.users.get(data.player)
        var stats = {}
        for(key in data.stats){
            stats[key] = data.stats[key].value;
        }

        let embed = new Discord.RichEmbed()
            .setAuthor(acct.username, acct.displayAvatarURL)
            .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`)
            //Character portrait
            .setThumbnail('attachment://image.png')
            //Print character Stats
            .setDescription(`**Total XP**: ${data.xp.total} · **XP to Next Lvl**: ${data.xp.next}`)
            //Print characteristics and statistics
            .addField('**Characteristics**', formatHash(data.characteristics), true)
            .addField('**Statistics**', formatHash(stats), true)
            .addField('**Combat**', `**HP:** ${data.hp.current}/${data.hp.max}\n**AC:** ${data.combat.ac}\n**Speed:** ${data.combat.speed}`, true)
            .addBlankField(true)
            //Print a preview to the bio
            .addField('**Bio Preview**', data.bio_preview + "\n\nUse the `$readbio` command to continue reading.")
            .setColor(data.color);

        message.channel.send({embed, files: [{ attachment: data.icon, name: 'image.png' }]});
    }).catch(function(e){
        message.channel.send(`${character} isn't here.`);
        console.log(e);
    });
}

//Dms the bio of the specified characters to the requester
function readbio(message, characters){
    //Format and print some flavor text
    message.author.send(genBasicEmbed(`${genFlavorText()}`))
    
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
    fs.readFile('./pcs/bios/' + character + '.txt', 'utf-8', function(err, data){
        if(err){
            console.log("Error", err);
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
function hp(message, params){
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
    var errors = [];
    var pcs = [];
    params.forEach(function(param){
        var cmd = param.split(/\:/g);
        var val = parseInt(cmd[1]);
        //Check to see if the hp command is valid, before trying to update
        if(cmd[1] == 'max' || !isNaN(val)){
            if(cmd[1] == 'max'){
                val = cmd[1];
            }
            var path = './pcs/' + cmd[0].toLowerCase() + '.json';
            //Edit the HP and record whether it works
            var success = editHP(path, val);
            if(success){
                pcs.push(cmd[0]);
            }
            else{
                errors.push(cmd[0]);
            }
        }
        else{
            errors.push(cmd[0]);
        }
    });

    //Confirm HP update
    var description = 'I updated the HP values for: ' + pcs;
    if(errors.length > 0){
        description += '\nI ran into some trouble updating HP for ' + errors;
    }
    message.channel.send(genBasicEmbed(description));
}

//Edits the HP of the requested characters
function editHP(path, value){
    //Load PC data if possible
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
        fs.writeJSON(path, data, function(err){
            if(err){
                console.log("Error: ", err);
                return false;
            }
        });
        return true;
    }).catch(function(err){
        console.log('Error editing hp', err);
        return false;
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
    promises = pcs.map(async pc => {
        const data = await loadData('./pcs/' + pc + '.json');
        return {name: data.name, initiative: rollDice(1,20).total + data.initiative_bonus};
    });
    const initiatives = await Promise.all(promises);
    //Check to see if any NPCs were specifed and roll for them if applicable
    if(npcs){
        npcs.forEach(function(npc){
            params = npc.replace('_', ' ').split(/\:/g);
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