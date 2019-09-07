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
          </v-toolbar>

          <v-container fluid fill-height class="rulesContainer">
            <v-layout>
              <v-flex d-flex justify-center align-center class="text-xs-center">
                <div id="points">
                  <div v-if="trashOpen">
                    <div v-if="mouseOverTrash">
                      <v-icon class="trashIcon" x-large>delete_forever</v-icon>
                    </div>
                    <div v-else>
                      <v-icon class="trashIcon" x-large>delete</v-icon>
                    </div>
                    <div class="trash" :class="{ 'red': mouseOverTrash }"></div>
                  </div>
                  <div v-else>
                    <v-icon class="trashIcon" x-large>delete</v-icon>
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
                      :initialNeighbourRange="block.neighbourRange"
                      :initialNeighbourhood="block.neighbourhood"
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
                      :initialAffectsNeighbours="block.affectsNeighbours"
                      :initialNeighbourhood="block.neighbourhood"
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

      //First check for any rules which don't require conditions:
      this.blocks.stateBlocks.forEach(state => {
        if (state.actions.length === 0) return;

        // This rule has no cond, so don't put any in the array
        var conditions = [];

        let actions = this.parseActions(state.actions);
        let stateColour = state.colour;

        rules.push({
          stateColour,
          conditions,
          actions
        });
      });

      // Then go through the rules which require conditions
      this.blocks.stateBlocks.forEach(state => {
        if (state.conditions.length === 0) return;

        var stateColour = state.colour;

        state.conditions.forEach(conditionId => {
          let cond = this.blocks.conditionBlocks.find(
            x => x.id === conditionId
          );
          let newRules = this.parseCondition(stateColour, cond, [], rules);
          rules.concat(newRules);
        });
      });
      return rules;
    }
  },
  mounted() {
    console.log("mounted");
    jsPlumb.registerConnectionTypes({
      actionProperty: {
        cssClass: "actionProperty",
        paintStyle: {
          // stroke: "#f2eaa9",
          strokeWidth: 8
        } //outlineStroke: "black", outlineWidth: 2
      }
    });
    jsPlumb.setContainer(document.getElementById("points"));
    jsPlumb.importDefaults({
      PaintStyle: {
        // stroke: "#e8d225",
        strokeWidth: 15
      },
      // Endpoints : [ "Dot", null ],
      EndpointStyle: { radius: 20 },
      // EndpointStyles : [ { radius : 20 }, { radius : 20 } ],
      Connector: ["Bezier", { curviness: 50 }],
      ConnectionOverlays: defaultArrow
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
    this.$root.$on("updateConditionNeighbourRange", data => {
      Vue.set(
        this.blocks.conditionBlocks.find(x => x.id == data.id),
        "neighbourRange",
        data.range
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
    this.$root.$on("updateActionAffectsNeighbours", data => {
      Vue.set(
        this.blocks.actionBlocks.find(x => x.id == data.id),
        "affectsNeighbours",
        data.affectsNeighbours
      );
    });
    // Two events trigger on the same name here because we want to check both Conditions and Actions
    // to find the block we need to update
    this.$root.$on("updateNeighbourhood", data => {
      let block = this.blocks.conditionBlocks.find(x => x.id == data.id);
      if (block) {
        Vue.set(block, "neighbourhood", data.neighbourhood);
      }
    });
    this.$root.$on("updateNeighbourhood", data => {
      let block = this.blocks.actionBlocks.find(x => x.id == data.id);
      if (block) {
        Vue.set(block, "neighbourhood", data.neighbourhood);
      }
    });
    // Here we receive a copy of the grid from the SimZone, but we only ever use this for saving
    this.$root.$on("saveGrid", data => {
      this.grid = data.grid;
    });
  },
  methods: {
    // Converts list of action ids into array of information about those actions to be used by rules
    parseActions(actionArray) {
      let actions = [];
      let validActions = true;
      actionArray.forEach(actionId => {
        // find the Action object with this id in the actionBlocks array
        let action = this.blocks.actionBlocks.find(x => x.id === actionId);
        if (!action) {
          console.error(
            "Could not find action " +
              actionId +
              " but it was in the actions array of Condition " +
              cond.id
          );
          validActions = false;
          return;
        }
        var affectsNeighbours = action.affectsNeighbours; // Use this to determine whether or not we'll set our own state or our neighbours states

        var neighbourhood = action.neighbourhood;

        actions.push({
          affectsNeighbours,
          desiredState: action.desiredState,
          neighbourhood
        });
      });
      return actions;
    },
    parseCondition(stateColour, cond, arrayOfExistingConds, rules) {

      if (cond.actions.length === 0 && cond.conditions.length === 0) {
        // Then this condition must be useless
        return rules;
      }

      var requiredState = cond.requiredState;
      var operator = cond.operator;
      var neighbourhood = cond.neighbourhood;
      var desiredNumberOfNeighbours = cond.desiredNumberOfNeighbours;
      var neighbourRange = cond.neighbourRange;

      // Create list of Action objects
      let actions = this.parseActions(cond.actions);

      // This rule has at least one condition, the current one, so add it
      arrayOfExistingConds.push({
        requiredState,
        operator,
        neighbourhood,
        desiredNumberOfNeighbours,
        neighbourRange
      });

      // If this condition has actions as well, then it forms a complete rule and we can push it
      if (actions.length) {
        rules.push({
          stateColour,
          conditions: arrayOfExistingConds.slice(),
          actions
        });
      }

      let conditionsOfThisCond = cond.conditions;

      // The conditions may be connected to other conditions in a chain, so deal with them recursively
      if (conditionsOfThisCond.length) {
        conditionsOfThisCond.forEach(conditionId => {
          let cond = this.blocks.conditionBlocks.find(
            x => x.id === conditionId
          );
          this.parseCondition(stateColour, cond, arrayOfExistingConds, rules);
        });
      } else return rules;
    },
    revalidateOnConnect() {
      // When resizing a block we want to update the connection to reflect the new size,
      // and this is the best way I've found to do that:
      jsPlumb.bind("connection", info => {
        // This first tick is when the block will be resizing, so we wait for that to pass first
        Vue.nextTick(() => {
          Vue.nextTick(() => {
            // This is getting out of hand... need to wait for a third tick because when we connect to an
            // Action block we wait a tick for the existing connection to be cleared first
            Vue.nextTick(() => {
              jsPlumb.revalidate(info.targetId);
            });
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
        conditions: [],
        actions: [],
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

      jsPlumb.bind("connection", info => {
        // If a connection is made from this State block to an action block,
        // push the id of that action block into the actions array of this State block
        // (for conditionless actions)
        if (
          info.sourceId == neighbourNode &&
          info.targetId.startsWith("action")
        ) {
          this.blocks.stateBlocks
            .find(x => x.id === id)
            .actions.push(info.targetId);
        } else if (
          info.sourceId == neighbourNode &&
          info.targetId.startsWith("condition")
        ) {
          this.blocks.stateBlocks
            .find(x => x.id === id)
            .conditions.push(info.targetId);
        }
      });
      jsPlumb.bind("connectionDetached", info => {
        if (
          info.sourceId == neighbourNode &&
          info.targetId.startsWith("action")
        ) {
          // If a connection is detached from this state block to an action block,
          // delete the id of that action block out of the actions array of this state block
          let index = this.blocks.stateBlocks
            .find(x => x.id === id)
            .actions.indexOf(info.targetId);
          this.$delete(
            this.blocks.stateBlocks.find(x => x.id === id).actions,
            index
          );
        } else if (
          info.sourceId == neighbourNode &&
          info.targetId.startsWith("condition")
        ) {
          // If a connection is detached from this state block to an action block,
          // delete the id of that action block out of the actions array of this state block
          let index = this.blocks.stateBlocks
            .find(x => x.id === id)
            .conditions.indexOf(info.targetId);
          this.$delete(
            this.blocks.stateBlocks.find(x => x.id === id).conditions,
            index
          );
        }
      });
    },
    addCondition: function(event) {
      // count = count + 1;
      var idOfThisCond = "condition_" + count;

      this.blocks.conditionBlocks.push({
        id: idOfThisCond,
        source: "",
        actions: [],
        conditions: [],
        desiredNumberOfNeighbours: 1,
        neighbourRange: [0, 9],
        neighbourhood: [
          [true, true, true],
          [true, false, true],
          [true, true, true]
        ],
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
        if (info.targetId == id && info.sourceId.startsWith("state")) {
          Vue.set(
            // Find the array entry for this block
            this.blocks.conditionBlocks.find(x => x.id === id),
            // Update the source field
            "source",
            // to the sourceId of the connection
            info.sourceId
          );
        } else if (
          info.sourceId == thenNode &&
          info.targetId.startsWith("action")
        ) {
          // If a connection is made from this condition block to an action block,
          // push the id of that action block into the actions array of this condition block
          this.blocks.conditionBlocks
            .find(x => x.id === id)
            .actions.push(info.targetId);
        } else if (
          info.sourceId == thenNode &&
          info.targetId.startsWith("condition")
        ) {
          // If a connection is made from this condition block to an action block,
          // push the id of that action block into the actions array of this condition block
          this.blocks.conditionBlocks
            .find(x => x.id === id)
            .conditions.push(info.targetId);
        }
      });
      // Reverse those changes when detaching connections
      jsPlumb.bind("connectionDetached", info => {
        // If a connection is detached from a state block to this condition block,
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
        } else if (
          info.sourceId == thenNode &&
          info.targetId.startsWith("action")
        ) {
          // If a connection is detached from this condition block to an action block,
          // delete the id of that action block out of the actions array of this condition block
          let index = this.blocks.conditionBlocks
            .find(x => x.id === id)
            .actions.indexOf(info.targetId);
          this.$delete(
            this.blocks.conditionBlocks.find(x => x.id === id).actions,
            index
          );
        } else if (
          info.sourceId == thenNode &&
          info.targetId.startsWith("condition")
        ) {
          // If a connection is detached from this condition block to an action block,
          // delete the id of that action block out of the actions array of this condition block
          let index = this.blocks.conditionBlocks
            .find(x => x.id === id)
            .conditions.indexOf(info.targetId);
          this.$delete(
            this.blocks.conditionBlocks.find(x => x.id === id).conditions,
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
        desiredState: "#FFFFFF",
        affectsNeighbours: false,
        neighbourhood: [
          [true, true, true],
          [true, false, true],
          [true, true, true]
        ],
        top: 500,
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
    },
    initializeTransformBlock(id) {
      // Transforms have been removed
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
@import "../assets/variables.css";

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
  background-color: var(--background);
  // min-height: 750px;
  // resize: vertical;
  border: 1px solid #aaaaaa;
  overflow-y: auto;
  height: 100%;
  z-index: 0;

  .trashIcon {
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
}
svg.jtk-connector path {
  stroke: var(--default-connector);
}
svg.actionProperty path {
  stroke: var(--action-connector);
}
.jtk-connector {
  z-index: -10;
}
.jtk-endpoint {
  z-index: -1;
  svg circle {
    fill: var(--endpoint-primary);
    stroke: var(--endpoint-secondary);
    stroke-width: 3;
    r: 13;
  }
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
  // width: 36px;
  // height: 36px;
  display: inline-block;
  right: 50px;
  bottom: -20px;
  border-radius: 100%;
}
.stateSource {
  position: absolute;
  display: inline-block;
  left: 0px;
  bottom: -10px;
  border-radius: 100%;
}
.state,
.condition,
.action,
.transform {
  box-shadow: 10px 10px 6px -10px rgba(0, 0, 0, 0.2);
  border-width: 3px;
  border-style: solid;
}
.condition,
.action,
.transform {
  border-radius: 10px;
}
.v-chip {
  z-index: 0;
}
</style>
