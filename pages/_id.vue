<template>
  <div>
    <div class="title">
      {{ meta.name }} ({{ meta.artist }})
    </div>
    <div :class="['sections', modeFull ? 'full' : 'light']">
      <div v-for="(s, index) in songData" :key="index" class="section" :style="{marginBottom: sectionTitles && !lyrics && !modeFull ? '40px' : '0'}">
        <h2 v-if="sectionTitles"><span>({{ alphabet[index] }})</span> {{s.name}}</h2>
        <div class="measures" v-if="sectionTitles">
          <div
            v-for="(m, index) in s.measures.filter(i => s.measures.indexOf(i) > 0)"
            :key="index"
            :class="measureClass(m)">
            <div v-if="typeof m === 'object'">
              <span :class="beatClass(m[0])">{{m[0]}}</span>
              <span :class="beatClass(m[1])">{{m[1]}}</span>
              <span :class="beatClass(m[2])">{{m[2]}}</span>
              <span :class="beatClass(m[3])">{{m[3]}}</span>
            </div>
            <div v-else-if="m !== '[' && m !== ':' && m !== '('">{{m.substring(1)}}</div>
          </div>
        </div>
        <div v-if="lyrics" class="lyrics">
          <div v-for="(l, index) in s.lyrics" :key="index">
            <span v-html="decodeLyric(l)" />
          </div>
        </div>
      </div>
    </div>
    <nuxt-link to="/">back</nuxt-link>
    <button @click="toggleLyrics">Lyrics {{ lyrics ? 'on' : 'off' }}</button>
    <button @click="toggleModeFull">Mode {{ modeFull ? 'full' : 'light' }}</button>
    <button @click="toggleSectionTitles">Titles {{ sectionTitles ? 'on' : 'off' }}</button>
  </div>
</template>

<script>
import dataJson from './../data/json/data.json';
import indexJson from './../data/json/index.json';

export default {
  async asyncData({params}) {
    return {
      id: params.id,
      alphabet: 'abcdefghijklmnopqrstuvwxyz',
    }
  },
  data() {
    return {
      allSongsData: dataJson,
      index: indexJson,
      lyrics: true,
      modeFull: true,
      sectionTitles: true,
      spcache: [],
      measureInRepeatCycle: false,
    };
  },
  computed: {
    meta() {
      return this.index.filter(i => i.id === this.id)[0];
    },
    songData() {
      return this.allSongsData[this.id];
    },
  },
  mounted() {
    this.cacheSectionsOffsetTop();
    window.addEventListener('keydown', e => {
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
    measureClass(m) {
      if (typeof m === 'object') {
        return ['measure', `show${this.showCount(m)}`, this.measureInRepeatCycle ? 'inRepeatCycle' : ''];
      } else if (m === '[') {
        this.measureInRepeatCycle = true;
        return ['repeatStart'];
      } else if (m.startsWith(']')) {
        this.measureInRepeatCycle = false;
        return ['repeatEnd'];
      } else if (m === '(') {
        return ['echoStart'];
      } else if (m.startsWith(')')) {
        return ['echoEnd'];
      } else if (m === ':') {
        return ['blank'];
      };
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
    toggleLyrics() {
      this.lyrics = !this.lyrics;
      this.$nextTick(() => {
        this.cacheSectionsOffsetTop();
      });
    },
    toggleModeFull() {
      this.modeFull = !this.modeFull;
      this.$nextTick(() => {
        this.cacheSectionsOffsetTop();
      });
    },
    toggleSectionTitles() {
      this.sectionTitles = !this.sectionTitles;
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
      spl.forEach(val => {
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
      Array.prototype.forEach.call(sections, s => {
        this.spcache.push(s.offsetTop);
      });
    },
  },
}
</script>

<style lang="scss">
body {
  background:#eee;
  margin:0;
  padding:0;
}
.title {
  background:#222;
  padding:10px;
  color:#fff;
  font-size:.8em;
  text-align:center;
}
.sections {
  max-width:600px;
}
h2 {
  background:#222;
  color:white;
  display:inline-block;
  padding:10px 15px;
  & > span {
    font-size:.6em;
  }
}

.full {
  .measures {
    &::after {
      content: '';
      display:block;
      clear:both;
    }
    .measure {
      float:left;
      & > div {
        border:2px solid #222;
        padding:5px;
        margin:4px;
        font-size:1.5em;
        font-weight:bold;
        background: white;
        &::after {
          content: '';
          display:block;
          clear:both;
        }
      }
      span {
        position:relative;
        display:block;
        float:left;
        text-align:center;
        &:not(:first-child) {
          &::before {
            content: '';
            display:block;
            position:absolute;
            width:1px;
            height:100%;
            background:#222;
            transform-origin: center center;
            transform:rotate(10deg);
          }
        }
      }
    }
    .inRepeatCycle {
      & > div {
        position:relative;
        &::before {
          content: '';
          width:100%;
          position:absolute;
          height:5px;
          background:blue;
          bottom:-3px;
          left:0;
        }
      }
    }
    .show1 {
      width:25%;
      span {
        width:100%;
        &:nth-child(2),
        &:nth-child(3),
        &:nth-child(4) {
          display:none;
        }
      }
    }
    .show2 {
      width:50%;
      span {
        width:50%;
        &:nth-child(2),
        &:nth-child(4) {
          display:none;
        }
      }
    }
    .show4 {
      width:100%;
      span {
        width:25%;
      }
    }
    .repeat {
      color:#aaa;
    }
    .empty {
      background:#222;
    }
  }
  .repeatStart {
    display:none;
  }
  .repeatEnd {
    position:relative;
    float:left;
    height:46px;
    width:0;
    background:red;
    & > div {
      position:absolute;
      background: blue;
      color:white;
      width:30px;
      height:30px;
      text-align:center;
      bottom:-15px;
      right:0px;
      font-weight:bold;
      font-size:1.5em;
    }
  }
  .blank {
    width:100%;
    float:left;
    height:20px;
  }
  .echoStart {
    width:100%;
    float:left;
    border-top:2px dashed #888;
    margin:10px 4px;
  }
  .echoEnd {
    width:100%;
    float:left;
    margin:0 4px;
    font-size:2em;
    font-style:italic;
    color:#666;
    & > div {
      border-top:2px dashed #888;
      margin-top:10px;
      text-align:right;
      padding:0 10px 0 0;
      &::before {
        content: 'x ';
      }
    }
  }
}

.light {
  h2 {
    display:inline;
  }
  .measures {
    display:inline;
    * {
      display:inline;
    }
    &::after {
      content:'...';
    }
    .repeat,
    .empty {
      display:none;
    }
    .measure {
      display:none;
      &:nth-child(1) {
        display:inline;
      }
    }
  }
  
}

.lyrics {
  padding:10px;
  font-size:1.2em;
  span {
    display:block;
    margin:0 0 10px 0;
  }
  strong {
    font-size:2em;
    font-weight:bold;
  }
}
</style>