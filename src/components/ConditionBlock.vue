<template>
  <div :id="id" class="condition">
    <v-toolbar-title class="text-uppercase">
      <span class="heading">Condition</span>
    </v-toolbar-title>
    <div class="body">
      <select v-model="operator" @change="updateOperatorInParent">
        <option>Exactly</option>
        <option>Less than</option>
        <option>More than</option>
        <option>Between</option>
      </select>
      <template v-if="operator === 'Between'">
        <input
          class="rangeInput"
          v-model.number="neighbourRange[0]"
          @input="updateNeighbourRangeInParent"
          type="number"
        />
        and
        <input
          class="rangeInput"
          v-model.number="neighbourRange[1]"
          @input="updateNeighbourRangeInParent"
          type="number"
        />
      </template>
      <div v-else>
        <input v-model.number="howManyNeighbours" @input="updateNeighboursInParent" type="number" />
      </div>
      <div>Neighbours are:</div>
      <div class="selectColour">
        <swatches
          v-model="requiredState"
          colors="text-basic"
          @input="updateStateInParent"
        >Select state</swatches>
      </div>

      <v-btn class="toggleTransform" flat icon color="black" @click.stop="drawer = !drawer">
        <template v-if="drawer">
          <v-icon>keyboard_arrow_left</v-icon>
        </template>
        <div v-else>
          <v-icon>keyboard_arrow_right</v-icon>
        </div>
      </v-btn>
    </div>
    <div :id="id+'_then'" class="thenSource">
      <v-chip>Then</v-chip>
    </div>

    <div class="drawer" :class="{ open: drawer }">
      <TransformBlock
        :id="id+'_transform'"
        :initialNeighbourhood="neighbourhood"
      ></TransformBlock>
    </div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";
import TransformBlock from "./TransformBlock";

export default {
  components: { Swatches, TransformBlock },
  props: [
    "id",
    "source",
    "initialOperator",
    "initialNeighbourCount",
    "initialNeighbourRange",
    "initialNeighbourhood",
    "initialReqState",
  ],
  data: function() {
    return {
      operator: this.initialOperator,
      howManyNeighbours: this.initialNeighbourCount,
      neighbourRange: this.initialNeighbourRange,
      neighbourhood: this.initialNeighbourhood,
      requiredState: this.initialReqState,
      drawer: false
    };
  },
  mounted() {
    this.updateOperatorInParent();
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
    updateNeighbourRangeInParent() {
      this.$root.$emit("updateConditionNeighbourRange", {
        id: this.id,
        range: this.neighbourRange
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
  // z-index: 2;
  position: absolute;
  // width: 120px;
  padding: 10px;
  background-color: var(--condition-primary);
  border-color: var(--condition-secondary);

  .heading {
    display: inline-block;
    font-size: 18px;
    margin-bottom: 12px;
  }
  .body {
    display: inline-block;
    margin-bottom: 15px;
    max-width: 120px;
  }
  .selectColour {
    background-color: var(--condition-secondary);
  }
  input,
  select {
    width: 100%;
    display: block;
    border-radius: 5px;
    background-color: var(--condition-secondary);
    margin-bottom: 4px;
    padding: 4px 10px;
  }
  .thenSource {
    display: inline-block;
    position: absolute;
    right: 39px;
    bottom: -25px;
  }
  .rangeInput {
    display: inline-block;
    width: 37%;
  }
  .drawer {
    position: absolute;
    top: 50px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: -5;
    transform: translateX(0px);
    transition: transform 0.2s;
  }
  .open {
    transform: translateX(135px) !important;
  }
  .toggleTransform{
    position: absolute;
    right: -4px;
    bottom: 28px;
  }
}
</style>
