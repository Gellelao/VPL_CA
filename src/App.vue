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

    <v-content>
      <v-layout align-center justify-center row>
        <v-flex grow xs6>
          <RulesZone/>
        </v-flex>
        <v-flex grow xs6>
          <SimZone/>
        </v-flex>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script>
import RulesZone from './components/RulesZone';
import SimZone from './components/SimZone';
import jsplumb from 'jsplumb';
import Vue from 'vue';

export default {
  name: 'App',
  components: {
    RulesZone,
    SimZone,
  },
  data() {
    return {
      //
    };
  }
};
</script>
