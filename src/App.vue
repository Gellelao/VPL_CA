<template>
  <v-app>
    <RulesZone/>
  </v-app>
</template>

<script>
import RulesZone from "./components/RulesZone";
import jsplumb from "jsplumb";
import Vue from "vue";

export default {
  name: "App",
  components: {
    RulesZone
  },
  data() {
    return {
      //
    };
  }
};
</script>
