<template>
  <div>
    <h1>Live notes ! Rock on !</h1>
    <ul>
      <li v-for="s in songs" :key="s.id">
        <a :href="`/${s.id}`">
          <span>{{s.name}}</span>
          <span>({{s.artist}})</span>
          <span v-if="s.nota" class="nota">({{s.nota}})</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import songsJson from './../data/json/index.json';

export default {
  data() {
    return {
      songs: songsJson,
    };
  }
}
</script>

<style>
ul {
  list-style-type:none;
  margin:0;
  padding:0;
}
li {
  margin:0;
  padding:0;
  border-bottom:1px solid #eee;
}
li a {
  display:block;
  padding:10px;
  text-decoration:none;
  color:#333;
}
li a span:nth-child(1) {
  display:block;
  font-weight:bold;
  font-size:1.2em;
}
li a span:nth-child(2) {
  opacity:.5;
}
li a span.nota {
  color:red;
}
</style>