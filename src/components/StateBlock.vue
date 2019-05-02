<template>
  <div :id="id" class="state">
     <v-toolbar-title class="text-uppercase">
       <span class="heading">State</span>
     </v-toolbar-title>
    <div class="selectColour">
      <!-- <div class="form__input"> -->
      <swatches v-model="colour" colors="text-basic" @input="updateStateInParent"></swatches>
      <!-- </div> -->
    </div>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
    <div :id="id+'_neighbours'" v-on="on" class="neighboursSource"></div>
      </template>
      <span>Neighbours</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
    <div :id="id+'_state'" v-on="on" class="stateSource"></div>
      </template>
      <span>State</span>
    </v-tooltip>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches },
  props: ["id"],
  data: () => ({
    colour: "#000000"
  }),
  mounted() {
    this.updateStateInParent();
  },
  methods: {
    updateStateInParent() {
      this.$root.$emit("updateStateColour", {
        id: this.id,
        colour: this.colour
      });
    }
  }
};
</script>

<style scoped lang="scss">
.state {
  z-index: 2;
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 100%;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: rgb(255, 255, 255);

  .heading{
    position: absolute;
    top: 30px;
    left: 42px;
  }
  .selectColour {
    position: absolute;
    width: 50px;
    height: 50px;
    top: 60px;
    left: 50px;
    padding: 4px;
    border-radius: 5px;
    background-color: rgb(90, 90, 90);
    /* box-shadow: 2px 2px 2px 2px rgba(190, 190, 190, 0.75); */
  }
  .neighboursSource {
    position: absolute;
    background-color: rgb(54, 173, 43);
    width: 30px;
    height: 30px;
    right: 20px;
    bottom: 0px;
    border-radius: 100%;
  }
  .stateSource {
    position: absolute;
    background-color: rgb(173, 0, 0);
    width: 30px;
    height: 30px;
    left: 20px;
    bottom: -0px;
    border-radius: 100%;
  }
}
</style>
