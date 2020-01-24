const outpt = {
  track: [
    {
      cycle: 'R',
      bpm: 105,
      repeat: 4,
      substract: 0,
      toneVar: 0,
    },
    {
      cycle: 'C',
      bpm: 105,
      repeat: 1,
      substract: 0,
      toneVar: 0,
    },
    {
      cycle: 'SG',
      bpm: 105,
      repeat: 2,
      substract: 0,
      toneVar: 0,
    },
    ...
  ],
  cycles: {
    R: {
      structure: [
        {
          repeat: 4,
          tempo: 192,
          signature: [
            top: 2,
            bottom: 4,
          ],
          chords: [
            {
              chord: 'E',
              length: [
                measures: 0,
                beats: 2,
              ],
            },
            {
              chord: 'A',
              length: [
                measures: 0,
                beats: 2,
              ],
            },
            {
              chord: 'D',
              length: [
                measures: 0,
                beats: 2,
              ],
            },
          ],
        },
        {
          repeat: 1,
          chords: [
            {
              chord: 'D',
              length: [
                measures: 1,
                beats: 0,
              ],
            },
          ],
        }
      ],
    }
  },
}