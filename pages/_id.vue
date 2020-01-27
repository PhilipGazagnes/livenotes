<template>
  <div>
    <nuxt-link to="/">back</nuxt-link>
    <!-- <h1>{{ meta }}</h1> -->
    {{songData.track}}
    {{songData.cycles}}
  </div>
</template>

<script>
export default {
  async asyncData({params}) {
    // const listJson = await import(`./../data/json/index.json`);
    const songJson = await import(`./../data/json/${params.id}.json`);
    return {
      // id: params.id,
      // listData: listJson,
      songData: songJson,
    }
  },
}
</script>