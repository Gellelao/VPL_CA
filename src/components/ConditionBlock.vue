<template>
  <div :id="id" class="condition">
    Condition
    <template v-if="property === 'neighbours'">
      <select v-model="operator" @change="updateOperatorInParent">
        <option>Exactly</option>
        <option>Less than</option>
        <option>More than</option>
      </select>
      <input v-model.number="howManyNeighbours" @input="updateNeighboursInParent" type="number">
      <div>Neighbours are in state</div>
      <div class="selectColour">
        <div class="form__input">
          <swatches
            v-model="requiredState"
            colors="text-basic"
            @input="updateStateInParent"
          >Select state</swatches>
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
    operator: "Exactly",
    howManyNeighbours: 1,
    requiredState: "1CA085"
  }),
  computed: {
    property() {
      let index = this.source.lastIndexOf("_");
      return this.source.substr(index + 1);
    }
  },
  methods: {
    updateStateInParent() {
      this.$root.$emit("updateConditionRequiredState", {
        id: this.id,
        requiredState: this.requiredState
      });
    },
    updateNeighboursInParent() {
      this.$root.$emit("updateConditionNeighbours", {
        id: this.id,
        neighbours: this.howManyNeighbours
      });
    },
    updateOperatorInParent() {
      this.$root.$emit("updateConditionOperator", {
        id: this.id,
        operator: this.operator
      });
    }
  }
};
</script>
