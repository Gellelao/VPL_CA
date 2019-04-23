<template>
  <div :id="id" class="condition">
    Condition
    <template v-if="property === 'neighbours'">
      <div>Neighbours!</div>
    </template>
    <template v-else-if="property === 'state'">
      <div>State!</div>
    </template>
    <div v-else>Connect a property</div>
    <div class="thenSource"></div>
  </div>
</template>

<script>
export default {
  props: ["id", "source"],
  data: () => ({
    // property: "vv"
  }),
  computed: {
    property() {
      let index = this.source.lastIndexOf("_");
      return this.source.substr(index+1);
    }
  }
};
</script>
