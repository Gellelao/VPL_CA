<template>
  <div :id="id" class="state">
    State
    <div class="form__field selectColour">
      <div class="form__input">
        <swatches v-model="colour" colors="text-basic" @input="updateStateInParent"></swatches>
      </div>
    </div>
    <div :id="id+'_neighbours'" class="neighboursSource"></div>
    <div :id="id+'_state'" class="stateSource"></div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches },
  props: ["id"],
  data: () => ({
    colour: "#1CA085"
  }),
  methods: {
    updateStateInParent() {
      this.$root.$emit("updateStateColour", {
        id: this.id,
        colour: this.colour
      });
    }
  }
};
</script>
