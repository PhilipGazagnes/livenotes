<template>
  <div>
    <h1>Live notes ! Rock on !</h1>
    <ul>
      <li v-for="s in songs" :key="s.id">
        <a :href="`/${s.id}`">{{s.name}} ({{s.artist}})</a>
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