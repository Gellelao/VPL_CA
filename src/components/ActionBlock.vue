<template>
  <div :id="id" class="action">
    <v-toolbar-title class="text-uppercase">
      <span class="heading">Action</span>
    </v-toolbar-title>
    <template v-if="property === 'neighbours'">
      <div class="body">
        <div>Turn my neighbours into:</div>
        <div class="selectColour">
          <swatches v-model="desiredState" colors="text-basic" @input="updateStateInParent"></swatches>
        </div>
      </div>
    </template>
    <template v-else-if="property === 'state'">
      <div class="body">
        <div>Become:</div>
        <div class="selectColour">
          <swatches v-model="desiredState" colors="text-basic" @input="updateStateInParent"></swatches>
        </div>
      </div>
    </template>
    <div class="body" v-else>Connect a property</div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches },
  props: ["id", "source"],
  data: () => ({
    desiredState: "1CA085"
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
  text-align: center;
  z-index: 2;
  position: absolute;
  padding: 10px;
  // width: 110px;
  // height: 160px;
  border-radius: 30px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: #FDD835;

  .heading {
    // position: absolute;
    // top: 10px;
    // left: 10px;
    font-size: 18px;
    margin-bottom: 12px;
  }
  .body {
    // position: absolute;
    // top: 40px;
    // left: 10px;
  }
}
</style>