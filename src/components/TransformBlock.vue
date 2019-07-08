<template>
  <div :id="id" class="transform">
    <v-toolbar-title class="text-uppercase">
      <span class="heading">Transform</span>
    </v-toolbar-title>
    <template v-if="property === 'neighbours'">
      <div class="body">
        <div>Set neighbourhood:</div>
        <!-- Grid start -->
        <div class="grid">
          <tr v-for="(row, x) in grid" :key="x">
            <td v-for="(col, y) in row" :key="y">
              <div class="tile" :class="{on: grid[x][y]}" @click="toggleCell(x, y)"></div>
            </td>
          </tr>
        </div>
        <!-- Grid end -->
      </div>
    </template>
    <template v-else-if="property === 'state'">
      <div class="body">
        state
        <!-- Fill this in -->
      </div>
    </template>
    <div class="body" v-else>Connect a property</div>
    <!-- put the property nodes in v-shows so that they stay on the dom -->
    <div v-show="property === 'neighbours'">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <div :id="id+'_neighbours'" v-on="on" class="neighboursSource"></div>
        </template>
        <span>Neighbours</span>
      </v-tooltip>
    </div>
    <div v-show="property === 'state'">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <div :id="id+'_state'" v-on="on" class="stateSource"></div>
        </template>
        <span>State</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  props: ["id", "source", "initialNeighbourhood"],
  data: function() {
    return {
      grid: this.initialNeighbourhood
    };
  },
  mounted() {
    this.updateNeighbourhoodInParent();
  },
  computed: {
    property() {
      let index = this.source.lastIndexOf("_");
      return this.source.substr(index + 1);
    }
  },
  methods: {
    updateNeighbourhoodInParent() {
      this.$root.$emit("updateNeighbourhood", {
        id: this.id,
        neighbourhood: this.grid
      });
    },
    toggleCell(x, y) {
      // Code from here: https://stackoverflow.com/questions/45644781/update-value-in-multidimensional-array-in-vue?rq=1
      //make a copy of the row
      const newRow = this.grid[x].slice(0);
      // update the value
      newRow[y] = !newRow[y];
      // update it in the grid
      this.$set(this.grid, x, newRow);
      // That process is necessary in order for Vue to realise that the array has changed and rerender accordingly
      this.updateNeighbourhoodInParent();
    }
  }
};
</script>

<style scoped lang="scss">
.transform {
  text-align: center;
  z-index: 2;
  position: absolute;
  padding: 10px;
  // width: 110px;
  // height: 160px;
  border-radius: 3px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: #fda635;

  .heading {
    // position: absolute;
    // top: 10px;
    // left: 10px;
    font-size: 18px;
    margin-bottom: 12px;
  }
  .neighboursSource {
    position: absolute;
    background-color: rgb(54, 173, 43);
    width: 30px;
    height: 30px;
    bottom: -15px;
    border-radius: 100%;
  }
  .stateSource {
    position: absolute;
    background-color: rgb(173, 0, 0);
    width: 30px;
    height: 30px;
    bottom: -15px;
    border-radius: 100%;
  }
  .body {
    display: inline-block;
  }
  .grid {
    border-collapse: collapse;
    display: inline-block;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  .tile {
    width: 30px;
    height: 30px;
    border: rgb(48, 48, 48);
    background-color: #fda635;
  }
  .on {
    background-color: #a16a23;
  }
  th,
  td {
    border: 1px solid black;
  }
}
</style>