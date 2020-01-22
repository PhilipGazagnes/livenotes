const fs = require('fs');
const scDir = '../sc/';
// list all files

// loop on files and build song object
fs.readFile(`${scDir}0013.txt`, 'utf8', (err, sc) => {
  if (err) throw err;
  scToJson(sc);
});

function scToJson (sc) {
  const output = {
    sections: [],

  };
  const scSections = sc.split('\n\n');
  
}

// build html