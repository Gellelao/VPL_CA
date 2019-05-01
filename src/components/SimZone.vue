<template>
  <div>
    <button @click="initializeGrid()">Initialize Grid</button>
    <button @click="updateCells">Update cells</button>
    <!-- The following button is from this project: https://github.com/iaucab/cellular-automaton-with-vue -->
    <button @click="isRunning ? stop() : start()">{{ isRunning ? 'stop' : 'start' }}</button>
    <!-- Rules: {{rules}} -->
    <tr v-for="(row, x) in grid" :key="x">
      <td v-for="(col, y) in row" :key="y">
        <div class="cell" :style="{'background-color': grid[x][y]}" @click="setColour(x, y)"></div>
      </td>
    </tr>
    <div class="form__label">
      <swatches v-model="penColour" colors="text-basic" inline></swatches>
    </div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

export default {
  components: { Swatches },
  props: ["rules"],
  data: () => ({
    grid: [],
    timer: null,
    isRunning: false,
    penColour: "#000000"
  }),
  mounted() {
    this.initializeGrid();
  },
  computed: {
    colours() {
      let colours = new Set();
      this.rules.forEach(rule => {
        colours.add(rule.stateColour);
      });
      return Array.from(colours);
    }
  },
  methods: {
    initializeGrid(width = 39, height = 39) {
      let newGrid = [];
      for (let y = 0; y < height; y++) {
        let newRow = [];
        for (let x = 0; x < width; x++) {
          if (this.colours.length <= 1) {
            newRow.push(Math.random() < 0.5 ? "#FFFFFF" : "#000000");
          } else {
            var randomIndex = Math.floor(Math.random() * this.colours.length);
            newRow.push(this.colours[randomIndex]);
          }
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
      // We expect to have updated this variable by the end of the method
      var futureCellState = cellState;

      this.rules.forEach(rule => {
        // Only consider rules that match the state of this cell
        if (rule.stateColour === cellState) {
          switch (rule.property) {
            case "neighbours": {
              let actualNeighbours = neighbours.filter(
                cell => cell === rule.requiredState
              ).length;
              // Make this equals sign a variable - could be < or >
              switch (rule.operator) {
                case "Exactly": {
                  if (actualNeighbours === rule.desiredNumberOfNeighbours) {
                    rule.actions.forEach(action => {
                      switch (action.property) {
                        case "neighbours": {
                          break;
                        }
                        case "state": {
                          futureCellState = action.desiredState;
                          break;
                        }
                        default: {
                          break;
                        }
                      }
                    });
                  }
                  break;
                }
                case "Less than": {
                  if (actualNeighbours < rule.desiredNumberOfNeighbours) {
                    rule.actions.forEach(action => {
                      switch (action.property) {
                        case "neighbours": {
                          break;
                        }
                        case "state": {
                          futureCellState = action.desiredState;
                          break;
                        }
                        default: {
                          break;
                        }
                      }
                    });
                  }
                  break;
                }
                case "More than": {
                  if (actualNeighbours > rule.desiredNumberOfNeighbours) {
                    rule.actions.forEach(action => {
                      switch (action.property) {
                        case "neighbours": {
                          break;
                        }
                        case "state": {
                          futureCellState = action.desiredState;
                          break;
                        }
                        default: {
                          break;
                        }
                      }
                    });
                  }
                  break;
                }
                default: {
                  break;
                }
              }
            }
            case "state": {
              break;
            }
            default: {
              break;
            }
          }
        }
      });

      // if (cellState === "#ffffff") {
      //   // DEAD
      //   if (aliveNeighbours == 3) {
      //     return "#000000";
      //   }
      // } else {
      //   // ALIVE
      //   if (aliveNeighbours < 2 || aliveNeighbours > 3) {
      //     return "#ffffff";
      //   }
      // }
      return futureCellState;
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
    setColour(x, y) {
      // Code from here: https://stackoverflow.com/questions/45644781/update-value-in-multidimensional-array-in-vue?rq=1
      //make a copy of the row
      const newRow = this.grid[x].slice(0);
      // update the value
      newRow[y] = this.penColour;
      // update it in the grid
      this.$set(this.grid, x, newRow);
    },
    start() {
      this.isRunning = true;
      this.timer = setInterval(this.updateCells, 100);
    },
    stop() {
      this.isRunning = false;
      clearInterval(this.timer);
    }
  }
};
</script>

<style scoped>
.cell {
  width: 20px;
  height: 20px;
  /* border-radius: 5px; */
  /* border-radius: 10px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75); */
}
</style>
