const Discord = require("discord.js");
const fs = require('fs-extra');
var auth = require('./auth.json');

//A mapping of userIDs to characters
var mapping = require('./mapping.json');

const client = new Discord.Client();

//On bot start
client.on("ready", function(){
    console.log("I am ready!");
});


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
            case 'initiative':
                initiative(message)
        }
    }
});

//Responds to a comment $hellothere in the only acceptable way.
function helloThere(message){
    message.channel.send('General Kenobi!\nYou are a bold one.\nhttps://www.youtube.com/watch?v=frszEJb0aOo');
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
    return embed
}

//Rolls the dice specified, and prints the result.
function roll(message, args){
    //Exit early if no dice specified.
    if(args.length < 1){
        message.channel.send('Please specify die/dice to roll');
    }
    //Proceed with rolling...
    else{
        //Get rolls as a list of hashes
        output = getRollOutput(args);
        
        //Print the hashes to the channel where they were requested
        let embed = new Discord.RichEmbed()
            //Set thumbnail to Diendee's profile pic
            .setThumbnail(client.user.displayAvatarURL)
            //Set author to the person who requested the roll
            .setAuthor(message.author.username + ' rolled: ', message.author.displayAvatarURL)
            .setColor('#fcce63');

        //Add each dice roll as a field
        output.forEach(function(elem){
            embed.addField(elem.name, elem.value, true);
        });
        message.channel.send(embed);
    }
}

//Returns requested rolls as a list of hashes representing fields
function getRollOutput(cmds){
    //Check to see if we should drop the lowest roll
    var drop = false;
    if(cmds[cmds.length - 1] == '--drop'){
        drop = true;
        cmds.splice(cmds.length - 1, 1);
    }
    //Get the roll corresponding to each command and add it to a list
    fields = [];
    //Run through all sets of commands
    cmds.forEach(function(cmd){
        //Find the individual sets of rolls in those commands
        dice = cmd.split(/\+/g);
        var output = '';
        var sum = 0;
        //Conduct each roll in the set of rolls
        dice.forEach(function(die){
            //Get the rolls
            var results = getRoll(die, drop);

            //Sum up the rolls and format the output
            output += `${die}:`;
            results.forEach(function(result){
                output += ` ${result} `;
                sum += result;
            });
            output += '\n'
        });
        //Add the outcomes of the rolls to the fields to be printed
        fields.push({
            name: `${cmd}:`,
            value: `${output}**Total**: ${sum}`
        });
    });
    //Return all the fields to be printed
    return fields;
}

//Returns the an array of rolls for a given command
function getRoll(cmd, drop){
    //If the command specifies a constant, return it.
    dIndex = cmd.indexOf('d');
    if(dIndex == -1){
        return [parseInt(cmd)];
    }

    //Find the type of die to roll
    die = parseInt(cmd.substring(dIndex + 1));

    //Find the number of die to roll
    quantity = 1;
    if(dIndex > 0){
        quantity = parseInt(cmd.substring(0, dIndex));
    }

    //Roll the dice and record the results.
    rolls = [];
    for(r = 0; r < quantity; r++){
        rolls.push(Math.floor(Math.random() * die) + 1);
    }
    
    //Drop the lowest roll if applicable
    if(drop){
        minI = getMinIndex(rolls);
        console.log('Dropping ' + rolls[minI] + ' from ' + cmd);
        rolls.splice(minI, 1);
    }

    return rolls;
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
    let embed = genBasicEmbed(`Greetings adventurer!\nMy name is Diendee and I will aid you on your journey.\n\nType ${auth.prefix}usage to learn how to talk to me!`)
        //Add signature to the bot.
        .setFooter(`This bot was created by ${owner.username}`, owner.displayAvatarURL);

    message.channel.send(embed);
}

//Print information about using Diendee
function usage(message){
    let embed = genBasicEmbed("Here are some ways you can talk to me:")
        .addField(`${auth.prefix}about`, "Learn about me")
        .addField(`${auth.prefix}usage`, "Learn how to talk to me")
        .addField(`${auth.prefix}roll [roll1 ...] --drop`, 
            "I'll roll the specified roll.\nRolls can be specifed as `2d6+d8+2d20+5+5`.\nYou can specify multiple rolls, just seperate them with a space like so: `d20 2d6+5`.\n`--drop` is optional, but if you add it I will drop the lowest roll.")
        .addField(`${auth.prefix}stats [name1 ...]`, "I'll look up some stats for you. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}bio [name1 ...]`, "I'll to look up some bios. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}readbio [name1 ...]`, "I'll send you some adventurer(s)'s complete life story. I'll send your own if you don't specify character(s).")
        .addField(`${auth.prefix}get [stat] [name1 ...]`, "I'll tell you the proficiencies for a given stat. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}initiative`, "I'll find the initiative values for you and pin it to the channel");

    message.channel.send(embed);
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
    try{
        //Load character data
        var data = require('./pcs/'+ character + '.json');

        let embed = new Discord.RichEmbed()
            .setThumbnail('attachment://image.png')
            .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`)
            .setColor(data.color)
            .setDescription(`**HP:** ${data.hp.Current}/${data.hp.Max} · **AC:** ${data.combat.AC} · **Speed:** ${data.combat.Speed}`);

        //Get the possible skills
        var skills = require('./pcs/skills.json');
        //Get the values for each main stat
        for(key in data.stats){
            var vals = {}
            //Get the values for each proficiency within the main stat
            skills[key].forEach(function(skill){
                if(data.stats[key][1][skill]){
                    vals[skill] = data.stats[key][1][skill];
                }
                else{
                    vals[skill] = Math.floor((data.stats[key][0] - 10)/2);
                }
            });

            //Constitution has no associated skills
            if(key == "Constitution"){
                embed.addField(`**${key}: ${data.stats[key][0]}**`, "_None_", true);
            }
            else{
                //Add formatted values to the embed to be outputted
                embed.addField(`**${key}: ${data.stats[key][0]}**`, formatHash(vals), true);
            }
        }
        //Send values to the channel
        message.channel.send({embed, files: [{ attachment: data.icon, name: 'image.png' }]});
    }catch(e){
        message.channel.send(`${character} isn't here.`);
        console.log(e);
    }
}

function get(message, params){
    //Print the stats of all the specified characters
    if(params.length >= 1){
        var choice = params.shift().toLowerCase();
        choice = choice.charAt(0).toUpperCase() + choice.slice(1);
        //If no character was specified, print the sender's character's stats
        if(params.length == 0){
            var pc = mapping['u' + message.author.id];
            printRequestedSkill(choice, [pc], message);
        }
        //Othewise prin thte stats of all specified characters
        else{
            printRequestedSkill(choice, params, message);
        }
    }
    //If there was no statistic specified
    else{
        message.channel.send('You must specify a statistic.');
    }
}

//Gets the proficiency values for some characters in a particular skill
function printRequestedSkill(skill, characters, message){
    var skills = require('./pcs/skills.json');

    //Check whether the requested skill is either skill or a stat
    var stat = ''
    skillLoop:
    for(key in skills){
        if(key == skill){
            stat = key
            break;
        }
        skills[key].forEach(function(s){
            if(s == skill){
                stat = key;
                break skillLoop;
            }
        });
    }

    //If the stat is not valid, return it
    if(stat == ''){
        message.channel.send(genBasicEmbed(`_${skill}_ is not a valid stat`));
        return;
    }

    //Find the stat value for each character
    var values = []
    characters.forEach(function(character){
        var data = '';
        //Check to see if the character exists
        try{
            data = require('./pcs/' + character + '.json');
            var val = 0;
            //Get the value if the requested value is a stat
            if(stat == skill){
                val = data.stats[stat][0];
            }
            //Get the value if the requested value is a stat
            else{
                //Get the value if there are proficiencies
                if(data.stats[stat][1][skill]){
                    val = data.stats[stat][0] + 'g+' + data.stats[stat][1][skill] + 'y';
                }
                //Get the value if there are no proficiencies
                else{
                    val = data.stats[stat][0] + 'g';
                }
            }
            values.push({"name": data.name, "stat": `${val}`});
        }
        catch(e){
            message.channel.send(`${character} isn't here.`);
        }
    });

    //Print all the requested stat values
    if(values.length > 0){
        var output = ''
        values.forEach(function(value){
            output += '**' + value.name + '**: ' + value.stat + '\n';
        });
        message.channel.send(genBasicEmbed(`Here are the values for _${skill}_:\n\n${output}`));
    }
}

//Given a hash, return all key-value pairs in a single string, seperated by newlines
function formatHash(hash){
    var output = ``;
    for(key in hash){
        output += `**${key}:** ${hash[key]}\n`;
    }
    return output;
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
    //Try-catch to make sure the character actually exists, with complete data
    try{
        //Read character data from a file
        var data = require('./pcs/' + character + '.json');
        var acct = client.users.get(data.player)

        var stats = {}
        for(key in data.stats){
            stats[key] = data.stats[key][0];
        }

        let embed = new Discord.RichEmbed()
            .setAuthor(acct.username, acct.displayAvatarURL)
            .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`)
            //Character portrait
            .setThumbnail('attachment://image.png')
            //Print character exp
            .setDescription(`**Available XP**: ${data.xp.available} **Total XP**: ${data.xp.total}`)
            //Print characteristics and statistics
            .addField('**Characteristics**', formatHash(data.characteristics), true)
            .addField('**Statistics**', formatHash(stats), true)
            .addField('**HP**', formatHash(data.hp), true)
            .addField('**Combat**', formatHash(data.combat), true)
            //Print a preview to the bio
            .addField('**Bio Preview**', data.bio_preview + "\n\nUse the `$readbio` command to continue reading.")
            .setColor(data.color);

        message.channel.send({embed, files: [{ attachment: data.icon, name: 'image.png' }]});
    }catch(e){
        message.channel.send(`${character} isn't here.`);
        console.log(e);
    }
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

function hp(message, params){
    // if(message.author.id != 190515236434870272 && message.author.id != 190355784859779073){
    if(message.author.id != 190515236434870272){
        message.channel.send(genBasicEmbed('You are not authorized to use that command.'));
        return;
    }

    //Print the stats of all the specified characters
    if(params.length >= 1){
        //Get the amount to increment the hp by and check if its valid
        var choice = params.shift().toLowerCase();
        if(choice != 'max'){
            choice = parseInt(choice);
            if(isNaN(choice)){
                message.channel.send('Please enter `max` or a number after hp.');
                return;
            }
        }
        //If no character was specified, update the sender's character's hp
        var pcs = [];
        if(params.length == 0){
            var mapping = require('./mapping.json');
            pcs.push(mapping['u' + message.author.id]);
        }
        //Otherwise update the hp of the specified characters.
        else{
            pcs = pcs.concat(params);
        }

        //Edit the hp for each requested pc
        pcs.forEach(function(pc){
            var path = './pcs/' + pc + '.json';
            var data = {}
            //Make sure the suggested pc exists
            try{
                data = require(path);
                editHP(data, path, choice);
            }
            catch(err){
                message.channel.send('Sorry, I could not find ' + pc + '.');
            }
        });
        message.channel.send('HPs updated for: ' + pcs);
    }
    //If there was no statistic specified
    else{
        message.channel.send('You must specify a character and a value.');
    }
}

function editHP(data, path, value){
    if(value == 'max'){
        data.hp.current = data.hp.max;
    }
    else{
        data.hp.current += value;
    }
    fs.writeJSON(path, data, function(err){
        if(err){
            console.log("Error: ", err);
        }
    });
}

function initiative(message){
    const message_text = 'Here are the initiative values: ';

    //Remove old pinned initiative values
    message.channel.fetchPinnedMessages().then(function(messages){
        messages = messages.array();
        messages.forEach(function(mes){
            if(mes.author.id == client.user.id && mes.embeds[0].description.substring(0,message_text.length) == message_text){
                mes.unpin();
            }
        });
    });

    //Find the current initiative values
    var mapping = require('./mapping.json');
    vals = [];
    for(id in mapping){
        var data = require('./pcs/' + mapping[id] + '.json');
        var roll = getRoll('d20', false)[0];
        vals.push({name: data.name, initiative: (roll + data.combat.Initiative)});
    }
    vals.sort(function(a, b){
        return b.initiative - a.initiative;
    });

    output = '';
    vals.forEach(function(elem){
        output += '**' + elem.name + '**: ' + elem.initiative + '\n';
    });

    //Send the initiative values to the channel and pin them
    message.channel.send(genBasicEmbed(`${message_text}\n${output}`)).then(function(message){
        message.pin();
    });
}

//Bot login
client.login(auth.token);