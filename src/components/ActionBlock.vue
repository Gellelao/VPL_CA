<template>
  <div :id="id" class="action">
    Action
    <template v-if="property === 'neighbours'">
      <div>Turn my neighbours into:</div>
      <swatches v-model="desiredState" colors="text-basic" @input="updateStateInParent"></swatches>
    </template>
    <template v-else-if="property === 'state'">
      <div>Turn myself into:</div>
      <swatches v-model="desiredState" colors="text-basic" @input="updateStateInParent"></swatches>
    </template>
    <div v-else>Connect a property</div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches },
  props: ["id", "source"],
  data: () => ({
    desiredState: "1CA085",
  }),
  computed: {
    property() {
      let index = this.source.lastIndexOf("_");
      return this.source.substr(index + 1);
    }
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
