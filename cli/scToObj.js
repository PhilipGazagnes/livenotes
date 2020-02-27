const constants = {}

function scToObj(sc) {
  const blocs = sc.split('\n\n');
  const constantMeasuresSc = blocs.filter(b => b.startsWith('$'));
  const songSectionsSc = blocs.filter(b => !b.startsWith('$'));
  scToConstantMeasures(constantMeasuresSc);
  return scToSectionsArr(songSectionsSc);
}
exports.scToObj = scToObj;

function scToConstantMeasures(arr) {
  arr.forEach(i => {
    const spl = i.split('\n');
    const key = spl[0].substring(1);
    const val = measuresScToArr(spl.filter(i => spl.indexOf(i) > 0));
    constants[key] = val;
  });
}

function measuresScToArr(arr) {
  const exportArr = [1];
  arr.forEach(i => {
    const spl = i.split(';');
    spl.forEach(j => {
      if (j.startsWith('$')) {
        constantObj = constants[j.substring(1)];
        constantObj.filter(i => constantObj.indexOf(i) > 0).forEach(k => {
          exportArr.push(k);  
        });
        if (constantObj[0] > exportArr[0]) {
          exportArr[0] = constantObj[0];
        }
      } else if (
        j.startsWith('[') ||
        j.startsWith(']') ||
        j.startsWith(':') ||
        j.startsWith('(') ||
        j.startsWith(')')
      ) {
        exportArr.push(j);
      } else {
        const chordsArr = chordsScToArr(j);
        if (chordsArr[0] > exportArr[0]) {
          exportArr[0] = chordsArr[0];
        }
        exportArr.push(chordsArr.filter(i => chordsArr.indexOf(i) > 0));
      }
    });
  });
  return exportArr;
}

function chordsScToArr(arr) {
  const spl = arr.split(' ').filter(val => val !== '');
  const measure = [1, '%','%','%','%'];
  switch (spl.length) {
    case 1 :
      measure[1] = spl[0];
      break;
    case 2 :
      measure[0] = 2;  
      measure[1] = spl[0];
      measure[3] = spl[1];
      break;
    case 4 :
      measure[0] = 4;
      measure[1] = spl[0];
      measure[2] = spl[1];
      measure[3] = spl[2];
      measure[4] = spl[3];
      break;
    default:
      throw new Error('the following measure has an unauthorized amount of chords : ' + spl);
  }
  return measure;
}

function scToSectionsArr(arr) {
  const exportArr = [];
  arr.forEach(i => {
    const spl1 = i.split('--');
    const spl2 = spl1[0].split('++');
    const spl3 = spl2[0].split('\n').filter(val => val !== '');
    exportArr.push({
      name: spl3[0],
      measures: measuresScToArr(spl3.filter(i => spl3.indexOf(i) > 0)),
      lyrics: spl1[1] ? spl1[1].split('\n').filter(val => val !== '') : undefined,
      comments: spl2[1] ? spl2[1].split('\n').filter(val => val !== '') : undefined,
    });
  });
  return exportArr;
}