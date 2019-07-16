<template>
  <div>
    <v-toolbar>
      <v-spacer></v-spacer>
      <div class="mx-2"></div>
      <v-btn @click="initializeGrid()">
        Randomize
        <v-icon light right>casino</v-icon>
      </v-btn>
      <v-btn id="fillBtn" @click="fillGrid()">Fill</v-btn>
      <swatches swatch-size="20" v-model="fillColour" colors="text-basic">
        <v-btn id="fillIcon" slot="trigger" :color="fillColour">
          <template v-if="fillColour == '#000000'">
            <v-icon color="white">format_color_fill</v-icon>
          </template>
          <div v-else>
            <v-icon>format_color_fill</v-icon>
          </div>
        </v-btn>
      </swatches>
      <div class="mx-2"></div>
      <v-divider vertical></v-divider>
      <div class="mx-2"></div>
      <v-btn @click="updateCells">Update cells</v-btn>
      <!-- The following v-btn is from this project: https://github.com/iaucab/cellular-automaton-with-vue -->
      <v-btn @click="isRunning ? stop() : start()">{{ isRunning ? 'stop' : 'start' }}</v-btn>
      <div class="mx-2"></div>
      <v-divider vertical></v-divider>
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
    <v-toolbar>
        <swatches shapes="circles" background-color="rgba(0,0,0,0)" v-model="penColour" colors="text-basic" inline></swatches>
      <v-divider vertical></v-divider>
      <div class="mx-2"></div>
      <v-slider
        class="speedSlider"
        v-model="speed"
        step="200"
        min="0"
        :max="largestDelay"
        ticks="always"
        tick-size="2"
        label="Simulation Speed"
      ></v-slider>
    </v-toolbar>
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
    fillColour: "#FFFFFF",
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
          newRow.push(this.fillColour);
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

      // We'll also send the grid up to RulesZone with an event so that it can be saved to a file from there:
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
// .speedSlider {
//   width: 130px;
//   padding-right: 20px;
// }
#fillBtn {
  margin-right: 0px;
}
#fillIcon {
  margin-left: 0px;
  min-width: 40px;
  padding: 0px;
}
</style>
