<template>
  <div :id="id" class="condition">
    Condition
    <template v-if="property === 'neighbours'">
      <input v-model.number="howManyNeighbours" type="number">
      <div>Neighbours are in state</div>
      <div class="selectColour">
        <div class="form__input">
          <swatches v-model="requiredState" popover-to="left">Select state</swatches>
        </div>
      </div>
    </template>
    <template v-else-if="property === 'state'">
      <div>State!</div>
    </template>
    <div v-else>Connect a property</div>
    <div class="thenSource"></div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches },
  props: ["id", "source"],
  data: () => ({
    howManyNeighbours: 1,
    requiredState: "1CA085"
  }),
  computed: {
    property() {
      let index = this.source.lastIndexOf("_");
      return this.source.substr(index + 1);
    }
  }
};
</script>
