const data = require('../data/json/data.json');
const index = require('../data/json/index.json');

let md = '';

const namedData = Object.entries(data).map((song) => {
  const indexedSong = index.filter((el) => el.id === song[0])[0];
  return {
    name: indexedSong.name,
    artist: indexedSong.artist,
    lyrics: song[1].sections[0].lyrics,
  };
});

namedData.forEach((el) => {
  let lyricsMd = '';
  if (el.lyrics) {
    el.lyrics.forEach((l) => {
      lyricsMd = `
        ${lyricsMd}
        ${l}
        `;
    });
  }
  md = `
        ${md}
        # ${el.name}
        ## ${el.artist}
        ${lyricsMd}
    `;
});

console.log(md);
