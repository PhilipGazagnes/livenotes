const scToObj = require('./scToObj');
const buildSongPage = require('./buildSongPage');
const fs = require('fs');
const scDir = '../sc/';

fs.readFile(`${scDir}0013.txt`, 'utf8', (err, sc) => {
  if (err) throw err;
  buildSongPage.buildSongPage(
    scToObj.scToObj(sc)
  );
});