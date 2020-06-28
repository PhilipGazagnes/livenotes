<template>
  <div class="screen">
    <nuxt-link to="/">
      <span>
        {{ meta.name }}
        <span>{{ meta.artist }}</span>
        <strong v-if="meta.notes !== ''">{{ meta.notes }}</strong>
      </span>
    </nuxt-link>
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
      <div class="end">
        {{ meta.end }}
      </div>
    </div>
    <div ref="lyrics" class="lyrics">
      <div
        v-for="(s, index3) in songData.sections"
        :key="index3"
        :style="{ fontSize: `${fontSizeUser}em` }"
        :class="[
          'bloc',
          sectionClass(s.measures, index3, s.name),
          isSeparator(s.name),
        ]"
      >
        <div v-if="mode === 'lyrics'">
          <div
            v-for="(p, index2) in s.lyrics"
            :key="index2"
            v-html="lyric(p)"
          />
        </div>
      </div>
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
      mode: 'lyrics',
      fontSizeUser: 1.5,
      warning: false,
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
    // this.cacheSectionsOffsetTop();
    // window.addEventListener('keydown', (e) => {
    //   e.preventDefault();
    //   this.warning = true;
    //   setTimeout(() => {
    //     this.warning = false;
    //   }, 500);
    // });
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
    togglemode() {
      switch (this.mode) {
        case 'lyrics':
          this.mode = 'chords';
          break;
        case 'chords':
          this.mode = 'lyrics';
          break;
        default:
          break;
      }
    },
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
  },
};
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
}
.screen {
  display: flex;
  height: 100vh;
  & > a {
    flex: 0 0 80px;
    background: #222;
    color: white;
    position: relative;
    & > span {
      display: block;
      position: absolute;
      bottom: -20px;
      left: 15px;
      width: 100vh;
      transform-origin: top left;
      transform: rotate(-90deg);
      font-size: 2em;
      opacity: 0.5;
      & > span {
        opacity: 0.5;
        margin: 0 0 0 15px;
      }
      & > strong {
        color: #0f0;
        margin: 0 0 0 15px;
      }
    }
  }
  & > .structure {
    flex: 0 0 calc(50% - 40px);
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    .content {
      flex: 1 1 100%;
      display: flex;
      flex-direction: row;
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
        text-align: center;
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
      .sectionStyleHidden {
        display: none;
      }
    }
    .end {
      padding: 10px;
      color: white;
      background: #222;
      &::before {
        content: 'Fin: ';
        color: yellow;
        font-weight: bold;
      }
    }
  }
  & > .lyrics {
    flex: 0 0 calc(50% - 40px);
    font-family: Arial, Helvetica, sans-serif;
    background: white;
    padding: 10px 0;
    position: relative;
    overflow-y: scroll;
    em {
      font-size: 1.5em;
      font-weight: bold;
      background: blue;
      color: white;
      padding: 0 10px;
    }
    i {
      color: blue;
      background: #ddd;
    }
    & > .bloc {
      padding: 0 20px 0 10px;
      margin: 0 0 2em 10px;
      border: none;
      border-left: 10px solid;
      min-height: 20px;
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
    }
  }
}
</style>
