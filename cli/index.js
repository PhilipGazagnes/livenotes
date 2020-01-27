const scToObj = require('./scToObj');
const fs = require('fs');
const scDir = '../data/sc/';
const outputDir = '../data/json/';

const songId = '0001';

fs.readFile(`${scDir}${songId}.txt`, 'utf8', (err, sc) => {
  if (err) throw err;
  const obj = scToObj.scToObj(sc);
  const json = JSON.stringify(obj);
  fs.writeFile(`${outputDir}${songId}.json`, json, 'utf8', function (err) {
    if (err) {
        console.log(`Song ${songId}: An error occured while writing JSON Object to File.`);
        return console.log(err);
    }
    console.log(`Song ${songId}: JSON file has been saved.`);
  });
});