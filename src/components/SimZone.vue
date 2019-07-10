<template>
  <div>
    <v-toolbar>
      <v-spacer></v-spacer>
      <v-slider
        class="speedSlider"
        v-model="speed"
        step="200"
        min="0"
        :max="largestDelay"
        label="Speed"
      ></v-slider>
      <v-btn @click="initializeGrid()">Randomize Grid</v-btn>
      <v-btn @click="fillGrid()">Fill Grid</v-btn>
      <v-btn @click="updateCells">Update cells</v-btn>
      <!-- The following v-btn is from this project: https://github.com/iaucab/cellular-automaton-with-vue -->
      <v-btn @click="isRunning ? stop() : start()">{{ isRunning ? 'stop' : 'start' }}</v-btn>
      <v-toolbar-title class="headline text-uppercase">
        <span>Simulation</span>
      </v-toolbar-title>
    </v-toolbar>
    <!-- Rules: {{rules}} -->
    <div class="grid">
      <tr v-for="(row, x) in grid" :key="x">
        <td v-for="(col, y) in row" :key="y">
          <div class="cell" :style="{'background-color': grid[x][y]}" @click="setCell(x, y)"></div>
        </td>
      </tr>
    </div>
    <div class="form__label">
      <swatches v-model="penColour" colors="text-basic" inline></swatches>
    </div>
  </div>
</template>

<script>
import Swatches from "vue-swatches";

const defaultWidth = 21;
const defaultHeight = 21;
const defaultNeighbourhood = [
  [true, true, true],
  [true, false, true],
  [true, true, true]
];
const largestDelay = 2000;

export default {
  components: { Swatches },
  props: ["rules"],
  data: () => ({
    grid: [],
    nextGrid: [],
    timer: null,
    isRunning: false,
    penColour: "#000000",
    speed: 2000,
    largestDelay: 2000
  }),
  mounted() {
    this.initializeGrid();

    this.$root.$on("loadGrid", data => {
      let newGrid = data.grid;
      this.grid = newGrid;
    });
  },
  computed: {
    colours() {
      let colours = new Set();
      this.rules.forEach(rule => {
        colours.add(rule.stateColour);
      });
      return Array.from(colours);
    },
    updateDelay() {
      // Add 100 to avoid having zero delay
      return this.largestDelay - this.speed + 100;
    }
  },
  methods: {
    setArrays(updated, original) {
      for (var i = 0; i < original.length; i++) {
        // receiver[i] = original[i].slice();
        this.$set(updated, i, original[i].slice());
      }
    },
    initializeGrid(width = defaultWidth, height = defaultHeight) {
      this.grid = [];
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
        this.grid.push(newRow);
      }
      // this.setArrays(this.grid, this.nextGrid);
    },
    fillGrid(width = defaultWidth, height = defaultHeight) {
      this.grid = [];
      for (let y = 0; y < height; y++) {
        let newRow = [];
        for (let x = 0; x < width; x++) {
          newRow.push(this.penColour);
        }
        this.grid.push(newRow);
      }
      // this.setArrays(this.grid, this.nextGrid);
    },
    updateCells() {
      this.setArrays(this.nextGrid, this.grid);
      var updates = [];
      // for (let x = 0; x < this.grid.length; x++) {
      //   this.nextGrid[x] = [];
      //   for (let y = 0; y < this.grid[x].length; y++) {
      //     this.nextGrid[x][y] = "";
      //   }
      // }
      for (let x = 0; x < this.nextGrid.length; x++) {
        for (let y = 0; y < this.nextGrid[x].length; y++) {
          let updateInfo = this.applyRules(x, y);
          if (updateInfo) {
            if (updateInfo.self) {
              this.nextGrid[x][y] = updateInfo.self.colour;
            }
            updates.push(updateInfo);
          }
        }
      }
      updates.forEach(update => {
        let cellUpdates = update.neighbours;
        if (cellUpdates) {
          cellUpdates.forEach(cell => {
            this.nextGrid[cell.x][cell.y] = cell.colour;
          });
        }
      });
      this.setArrays(this.grid, this.nextGrid);
      // Force grid to update:
      // let newRow = this.grid[0].slice(0);
      // this.$set(this.grid, 0, newRow);
    },
    processActions(x, y, actions) {
      var actionsResult = {};
      actions.forEach(action => {
        switch (action.property) {
          case "neighbours": {
            actionsResult.neighbours = this.setMyNeighbours(
              x,
              y,
              action.desiredState,
              action.neighbourhood
            );
            break;
          }
          case "state": {
            actionsResult.self = {
              x,
              y,
              colour: action.desiredState
            };
            break;
          }
          default: {
            // do nothing
          }
        }
      });
      return actionsResult;
    },
    applyRules(x, y) {
      let cellState = this.grid[x][y];
      // We expect to have updated this variable by the end of the method
      var updateInfo;

      this.rules.forEach(rule => {
        // Only consider rules that match the state of this cell
        if (rule.stateColour === cellState) {
          let neighbours = this.getMyNeighbours(x, y, rule.neighbourhood);
          switch (rule.property) {
            case "neighbours": {
              let actualNeighbours = neighbours.filter(
                cell => cell === rule.requiredState
              ).length;
              switch (rule.operator) {
                case "Exactly": {
                  if (actualNeighbours === rule.desiredNumberOfNeighbours) {
                    updateInfo = this.processActions(x, y, rule.actions);
                  }
                  break;
                }
                case "Less than": {
                  if (actualNeighbours < rule.desiredNumberOfNeighbours) {
                    updateInfo = this.processActions(x, y, rule.actions);
                  }
                  break;
                }
                case "More than": {
                  if (actualNeighbours > rule.desiredNumberOfNeighbours) {
                    updateInfo = this.processActions(x, y, rule.actions);
                  }
                  break;
                }
                default: {
                  // do nothing
                }
              }
              break;
            }
            case "state": {
              updateInfo = this.processActions(x, y, rule.actions);
              break;
            }
            default: {
              // do nothing
            }
          }
        }
      });
      // if(updateInfo){
      //   this.nextGrid[x][y] = futureCellState;
      // }
      return updateInfo;
    },
    getMyNeighbours(x, y, neighbourhood = defaultNeighbourhood) {
      // no looping for now
      // 8 neighbours
      let neighbours = [];
      for (let i = x - 1; i <= x + 1; i++) {
        if (i < 0 || i >= this.grid[0].length) continue;
        for (let j = y - 1; j <= y + 1; j++) {
          if (j < 0 || j >= this.grid[i].length || (x == i && y == j)) continue;
          if (!neighbourhood[i - x + 1][j - y + 1]) continue; // Filter out neighbours we are not interested in
          neighbours.push(this.grid[i][j]);
        }
      }
      return neighbours;
    },
    setMyNeighbours(x, y, colour, neighbourhood = defaultNeighbourhood) {
      // no looping for now
      // 8 neighbours
      var cellUpdates = [];
      for (let i = x - 1; i <= x + 1; i++) {
        if (i < 0 || i >= this.grid[0].length) continue;
        for (let j = y - 1; j <= y + 1; j++) {
          if (j < 0 || j >= this.grid[i].length || (x == i && y == j)) continue;
          if (!neighbourhood[i - x + 1][j - y + 1]) continue; // Filter out neighbours we are not interested in
          cellUpdates.push({
            x: i,
            y: j,
            colour
          });
        }
      }
      return cellUpdates;
    },
    setCell(x, y, colour = this.penColour) {
      // Code from here: https://stackoverflow.com/questions/45644781/update-value-in-multidimensional-array-in-vue?rq=1
      //make a copy of the row
      const newRow = this.grid[x].slice(0);
      // update the value
      newRow[y] = colour;
      // update it in the grid
      this.$set(this.grid, x, newRow);
      // That process is necessary in order for Vue to realise that the array has changed and rerender accordingly

      // We'll also send th grid up to RulesZone with an event so that it can be saved to a file form there:
      this.$root.$emit("saveGrid", {
        grid: this.grid
      });
    },
    // For use by the algorithm, only affects NextGrid instead of directly altering the current grid
    // setNextCell(x, y, colour) {
    //   const newRow = this.nextGrid[x].slice(0);
    //   newRow[y] = colour;
    //   this.$set(this.nextGrid, x, newRow);
    // },
    start() {
      this.isRunning = true;
      this.timer = setInterval(this.updateCells, this.updateDelay);
    },
    stop() {
      this.isRunning = false;
      clearInterval(this.timer);
    }
  }
};
</script>

<style scoped lang="scss">
$cellWidth: 30px;

.grid {
  padding-top: 30px;
  padding-left: 50px;
  padding-bottom: 25px;
  border-collapse: collapse;
  display: inline-block;
}
th,
td {
  border: 3px solid grey;
}
.cell {
  width: $cellWidth;
  height: $cellWidth;
  /* border-radius: 5px; */
  /* border-radius: 10px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75); */
}
.speedSlider {
  width: 130px;
  padding-right: 20px;
}
</style>
