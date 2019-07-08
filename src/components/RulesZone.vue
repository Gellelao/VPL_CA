<template>
  <v-content>
    <v-layout align-start justify-center row>
      <v-flex xs6>
        <v-toolbar>
          <v-toolbar-title class="headline text-uppercase">
            <span>Rules</span>
          </v-toolbar-title>
          <v-btn @click="addState">Add a new State</v-btn>
          <v-btn @click="addCondition">Add a new Condition</v-btn>
          <v-btn @click="addAction">Add a new Action</v-btn>
          <v-btn @click="addTransform">Add a new Transform</v-btn>
        </v-toolbar>
        <div id="points">
          <div v-if="blocks.stateBlocks.length > 0">
            <StateBlock v-for="block in blocks.stateBlocks" :key="block.id" :id="block.id" :initialColour="block.colour"></StateBlock>
          </div>

          <div v-if="blocks.conditionBlocks.length > 0">
            <ConditionBlock
              v-for="block in blocks.conditionBlocks"
              :key="block.id"
              :id="block.id"
              :source="block.source"
              :initialNeighbourCount="block.desiredNumberOfNeighbours"
              :initialOperator="block.operator"
              :initialReqState="block.requiredState"
            ></ConditionBlock>
          </div>

          <div v-if="blocks.actionBlocks.length > 0">
            <ActionBlock
              v-for="block in blocks.actionBlocks"
              :key="block.id"
              :id="block.id"
              :source="block.source"
            ></ActionBlock>
          </div>

          <div v-if="blocks.transformBlocks.length > 0">
            <TransformBlock
              v-for="block in blocks.transformBlocks"
              :key="block.id"
              :id="block.id"
              :source="block.source"
            ></TransformBlock>
          </div>
        </div>
        <v-toolbar>
          <v-btn @click="save">Save Rules</v-btn>
          <v-btn @click="$refs.inputUpload.click()">Load Rules</v-btn>
          <input v-show="false" ref="inputUpload" type="file" @change="load" />
        </v-toolbar>
      </v-flex>
      <v-flex xs6>
        <SimZone :rules="this.rules" />
      </v-flex>
    </v-layout>
  </v-content>
</template>

<script>
import Vue from "vue";
import StateBlock from "./StateBlock";
import ConditionBlock from "./ConditionBlock";
import ActionBlock from "./ActionBlock";
import TransformBlock from "./TransformBlock";
import SimZone from "./SimZone";
import "vue-swatches/dist/vue-swatches.min.css";

var count = 0;
const dragGridSize = 20;

// Define common jsplumb styles
const defaultArrow = [
  [
    "Arrow",
    {
      location: 0.75,
      id: "arrow",
      length: 20,
      width: 12,
      foldback: 0.9,
      paintStyle: {
        fill: "white"
      }
    }
  ]
];
const bezierSourcePoint = {
  endpoint: "Dot",
  isSource: true,
  connector: ["Bezier", { curviness: 50 }],
  connectionType: "normal",
  connectorOverlays: defaultArrow
};
const targetPoint = {
  endpoint: "Dot",
  isTarget: true
};

export default {
  components: {
    ConditionBlock,
    StateBlock,
    ActionBlock,
    TransformBlock,
    SimZone
  },
  data: () => ({
    blocks: {
      stateBlocks: [],
      conditionBlocks: [],
      actionBlocks: [],
      transformBlocks: []
    }
  }),
  updated() {
    // console.log("UPDATED");
  },
  computed: {
    rules() {
      // Fully construct the data needed for each rule here, to pass down to
      // SimZone which can use the data to implement the rules.
      var rules = [];
      this.blocks.conditionBlocks.forEach(elem => {
        // We need conditions to have all of the required info before we make a rule out of them
        if (elem.actions.length == 0 || !elem.source) {
          return;
        }

        let index = elem.source.lastIndexOf("_");
        var property = elem.source.substr(index + 1); // Use this to determine whether or not we'll check our own state or our neighbours states

        // We need a required state if we're basing the condition on neighbours
        if (property === "neighbours" && !elem.requiredState) {
          return;
        }

        // Create list of Action objects
        var actions = [];
        var validActions = true;
        elem.actions.forEach(elem => {
          let action = this.blocks.actionBlocks.find(x => x.id === elem);
          if (!action.source || !action.desiredState) {
            validActions = false;
          }
          let index = action.source.lastIndexOf("_");
          var property = action.source.substr(index + 1); // Use this to determine whether or not we'll set our own state or our neighbours states

          var neighbourhood = undefined;
          let sourceId = action.source.substr(0, index);
          if (sourceId.startsWith("transform")) {
            let transformSource = this.blocks.transformBlocks.find(
              x => x.id === sourceId
            );
            neighbourhood = transformSource.neighbourhood;
          }

          actions.push({
            property,
            desiredState: action.desiredState,
            neighbourhood
          });
        });
        // We need at least one action to have the required info, so return otherwise.
        if (!validActions) return;

        var neighbourhood = undefined;
        let sourceId = elem.source;

        // If there is a transform block present, go find the original state source
        // and update the sourceId to point to that instead of the transform block
        if (sourceId.startsWith("transform")) {
          index = sourceId.lastIndexOf("_");
          sourceId = sourceId.substr(0, index);
          let transformSource = this.blocks.transformBlocks.find(
            x => x.id === sourceId
          );
          sourceId = transformSource.source;
          neighbourhood = transformSource.neighbourhood;
        }

        index = sourceId.lastIndexOf("_");
        sourceId = sourceId.substr(0, index);
        let source = this.blocks.stateBlocks.find(x => x.id === sourceId);
        var stateColour = source.colour;
        var requiredState = elem.requiredState;
        var operator = elem.operator;
        var desiredNumberOfNeighbours = elem.desiredNumberOfNeighbours;

        rules.push({
          stateColour,
          property,
          requiredState,
          operator,
          neighbourhood,
          desiredNumberOfNeighbours,
          actions
        });
      });
      return rules;
    }
  },
  mounted() {
    console.log("mounted");
    jsPlumb.registerConnectionTypes({
      normal: {
        paintStyle: { stroke: "#e8d225", strokeWidth: 15 } //outlineStroke: "black", outlineWidth: 2
      },
      actionProperty: {
        paintStyle: { stroke: "#f2eaa9", strokeWidth: 8 } //outlineStroke: "black", outlineWidth: 2
      }
    });
    jsPlumb.setContainer(document.getElementById("points"));
    jsPlumb.ready(() => {});

    // Set up events to make sure changes down in the components are reflected in the data up here
    this.$root.$on("updateStateColour", data => {
      Vue.set(
        this.blocks.stateBlocks.find(x => x.id === data.id),
        "colour",
        data.colour
      );
    });
    this.$root.$on("updateConditionRequiredState", data => {
      Vue.set(
        this.blocks.conditionBlocks.find(x => x.id === data.id),
        "requiredState",
        data.requiredState
      );
    });
    this.$root.$on("updateConditionNeighbours", data => {
      Vue.set(
        this.blocks.conditionBlocks.find(x => x.id === data.id),
        "desiredNumberOfNeighbours",
        data.neighbours
      );
    });
    this.$root.$on("updateConditionOperator", data => {
      Vue.set(
        this.blocks.conditionBlocks.find(x => x.id === data.id),
        "operator",
        data.operator
      );
    });
    this.$root.$on("updateActionDesiredState", data => {
      Vue.set(
        this.blocks.actionBlocks.find(x => x.id === data.id),
        "desiredState",
        data.desiredState
      );
    });
    this.$root.$on("updateNeighbourhood", data => {
      Vue.set(
        this.blocks.transformBlocks.find(x => x.id === data.id),
        "neighbourhood",
        data.neighbourhood
      );
    });
  },
  methods: {
    initializeGenericBlock(id, blockData) {
      jsPlumb.draggable(id, {
        // grid: [dragGridSize, dragGridSize]
      });

      let element = document.getElementById(id);
      element.style.left = blockData.left + "px";
      element.style.top = blockData.top + "px";
    },
    addState: function(event) {
      count = count + 1;
      var idOfThisState = "state_" + count;

      this.blocks.stateBlocks.push({
        id: idOfThisState,
        colour: "#000000",
        top: 10,
        left: count * 180 - 140
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        this.initializeStateBlock(idOfThisState);
      });
    },
    initializeStateBlock(id) {
      let neighbourNode = id + "_neighbours";
      let stateNode = id + "_state";

      let blockData = this.blocks.stateBlocks.find(x => x.id === id);
      this.initializeGenericBlock(id, blockData);

      jsPlumb.makeSource(
        neighbourNode,
        {
          maxConnections: 100,
          anchor: "Center"
        },
        bezierSourcePoint
      );
      jsPlumb.makeSource(
        stateNode,
        {
          maxConnections: 100,
          anchor: "Center"
        },
        bezierSourcePoint
      );
    },
    addCondition: function(event) {
      count = count + 1;
      var idOfThisCond = "condition_" + count;

      this.blocks.conditionBlocks.push({
        id: idOfThisCond,
        source: "",
        actions: [],
        desiredNumberOfNeighbours: 1,
        operator: "Exactly",
        requiredState: "#ffffff",
        top: 200,
        left: count * 180 - 140
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        this.initializeConditionBlock(idOfThisCond);
      });
    },
    initializeConditionBlock(id) {
      let blockData = this.blocks.conditionBlocks.find(x => x.id === id);
      this.initializeGenericBlock(id, blockData);

      jsPlumb.makeSource(
        id,
        {
          maxConnections: 100,
          filter: ".thenSource",
          anchor: "BottomRight"
        },
        bezierSourcePoint
      );
      jsPlumb.makeTarget(
        id,
        { maxConnections: 1, anchor: "Continuous" },
        targetPoint
      );

      jsPlumb.bind("connection", info => {
        // If a connection is made from a state block to this condition block,
        // update the source of this block to the name of the property which was just connected to it.
        if (
          info.targetId == id &&
          (info.sourceId.startsWith("state") ||
            info.sourceId.startsWith("transform"))
        ) {
          Vue.set(
            // Find the array entry for this block
            this.blocks.conditionBlocks.find(x => x.id === id),
            // Update the source field
            "source",
            // to the sourceId of the connection
            info.sourceId
          );
        }
        // If a connection is made from this condition block to an action block,
        // push the id of that action block into the actions array of this condition block
        else if (info.sourceId == id && info.targetId.startsWith("action")) {
          // Add the id of the source to the array of triggers
          this.blocks.conditionBlocks
            .find(x => x.id === id)
            .actions.push(info.targetId);
        }
      });
    },
    addAction: function(event) {
      count = count + 1;
      var idOfThisAction = "action_" + count;

      this.blocks.actionBlocks.push({
        id: idOfThisAction,
        source: "",
        top: 400,
        left: count * 180 - 140
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        this.initializeActionBlock(idOfThisAction);
      });
    },
    initializeActionBlock(id) {
      let blockData = this.blocks.actionBlocks.find(x => x.id === id);
      this.initializeGenericBlock(id, blockData);

      jsPlumb.makeTarget(id, {
        maxConnections: 100,
        anchor: "Continuous"
      });

      // When a connection is made, update the source of the block to
      // the name of the property which was just connected to it.
      jsPlumb.bind("connection", info => {
        if (
          info.targetId == id &&
          (info.sourceId.startsWith("state") ||
            info.sourceId.startsWith("transform"))
        ) {
          // Style the Action connection differently to other connections
          info.connection.addType("actionProperty");
          info.connection.removeOverlay("arrow");
          // Only update source if we receive a connection from a State block
          Vue.set(
            // Find the array entry for this block
            this.blocks.actionBlocks.find(x => x.id === id),
            // Update the source field
            "source",
            // to the sourceId of the connection
            info.sourceId
          );
        }
      });
    },
    addTransform: function(event) {
      count = count + 1;
      var idOfThisTransform = "transform_" + count;

      this.blocks.transformBlocks.push({
        id: idOfThisTransform,
        source: "",
        top: 600,
        left: count * 180 - 140
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        this.initializeTransformBlock(idOfThisTransform);
      });
    },
    initializeTransformBlock(id) {
      let neighbourNode = id + "_neighbours";
      let stateNode = id + "_state";

      let blockData = this.blocks.transformBlocks.find(x => x.id === id);
      this.initializeGenericBlock(id, blockData);

      jsPlumb.makeSource(
        neighbourNode,
        {
          maxConnections: 100,
          anchor: "Center"
        },
        bezierSourcePoint
      );
      jsPlumb.makeSource(
        stateNode,
        {
          maxConnections: 100,
          anchor: "Center"
        },
        bezierSourcePoint
      );
      jsPlumb.makeTarget(id, {
        // 1 max connection because each Transform should have exactly one
        // property attached
        maxConnections: 1,
        anchor: "Continuous"
      });

      // When a connection is made, update the source of the block to
      // the name of the property which was just connected to it.
      jsPlumb.bind("connection", info => {
        if (info.targetId == id) {
          if (info.sourceId.startsWith("state")) {
            // Only update source if we receive a connection from a State block
            Vue.set(
              // Find the array entry for this block
              this.blocks.transformBlocks.find(x => x.id === id),
              // Update the source field
              "source",
              // to the sourceId of the connection
              info.sourceId
            );

            // Transform Blocks should only accept connections from State Blocks,
            // so destroy all other connections
          } else {
            jsPlumb.deleteConnection(info.connection);
          }
        }
      });
    },
    storeBlockPosition(block) {
      let elem = document.getElementById(block.id);
      block.left = parseInt(window.getComputedStyle(elem).left, 10);
      block.top = parseInt(window.getComputedStyle(elem).top, 10);
      return block;
    },
    save() {
      console.log("SAVE");
      let blockData = this.blocks;
      blockData.stateBlocks.forEach(block => {
        block = this.storeBlockPosition(block);
      });
      blockData.conditionBlocks.forEach(block => {
        block = this.storeBlockPosition(block);
      });
      blockData.actionBlocks.forEach(block => {
        block = this.storeBlockPosition(block);
      });
      blockData.transformBlocks.forEach(block => {
        block = this.storeBlockPosition(block);
      });

      let connections = [];
      jsPlumb.getConnections().forEach(connection => {
        connections.push({
          source: connection.sourceId,
          target: connection.targetId
        })
      });

      let totalInfo = JSON.stringify({
        blocks: blockData,
        connections: connections
      });

      // Code from here: https://forum.vuejs.org/t/saving-form-data/38714
      let blob = new Blob([totalInfo], { type: "text/plain;charset=utf-8;" });
      if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, filename);
      } else {
        let link = document.createElement("a");
        if (link.download !== undefined) {
          // feature detection
          // Browsers that support HTML5 download attribute
          let url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", "rules.txt");
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },
    load(e) {
      console.log("LOAD");
      // Code from https://codepen.io/Atinux/pen/qOvawK/
      var file = e.target.files || e.dataTransfer.files;
      if (!file.length) {
        console.error("!file.length");
        return;
      }
      var reader = new FileReader();
      reader.onload = e => {
        let totalData = JSON.parse(e.target.result);

        Vue.set(this.blocks, "stateBlocks", totalData.blocks.stateBlocks);
        Vue.set(this.blocks, "conditionBlocks", totalData.blocks.conditionBlocks);
        Vue.set(this.blocks, "actionBlocks", totalData.blocks.actionBlocks);
        Vue.set(this.blocks, "transformBlocks", totalData.blocks.transformBlocks);

        Vue.nextTick(() => {
          totalData.connections.forEach(connection => {
            jsPlumb.connect({source: connection.source, target: connection.target});
          });
        });

        // Wait for the DOM to update before setting up plumbing
        Vue.nextTick(() => {
          this.blocks.stateBlocks.forEach(block => {
            this.initializeStateBlock(block.id);
          });
          this.blocks.conditionBlocks.forEach(block => {
            this.initializeConditionBlock(block.id);
          });
          this.blocks.actionBlocks.forEach(block => {
            this.initializeActionBlock(block.id);
          });
          this.blocks.transformBlocks.forEach(block => {
            this.initializeTransformBlock(block.id);
          });
        });
      };
      reader.readAsText(file[0]);
    }
  }
};
</script>

<style lang="scss">
#points {
  position: relative;
  // background-color: #fffde7;
  background-color: white;
  min-height: 750px;
  resize: vertical;
  border: 1px solid #aaaaaa;
  overflow-y: scroll;
}
// ._jsPlumb_drag_select {
//   -webkit-touch-callout: none;
//   -webkit-user-select: none;
//   -khtml-user-select: none;
//   -moz-user-select: none;
//   -ms-user-select: none;
//   user-select: none;
// }
.selectColour {
  display: inline-block;
  width: 50px;
  height: 50px;
  padding: 4px;
  border-radius: 15px;
  background-color: rgb(90, 90, 90);
}
</style>
