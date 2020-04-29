const fs = require('fs');
const scToObj = require('./scToObj');

const scDir = '../data/sc/';
const outputDir = '../data/json/';

function decodeSongs(files) {
  const output = {};
  return new Promise((res) => {
    for (let i = 0, len = files.length; i < len; i += 1) {
      const id = files[i].split('.')[0];
      fs.readFile(`${scDir}${id}.txt`, 'utf8', (err, sc) => {
        if (err) throw err;
        output[id] = scToObj.scToObj(sc);
      });
      if (i === len - 1) {
        setTimeout(() => {
          res(output);
        }, 1500);
      }
    }
  });
}

fs.readdir(scDir, (err, files) => {
  if (err) {
    console.log(err);
  }
  // decodeSongs(['0001.txt']).then((val) => {
  decodeSongs(files).then((val) => {
    const json = JSON.stringify(val);
    fs.writeFile(`${outputDir}data.json`, json, 'utf8', function (err) {
      if (err) {
        console.log('Error.');
        return console.log(err);
      }
      console.log('Success.');
    });
  });
});
