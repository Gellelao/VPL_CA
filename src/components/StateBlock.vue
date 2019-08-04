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
    <div :id="id+'_neighbours'" class="neighboursSource">
      <v-chip >Others</v-chip>
    </div>
    <div :id="id+'_state'" class="stateSource">
      <v-chip >Myself</v-chip>
    </div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches },
  props: ["id", "initialColour"],
  data: function() {
    return {
      colour: this.initialColour
    };
  },
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
  background-color: var(--state-primary);

  .heading {
    position: absolute;
    top: 30px;
    left: 42px;
  }
  .selectColour {
    position: absolute;
    top: 60px;
    left: 50px;
  }
}
</style>
