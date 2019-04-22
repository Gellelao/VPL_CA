<script>
import Vue from "vue";

Vue.component("ConditionBlock", {
  props: ["id", "class"],
  template: `<div :id="id" class="condition">
          State
          <div class="thenSource"></div>
        </div>`
});
</script>