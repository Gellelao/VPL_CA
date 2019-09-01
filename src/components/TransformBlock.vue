<template>
  <div :id="id" class="transform">
    <div class="body">
      <div>Neighbourhood:</div>
      <!-- Grid start -->
      <div class="grid">
        <tr v-for="(row, x) in grid" :key="x">
          <td v-for="(col, y) in row" :key="y">
            <div v-if="x*y != 1" class="tile" :class="{on: grid[x][y]}" @click="toggleCell(x, y)"></div>
          </td>
        </tr>
      </div>
      <!-- Grid end -->
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
  // z-index: 2;
  position: absolute;
  padding: 10px;
  background-color: var(--transform-primary);
  border-color: var(--transform-secondary);

  .heading {
    font-size: 18px;
    margin-bottom: 12px;
  }
  .neighboursSource,
  .stateSource {
    bottom: -15px;
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
    background-color: var(--transform-primary);
  }
  .on {
    background-color: var(--transform-secondary);
  }
  th,
  td {
    border: 1px solid black;
  }
}
</style>