<template>
  <div :id="id" class="condition">
    <span>Condition</span>
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
  mounted(){
    this.updateOperatorInParent();
  },
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

<style scoped lang="scss">

.condition {
  z-index: 2;
  position: absolute;
  width: 200px;
  height: 100px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: beige;
}
.thenSource {
  position: absolute;
  background-color: rgb(49, 155, 247);
  width: 30px;
  height: 30px;
  right: -15px;
  bottom: -15px;
  border-radius: 100%;
}
</style>
