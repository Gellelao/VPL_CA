<template>
  <div>
    <button @click="initializeGrid()">Initialize Grid</button>
    <button @click="updateCells">Update cells</button>
    <!-- The following button is from this project: https://github.com/iaucab/cellular-automaton-with-vue -->
    <button @click="isRunning ? stop() : start()">{{ isRunning ? 'stop' : 'start' }}</button>
    Rules: {{rules}}
    <tr v-for="(row, x) in grid" :key="x">
      <td v-for="(col, y) in row" :key="y">
        <div class="cell" :style="{'background-color': grid[x][y]}"></div>
      </td>
    </tr>
  </div>
</template>

<script>
export default {
  props: ["rules"],
  data: () => ({
    grid: [],
    timer: null,
    isRunning: false
  }),
  mounted() {
    this.initializeGrid();
  },
  methods: {
    initializeGrid(width = 39, height = 39) {
      let newGrid = [];
      for (let y = 0; y < height; y++) {
        let newRow = [];
        for (let x = 0; x < width; x++) {
          newRow.push(Math.random() < 0.5 ? "#ffffff" : "#000000");
        }
        newGrid.push(newRow);
      }
      this.grid = newGrid;
    },
    updateCells() {
      let newGrid = [];
      for (let x = 0; x < this.grid.length; x++) {
        newGrid[x] = [];
        for (let y = 0; y < this.grid[x].length; y++) {
          let nextVal = this.applyRules(x, y);
          newGrid[x][y] = nextVal;
        }
      }
      this.grid = newGrid;
    },
    applyRules(x, y) {
      let cellState = this.grid[x][y];
      let neighbours = this.getMyNeighbours(x, y);
      let aliveNeighbours = neighbours.filter(cell => cell === "#000000")
        .length;
      if (cellState === "#ffffff") {
        // DEAD
        if (aliveNeighbours == 3) {
          return "#000000";
        }
      } else {
        // ALIVE
        if (aliveNeighbours < 2 || aliveNeighbours > 3) {
          return "#ffffff";
        }
      }
      return cellState;
    },
    getMyNeighbours(x, y) {
      // no looping for now
      let neighbours = [];
      for (let i = x - 1; i <= x + 1; i++) {
        if (i < 0 || i >= this.grid[0].length) continue;
        for (let j = y - 1; j <= y + 1; j++) {
          if (j < 0 || j >= this.grid[i].length || (x == i && y == j)) continue;
          neighbours.push(this.grid[i][j]);
        }
      }
      return neighbours;
    },
    start(){
      this.isRunning = true;
      this.timer = setInterval(this.updateCells, 100);
    },
    stop(){
      this.isRunning = false;
      clearInterval(this.timer);
    },
  }
};
</script>

<style scoped>
.cell {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  /* border-radius: 10px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75); */
}
</style>
