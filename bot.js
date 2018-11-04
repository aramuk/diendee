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
            //$bio
            case 'bio':
                bio(message, args);
                break;
        }
    }
});

//Responds to a comment $hellothere in the only acceptable way.
function helloThere(message){
    message.channel.send('General Kenobi!\nYou are a bold one.\nhttps://www.youtube.com/watch?v=frszEJb0aOo');
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

//Returns requested rolls as a list of hash
function getRollOutput(cmds){
    //Check to see if we should drop the lowest roll
    var drop = false;
    if(cmds[cmds.length - 1] == '--drop'){
        drop = true;
        cmds.splice(cmds.length - 1, 1);
    }
    //Get the roll corresponding to each command and add it to a list
    fields = [];
    for(i = 0; i < cmds.length; i++){
        fields.push(getRoll(cmds[i], drop));
    }
    return fields;
}

//Returns the results of an individual roll as a hash
function getRoll(cmd, drop){
    dIndex = cmd.indexOf('d');
    plusIndex = cmd.indexOf('+');

    //Find the number of die to roll
    quantity = 1;
    if(dIndex > 0){
        quantity = parseInt(cmd.substring(0, dIndex));
    }

    //Find the type of die to roll
    die = parseInt(cmd.substring(dIndex +1));
    modifier = 0;
    //If there is a bonus specified, get type of die and modifier
    if(plusIndex != -1){
        die = parseInt(cmd.substring(dIndex + 1, plusIndex));
        modifier = parseInt(cmd.substring(plusIndex + 1));
    }

    //Add all die rolls to a list and find the lowest roll.
    results = '';
    minI = undefined;
    rolls = [];
    for(j = 0; j < quantity; j++){
        outcome = Math.floor(Math.random() * die) + 1 + modifier;
        if(!minI || outcome < rolls[minI]){
            minI = rolls.length;
        }
        rolls.push(outcome);
    }
    
    //Find the sum of the die rolls, not including the lowest roll.
    var sum = 0;
    for(k = 0; k < rolls.length; k++){
        if(!drop || k != minI){
            sum += rolls[k];
        }
        results += rolls[k] + ' ';
    }

    //Return command, roll, sum as a hash
    return {
        name: `${cmd}: `,
        value: `${results}\nTotal: ${sum}`
    };
}

//Print information about Diendee
function about(message){
    var owner = client.users.get(auth.owner);
    let embed = new Discord.RichEmbed()
        .setThumbnail(client.user.displayAvatarURL)
        .setTitle(`**${client.user.username} says:**`)
        .setDescription(`Greetings adventurer! My name is Diendee and I will aid you 
            on your journey.\n\nType ${auth.prefix}usage to learn how to talk to me!`)
        //Add my signature to the bot.
        .setFooter(`This bot was created by ${owner.username}`, owner.displayAvatarURL)
        .setColor("#fcce63");

    message.channel.send(embed);
}

//Print information about using Diendee
function usage(message){
    let embed = new Discord.RichEmbed()
        .setThumbnail(client.user.displayAvatarURL)
        .setTitle(`**${client.user.username} says:**`)
        .setDescription("Here are some ways you can talk to me:")
        .setColor('#fcce63')
        .addField(`${auth.prefix}about`, "Learn about me")
        .addField(`${auth.prefix}usage`, "Learn how to talk to me")
        .addField(`${auth.prefix}roll [dice1...] --drop`, 
            "I'll roll the specified die.\nDie can be specified as `20`, `d10`, `3d12`, `d6+2`, etc.\nCan roll any number of die.\n`--drop` is optional, but if you add it I will drop the lowest roll.")
        .addField(`${auth.prefix}stats [name1...]`, "I'll look up some stats for you. I'll look up yours if you don't specify character(s).")
        .addField(`${auth.prefix}bio [name1...]`, "I'll to look up some bios. I'll look up yours if you don't specify character(s).");

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
        // console.log('Error');
    }
}

function getSkills(data){
    var categories = require('./pcs/skills.json');

    var columns = [];
    for(key in data.stats){
        var fields = {
            cat: `**${key}: ${data.stats[key]}**`,
            specs: {}
        }
        for(i = 0; i < categories[key].length; i++){
            var bonus = `${data.specializations[categories[key][i]]}`;
            if(bonus != 'undefined'){
                fields.specs[`${categories[key][i]}`] = `${data.stats[key] - bonus}g+${bonus}y`;
            }
            else{
                fields.specs[`${categories[key][i]}`] = `${data.stats[key]}g`;
            }
        }
        columns.push(fields);
    }
    return columns;
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
            //Print character statistics
            .addField('**Characteristics**', formatHash(data.characteristics), true)
            .addField('**Statistics**', formatHash(data.stats), true)
            .addBlankField()
            .setColor(data.color);

        // If the character's bio is too long, truncate it, else add the whole thing.
        if(data.bio.length > 1){
            embed.addField('**Bio Preview**', data.bio[0] + '... {truncated}');
            message.channel.send({embed, files: [{ attachment: data.icon, name: 'image.png' }]});
        }else {
            embed.addField('**Bio**', data.bio[0]);
            message.channel.send({embed, files: [{ attachment: data.icon, name: 'image.png' }]});
        }
    }catch(e){
        message.channel.send(`${character} isn't here.`);
        // console.log('Error');
    }
}

//Bot login
client.login(auth.token);