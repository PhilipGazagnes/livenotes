<template>
  <div class="song">
    <div class="bar">
      <nuxt-link to="/">&laquo;</nuxt-link>
      <span>
        {{ truncate(meta.name, 25) }}
        <small>{{ meta.artist }}</small>
      </span>
      <button @click="lyrics = !lyrics">&spades;</button>
    </div>
    <ul v-if="!lyrics" class="overview">
      <li v-for="(s, index3) in songData" :key="index3">
        <span :class="sectionClass(s.measures, index)">
          {{ s.name }}
          <small
            v-if="
              typeof s.measures[s.measures.length - 1] === 'string' &&
              s.measures[s.measures.length - 1].startsWith(')')
            "
          >
            {{ s.measures[s.measures.length - 1].substring(1) }}
          </small>
        </span>
      </li>
    </ul>
    <div v-if="!lyrics" class="notes">
      <div
        v-for="(s, index3) in songData"
        :key="index3"
        :class="['section', titleClass(s.name)]"
      >
        <div :class="['measures', isNewAndSectionClass(s.measures, index)]">
          <div v-for="(c, index2) in s.comments" :key="index2">{{ c }}</div>
          <div
            v-for="(m, index2) in s.measures"
            :key="index2"
            :class="measureClass(m)"
          >
            <div v-if="typeof m === 'number'" />
            <div v-else-if="typeof m === 'object'">
              <span :class="beatClass(m[0])">{{ m[0] }}</span>
              <span :class="beatClass(m[1])">{{ m[1] }}</span>
              <span :class="beatClass(m[2])">{{ m[2] }}</span>
              <span :class="beatClass(m[3])">{{ m[3] }}</span>
            </div>
            <div v-else-if="m !== '[' && m !== ':' && m !== '('">
              {{ m.substring(1) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="lyrics" ref="lyrics" class="lyrics">
      <div
        v-for="(s, index3) in songData"
        :key="index3"
        :style="{ fontSize: `${fontSizeUser}em` }"
      >
        <div v-for="(p, index2) in s.lyrics" :key="index2" v-html="lyric(p)" />
      </div>
      <button @click="fontSize(true)">+</button>
      <button @click="fontSize(false)">-</button>
    </div>
  </div>
</template>

<script>
import dataJson from '../data/json/data.json';
import indexJson from '../data/json/index.json';

const measureInRepeatCycle = false; // eslint-disable-line no-unused-vars
let cyclesCache = [];
let cyclesCache2 = [];

export default {
  async asyncData({ params }) {
    return {
      id: params.id,
    };
  },
  data() {
    return {
      allSongsData: dataJson,
      index: indexJson,
      showLyrics: false,
      showTitles: true,
      showMeasures: true,
      spcache: [],
      presentationMode: 1,
      lyrics: true,
      fontSizeUser: 1.2,
    };
  },
  computed: {
    meta() {
      return this.index.filter((i) => i.id === this.id)[0];
    },
    songData() {
      return this.allSongsData[this.id];
    },
  },
  mounted() {
    this.cacheSectionsOffsetTop();
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 40) {
        // KeyDown : Airturn right button
        e.preventDefault();
        this.skipToNextSection();
      }
      if (e.keyCode === 38) {
        // KeyUp : Airturn left button
        e.preventDefault();
        this.skipToPrevSection();
      }
    });
  },
  methods: {
    truncate(txt, limit) {
      let str = txt;
      if (str.length > limit) {
        str = `${txt.substring(0, limit - 3)}...`;
      }
      return str;
    },
    measureClass(m) {
      if (typeof m === 'number') {
        return undefined;
      }
      if (typeof m === 'object') {
        return [
          'measure',
          `show${this.showCount(m)}`,
          this.measureInRepeatCycle ? 'inRepeatCycle' : '',
        ];
      }
      if (m === '[') {
        this.measureInRepeatCycle = true;
        return ['repeatStart'];
      }
      if (m.startsWith(']')) {
        this.measureInRepeatCycle = false;
        return ['repeatEnd'];
      }
      if (m === '(') {
        return ['echoStart'];
      }
      if (m.startsWith(')')) {
        return ['echoEnd'];
      }
      if (m === ':') {
        return ['blank'];
      }
      return undefined;
    },
    beatClass(str) {
      if (str === '=') {
        return 'empty';
      }
      if (str === '%') {
        return 'repeat';
      }
      return undefined;
    },
    titleClass(str) {
      let txt;
      if (str === 'couplet' || str === 'Couplet') {
        txt = 'couplet';
      }
      if (str.indexOf('Refrain') > -1) {
        txt = 'refrain';
      }
      if (str.indexOf('Pré Refrain') > -1) {
        txt = 'prerefrain';
      }
      if (str.indexOf('solo') >= 0 || str.indexOf('Solo') >= 0) {
        txt = 'solo';
      }
      return txt;
    },
    togglePresentation() {
      switch (this.presentationMode) {
        case 1:
          this.showTitles = true;
          this.showLyrics = false;
          this.showMeasures = true;
          this.presentationMode = 2;
          break;
        case 2:
          this.showTitles = false;
          this.showLyrics = true;
          this.showMeasures = false;
          this.presentationMode = 3;
          break;
        case 3:
          this.showTitles = true;
          this.showLyrics = true;
          this.showMeasures = true;
          this.presentationMode = 1;
          break;
        default:
          break;
      }
      this.$nextTick(() => {
        this.cacheSectionsOffsetTop();
      });
    },
    showCount(arr) {
      let show = 1;
      if (arr[2] !== '%') {
        show = 2;
      }
      if (arr[1] !== '%' || arr[3] !== '%') {
        show = 4;
      }
      return show;
    },
    decodeLyric(str) {
      const spl = str.split('***');
      let output = '';
      spl.forEach((val) => {
        const index = spl.indexOf(val);
        if (index * -1 < 0) {
          spl[index] = `<strong>${val}</strong>`;
        }
        output += spl[index];
      });
      return output;
    },
    skipToNextSection() {
      const pos = window.scrollY;
      let i = 0;
      while (i < this.spcache.length && this.spcache[i] <= pos) {
        i += 1;
      }
      if (i < this.spcache.length) {
        window.scrollTo(0, this.spcache[i]);
      } else {
        console.log('end');
      }
    },
    skipToPrevSection() {
      const pos = window.scrollY;
      let i = this.spcache.length - 1;
      while (i > 0 && this.spcache[i] >= pos) {
        i -= 1;
      }
      if (i > 0) {
        window.scrollTo(0, this.spcache[i]);
      } else {
        window.scrollTo(0, 0);
      }
    },
    cacheSectionsOffsetTop() {
      const sections = document.getElementsByClassName('section');
      this.spcache = [];
      Array.prototype.forEach.call(sections, (s) => {
        this.spcache.push(s.offsetTop);
      });
    },
    sectionClass(arr, index) {
      if (index === 0) {
        cyclesCache = [];
      }
      const arrWithoutEcho = arr.filter(
        (item) =>
          !(
            typeof item === 'string' &&
            (item.startsWith('(') || item.startsWith(')'))
          ),
      );
      if (cyclesCache.indexOf(JSON.stringify(arrWithoutEcho)) === -1) {
        cyclesCache.push(JSON.stringify(arrWithoutEcho));
      }
      return `sectionStyle${cyclesCache.indexOf(
        JSON.stringify(arrWithoutEcho),
      )}`;
    },
    isNewAndSectionClass(arr, index) {
      if (index === 0) {
        cyclesCache2 = [];
      }
      const arrWithoutEcho = arr.filter(
        (item) =>
          !(
            typeof item === 'string' &&
            (item.startsWith('(') || item.startsWith(')'))
          ),
      );
      if (cyclesCache2.indexOf(JSON.stringify(arrWithoutEcho)) === -1) {
        cyclesCache2.push(JSON.stringify(arrWithoutEcho));
        return `sectionStyle${cyclesCache2.indexOf(
          JSON.stringify(arrWithoutEcho),
        )}`;
      }
      return 'sectionStyleHidden';
    },
    lyric(str) {
      const spl = str.split('***');
      if (spl.length > 1) {
        return `<strong>${spl[1]}</strong>`;
      }
      return str;
    },
    fontSize(increase) {
      this.fontSizeUser += 0.1 * (increase ? 1 : -1);
    },
  },
};
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
}
.song {
  background: #eee;
  padding: 0;
  margin: 0;
}
.bar {
  background: #222;
  height: 50px;
  display: flex;
  & > a,
  & > button {
    flex: 0 0 50px;
    display: block;
    height: 50px;
    background: grey;
    border: none;
    font-size: 2em;
    color: white;
    text-decoration: none;
    text-align: center;
    line-height: 1.3em;
    cursor: pointer;
  }
  & > span {
    display: block;
    flex: 0 1 100%;
    color: white;
    text-align: center;
    padding: 5px 0 0 0;
    & > small {
      display: block;
    }
  }
}
.overview {
  list-style-type: none;
  margin: 0;
  padding: 0;
  float: left;
  width: 35%;
  & > li {
    border: none;
    margin-bottom: 1px;
    & > span {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 1.2em;
      & > small {
        font-weight: 600;
        background: blue;
        color: white;
        font-size: 1em;
        padding: 5px;
      }
    }
  }
}
.notes {
  float: left;
  width: 65%;
}
.section {
  &::after {
    content: '';
    display: block;
    clear: both;
  }
}
.sectionStyle0 {
  background: lightpink;
}
.sectionStyle1 {
  background: lightblue;
}
.sectionStyle2 {
  background: lightcoral;
}
.sectionStyle3 {
  background: lightgray;
}
.sectionStyle4 {
  background: lightgreen;
}
.sectionStyle5 {
  background: lightyellow;
}
.sectionStyleHidden {
  display: none;
}
.measures {
  &::after {
    content: '';
    display: block;
    clear: both;
  }
  .measure {
    float: left;
    & > div {
      border-bottom: 1px solid #222;
      padding: 5px 0;
      margin: 4px;
      font-size: 1.5em;
      font-weight: bold;
      &::after {
        content: '';
        display: block;
        clear: both;
      }
    }
    span {
      position: relative;
      display: block;
      float: left;
      text-align: center;
      padding: 0 5px;
      &:not(:first-child) {
        &::before {
          content: '';
          display: block;
          position: absolute;
          width: 1px;
          left: 0;
          height: 100%;
          background: #222;
          transform-origin: center center;
          transform: rotate(10deg);
        }
      }
    }
  }
  .inRepeatCycle {
    & > div {
      position: relative;
      background: rgba(0, 0, 0, 0.07);
      &::before {
        content: '';
        width: 100%;
        position: absolute;
        height: 2px;
        background: blue;
        bottom: 0;
        left: 0;
      }
    }
  }
  .show1 {
    span {
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4) {
        display: none;
      }
    }
  }
  .show2 {
    span {
      &:nth-child(2),
      &:nth-child(4) {
        display: none;
      }
    }
  }
  .repeat {
    color: #aaa;
  }
  .empty {
    background: #222;
  }
  .repeatStart {
    display: none;
  }
  .repeatEnd {
    float: left;
    & > div {
      padding: 5px;
      background: blue;
      border-radius: 0 10px 10px 0;
      color: white;
      margin: 4px 0;
      text-align: center;
      font-weight: bold;
      font-size: 1.5em;
    }
  }
  .blank {
    width: 100%;
    float: left;
  }
  .echoStart {
    display: none;
  }
  .echoEnd {
    display: none;
    float: left;
    & > div {
      &::before {
        content: 'x ';
      }
    }
  }
}
.lyrics {
  font-family: Arial, Helvetica, sans-serif;
  padding: 50px 20px;
  background: white;
  strong {
    font-size: 2em;
    font-weight: bold;
  }
  & > div {
    margin: 0 0 3em 0;
    & > div {
      margin: 0 0 0.7em 0;
    }
  }
  & > button {
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: 60px;
    height: 60px;
    opacity: 0.5;
    font-size: 2em;
    &:last-child {
      bottom: 80px;
    }
  }
}
</style>
