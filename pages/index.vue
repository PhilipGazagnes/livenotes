<template>
  <div :class="['index', isKliPad ? 'isKliPad' : '']">
    <ul>
      <li
        v-for="(s, index) in scope.arr"
        :key="s.id"
        :data-first-letter="s.name.charAt(0)"
      >
        <nuxt-link :ref="`link${index}`" :to="`/note/${s.id}`">
          <span>{{ s.name }}</span>
          <span>{{ isKliPad ? '' : index + 1 }} ({{ s.artist }})</span>
          <span v-if="!isKliPad && s.work" class="nota">({{ s.work }})</span>
        </nuxt-link>
      </li>
      <li>
        <button @click="handlewarmup">WARM UP</button>
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
      <button class="switchscope" @click="switchscope">
        {{ scope.name }} ({{ scope.arr.length }})
      </button>
      <button class="random" @click="handleRandom">R-a-N-d-O-m</button>
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
      isKliPad: false,
      warmuppos: 0,
      warmup: false,
      scopekey: 1,
    };
  },
  computed: {
    scope() {
      const obj = {
        arr: [],
        name: '',
      };
      switch (this.scopekey) {
        case 1:
          obj.arr = this.songs;
          obj.name = 'All';
          break;
        case 2:
          obj.arr = this.songs.filter((s) => s.scope.indexOf('funlive') >= 0);
          obj.name = 'Fun Live';
          break;
        case 3:
          obj.arr = this.songs.filter((s) => s.scope.indexOf('madyfab') >= 0);
          obj.name = 'Mady & Fab';
          break;
        case 4:
          obj.arr = this.songs.filter((s) => s.scope.indexOf('syl') >= 0);
          obj.name = 'Syl';
          break;
        case 5:
          obj.arr = this.songs.filter((s) => s.scope.indexOf('lilthing') >= 0);
          obj.name = 'Lil Thing';
          break;
        default:
          break;
      }
      return obj;
    },
  },
  mounted() {
    window.onbeforeunload = function (event) {
      return confirm('Confirm refresh');
    };
    this.isKliPad = window.innerWidth === 600;
    if (this.$store.state.warmup.active) {
      if (this.$store.state.warmup.pos < this.songs.length - 1) {
        this.$store.commit('warmup/SET_POS', this.$store.state.warmup.pos + 1);
        this.$refs[`link${this.$store.state.warmup.pos}`][0].$el.click();
      } else {
        this.$store.commit('warmup/SET_ACTIVE', false);
        alert('warm up complete !');
      }
    }
  },
  methods: {
    switchscope() {
      this.scopekey = this.scopekey === 5 ? 1 : this.scopekey + 1;
    },
    handlewarmup() {
      const go = confirm('warm up ?');
      if (go) {
        this.$store.commit('warmup/SET_ACTIVE', true);
        this.$store.commit('warmup/SET_POS', 0);
        this.$refs.link0[0].$el.click();
      }
    },
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
    scrollToLetter(letter) {
      const matches = document.querySelectorAll(
        `[data-first-letter=${letter.toUpperCase()}]`,
      );
      if (matches.length > 0) {
        const offsetTopFirstMatch = matches[0].offsetTop;
        window.scrollTo(0, offsetTopFirstMatch);
      }
    },
    handleRandom() {
      const len = this.songs.length;
      const random = Math.random();
      const randomPosStr = Math.floor(len * random).toString();
      let outputStr = '';
      switch (randomPosStr.length) {
        case 1:
          outputStr = `000${randomPosStr}`;
          break;
        case 2:
          outputStr = `00${randomPosStr}`;
          break;
        default:
          outputStr = `0${randomPosStr}`;
          break;
      }

      window.location.href = `/note/${outputStr}`;
    },
  },
};
</script>

<style lang="postcss">
body {
  padding: 0;
  margin: 0;
  font-family: sans-serif;
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
.isKliPad ul {
  font-size: 1.2em;
}
li {
  margin: 0;
  padding: 0 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  &:nth-child(odd) {
    background: rgba(0, 0, 0, 0.02);
  }
  &:last-child {
    padding: 200px 0 20px 20px;
    & > button {
      padding: 15px 30px;
    }
  }
  & > a {
    display: block;
    padding: 10px;
    text-decoration: none;
    color: #333;
    &:first-child {
      flex: 1 1 auto;
    }
    & > span {
      &:nth-child(1) {
        display: block;
        font-weight: bold;
        font-size: 1.5em;
      }
      &:nth-child(2) {
        opacity: 0.5;
      }
      &.nota {
        color: red;
      }
    }
  }
}
.letters {
  position: fixed;
  height: 100%;
  width: 25%;
  top: 0;
  right: 0;
  background: #222;
  overflow: auto;
  & > button {
    display: inline-block;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 1.5em;
    line-height: 1em;
    width: 50%;
    padding: 22px 0;
    &.switchscope {
      width: 100%;
      border: purple 2px solid;
      font-size: 1em;
    }
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
