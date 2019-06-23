const fs = require("fs-extra");

/**
 * Parses value to a natural number; Returns 1 if it's not a natural number
 * @param {*} val       Value to convert
 */
const parseNat = function(val) {
    val = parseInt(val);
    if (!isNaN(val) && val > 0) {
        return val;
    }
    return 1;
};

/**
 * Given a hash, return all key-value pairs in a single string, seperated by newlines
 * @param {*} hash          The hash to print out
 */
const formatHash = function(hash) {
    var output = ``;
    for (key in hash) {
        output += `**${key}:** ${hash[key]}\n`;
    }
    return output;
};

/**
 * Loads a JSON from memory
 * @param {string} path     A path to the JSON
 */
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
};

/**
 * Reformats a command line arg as needed
 * @param {string} attr         The string to reformat
 */
function formatArg(attr) {
    attr = attr.replace(/\_/g, " ").toLowerCase();
    switch (attr) {
        case "sleight of hand":
            return "Sleight of Hand";
        case "animal handling":
            return "Animal Handling";
        default:
            return attr
                .split(" ")
                .map(s => s[0].toUpperCase() + s.slice(1))
                .join(" ");
    }
}

module.exports = { parseNat, formatHash, loadData, formatArg };
