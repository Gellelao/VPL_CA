<template>
  <div :id="id" class="action">
    <v-toolbar-title class="text-uppercase heading">
      <span class="heading">Action</span>
    </v-toolbar-title>
    <div class="onSameLine">
      Turn
      <select
        :id="id+'_actionsAffectsNeighboursSelector'"
        v-model="affectsNeighbours"
        @change="updateAffectsNeighboursInParent"
      >
        <option value="false">myself</option>
        <option value="true">my neighbours</option>
      </select>
      into:
    </div>
    <p></p>
    <div class="selectColour">
      <swatches v-model="desiredState" colors="text-basic" @input="updateStateInParent"></swatches>
    </div>

    <template v-if="affectsNeighbours === 'true'">
      <v-btn class="toggleTransform" flat icon color="black" @click.stop="drawer = !drawer">
        <template v-if="drawer">
          <v-icon>keyboard_arrow_left</v-icon>
        </template>
        <div v-else>
          <v-icon>keyboard_arrow_right</v-icon>
        </div>
      </v-btn>

      <div class="drawer" :class="{ open: drawer }">
        <TransformBlock
          :id="'null'"
          :source="'null'"
          :initialNeighbourhood="[
          [true, true, true],
          [true, false, true],
          [true, true, true]
        ]"
        ></TransformBlock>
      </div>
    </template>
  </div>
</template>

<script>
import Swatches from "vue-swatches";
import TransformBlock from "./TransformBlock";

export default {
  components: { Swatches, TransformBlock },
  props: ["id", "source", "initialDesiredState", "initialAffectsNeighbours"],
  data: function() {
    return {
      desiredState: this.initialDesiredState,
      affectsNeighbours: this.initialAffectsNeighbours,
      drawer: false
    };
  },
  mounted() {
    this.resizeSelect();
  },
  methods: {
    updateStateInParent() {
      this.$root.$emit("updateActionDesiredState", {
        id: this.id,
        desiredState: this.desiredState
      });

      this.$root.$emit("updateActionAffectsNeighbours", {
        id: this.id,
        affectsNeighbours: this.affectsNeighbours
      });
    },
    updateAffectsNeighboursInParent() {
      this.$root.$emit("updateActionAffectsNeighbours", {
        id: this.id,
        affectsNeighbours: this.affectsNeighbours
      });

      // Also update the width of the select box to match the text inside
      this.resizeSelect();
    },
    resizeSelect() {
      // Code from here: https://stackoverflow.com/a/49693251
      const select = document.querySelector(
        "#" + this.id + "_actionsAffectsNeighboursSelector"
      );

      const dummySelect = document.createElement("select");
      dummySelect.classList.add("dummy");

      const dummyOption = document.createElement("option");
      dummyOption.innerHTML =
        select.options[select.selectedIndex].text + "+four";
      dummySelect.appendChild(dummyOption);

      document.body.appendChild(dummySelect);
      select.style.width = `${dummySelect.offsetWidth}px`;

      document.body.removeChild(dummySelect);
    }
  }
};
</script>

<style scoped lang="scss">
.action {
  text-align: center;
  // z-index: 2;
  position: absolute;
  padding: 10px;
  background-color: var(--action-primary);
  border-color: var(--action-secondary);
  min-height: 170px;

  .heading {
    font-size: 18px;
    margin-bottom: 12px;
  }
  .selectColour {
    background-color: var(--action-secondary);
  }
  .onSameLine {
    display: inline-block;
  }
  p {
    margin-bottom: 10px;
  }
  input,
  select {
    border-radius: 5px;
    background-color: var(--action-secondary);
    padding: 4px 10px;
  }
  .dummy {
    position: absolute;
    left: -10000px;
    padding: 4px 10px;
  }

  .drawer {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: -5;
    transform: translateX(0px);
    transition: transform 0.2s;
  }
  .open {
    transform: translateX(195px) !important;
  }
  .toggleTransform {
    position: absolute;
    right: -4px;
    bottom: 13px;
  }
}
</style>