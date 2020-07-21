<template>
  <div class="index">
    <h1>Live notes ! Rock on !</h1>
    <button class="random" @click="focusRandom">Pick a random song</button>
    <ul>
      <li v-for="s in songs" :key="s.id" :data-first-letter="s.name.charAt(0)">
        <a @click="toSong(s.id)">
          <span>{{ s.name }}</span>
          <span>({{ s.artist }})</span>
          <span v-if="s.nota" class="nota">({{ s.nota }})</span>
        </a>
      </li>
    </ul>
    <div class="letters">
      <button
        v-for="(l, index) in $options.alphabet"
        :key="index"
        @click="scrollToLetter(l)"
      >
        {{ l }}
      </button>
    </div>
  </div>
</template>

<script>
import songsJson from '../data/json/index.json';

export default {
  alphabet: 'abcdefghijklmnopqrstuvwxyz',
  data() {
    return {
      songs: songsJson.sort(this.compare),
    };
  },
  methods: {
    compare(a, b) {
      // Use toUpperCase() to ignore character casing
      const songA = this.regularFirstLetter(a.name.toUpperCase());
      const songB = this.regularFirstLetter(b.name.toUpperCase());

      let comparison = 0;
      if (songA > songB) {
        comparison = 1;
      } else if (songA < songB) {
        comparison = -1;
      }
      return comparison;
    },
    regularFirstLetter(str) {
      let txt = str;
      if (txt.startsWith('ç') || txt.startsWith('Ç')) {
        txt = `C${txt.substring(1)}`;
      }
      return txt;
    },
    focusRandom() {
      const random = Math.floor(Math.random() * this.songs.length - 1);
      const url = `/${this.songs[random].id}/`;
      this.$router.push({
        path: url,
      });
    },
    scrollToLetter(letter) {
      const matches = document.querySelectorAll(
        `[data-first-letter=${letter.toUpperCase()}]`,
      );
      if (matches.length > 0) {
        const offsetTopFirstMatch = matches[0].offsetTop;
        window.scrollTo(0, offsetTopFirstMatch);
      }
    },
    toSong(id) {
      window.location.href = window.innerWidth > 600 ? `/song/${id}` : `/${id}`;
    },
  },
};
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
  font-family: 'Roboto Condensed';
  font-weight: 400;
}
.index {
  background: white;
  h1 {
    padding: 30px 20px;
  }
}
.random {
  padding: 10px 20px;
  margin: 0 0 40px 20px;
  font-size: 1em;
}
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
li {
  margin: 0;
  padding: 0 10px;
  border-bottom: 1px solid #eee;
  display: flex;
}
li a {
  display: block;
  padding: 10px;
  text-decoration: none;
  color: #333;
  &:first-child {
    flex: 1 1 auto;
  }
}
li a span:nth-child(1) {
  display: block;
  font-weight: bold;
  font-size: 1.5em;
}
li a span:nth-child(2) {
  opacity: 0.5;
}
li a span.nota {
  color: red;
}
.letters {
  position: fixed;
  height: 100%;
  width: 25%;
  top: 0;
  right: 0;
  background: #222;
  & > button {
    display: inline-block;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 1.5em;
    line-height: 1em;
    width: 50%;
    padding: 22px 0;
  }
  @media screen and (min-width: 768px) {
    width: 20%;
    button {
      width: 33.33%;
      padding: 16px 0;
    }
  }
}
</style>
