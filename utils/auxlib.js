const fs = require('fs-extra');

/**
 * Parses value to a natural number; Returns 1 if it's not a natural number
 * @param {*} val       Value to convert
 * @return a natural number
 */
const parseNat = val => {
    val = parseInt(val);
    if (!isNaN(val) && val > 0) {
        return val;
    }
    return 1;
};

/**
 * Given a JS object, return all key-value pairs in a single string, seperated by newlines
 * @param {*} obj - The object to format
 * @return a string representation of the object
 */
const formatObj = obj => {
    return Object.entries(obj)
        .map(entry => `**${entry[0]}**: ${entry[1]}`)
        .join('\n');
};

/**
 * Loads a JSON from memory
 * @param {string} path - A path to the JSON
 * @return some JSON
 */
const loadData = path => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                console.log('Error', err);
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

/**
 * Capitalizes each word in a string
 * @param {string} arg - A string to capitalize
 * @return {string} with all all first letters capitalized
 */
const capitalize = arg => {
    return arg
        .replace(/\_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(s => s[0].toUpperCase() + s.slice(1))
        .join(' ');
};

module.exports = { parseNat, formatObj, loadData, capitalize };
