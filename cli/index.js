const fs = require('fs');
const scDir = '../sc/';
// list all files

// loop on files and build song object
fs.readFile(`${scDir}0013.txt`, 'utf8', (err, sc) => {
  if (err) throw err;
  console.log(scToObj(sc));
});


const trackParams = {
  BPM: 0,
  TON: 0,
};


function scToObj (sc) {
  const sections = sc.split('\n\n');
  return {
    track: trackToArr(sections[0]),
    cycles: cyclesToObj(sections.filter(item => sections.indexOf(item) !== 0)),
  };
}


function trackToArr(sc) {
  const instr = sc.split('\n');
  if (!instr[0].startsWith('@BPM')) throw 'missing initial @BPM instruction';
  const output = [];
  for (let i = 0, len = instr.length; i < len; i += 1) {
    const obj = trackInstrToObj(instr[i]);
    if (obj) output.push(obj);
  }
  return output;
}


function trackInstrToObj(sc) {
  const str = sc.replace(/\s/g, '');
  const arr = str.split('@');
  if (!str.startsWith('@')) {
    const cycle = arr[0].split('*');
    const cycleParams = {}
    const modifiers = arr.filter(item => arr.indexOf(item) !== 0);
    for (let i = 0, len = modifiers.length; i < len; i += 1) {
      const values = modifiers[i].split(':');
      cycleParams[values[0]] = values[1];
    }
    return {
      cycle: cycle[0],
      repeat: cycle[1] ? parseInt(cycle[1], 10) : 1,
      BPM: cycleParams.BPM ? cycleParams.BPM : trackParams.BPM,
      TON: cycleParams.TON ? cycleParams.TON : trackParams.TON,
      LEN: cycleParams.LEN ? cycleParams.LEN : 0,
    };
  } else {
    for (let i = 0, len = arr.length; i < len; i += 1) {
      const values = arr[i].split(':');
      trackParams[values[0]] = values[1];
    }
  }
}

function bpmFromModifier(sc) {
  return sc;
}

function cyclesToObj(sc) {
  return sc;
}

function getBpm(str) {
  return str
}

// build html