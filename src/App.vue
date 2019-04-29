<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Rules</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-title class="headline text-uppercase">
        <span>Simulation</span>
      </v-toolbar-title>
    </v-toolbar>

<RulesZone/>
  </v-app>
</template>

<script>
import RulesZone from './components/RulesZone';
import jsplumb from 'jsplumb';
import Vue from 'vue';

export default {
  name: 'App',
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
