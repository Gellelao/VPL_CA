<template>
  <div :id="id" class="action">
    <v-toolbar-title class="text-uppercase">
      <span class="heading">Action</span>
    </v-toolbar-title>
    <template v-if="affectsNeighbours">
      <div>Turn my neighbours into:</div>
      <div class="selectColour">
        <swatches v-model="desiredState" colors="text-basic" @input="updateStateInParent"></swatches>
      </div>
    </template>
    <template v-else>
      <div>Turn myself into:</div>
      <div class="selectColour">
        <swatches v-model="desiredState" colors="text-basic" @input="updateStateInParent"></swatches>
      </div>
    </template>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches },
  props: ["id", "source", "initialDesiredState", "initialAffectsNeighbours"],
  data: function() {
    return {
      desiredState: this.initialDesiredState,
      affectsNeighbours: this.initialAffectsNeighbours
    };
  },
  methods: {
    updateStateInParent() {
      this.$root.$emit("updateActionDesiredState", {
        id: this.id,
        desiredState: this.desiredState
      });
    }
  }
};
</script>

<style scoped lang="scss">
.action {
  text-align: center;
  z-index: 2;
  position: absolute;
  padding: 10px;
  background-color: var(--action-primary);
  border-color: var(--action-secondary);

  .heading {
    font-size: 18px;
    margin-bottom: 12px;
  }
  .selectColour {
    background-color: var(--action-secondary);
  }
}
</style>