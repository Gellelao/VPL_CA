<template>
  <div :id="id" class="condition">
    <v-toolbar-title class="text-uppercase">
      <span class="heading">Condition</span>
    </v-toolbar-title>
    <template class="body" v-if="property === 'neighbours'">
      <div class="body">
        <select v-model="operator" @change="updateOperatorInParent">
          <option>Exactly</option>
          <option>Less than</option>
          <option>More than</option>
        </select>
        <input v-model.number="howManyNeighbours" @input="updateNeighboursInParent" type="number">
        <div>Neighbours are:</div>
        <div class="selectColour">
          <swatches
            v-model="requiredState"
            colors="text-basic"
            @input="updateStateInParent"
          >Select state</swatches>
        </div>
      </div>
    </template>
    <template v-else-if="property === 'state'">
      <div class="body">Skip!</div>
    </template>
    <div class="body" v-else>Connect a property</div>
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
  mounted() {
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
  text-align: center;
  z-index: 2;
  position: absolute;
  width: 120px;
  // min-height: 70px;
  // max-height: 170px;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: #FFF176;
  .heading {
    // position: absolute;
    display: inline-block;
    // top: 10px;
    // left: 10px;
    font-size: 18px;
    margin-bottom: 12px;
  }
  .body {
    display: inline-block;
    // position: absolute;
    // top: 40px;
    // left: 10px;
  }
  select {
    width: 100%;
    border-radius: 5px;
    background-color: #FDD835;
    margin-bottom: 4px;
    padding-left: 4px;
  }
  input {
    width: 100%;
    border-radius: 5px;
    background-color: #FDD835;
    padding-left: 4px;
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
