<template>
  <div>
    <nuxt-link to="/">back</nuxt-link>
    <h1>{{ meta.name }} ({{ meta.artist }})</h1>
    <a :href="meta.reference" target="_blank">Video</a>
    <hr>
    {{ data[id] }}
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
      data: dataJson,
      index: indexJson,
    };
  },
  computed: {
    meta() {
      return this.index.filter(i => i.id === this.id)[0];
    } 
  }
}
</script>