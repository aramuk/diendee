const fs = require("fs-extra");

//Converts a string to a Natural number; Returns 1 if there's an error
const parseNat = function(val) {
    val = parseInt(val);
    if (!isNaN(val) && val > 0) {
        return val;
    }
    return 1;
}

//Given a hash, return all key-value pairs in a single string, seperated by newlines
const formatHash = function(hash) {
    var output = ``;
    for (key in hash) {
        output += `**${key}:** ${hash[key]}\n`;
    }
    return output;
}

//Loads a JSON from memory
const loadData = function(path) {
    return new Promise(function(resolve, reject) {
        fs.readFile(path, "utf-8", function(err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

module.exports = { parseNat, formatHash, loadData };