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
      <div class="body" >State!</div>
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
  z-index: 2;
  position: absolute;
  width: 120px;
  height: 170px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: beige;
  .heading {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 18px;
  }
  .body {
    position: absolute;
    top: 40px;
    left: 10px;
  }
  input{
    width: 100px;
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
  .selectColour {
    position: absolute;
    width: 50px;
    height: 50px;
    top: 70px;
    left: 25px;
    padding: 4px;
    border-radius: 5px;
    background-color: rgb(90, 90, 90);
    /* box-shadow: 2px 2px 2px 2px rgba(190, 190, 190, 0.75); */
  }
}
</style>
