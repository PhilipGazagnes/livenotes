<template>
  <div v-if="urlParamsProcessed" class="screen" :data-mode="mode">
    <div class="structure">
      <div class="content">
        <ul class="overview">
          <li
            v-for="(s, index3) in songData.sections"
            :key="index3"
            :class="[
              sectionClass(s.measures, index3, s.name),
              isSeparator(s.name),
            ]"
          >
            <span v-html="sectionName(s.name)" />
            <span
              v-if="
                typeof s.measures[s.measures.length - 1] === 'string' &&
                s.measures[s.measures.length - 1].startsWith(')')
              "
              v-html="s.measures[s.measures.length - 1].substring(1)"
            />
          </li>
          <li v-if="songData.end" class="end" v-html="songData.end" />
        </ul>
        <div class="notes">
          <div
            v-for="(s, index3) in songData.sections"
            :key="index3"
            :class="[
              'section',
              isNewAndSectionClass(s.measures, index3, s.name),
            ]"
          >
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
    <div ref="lyrics" class="lyrics" :style="{ fontSize: `${fontSizeUser}em` }">
      <div class="lyricsDirectory">
        <a v-if="urlParams.directory" :href="directoryParams.url">
          {{ directoryParams.name }}
        </a>
        <nuxt-link v-else to="/">Retour au répertoire</nuxt-link>
      </div>
      <div class="lyricsTitle">{{ meta.name }} - {{ meta.artist }}</div>
      <div
        v-if="mode === 3 && songData.warning"
        class="lyricsWarning"
        v-html="songData.warning"
      />
      <div
        v-for="(s, index3) in songData.sections"
        v-show="!(mode === 1 && !s.lyrics)"
        :key="index3"
        :class="[
          'lyricsBloc',
          sectionClass(s.measures, index3, s.name),
          isSeparator(s.name),
        ]"
        :data-mode="mode"
      >
        <div>
          <div
            v-for="(p, index2) in s.lyrics"
            :key="index2"
            v-html="lyric(p)"
          />
        </div>
      </div>
    </div>
    <div class="tools">
      <button
        v-if="!this.urlParams.directory"
        class="toolsButton"
        @click="changeMode"
      >
        M
      </button>
      <button class="toolsButton" @click="fontSize(true)">+</button>
      <button class="toolsButton" @click="fontSize(false)">-</button>
    </div>
  </div>
</template>

<script>
import dataJson from '../../data/json/data.json';
import indexJson from '../../data/json/index.json';

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
      mode: 1, // 1: lyrics, 2: chords, 3: hybrid
      fontSizeUser: 1.5,
      warning: false,
      urlParams: {},
      urlParamsProcessed: false,
    };
  },
  computed: {
    meta() {
      return this.index.filter((i) => i.id === this.id)[0];
    },
    songData() {
      return this.allSongsData[this.id];
    },
    directoryParams() {
      if (this.urlParams.directory === 'funlive') {
        return {
          name: 'Retour au répertoire Fun Live',
          url: 'https://www.fun-live.fr/repertoire/',
        };
      }
      if (this.urlParams.directory === 'airjprod') {
        return {
          name: "Retour au répertoire C'est toi la star",
          url: 'https://star.fun-live.fr/repertoire/',
        };
      }
      // if (this.urlParams.directory === 'fifi') {
      //   return {
      //     name: 'Fun Live',
      //     url: 'https://fifi.fun-live.fr/repertoire/',
      //   };
      // }
      return null;
    },
  },
  mounted() {
    /** * * * * * * * */
    /* GET URL PARAMS */
    /** * * * * * * * */
    const urlParamsRaw = window.location.search.substring(1).split('&');
    urlParamsRaw.forEach((i) => {
      const split = i.split('=');
      this.urlParams[split[0]] = split[1];
    });
    if (!this.urlParams.directory) {
      this.mode = window.innerWidth >= 768 ? 3 : 1;
    }
    this.urlParamsProcessed = true;

    if (!this.urlParams.directory) {
      window.onbeforeunload = function (event) {
        return confirm('Confirm refresh');
      };
    }
    if (this.$store.state.warmup.active) {
      setTimeout(() => {
        window.history.back();
      }, 100);
    }
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 40) {
        // KeyDown : Airturn right button
        e.preventDefault();
        this.scrollDown();
      }
      if (e.keyCode === 38) {
        // KeyUp : Airturn left button
        e.preventDefault();
        this.scrollUp();
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
    scrollDown() {
      this.$refs.lyrics.scrollTo(0, this.$refs.lyrics.scrollTop + 200);
    },
    scrollUp() {
      this.$refs.lyrics.scrollTo(0, this.$refs.lyrics.scrollTop - 200);
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
      if (str.indexOf('***') >= 0) {
        const spl = str.split('***');
        if (spl.length > 1) {
          return `<em>${spl[1]}</em>`;
        }
      }
      if (str.indexOf('+++') >= 0) {
        const spl = str.split('+++');
        if (spl.length > 1) {
          return `<i>${spl[1]}</i>`;
        }
      }
      return str;
    },
    fontSize(increase) {
      this.fontSizeUser += 0.1 * (increase ? 1 : -1);
    },
    changeMode() {
      this.mode = this.mode === 3 ? 1 : this.mode + 1;
      console.log(this.mode);
    },
  },
};
</script>

<style lang="postcss">
body {
  padding: 0;
  margin: 0;
  font-family: sans-serif;
}
.screen {
  height: 100vh;
  width: 100%;
  display: flex;
  &[data-mode='1'] {
    .lyrics {
      display: block;
      flex: 1 1 100%;
    }
    .structure {
      display: none;
    }
  }
  &[data-mode='2'] {
    .lyrics {
      display: none;
    }
    .structure {
      display: flex;
      flex: 1 1 100%;
    }
  }
  &[data-mode='3'] {
    @media screen and (max-width: 768px) {
      font-size: 0.5em;
    }
    .lyrics {
      display: block;
      flex: 0 0 50%;
    }
    .structure {
      display: flex;
      flex: 0 0 50%;
    }
  }
}
.structure {
  padding: 0;
  margin: 0;
  flex-direction: column;

  .content {
    flex: 1 1 100%;
    display: flex;
    flex-direction: row;
    background: black;
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
        flex: 2 1 auto;
        display: flex;
        flex-direction: row;
        padding: 0;
        &:not(:last-child) {
          margin-bottom: 1px;
        }
        & > span {
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
            width: 30px;
          }

          & > span {
            color: red;
            background: white;
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
        &.end {
          flex-grow: 1;
          background: purple;
          color: white;
          padding: 0 3px;
          font-weight: bold;
          line-height: 1.4em;
        }
      }
    }
    .notes {
      flex: 0 0 65%;
      display: flex;
      flex-direction: column;
    }
    .section {
      flex: 1 1 auto;
      text-align: center;
      margin-left: 1px;
      &:not(:last-child) {
        margin-bottom: 1px;
      }
      .measure {
        display: inline-block;
        & > div {
          border-bottom: 2px solid #222;
          padding: 5px 0;
          margin: 4px 6px;
          font-size: 1.5em;
          line-height: 1em;
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
    .sectionStyle6 {
      background: lightgreen;
    }
    .sectionStyleHidden {
      display: none;
    }
  }
}
.lyrics {
  background: white;
  padding: 10px 0;
  overflow-y: scroll;
  em {
    font-size: 1.5em;
    font-weight: bold;
    background: blue;
    color: white;
    padding: 50px 20px;
    display: block;
  }
  i {
    color: blue;
    background: #ddd;
  }
  &Directory {
    padding: 20px 20px 0;
  }
  &Title {
    font-style: italic;
    font-weight: bold;
    padding: 20px 20px 50px;
    font-size: 1.5em;
  }
  &Warning {
    background: red;
    color: white;
    font-size: 1.2em;
    padding: 30px;
    margin: 0 10px 50px 10px;
  }
  &Bloc {
    padding: 0 20px 0 20px;
    margin: 0 0 2em 0;
    border: none;
    min-height: 20px;
    font-weight: bold;
    &[data-mode='3'] {
      font-weight: normal;
      border-left: 10px solid;
      padding: 0 20px 0 10px;
      margin: 0 0 2em 10px;
    }
    & > div {
      & > div {
        margin: 0 0 0.5em 0;
      }
    }
    &.sectionStyle0 {
      border-color: lightpink;
    }
    &.sectionStyle1 {
      border-color: aqua;
    }
    &.sectionStyle2 {
      border-color: yellow;
    }
    &.sectionStyle3 {
      border-color: violet;
    }
    &.sectionStyle4 {
      border-color: lightblue;
    }
    &.sectionStyle5 {
      border-color: lightcoral;
    }
    &.sectionStyle6 {
      border-color: lightgreen;
    }
  }
}
.tools {
  position: fixed;
  right: 10px;
  bottom: 10px;
  width: 40px;
  &Button {
    background: rgba(255, 255, 0, 0.2);
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 20px;
    width: 100%;
    height: 40px;
    margin-top: 10px;
  }
}
</style>
