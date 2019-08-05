<template>
  <div :id="id" class="state">
    <v-toolbar-title class="text-uppercase">
      <span class="heading">Colour</span>
    </v-toolbar-title>
    <div class="selectColour">
      <!-- <div class="form__input"> -->
      <swatches v-model="colour" colors="text-basic" @input="updateStateInParent"></swatches>
      <!-- </div> -->
    </div>
    <div :id="id+'_neighbours'" class="neighboursSource">
      <v-chip>Others</v-chip>
    </div>
    <div :id="id+'_state'" class="stateSource">
      <v-chip>Myself</v-chip>
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
    display: inline-block;
  width: 150px;
  height: 150px;
  border-radius: 100%;
  background-color: var(--state-primary);
  border-color: var(--state-secondary);

  .heading {
    display: inline-block;
    margin-top: 25px;
  }
  .selectColour {
    display: inline-block;
    margin-top: 5px;
    background-color: var(--state-secondary);
  }
}
</style>
