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
    <!-- put the property nodes in v-shows so that they stay on the dom -->
    <div v-show="property === 'neighbours'">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <div :id="id+'_neighbours'" v-on="on" class="neighboursSource"></div>
        </template>
        <span>Neighbours</span>
      </v-tooltip>
    </div>
    <div v-show="property === 'state'">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <div :id="id+'_state'" v-on="on" class="stateSource"></div>
        </template>
        <span>State</span>
      </v-tooltip>
    </div>
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
  .neighboursSource {
    position: absolute;
    background-color: rgb(54, 173, 43);
    width: 30px;
    height: 30px;
    bottom: -15px;
    border-radius: 100%;
  }
  .stateSource {
    position: absolute;
    background-color: rgb(173, 0, 0);
    width: 30px;
    height: 30px;
    bottom: -15px;
    border-radius: 100%;
  }
}
</style>