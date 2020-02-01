const trackParams = {
  BPM: 0,
  TON: 0,
};


let lyrics = {};
let notas = {};
let cycles = {};
let track = [];

function scToObj(sc) {
  const sections = sc.split('\n\n');
  lyrics = lyricsToObj(sections.filter(
    item => item.startsWith('$')
  ));
  notas = notasToObj(sections.filter(
    item => item.startsWith('NOTA')
  ));
  cycles = cyclesToObj(sections.filter(
    item => item.startsWith('_')
  ));
  track = trackToArr(sections[0]);
  return {
    track: track,
    cycles: cycles,
    comments: commentsToArr(sections.filter(
      item => item.startsWith('(')
    )),
    duration: duration(),
  };
}
exports.scToObj = scToObj;


function duration() {
  let duration = 0;
  for (let i = 0, len = track.length; i < len; i += 1) {
    duration += track[i].duration;
  }
  return duration;
}


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
  const split1 = str.split('(');
  const str1 = split1[0];
  const comment = split1[1];
  const split2 = str1.split('$');
  const arr = split2[0].split('@');
  if (!str.startsWith('@')) {
    const cycle = arr[0].split('*');
    const cycleParams = {}
    const modifiers = arr.filter(item => arr.indexOf(item) > 0);
    for (let i = 0, len = modifiers.length; i < len; i += 1) {
      const values = modifiers[i].split(':');
      cycleParams[values[0]] = values[1];
    }
    const output = {
      cycle: cycle[0],
      repeat: cycle[1] ? parseInt(cycle[1], 10) : 1,
      BPM: cycleParams.BPM ? cycleParams.BPM : trackParams.BPM,
      TON: cycleParams.TON ? cycleParams.TON : trackParams.TON,
      LEN: cycleParams.LEN ? cycleParams.LEN : 0,
      SKP: cycleParams.SKP ? cycleParams.SKP : 0,
      lyrics: split2[1] ? lyrics[split2[1]] : undefined,
      comment: comment,
    };
    output.beats = cycles[output.cycle].beats * output.repeat - parseInt(output.SKP, 10) + parseInt(output.LEN, 10);
    output.duration = output.beats / parseInt(output.BPM, 10);
    return output;
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
      value: {
        beats: 0,
        phases: [{
          chords: [],
          beats: 0,
        }],
      }
    };
    let phasesCount = 1;
    for (let i = 1; i < arr.length; i += 1) {
      if (arr[i].startsWith('/')) {
        const spl = arr[i].split('*');
        cycleOutput.value.phases[phasesCount - 1].repeats = spl[1] ? spl[1] : 1;
        cycleOutput.value.phases[phasesCount - 1].beats = cycleOutput.value.phases[phasesCount - 1].beats * cycleOutput.value.phases[phasesCount - 1].repeats;
        phasesCount = phasesCount + 1;
        if (i < arr.length - 1) {
          cycleOutput.value.phases.push({
            chords: [],
            beats: 0,
          });
        }
      } else {
        const spl = arr[i].split(',');
        for (let j = 0; j < spl.length - 1; j += 1) {
          const val = spl[j];
          if (val.startsWith('NOTA')) {
            spl[j] = notas[val.substr(4)];
          }
        }
        cycleOutput.value.phases[phasesCount - 1].chords.push({
          chord: spl.filter(i => spl.indexOf(i) < spl.length - 1),
          beats: parseInt(spl[spl.length - 1], 10),
        });
        cycleOutput.value.phases[phasesCount - 1].beats += parseInt(spl[spl.length - 1], 10);
        if (i === arr.length - 1) {
          cycleOutput.value.phases[phasesCount - 1].repeats = 1;
        }
      } 
    }
    for (let i = 0, len = cycleOutput.value.phases.length; i < len; i += 1) {
      cycleOutput.value.beats += cycleOutput.value.phases[i].beats;
    }
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


function commentsToArr(scArr) {
  const output = [];
  for (let i = 0, len = scArr.length; i < len; i += 1) {
    const str = scArr[i];
    const arr = str.split('\n');
    output.push(arr.filter(c => arr.indexOf(c) > 0));
  }
  return output;
}


function notasToObj(scArr) {
  const output = {}
  for (let i = 0, len = scArr.length; i < len; i += 1) {
    const str = scArr[i];
    const arr = str.split('\n');
    const name = arr[0].substr(4);
    const value = arr.filter(n => arr.indexOf(n) > 0);
    output[name] = value;
  }
  return output;
}


function removeBlanks(str) {
  return str.replace(/\s/g, '');
}