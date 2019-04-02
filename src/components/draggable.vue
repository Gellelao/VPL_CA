<template>
  <div id="diagramContainer">
    <div id="item_left" class="item"></div>
    <div id="item_right" class="item" style="margin-left:50px;"></div>
  </div>
</template> 

    <script>
import jsplumb from "jsplumb";
export default {
  props: ["yourProps"],
  data() {
    return {
      your: data
    };
  },
  mounted() {
    jsPlumb.ready(function() {
      jsPlumb.connect({
        source: "item_left",
        target: "item_right",
        endpoint: "Rectangle"
      });
    });
  }
};
</script> 