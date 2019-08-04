<template>
  <v-content>
    <v-layout justify-center row fill-height>
      <v-flex xs6>
        <v-layout column fill-height>
          <v-toolbar>
            <v-toolbar-title class="headline text-uppercase">
              <span>Rules</span>
            </v-toolbar-title>
            <v-btn @click="addState">Add a new State</v-btn>
            <v-btn @click="addCondition">Add a new Condition</v-btn>
            <v-btn @click="addAction">Add a new Action</v-btn>
            <v-btn @click="addTransform">Add a new Transform</v-btn>
          </v-toolbar>

          <v-container fluid fill-height class="rulesContainer">
            <v-layout>
              <v-flex d-flex justify-center align-center class="text-xs-center">
                <div id="points">
                  <div v-if="trashOpen">
                    <div v-if="mouseOverTrash">
                      <v-icon x-large>delete_forever</v-icon>
                    </div>
                    <div v-else>
                      <v-icon x-large>delete</v-icon>
                    </div>
                    <div class="trash" :class="{ 'red': mouseOverTrash }"></div>
                  </div>
                  <div v-else>
                    <v-icon x-large>delete</v-icon>
                  </div>

                  <div v-if="blocks.stateBlocks.length > 0">
                    <StateBlock
                      v-for="block in blocks.stateBlocks"
                      :key="block.id"
                      :id="block.id"
                      :initialColour="block.colour"
                    ></StateBlock>
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
                      :initialDesiredState="block.desiredState"
                    ></ActionBlock>
                  </div>

                  <div v-if="blocks.transformBlocks.length > 0">
                    <TransformBlock
                      v-for="block in blocks.transformBlocks"
                      :key="block.id"
                      :id="block.id"
                      :source="block.source"
                      :initialNeighbourhood="block.neighbourhood"
                    ></TransformBlock>
                  </div>
                </div>
              </v-flex>
            </v-layout>
          </v-container>

          <v-toolbar>
            <v-btn @click="save">Save Rules</v-btn>
            <v-btn id="loadFile" @click="upload">Load Rules</v-btn>
            <v-menu top offset-y>
              <template v-slot:activator="{ on }">
                <v-btn id="loadPreset" v-on="on">
                  <v-icon>expand_less</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-tile v-for="(item, i) in presets" :key="i" @click="loadPreset(item.data)">
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
            <input v-show="false" ref="inputUpload" type="file" @change="loadFile" />
            <v-checkbox v-model="storeGrid" :label="`Save cells too?`"></v-checkbox>
            <v-btn @click="clearRules">Clear Rules</v-btn>
          </v-toolbar>
        </v-layout>
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
import basics from "../../rules/basics.json";
import wireworld from "../../rules/unfinished_wireworld.json";
import blueYellow from "../../rules/blue_and_yellow.json";

// Count variable appended to block id values to ensure uniqueness
var count = 0;
const dragGridSize = 20;
const blockStartingX = 40;

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
const sourcePoint = {
  isSource: true,
  isTarget: false
};
const targetPoint = {
  isTarget: true,
  isSource: false
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
    },
    storeGrid: true,
    grid: null,
    trashOpen: false,
    mouseOverTrash: false,
    presets: [
      { title: "Basics", data: basics },
      { title: "Wireworld", data: wireworld },
      { title: "BlueYellow", data: blueYellow }
    ]
  }),
  updated() {
    // console.log("UPDATED");
  },
  computed: {
    rules() {
      // Fully construct the data needed for each rule here, to pass down to
      // SimZone which can use the data to implement the rules.
      var rules = [];
      this.blocks.conditionBlocks.forEach(cond => {
        // We need conditions to have all of the required info before we make a rule out of them
        if (cond.actions.length == 0 || !cond.source) {
          return;
        }

        let index = cond.source.lastIndexOf("_");
        var property = cond.source.substr(index + 1); // Use this to determine whether or not we'll check our own state or our neighbours states

        // We need a required state if we're basing the condition on neighbours
        if (property === "neighbours" && !cond.requiredState) {
          return;
        }

        // Create list of Action objects
        let actions = [];
        let validActions = true;
        cond.actions.forEach(actionId => {
          // Using the condition's array of actions (which are strings of the action ids),
          // find the corresponding Action object from the actionBlocks array
          let action = this.blocks.actionBlocks.find(x => x.id === actionId);
          if (!action.source || !action.desiredState) {
            validActions = false;
            return;
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
        let sourceId = cond.source;

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
        let source = this.blocks.stateBlocks.find(x => x.id == sourceId);
        var stateColour = source.colour;
        var requiredState = cond.requiredState;
        var operator = cond.operator;
        var desiredNumberOfNeighbours = cond.desiredNumberOfNeighbours;

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
      actionProperty: {
        paintStyle: { stroke: "#f2eaa9", strokeWidth: 8 } //outlineStroke: "black", outlineWidth: 2
      }
    });
    jsPlumb.setContainer(document.getElementById("points"));
    jsPlumb.importDefaults({
      PaintStyle: {
        stroke: "#e8d225",
        strokeWidth: 15
      },
      Endpoints: ["Dot"],
      Connector: ["Bezier", { curviness: 50 }],
      ConnectionOverlays: defaultArrow
      // Endpoints: [["Dot", { radius: 7 }], ["Dot", { radius: 11 }]],
      // DragOptions: { cursor: "crosshair" },
      // EndpointStyles: [{ fillStyle: "#225588" }, { fillStyle: "#558822" }]
    });

    this.revalidateOnConnect();

    jsPlumb.ready(() => {});

    // Set up events to make sure changes down in the components are reflected in the data up here
    this.$root.$on("updateStateColour", data => {
      Vue.set(
        this.blocks.stateBlocks.find(x => x.id == data.id),
        "colour",
        data.colour
      );
    });
    this.$root.$on("updateConditionRequiredState", data => {
      Vue.set(
        this.blocks.conditionBlocks.find(x => x.id == data.id),
        "requiredState",
        data.requiredState
      );
    });
    this.$root.$on("updateConditionNeighbours", data => {
      Vue.set(
        this.blocks.conditionBlocks.find(x => x.id == data.id),
        "desiredNumberOfNeighbours",
        data.neighbours
      );
    });
    this.$root.$on("updateConditionOperator", data => {
      Vue.set(
        this.blocks.conditionBlocks.find(x => x.id == data.id),
        "operator",
        data.operator
      );
    });
    this.$root.$on("updateActionDesiredState", data => {
      Vue.set(
        this.blocks.actionBlocks.find(x => x.id == data.id),
        "desiredState",
        data.desiredState
      );
    });
    this.$root.$on("updateNeighbourhood", data => {
      Vue.set(
        this.blocks.transformBlocks.find(x => x.id == data.id),
        "neighbourhood",
        data.neighbourhood
      );
    });
    // Here we receive a copy of the grid from the SimZone, but we only ever use this for saving
    this.$root.$on("saveGrid", data => {
      this.grid = data.grid;
    });
  },
  methods: {
    revalidateOnConnect() {
      // When resizing a block we want to update the connection to reflect the new size,
      // and this is the best way I've found to do that:
      jsPlumb.bind("connection", info => {
        // This first tick is when the block will be resizing, so we wait for that to pass first
        Vue.nextTick(() => {
          Vue.nextTick(() => {
            jsPlumb.revalidate(info.targetId);
          });
        });
      });
    },
    initializeGenericBlock(id, blockData) {
      jsPlumb.draggable(id, {
        start: () => {
          this.trashOpen = true;
        },
        drag: params => {
          this.mouseOverTrash =
            Math.hypot(params.e.clientX, params.e.clientY - 64) <= 80 ||
            (params.e.clientX <= 0 && params.e.clientY < 64);
        },
        stop: params => {
          this.trashOpen = false;
          if (this.mouseOverTrash) this.removeBlock(params.el.id);
        }
        // grid: [dragGridSize, dragGridSize]
      });

      // We update the count here because this method is called when blocks are
      // loaded as well as when they are first created, and by updating the count
      // in this way we avoid having duplicate ids when creating blocks after loading
      let newCount = id.match(/\d+/)[0]; //find the number attached to this id
      if (newCount >= count) count = parseInt(newCount) + 1;

      let element = document.getElementById(id);
      element.style.left = blockData.left + "px";
      element.style.top = blockData.top + "px";
      // So that jsPlumb knows that the element has moved
      Vue.nextTick(() => {
        jsPlumb.revalidate(id);
      });
    },
    addState: function(event) {
      // count = count + 1;
      var idOfThisState = "state_" + count;

      this.blocks.stateBlocks.push({
        id: idOfThisState,
        colour: "#000000",
        top: 30,
        left: blockStartingX
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
        sourcePoint
      );
      jsPlumb.makeSource(
        stateNode,
        {
          maxConnections: 100,
          anchor: "Center"
        },
        sourcePoint
      );
    },
    addCondition: function(event) {
      // count = count + 1;
      var idOfThisCond = "condition_" + count;

      this.blocks.conditionBlocks.push({
        id: idOfThisCond,
        source: "",
        actions: [],
        desiredNumberOfNeighbours: 1,
        operator: "Exactly",
        requiredState: "#FFFFFF",
        top: 220,
        left: blockStartingX
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        this.initializeConditionBlock(idOfThisCond);
      });
    },
    initializeConditionBlock(id) {
      let blockData = this.blocks.conditionBlocks.find(x => x.id === id);
      this.initializeGenericBlock(id, blockData);

      let thenNode = id + "_then";

      jsPlumb.makeSource(
        thenNode,
        {
          maxConnections: 100,
          anchor: "Center"
        },
        sourcePoint
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
        } else if (info.sourceId == thenNode && info.targetId.startsWith("action")) {
          // If a connection is made from this condition block to an action block,
          // push the id of that action block into the actions array of this condition block
          // Add the id of the source to the array of triggers
          this.blocks.conditionBlocks
            .find(x => x.id === id)
            .actions.push(info.targetId);
        }
      });
      // Reverse those changes when detaching connections
      jsPlumb.bind("connectionDetached", info => {
        // If a connection is made from a state block to this condition block,
        // update the source of this block empty
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
            ""
          );
          Vue.nextTick(() => {
            jsPlumb.revalidate(id);
          });
        } else if (info.sourceId == id && info.targetId.startsWith("action")) {
          // If a connection is made from this condition block to an action block,
          // delete the id of that action block out of the actions array of this condition block
          let index = this.blocks.conditionBlocks
            .find(x => x.id === id)
            .actions.indexOf(info.targetId);
          this.$delete(
            this.blocks.conditionBlocks.find(x => x.id === id).actions,
            index
          );
        }
      });
    },
    addAction: function(event) {
      // count = count + 1;
      var idOfThisAction = "action_" + count;

      this.blocks.actionBlocks.push({
        id: idOfThisAction,
        source: "",
        desiredState: "#FFFFFF",
        top: 430,
        left: blockStartingX
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
          // Only update source if we receive a connection from a State or Transform block
          Vue.set(
            // Find the array entry for this block
            this.blocks.actionBlocks.find(x => x.id === id),
            // Update the source field
            "source",
            // to the sourceId of the connection
            info.sourceId
          );
          // if has a sourceConnection, detach it because n Action can only have one source
          let connectionId = this.blocks.actionBlocks.find(x => x.id === id).sourceConnection;
          console.log(connectionId);
          if(connectionId)jsPlumb.deleteConnection(connectionId);
          Vue.set(
            // Find the array entry for this block
            this.blocks.actionBlocks.find(x => x.id === id),
            "sourceConnection",
            info.connection
          );
        }
      });
      // The reverse of the above bind, we set the source to empty when detached
      jsPlumb.bind("connectionDetached", info => {
        if (
          info.targetId == id &&
          (info.sourceId.startsWith("state") ||
            info.sourceId.startsWith("transform"))
        ) {
          // Only update source if we receive a connection from a State block
          Vue.set(
            // Find the array entry for this block
            this.blocks.actionBlocks.find(x => x.id === id),
            // Update the source field to empty
            "source",
            ""
          );
          Vue.nextTick(() => {
            jsPlumb.revalidate(id);
          });
        }
      });
    },
    addTransform: function(event) {
      // count = count + 1;
      var idOfThisTransform = "transform_" + count;

      this.blocks.transformBlocks.push({
        id: idOfThisTransform,
        source: "",
        neighbourhood: [
          [true, true, true],
          [true, false, true],
          [true, true, true]
        ],
        top: 600,
        left: blockStartingX
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
        sourcePoint
      );
      jsPlumb.makeSource(
        stateNode,
        {
          maxConnections: 100,
          anchor: "Center"
        },
        sourcePoint
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
      // When detaching the conneciton, reverse our changes to the source field of this block
      jsPlumb.bind("connectionDetached", info => {
        if (info.targetId == id) {
          if (info.sourceId.startsWith("state")) {
            // Only update source if we receive a connection from a State block
            Vue.set(
              // Find the array entry for this block
              this.blocks.transformBlocks.find(x => x.id === id),
              // Update the source field
              "source",
              // to empty
              ""
            );
          }
        }
        Vue.nextTick(() => {
          jsPlumb.revalidate(id);
        });
      });
    },
    upload() {
      this.$refs.inputUpload.value = "";
      this.$refs.inputUpload.click();
    },
    saveBlock(block) {
      let elem = document.getElementById(block.id);
      block.left = parseInt(window.getComputedStyle(elem).left, 10);
      block.top = parseInt(window.getComputedStyle(elem).top, 10);
      // Clear the source and actions infromaion because this will be set when connections are made
      // And we don't want to load existing actions then add them again when we make the connections
      if ("source" in block) block.source = "";
      if ("actions" in block) block.actions = [];
      return block;
    },
    save() {
      console.log("SAVE");
      // We want to copy the blocks object, not store a reference to it
      let blockData = JSON.parse(JSON.stringify(this.blocks));
      blockData.stateBlocks.forEach(block => {
        block = this.saveBlock(block);
      });
      blockData.conditionBlocks.forEach(block => {
        block = this.saveBlock(block);
      });
      blockData.actionBlocks.forEach(block => {
        block = this.saveBlock(block);
      });
      blockData.transformBlocks.forEach(block => {
        block = this.saveBlock(block);
      });

      let connections = [];
      jsPlumb.getConnections().forEach(connection => {
        connections.push({
          source: connection.sourceId,
          target: connection.targetId
        });
      });

      let totalInfo = {
        blocks: blockData,
        connections: connections
      };

      if (this.storeGrid) {
        totalInfo.grid = JSON.stringify(this.grid);
      }

      totalInfo = JSON.stringify(totalInfo);

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
    load(totalData) {
      console.log("LOAD");

      if (totalData.grid && totalData.grid != null) {
        console.log("Loading grid");
        let jsonGrid = JSON.parse(totalData.grid);
        this.$root.$emit("loadGrid", {
          grid: jsonGrid
        });
      }

      console.log("Setting blocks");
      Vue.set(this.blocks, "stateBlocks", totalData.blocks.stateBlocks);
      Vue.set(this.blocks, "conditionBlocks", totalData.blocks.conditionBlocks);
      Vue.set(this.blocks, "actionBlocks", totalData.blocks.actionBlocks);
      Vue.set(this.blocks, "transformBlocks", totalData.blocks.transformBlocks);

      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        console.log("Initializing blocks");
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

      Vue.nextTick(() => {
        console.log("Making connections");
        totalData.connections.forEach(connection => {
          jsPlumb.connect({
            source: connection.source,
            target: connection.target
          });
        });
      });
    },
    loadFile(e) {
      // Clear the existing rules before loading
      this.clearRules();
      Vue.nextTick(() => {
        var file = e.target.files || e.dataTransfer.files;
        if (!file.length) {
          console.error("!file.length");
          return;
        }
        var reader = new FileReader();
        reader.onload = e => {
          let totalData = JSON.parse(e.target.result);
          this.load(totalData);
        };
        reader.readAsText(file[0]);
      });
    },
    loadPreset(preset) {
      // Clear the existing rules before loading
      this.clearRules();
      Vue.nextTick(() => {
        console.log("preset: " + preset);
        this.load(preset);
      });
    },
    removeBlock(id) {
      // Special case for State and Transform blocks because those blocks
      // are not the elements making the connections - its the propertiy nodes. So we need
      // to delete those nodes first. (This was avoided in the clear() method
      // by first deleting ALL connections but we can't do that here)
      if (id.startsWith("state") || id.startsWith("transform")) {
        jsPlumb.remove(id + "_neighbours");
        jsPlumb.remove(id + "_state");
      }
      if (id.startsWith("condition")) {
        jsPlumb.remove(id + "_then");
      }
      // We need to wait till the next tick here so that the blocks can resize
      Vue.nextTick(() => {
        jsPlumb.remove(id);

        // Remove the data of that element
        for (var blockset in this.blocks) {
          if (this.blocks.hasOwnProperty(blockset)) {
            let block = this.blocks[blockset].find(x => x.id === id);
            if (!block) continue;
            let index = this.blocks[blockset].indexOf(block);
            this.$delete(this.blocks[blockset], index);
            break;
          }
        }
      });
    },
    clearRules() {
      console.log("CLEAR");
      count = 0;

      // jsPlumb.deleteEveryConnection();
      // jsPlumb.deleteEveryEndpoint();
      jsPlumb.reset();

      for (var blockset in this.blocks) {
        if (this.blocks.hasOwnProperty(blockset)) {
          this.blocks[blockset].forEach(block => {
            // We don't need the overhead of the removeBlock() method when we are deleting all blocks anyway
            jsPlumb.remove(block.id);
          });
        }
      }

      // The elements are now gone from jsPlumb and the screen but we need to clear out the storage too:
      this.blocks.stateBlocks = [];
      this.blocks.conditionBlocks = [];
      this.blocks.actionBlocks = [];
      this.blocks.transformBlocks = [];

      // Also important to unbind the events we created for each block:
      jsPlumb.unbind();

      // But then remember to recreate the one binding we do want to keep:
      this.revalidateOnConnect();
    }
  }
};
</script>

<style lang="scss">
html,
body {
  overflow-y: hidden !important;
}
.rulesContainer {
  padding: 0px !important;
}
#points {
  position: relative;
  // background-color: #fffde7;
  background-color: white;
  // min-height: 750px;
  // resize: vertical;
  border: 1px solid #aaaaaa;
  overflow-y: auto;
  height: 100%;

  .v-icon {
    z-index: 2;
    position: absolute;
    top: 10px;
    left: 10px;
  }
}
.v-input {
  margin-top: 20px !important;
}
.selectColour {
  display: inline-block;
  width: 50px;
  height: 50px;
  padding: 4px;
  border-radius: 15px;
  background-color: rgb(90, 90, 90);
}
.jtk-endpoint {
  z-index: 1;
}
.trash {
  position: absolute;
  z-index: 1;
  width: 140px;
  height: 140px;
  border-radius: 100%;
  top: -60px;
  left: -60px;
  background-color: rgba(180, 180, 180, 0.322);

  // .v-icon{
  //   position: absolute;
  //   right: 30px;
  //   bottom: 30px;
  // }
}
.red {
  background-color: rgba(211, 0, 0, 0.8);
  -webkit-box-shadow: 10px 10px 39px 0px rgba(181, 0, 0, 0.5);
  -moz-box-shadow: 10px 10px 39px 0px rgba(181, 0, 0, 0.5);
  box-shadow: 10px 10px 39px 0px rgba(181, 0, 0, 0.5);
}
#loadFile {
  margin-right: 0px;
}
#loadPreset {
  margin-left: 0px;
  min-width: 40px;
  padding: 0px;
}
.neighboursSource {
  position: absolute;
  // background-color: rgb(54, 173, 43);
  // width: 30px;
  // height: 30px;
  display: inline-block;
  right: 0px;
  bottom: -10px;
  border-radius: 100%;
}
.stateSource {
  position: absolute;
  // background-color: rgb(173, 0, 0);
  // width: 30px;
  // height: 30px;
  display: inline-block;
  left: 0px;
  bottom: -10px;
  border-radius: 100%;
}
</style>
