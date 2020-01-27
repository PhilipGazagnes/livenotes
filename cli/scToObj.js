const trackParams = {
  BPM: 0,
  TON: 0,
};


let lyrics = {};


function scToObj(sc) {
  const sections = sc.split('\n\n');
  lyrics = lyricsToObj(sections.filter(
    item => item.startsWith('$')
  ));
  return {
    track: trackToArr(sections[0]),
    cycles: cyclesToObj(sections.filter(
      item => item.startsWith('_')
    )),
  };
}
exports.scToObj = scToObj;


function trackToArr(sc) {
  const instr = sc.split('\n');
  if (!instr[0].startsWith('@BPM'))
    throw 'missing initial @BPM instruction';
  const output = [];
  for (let i = 0, len = instr.length; i < len; i += 1) {
    const obj = trackInstrToObj(instr[i]);
    if (obj) output.push(obj);
  }
  return output;
}


function trackInstrToObj(scStr) {
  const str = removeBlanks(scStr);
  const split1 = str.split('$');
  const arr = split1[0].split('@');
  if (!str.startsWith('@')) {
    const cycle = arr[0].split('*');
    const cycleParams = {}
    const modifiers = arr.filter(item => arr.indexOf(item) > 0);
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
      lyrics: split1[1] ? lyrics[split1[1]] : undefined,
    };
  } else {
    for (let i = 0, len = arr.length; i < len; i += 1) {
      const values = arr[i].split(':');
      trackParams[values[0]] = values[1];
    }
  }
}


function cyclesToObj(scArr) {
  const cyclesOutput = {
    add(payload) {
      this[payload.key] = payload.value;
    }
  };
  for (let i = 0; i < scArr.length; i += 1) {
    cyclesOutput.add(cycle(scArr[i]));
  }
  return cyclesOutput;
  function cycle(scStr) {
    const arr = scStr.split('\n');
    if (!arr[0].startsWith('_'))
      throw 'cycle description must start with a "_"';
    const cycleOutput = {
      key: arr[0].substr(1),
    };
    const phases = [{
      chords: [],
    }];
    let phasesCount = 1;
    for (let i = 1; i < arr.length; i += 1) {
      if (arr[i].startsWith('/')) {
        const spl = arr[i].split('*');
        phases[phasesCount - 1].repeats = spl[1] ? spl[1] : 1;
        phasesCount = phasesCount + 1;
        if (i < arr.length - 1) {
          phases.push({
            chords: [],
          });
        }
      } else {
        const spl = arr[i].split(',');
        phases[phasesCount - 1].chords.push({
          chord: spl[0],
          beats: spl[1],
        });
        if (i === arr.length - 1) {
          phases[phasesCount - 1].repeats = 1;
        } 
      } 
    }
    cycleOutput.value = phases;
    return cycleOutput;
  }
}


function lyricsToObj(scArr) {
  const lyricsOutput = {
    add(payload) {
      this[payload.key] = payload.value;
    }
  }
  for (let i = 0, len = scArr.length; i < len; i += 1) {
    const str = scArr[i];
    const arr = str.split('\n');
    lyricsOutput.add({
      key: arr[0].substr(1),
      value: arr.filter(item => arr.indexOf(item) > 0),
    })
  }
  return lyricsOutput;
}


function removeBlanks(str) {
  return str.replace(/\s/g, '');
}