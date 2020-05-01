<template>
  <div>
    <div class="song">
      <div class="bar">
        <nuxt-link to="/">&laquo;</nuxt-link>
        <span>
          {{ truncate(meta.name, 25) }}
          <small>{{ meta.artist }}</small>
        </span>
        <button @click="lyrics = !lyrics">&spades;</button>
      </div>
      <div class="content">
        <ul v-if="!lyrics" class="overview">
          <li
            v-for="(s, index3) in songData.sections"
            :key="index3"
            :class="[
              sectionClass(s.measures, index3, s.name),
              isSeparator(s.name),
            ]"
          >
            <span>
              <span v-html="sectionName(s.name)"></span>
            </span>
            <span
              v-if="
                typeof s.measures[s.measures.length - 1] === 'string' &&
                s.measures[s.measures.length - 1].startsWith(')')
              "
            >
              <span>{{ s.measures[s.measures.length - 1].substring(1) }}</span>
            </span>
          </li>
        </ul>
        <div v-if="!lyrics" class="notes">
          <div
            v-for="(s, index3) in songData.sections"
            :key="index3"
            :class="[
              'section',
              isNewAndSectionClass(s.measures, index3, s.name),
            ]"
          >
            <!-- <div v-for="(c, index2) in s.comments" :key="index2">{{ c }}</div> -->
            <div>
              <div>
                <div
                  v-for="(m, index2) in s.measures"
                  :key="index2"
                  :class="measureClass(m)"
                >
                  <div v-if="typeof m === 'number'" />
                  <div v-else-if="typeof m === 'object'">
                    <span :class="beatClass(m[0])" v-html="beatCt(m[0])" />
                    <span :class="beatClass(m[1])" v-html="beatCt(m[1])" />
                    <span :class="beatClass(m[2])" v-html="beatCt(m[2])" />
                    <span :class="beatClass(m[3])" v-html="beatCt(m[3])" />
                  </div>
                  <div v-else-if="m !== '[' && m !== ':' && m !== '('">
                    <span>{{ m.substring(1) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="lyrics" ref="lyrics" class="lyrics">
          <div
            v-for="(s, index3) in songData.sections"
            :key="index3"
            :style="{ fontSize: `${fontSizeUser}em` }"
          >
            <div v-if="s.lyrics">
              <div
                v-for="(p, index2) in s.lyrics"
                :key="index2"
                v-html="lyric(p)"
              />
            </div>
          </div>
          <span>FIN</span>
          <button @click="fontSize(true)">+</button>
          <button @click="fontSize(false)">-</button>
        </div>
      </div>
    </div>
    <div v-if="stack && !lyrics" class="stack">
      {{ meta.stack }}
      <ul v-if="false">
        <li v-for="(i, index) in Object.keys(stack)" :key="index">
          <span>{{ i }}</span>
          <ul>
            <li v-if="i === 'tips' && songData.stacktips">
              <span>extra</span>
              <span>{{ songData.stacktips }}</span>
            </li>
            <li v-for="(j, index2) in Object.keys(stack[i])" :key="index2">
              <span>{{ j }}</span>
              <span>{{ stack[i][j] }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import stackJson from '../data/json/stack.json';
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
      allStacks: stackJson,
      index: indexJson,
      showLyrics: false,
      showTitles: true,
      showMeasures: true,
      spcache: [],
      presentationMode: 1,
      lyrics: false,
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
    stack() {
      return this.allStacks[this.meta.stack];
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
        return ['measure', 'repeatEnd'];
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
    beatCt(str) {
      const arr = str.split('!');
      if (arr.length > 1) {
        return `${arr[0]}<small>${arr[1]}</small>`;
      }
      return str;
    },
    sectionName(str) {
      const arr = str.split('!');
      let txt = str;
      if (arr.length > 1) {
        txt = `${arr[0]}<span>${arr[1]}</span>`;
      }
      if (txt.startsWith('Solo') || txt.startsWith('solo')) {
        txt = `&#11088;${txt}&#11088;`;
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
    sectionClass(arr, index, name) {
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
      if (
        cyclesCache.indexOf(JSON.stringify(arrWithoutEcho)) === -1 &&
        name !== '#'
      ) {
        cyclesCache.push(JSON.stringify(arrWithoutEcho));
      }
      return `sectionStyle${cyclesCache.indexOf(
        JSON.stringify(arrWithoutEcho),
      )}`;
    },
    isNewAndSectionClass(arr, index, name) {
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
      if (
        cyclesCache2.indexOf(JSON.stringify(arrWithoutEcho)) === -1 &&
        name !== '#'
      ) {
        cyclesCache2.push(JSON.stringify(arrWithoutEcho));
        return `sectionStyle${cyclesCache2.indexOf(
          JSON.stringify(arrWithoutEcho),
        )}`;
      }
      return 'sectionStyleHidden';
    },
    isSeparator(str) {
      if (str === '#') {
        return 'separator';
      }
      return '';
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
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
}
.bar {
  background: #222;
  height: 50px;
  flex: 0 0 50px;
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
.content {
  flex: 1 1 100%;
  display: flex;
  flex-direction: row;
}
.overview {
  list-style-type: none;
  margin: 0;
  padding: 0;
  flex: 0 0 35%;
  display: flex;
  flex-direction: column;
  height: 100%;
  & > li {
    border: none;
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    padding: 0;
    &:not(:last-child) {
      margin-bottom: 1px;
    }
    & > span {
      display: table;
      height: 100%;
      &:nth-child(1) {
        flex: 1 1 auto;
        font-weight: bold;
        font-size: 1.2em;
        padding: 0 3px;
        width: 100%;
      }
      &:nth-child(2) {
        flex: 0 0 30px;
        text-align: center;
        color: white;
        font-weight: bold;
        background: blue;
        font-size: 1.2em;
        line-height: 0.1em;
        width: 30px;
      }
      & > span {
        display: table-cell;
        vertical-align: middle;
        height: 100%;
        & > span {
          color: red;
          background: white;
        }
      }
    }
    &.separator {
      flex: 0 0 3px;
      background: black;
      font-size: 0;
      line-height: 0;
      margin-bottom: 0;
      margin-top: -1px;
    }
  }
}
.notes {
  flex: 0 0 65%;
  margin-left: 1px;
  display: flex;
  flex-direction: column;
}
.section {
  flex: 1 1 auto;
  &:not(:last-child) {
    margin-bottom: 1px;
  }
  & > div {
    display: table;
    height: 100%;
    width: 100%;

    & > div {
      display: table-cell;
      height: 100%;
      vertical-align: middle;
      text-align: center;
      .measure {
        display: inline-block;
        & > div {
          border-bottom: 2px solid #222;
          padding: 5px 0;
          margin: 4px 6px;
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
          &:first-child {
            padding-left: 0;
          }
          &:last-child {
            padding-right: 0;
          }
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
          & > small {
            color: red;
            background: white;
          }
        }
      }
      .inRepeatCycle {
        & > div {
          position: relative;
          &::before {
            content: '';
            width: 100%;
            position: absolute;
            height: 2px;
            border-top: 4px blue dashed;
            bottom: -3px;
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
        opacity: 0.5;
      }
      .empty {
        background: black;
      }
      .repeatStart {
        display: none;
      }
      .repeatEnd {
        display: inline-block;
        & > div {
          background: blue;
          border-radius: 0 10px 10px 0;
          color: white;
          margin: 4px 0;
          text-align: center;
          font-weight: bold;
          font-size: 1.5em;
          & > span {
            padding-left: 5px !important;
            padding-right: 5px !important;
          }
        }
      }
      .blank {
        width: 100%;
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
  }
}
.sectionStyle0 {
  background: lightpink;
}
.sectionStyle1 {
  background: aqua;
}
.sectionStyle2 {
  background: yellow;
}
.sectionStyle3 {
  background: violet;
}
.sectionStyle4 {
  background: lightblue;
}
.sectionStyle5 {
  background: lightcoral;
}
.sectionStyleHidden {
  display: none;
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
    & > div {
      margin: 0 0 3em 0;
      & > div {
        margin: 0 0 0.7em 0;
      }
    }
  }
  & > span {
    font-style: italic;
    border: 1px solid black;
    padding: 5px 10px;
    font-weight: bold;
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
.stack {
  background: black;
  color: #888;
  & > ul {
    padding: 40px 20px;
    & > li {
      border: none;
      margin-bottom: 20px;
      padding: 0;
      & > span {
        color: #bbb;
        font-weight: bold;
        font-size: 1.5em;
      }
      & > ul {
        & > li {
          display: table;
          width: 100%;
          padding: 10px 0;
          border-bottom: 1px solid #333;
          & > span {
            display: table-cell;
            width: 50%;
            & > strong {
              color: yellow;
            }
          }
        }
      }
    }
  }
}
</style>
