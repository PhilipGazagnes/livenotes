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
    R: [
      {
        repeat: 4,
        chords: [
          {
            chord: 'E',
            length: 2,
          },
          {
            chord: 'A',
            length: 2,
          },
          {
            chord: 'D',
            length: 2,
          },
        ],
      },
      {
        repeat: 1,
        chords: [
          {
            chord: 'D',
            length: 2,
          },
        ],
      },
    ],
  },
}