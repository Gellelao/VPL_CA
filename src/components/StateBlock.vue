<template>
  <div :id="id" class="state">
    State
    <div class="form__field selectColour">
      <div class="form__input">
        <swatches v-model="color" colors="text-basic"></swatches>
      </div>
    </div>
    <div :id="id+'_neighbours'" class="neighboursSource"></div>
    <div :id="id+'_state'" class="stateSource"></div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches},
  props: ["id"],
  data: () => ({
    color: "#1CA085",
  })
};
</script>
