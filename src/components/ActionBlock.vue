<template>
  <div :id="id" class="action">
    <v-toolbar-title class="text-uppercase heading">
      <span class="heading">Action</span>
    </v-toolbar-title>
    <div class="onSameLine">
    Turn
    <select :id="id+'_actionsAffectsNeighboursSelector'" v-model="affectsNeighbours" @change="updateAffectsNeighboursInParent">
      <option value="false">myself</option>
      <option value="true">my neighbours</option>
    </select>
    into:
    </div>
    <p></p>
    <div class="selectColour">
      <swatches v-model="desiredState" colors="text-basic" @input="updateStateInParent"></swatches>
    </div>
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
      const select = document.querySelector('#' + this.id + "_actionsAffectsNeighboursSelector");

      const dummySelect = document.createElement("select");
      dummySelect.classList.add("dummy");

      const dummyOption = document.createElement("option");
      dummyOption.innerHTML = select.options[select.selectedIndex].text + "+four";
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
  .onSameLine{
    display: inline-block
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
}
</style>