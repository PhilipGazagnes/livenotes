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
  methods: {
    measureClass(m) {
      if (typeof m === 'object') {
        return ['measure', `show${this.showCount(m)}`];
      } else if (m === '[') {
        return ['repeatStart'];
      } else if (m.startsWith(']')) {
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
    },
    toggleModeFull() {
      this.modeFull = !this.modeFull;
    },
    toggleSectionTitles() {
      this.sectionTitles = !this.sectionTitles;
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
  },
}
</script>

<style>
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
.section {
  
}
h2 {
  background:#222;
  color:white;
  display:inline-block;
  padding:10px 15px;
}
h2 span {
  font-size:.6em;
}
.full .measures .show1 {
  width:25%;
}
.full .measures .show1 span {
  width:100%;
}
.full .measures .show2 {
  width:50%;
}
.full .measures .show2 span {
  width:50%;
}
.full .measures .show4 {
  width:100%;
}
.full .measures .show4 span {
  width:25%;
}
.full .measures .show1 span:nth-child(2),
.full .measures .show1 span:nth-child(3),
.full .measures .show1 span:nth-child(4) {
  display:none;
}
.full .measures .show2 span:nth-child(2),
.full .measures .show2 span:nth-child(4) {
  display:none;
}
.full .measures::after {
  content: '';
  display:block;
  clear:both;
}
.full .measures .measure {
  float:left;
}
.full .measures .measure span {
  position:relative;
  display:block;
  float:left;
  text-align:center;
}
.full .measures .measure span:not(:first-child)::before{
  content: '';
  display:block;
  position:absolute;
  width:1px;
  height:100%;
  background:#222;
  transform-origin: center center;
  transform:rotate(10deg);
}
.full .measures .measure > div {
  border:2px solid #222;
  padding:5px;
  margin:4px;
  font-size:1.5em;
  font-weight:bold;
  background: white;
}
.full .repeatStart {
  float:left;
  margin:0;
  padding:0;
  background:black;
  border:0;
  width:8px;
  height:42px;
  margin:4px 12px 0 4px;
  position:relative;
}
.full .repeatStart::before,
.full .repeatStart::after {
  content: '';
  width:5px;
  height:5px;
  background:black;
  display:block;
  position:absolute;
  right:-8px;
  top:14px;
  border-radius:100%;
}
.full .repeatStart::after {
  top:24px;
}
.full .repeatEnd {
  float:left;
  margin:0;
  padding:0;
  border-left:black 8px solid;
  height:42px;
  margin:4px 8px 4px 12px;
  position:relative;
}
.full .repeatEnd > div {
  padding:3px 0 0 4px;
  font-size:2em;
  font-weight:bold;
  font-style:italic;
}
.full .repeatEnd:before,
.full .repeatEnd::after {
  content: '';
  width:5px;
  height:5px;
  background:black;
  display:block;
  position:absolute;
  left:-16px;
  top:14px;
  border-radius:100%;
}
.full .repeatEnd::after {
  top:24px;
}
.full .blank {
  width:100%;
  float:left;
  height:20px;
}
.full .echoStart {
  width:100%;
  float:left;
  border-top:2px dashed #888;
  margin:10px 4px;
}
.full .echoEnd {
  width:100%;
  float:left;
  margin:0 4px;
  font-size:2em;
  font-style:italic;
  color:#666;
}
.full .echoEnd > div {
  border-top:2px dashed #888;
  margin-top:10px;
  text-align:right;
  padding:0 10px 0 0;
}
.full .echoEnd > div::before {
  content: 'x ';
}
.full .measures .measure > div::after {
  content: '';
  display:block;
  clear:both;
}
.full .measures .repeat {
  color:#aaa;
}
.full .measures .empty {
  background:#222;
}

.light h2 {
  display:inline;
}
.light .measures,
.light .measures * {
  display:inline;
}
.light .measures::after {
  content:'...';
}
.light .measures .repeat,
.light .measures .empty {
  display:none;
}
.light .measure {
  display:none;
}
.light .measure:nth-child(1) {
  display:inline;
}
.lyrics {
  padding:10px;
  font-size:1.2em;
}
.lyrics span {
  display:block;
  margin:0 0 10px 0;
}
.lyrics strong {
  font-size:2em;
  font-weight:bold;
}
</style>