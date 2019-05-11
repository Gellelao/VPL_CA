<template>
  <div :id="id" class="transform">
    <v-toolbar-title class="text-uppercase">
      <span class="heading">Transform</span>
    </v-toolbar-title>
    <template v-if="property === 'neighbours'">
      <div class="body">
        neighbours
        <!-- Fill this in -->
      </div>
    </template>
    <template v-else-if="property === 'state'">
      <div class="body">
        state
        <!-- Fill this in -->
      </div>
    </template>
    <div class="body" v-else>Connect a property</div>
    <div class="thenSource"></div>
  </div>
</template>

<script>
export default {
  props: ["id", "source"],
  data: () => ({}),
  computed: {
    property() {
      let index = this.source.lastIndexOf("_");
      return this.source.substr(index + 1);
    }
  },
  methods: {
    updateStateInParent() {
      this.$root.$emit("fill this in", {
        id: this.id
        // payload info here
      });
    }
  }
};
</script>

<style scoped lang="scss">
.transform {
  text-align: center;
  z-index: 2;
  position: absolute;
  padding: 10px;
  // width: 110px;
  // height: 160px;
  border-radius: 3px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: rgb(253, 166, 53);

  .heading {
    // position: absolute;
    // top: 10px;
    // left: 10px;
    font-size: 18px;
    margin-bottom: 12px;
  }
  .thenSource {
    display: inline-block;
    position: absolute;
    background-color: rgb(49, 155, 247);
    width: 30px;
    height: 30px;
    right: -15px;
    bottom: -15px;
    border-radius: 100%;
  }
}
</style>