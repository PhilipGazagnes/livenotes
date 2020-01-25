<template>
  <div>
    <nuxt-link to="/">back</nuxt-link>
    <h1>TOTO</h1>
    {{songData[0]}}
  </div>
</template>

<script>

export default {
  async asyncData({params}) {
    const json = await import(`./../data/sc/${params.id}.json`);
    return {
      songData: json,
    }
  },
}
</script>