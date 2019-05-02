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

<style scoped lang="scss">

.action {
  z-index: 2;
  position: absolute;
  width: 100px;
  height: 100px;
  /* border-radius: 5px; */
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: rgb(255, 217, 217);
}
// .action:before {
//       content: "";
//       position: absolute;
//       top: -25px;
//       left: 0;
//       width: 0;
//       height: 0;
//       border-left: 50px solid transparent;
//       border-right: 50px solid transparent;
//       border-bottom: 25px solid  rgb(255, 217, 217);
//     }
// .action:after {
//       content: "";
//       position: absolute;
//       bottom: -25px;
//       left: 0;
//       width: 0;
//       height: 0;
//       border-left: 50px solid transparent;
//       border-right: 50px solid transparent;
//       border-top: 25px solid  rgb(255, 217, 217);
//     }

</style>