<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Vuetify</span>
        <span class="font-weight-light">MATERIAL DESIGN</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat href="https://github.com/vuetifyjs/vuetify/releases/latest" target="_blank">
        <span class="mr-2">Latest Release</span>
      </v-btn>
    </v-toolbar>

    <v-content>
      <v-layout align-center justify-center row>
        <v-flex grow xs6>
          <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
        </v-flex>
        <v-flex grow xs6>
          <!-- <img alt="Vue logo" src="./assets/logo.png">
          <HelloWorld1 msg="ANOTHER ONE" title="yo it works"/>
          <draggable/> -->
        </v-flex>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';
import HelloWorld1 from './components/HelloWorld.1';
import draggable from './components/draggable';

export default {
  name: 'App',
  components: {
    HelloWorld,
    HelloWorld1,
    draggable,
  },
  data() {
    return {
      //
    };
  }
};
</script>
