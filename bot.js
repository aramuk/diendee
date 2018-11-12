const Discord = require("discord.js");
const fs = require('fs');
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
        }
    }
});

//Responds to a comment $hellothere in the only acceptable way.
function helloThere(message){
    message.channel.send('General Kenobi!\nYou are a bold one.\nhttps://www.youtube.com/watch?v=frszEJb0aOo');
}

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
        var test = new Discord.RichEmbed()
            //Set thumbnail to Diendee's profile pic
            .setThumbnail(client.user.displayAvatarURL)
            //Set author to the person who requested the roll
            .setAuthor(message.author.username + ' rolled: ', message.author.displayAvatarURL)
            .setColor('#fcce63');

        //Add each dice roll as a field
        for(i = 0; i < output.length; i++){
            test.addField(output[i].name, output[i].value, true);
        }
        message.channel.send(test);
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
    for(i = 0; i < cmds.length; i++){
        //Find the individual sets of rolls in those commands
        dice = cmds[i].split(/\+/g);
        var output = '';
        var sum = 0;
        //Conduct each roll in the set of rolls
        for(j = 0; j < dice.length; j++){
            //Get the rolls
            var results = getRoll(dice[j], drop);

            //Sum up the rolls and format the output
            output += `${dice[j]}:`;
            for(k = 0; k < results.length; k++){
                output += ` ${results[k]} `;
                sum += results[k];
            }
            output += '\n'
        }
        //Add the outcomes of the rolls to the fields to be printed
        fields.push({
            name: `${cmds[i]}:`,
            value: `${output}**Total**: ${sum}`
        });
    }
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
    die = parseInt(cmd.substring(dIndex +1));

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

    message.channel.send(embed);
}

//Print the requested stats
function stats(message, characters){
    //Print the stats of all the specified characters
    if(characters.length > 0){
        for(k = 0; k < characters.length; k++){
            printStats(characters[k], message);
        }   
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
        var data = require('./pcs/'+ character + '.json');

        let embed = new Discord.RichEmbed()
            .setThumbnail('attachment://image.png')
            .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`)
            .setColor(data.color)

        var skills = getSkills(data);
        for(j = 0; j < skills.length; j++){
            embed.addField(`${skills[j].cat}`, formatHash(skills[j].specs), true);
        }

        message.channel.send({embed, files: [{ attachment: data.icon, name: 'image.png' }]});
    }catch(e){
        message.channel.send(`${character} isn't here.`);
    }
}

//Returns a list of skills values sorted by stat
function getSkills(data){
    var categories = require('./pcs/skills.json');

    var columns = [];
    //For each stat, create a column with the stat as the title and the skills as the fields
    for(key in data.stats){
        var fields = {
            cat: `**${key}: ${data.stats[key]}**`,
            specs: {}
        }
        //Loop through all the skills for a category and add their values to the column.
        for(i = 0; i < categories[key].length; i++){
            var bonus = `${data.specializations[categories[key][i]]}`;
            //Get yellow die if available
            if(bonus != 'undefined'){
                fields.specs[`${categories[key][i]}`] = `${data.stats[key] - bonus}g+${bonus}y`;
            }
            //Else print just the green die
            else{
                fields.specs[`${categories[key][i]}`] = `${data.stats[key]}g`;
            }
        }
        columns.push(fields);
    }
    return columns;
}

function get(message, characters){
    //Print the stats of all the specified characters
    if(characters.length >= 1){
        var choice = characters.shift().toLowerCase();
        choice = choice.charAt(0).toUpperCase() + choice.slice(1);
        //If no character was specified, print the sender's character's stats
        if(characters.length == 0){
            var pc = mapping['u' + message.author.id];
            getProficiency(choice, [pc], message);
        }
        //Othewise prin thte stats of all specified characters
        else{
            getProficiency(choice, characters, message);
        }
    }
    //If there was no statistic specified
    else{
        message.channel.send('You must specify a statistic.');
    }
}

//Gets the proficiency values for some characters in a particular skill
function getProficiency(skill, characters, message){
    var skills = require('./pcs/skills.json');
    var data = ''
    var values = []
    //Loop through all the characters
    for(i = 0; i < characters.length; i++){
        //Load the character data
        try{
            data = require('./pcs/' + characters[i] + '.json');
        }
        catch(e){
            //Print a message if the character could not be found
            message.channel.send(`${characters[i]} isn't here.`);
        }
        //Get proficiency if it is a stat
        var dice = data.stats[skill]
        if(dice != undefined){
            values.push({ 'name': data.name, 'stat': `${dice}`});
        }
        else{
            //Get proficiency if it is a skill
            dice = getSkillValue(skill, skills, data);
            if(dice != undefined){
                values.push({ 'name': data.name, 'stat': `${dice}`});
            }
        }
    }
    //If some values were found for a specific stat
    if(values.length > 0){
        var output = ''
        for(k = 0; k < values.length; k++){
            output += '**' + values[k].name + '**: ' + values[k].stat + '\n';
        }
        message.channel.send(genBasicEmbed(`Here are the values for _${skill}_:\n\n${output}`));
    }
    //Error message if invalid stat
    else{
        message.channel.send(genBasicEmbed(`_${skill}_ is not a valid stat`));
    }
}

//Gets the value of a skill given the skill, the set of all skills, and user data
function getSkillValue(skill, skills, data){
    for(key in skills){
        for(j = 0; j < skills[key].length; j++){
            if(skills[key][j] == skill){
                var bonus = data.specializations[skill];
                if(bonus){
                    return `${data.stats[key] - bonus}g+${bonus}y`;
                }
                else{
                    return `${data.stats[key]}g`;
                }
            }
        }
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
        for(i = 0; i < characters.length; i++){
            printBio(characters[i], message);
        }   
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
        let embed = new Discord.RichEmbed()
            .setAuthor(acct.username, acct.displayAvatarURL)
            .setTitle(`**${data.name}** - ${data.title} - (Level ${data.level} ${data.class})`)
            //Character portrait
            .setThumbnail('attachment://image.png')
            //Print character exp
            .setDescription(`**Available XP**: ${data.available_xp} **Total XP**: ${data.xp}`)
            //Print characteristics and statistics
            .addField('**Characteristics**', formatHash(data.characteristics), true)
            .addField('**Statistics**', formatHash(data.stats), true)
            .addBlankField()
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

//Bot login
client.login(auth.token);