<template>
  <div>
    <nuxt-link to="/">back</nuxt-link>
    <h1>{{ meta.name }} ({{ meta.artist }})</h1>
    <button @click="toggleMode">mode {{ mode }}</button>
    <ul class="songcomments" v-if="songData.comments">
      <li v-for="(c, index) in songData.comments" :key="index">
        <span v-for="(l, index) in c" :key="index">{{l}}</span>
      </li>
    </ul>
    <a :href="meta.reference" target="_blank">Video</a>
    <hr>
    <div v-if="mode === 'guitar'">
      <div class="track">
        <div 
          v-for="s in songData.track"
          :key="songData.track.indexOf(s)"
          :style="{
            width: `${s.duration * 100 / songData.duration}%`,
            background: trackSectionBackground(s.cycle),
          }"
        >
          <div class="repeat" v-if="s.repeat > 1">{{ s.repeat }}</div>
          <div class="tonality" v-if="s.TON !== 0">{{ s.TON }}</div>
          <div class="length" v-if="s.LEN">{{ s.LEN }}</div>
          <div class="skip" v-if="s.SKP">{{ s.SKP }}</div>
          <div class="comment" v-if="s.comment">{{s.comment}}</div>
        </div>
      </div>

      <div class="cycles">
        <div v-for="(c, index) in songData.cycles" :key="index">
          <div :style="{background: trackSectionBackground(index)}" />
          <div>
            <div v-for="(p, index) in c.phases" :key="index">
              <div v-for="(ch, index) in p.chords" :key="index">
                <span>
                  <span v-for="(cho, index) in ch.chord" :key="index">{{ index > 0 ? ', ' : '' }}{{ cho }}</span>
                </span>
                {{ ch.beats }}
              </div>
              <span v-if="p.repeats > 1">{{ p.repeats }}</span>
            </div>  
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="mode === 'lyrics'" class="lyrics">
      <div v-for="(s, index) in songData.track" :key="index">
        <div :style="{background: trackSectionBackground(s.cycle)}" />
        <div v-if="s.lyrics">
          <div v-for="(l, index) in s.lyrics" :key="index">
            {{ l }}
          </div>
        </div>
        <div v-else class="wait">wait {{s.duration}} min</div>
      </div>
    </div>
  </div>
</template>

<script>
import dataJson from './../data/json/data.json';
import indexJson from './../data/json/index.json';

export default {
  async asyncData({params}) {
    return {
      id: params.id,
    }
  },
  data() {
    return {
      allSongsData: dataJson,
      index: indexJson,
      colors: ['red', 'blue', 'green', 'purple', 'orange', 'black', 'brown', 'pink', 'yellow'],
      mode: 'guitar',
    };
  },
  computed: {
    meta() {
      return this.index.filter(i => i.id === this.id)[0];
    },
    songData() {
      return this.allSongsData[this.id];
    }
  },
  methods: {
    trackSectionBackground(c) {
      const cyclePos = Object.keys(this.songData.cycles).indexOf(c);
      return this.colors[cyclePos];
    },
    toggleMode() {
      this.mode = this.mode === 'guitar' ? 'lyrics' : 'guitar'; 
    },
  },
  mounted() {
    console.log(this.songData);
  }
}
</script>

<style>
.songcomments {
  background:lightyellow;
}
.track::after {
  content:'';
  display:block;
  clear:both;
}
.track > div {
  float:left;
  position:relative;
  height:100px;
  text-align:center;
  color:white;
}
.track > div > .repeat {
  position:absolute;
  top:0;
  left:50%;
  transform:translateX(-50%);
  border:white 2px solid;
  color:white;
  padding:0 10px;
  margin:10px 0 0 0;
  font-size:1.5em;
  font-weight:bold;
}
.track > div > .comment {
  position:absolute;
  bottom:5px;
  left:23px;
  font-size:1.2em;
  font-weight:bold;
  color:white;
  transform-origin:0 100%;
  transform:rotate(-90deg);
  text-transform:uppercase;
}
.track > div > .skip {
  position:absolute;
  top:-20px;
  left:0;
  font-size:1.2em;
  font-weight:bold;
  background:inherit;
  height:20px;
  padding:0 5px;
}
.track > div > .length {
  position:absolute;
  top:-20px;
  right:0;
  font-size:1.2em;
  font-weight:bold;
  background:inherit;
  height:20px;
  padding:0 5px;
}
.track > div > .tonality {
  position:absolute;
  bottom:10px;
  left:50%;
  transform:translateX(-50%);
  background:white;
  color:black;
  padding:0 10px;
  font-size:1.5em;
  font-weight:bold;
}
.track > div::before {
  content:'';
  position:absolute;
  display:block;
  width:1px;
  height:100%;
  top:0;
  left:0;
  background:white;
}
.track > div::after {
  content:'';
  position:absolute;
  display:block;
  width:1px;
  height:100%;
  top:0;
  right:0;
  background:white;
}

.cycles {
  margin-top:20px;
}
.cycles > div {
  position:relative;
  padding:0 0 0 50px;
  min-height:50px;
  margin-bottom:15px;
}
.cycles > div > div:first-child {
  position:absolute;
  top:0;
  left:0;
  width:50px;
  height:50px;
}
.cycles > div > div:last-child::after {
  content: '';
  display:block;
  clear:both;
}
.cycles > div > div:last-child > div {
  float:left;
  border-right:2px black solid;
  padding:0 0 0 20px;
}
.cycles > div > div:last-child > div > span {
  display:inline-block;
  width:30px;
  height:30px;
  border:2px solid black;
  font-weight:bold;
  text-align:center;
  transform:translateY(-20px);
  font-size:1.5em;
  margin-right:20px;
}
.cycles > div > div:last-child > div > div {
  display:inline-block;
  margin:0 30px 0 0;
  text-align:center;
  font-weight:bold;
  font-size:1.2em;
}
.cycles > div > div:last-child > div > div > span {
  display:block;
  font-size:1.8em;
  white-space: nowrap;
}

.lyrics {
  background:black;
  color:white;
}
.lyrics > div {
  position:relative;
  padding:0 0 0 100px;
  margin-bottom:20px;
}
.lyrics > div > div:first-child {
  width:50px;
  height:100%;
  position:absolute;
  top:0;
  left:0;
}
.lyrics > div > div:last-child {
  font-size:2em;
  line-height:1.5em;
  font-weight:bold;
}
.lyrics > div > .wait {
  color:yellow;
}
</style>