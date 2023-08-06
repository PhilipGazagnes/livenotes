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

function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const strA = a[0].toUpperCase();
  const strB = b[0].toUpperCase();

  let comparison = 0;
  if (strA > strB) {
    comparison = 1;
  } else if (strA < strB) {
    comparison = -1;
  }
  return comparison;
}

fs.readdir(scDir, (err, files) => {
  if (err) {
    console.log(err);
  }
  // decodeSongs(['0001.txt']).then((val) => {
  decodeSongs(files).then((val) => {
    const json = JSON.stringify(val);

    // console.log(val);
    const names = {};
    Object.keys(val).forEach((id) => {
      val[id].sections.forEach((s) => {
        const nameRaw = s.name.split('!')[0];
        if (names[nameRaw]) names[nameRaw] += 1;
        else names[nameRaw] = 1;
      });
    });

    Object.entries(names)
      .sort(compare)
      .forEach((n) => {
        console.log(`${n[0]};${n[1]}`);
      });

    fs.writeFile(`${outputDir}data.json`, json, 'utf8', function (err) {
      if (err) {
        console.log('Error.');
        return console.log(err);
      }
      console.log('Success.');
    });
  });
});
