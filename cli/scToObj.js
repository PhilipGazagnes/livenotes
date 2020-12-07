/* * * * * * * * * * * * * * * * * * * * * * *

     THIS FILS NEEDS A SERIOUS REFACTOR !

 * * * * * * * * * * * * * * * * * * * * * * */

const constants = {};
const emptylinepattern = '\r\n\r\n';
const linebreakpattern = '\r\n';

function chordsScToArr(arr) {
  const spl = arr.split(' ').filter((val) => val !== '');
  const measure = [1, '%', '%', '%', '%'];
  /* eslint-disable prefer-destructuring */
  switch (spl.length) {
    case 1:
      measure[1] = spl[0];
      break;
    case 2:
      measure[0] = 2;
      measure[1] = spl[0];
      measure[3] = spl[1];
      break;
    case 4:
      measure[0] = 4;
      measure[1] = spl[0];
      measure[2] = spl[1];
      measure[3] = spl[2];
      measure[4] = spl[3];
      break;
    default:
      throw new Error(
        `the following measure has an unauthorized amount of chords : ${spl}`,
      );
  }
  /* eslint-enable prefer-destructuring */
  return measure;
}

function measuresScToArr(arr) {
  const exportArr = [1];
  arr.forEach((i) => {
    const spl = i.split(';');
    spl.forEach((j) => {
      if (j.startsWith('$')) {
        const constantObj = constants[j.substring(1)];
        constantObj
          .filter((k) => constantObj.indexOf(k) > 0)
          .forEach((l) => {
            exportArr.push(l);
          });
        if (constantObj[0] > exportArr[0]) {
          [exportArr[0]] = constantObj;
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
          [exportArr[0]] = chordsArr;
        }
        exportArr.push(chordsArr.filter((k) => chordsArr.indexOf(k) > 0));
      }
    });
  });
  return exportArr;
}

function scToConstantMeasures(arr) {
  arr.forEach((i) => {
    const spl = i.split(linebreakpattern);
    const key = spl[0].substring(1);
    const val = measuresScToArr(spl.filter((j) => spl.indexOf(j) > 0));
    constants[key] = val;
  });
}

function scToSectionsArr(sectionsArr, stacktips) {
  const exportObj = {
    sections: [],
  };
  sectionsArr.forEach((i) => {
    const spl1 = i.split('--');
    const spl2 = spl1[0].split('++');
    const spl3 = spl2[0].split(linebreakpattern).filter((val) => val !== '');
    exportObj.sections.push({
      name: spl3[0],
      measures: measuresScToArr(spl3.filter((j) => spl3.indexOf(j) > 0)),
      lyrics: spl1[1]
        ? spl1[1].split(linebreakpattern).filter((val) => val !== '')
        : undefined,
      comments: spl2[1]
        ? spl2[1].split(linebreakpattern).filter((val) => val !== '')
        : undefined,
    });
  });
  if (stacktips) {
    const spl1 = stacktips.split(linebreakpattern);
    exportObj.stacktips = spl1[1];
  }
  return exportObj;
}

function scToObj(sc) {
  const blocs = sc.split(emptylinepattern);
  const constantMeasuresSc = blocs.filter((b) => b.startsWith('$'));
  const stacktips = blocs.filter((b) => b.startsWith('@'));
  const songSectionsSc = blocs.filter(
    (b) => !b.startsWith('$') && !b.startsWith('@'),
  );
  scToConstantMeasures(constantMeasuresSc);
  return scToSectionsArr(
    songSectionsSc,
    stacktips.length ? stacktips[0] : undefined,
  );
}
exports.scToObj = scToObj;
