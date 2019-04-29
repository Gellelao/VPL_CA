<template>
  <v-content>
    <v-layout align-center justify-center row>
      <v-flex grow xs6>
        <div id="points">
          <button @click="addState">Add a new State</button>
          <button @click="addCondition">Add a new Condition</button>
          <button @click="addAction">Add a new Action</button>

          <div v-if="stateBlocks.length > 0">
            <StateBlock v-for="block in stateBlocks" :key="block.id" :id="block.id"></StateBlock>
          </div>

          <div v-if="conditionBlocks.length > 0">
            <ConditionBlock
              v-for="block in conditionBlocks"
              :key="block.id"
              :id="block.id"
              :source="block.source"
            ></ConditionBlock>
          </div>

          <div v-if="actionBlocks.length > 0">
            <ActionBlock
              v-for="block in actionBlocks"
              :key="block.id"
              :id="block.id"
              :source="block.source"
            ></ActionBlock>
          </div>
        </div>
      </v-flex>
      <v-flex grow xs6>
        <SimZone :rules="this.rules"/>
      </v-flex>
    </v-layout>
  </v-content>
</template>

<script>
import Vue from "vue";
import StateBlock from "./StateBlock";
import ConditionBlock from "./ConditionBlock";
import ActionBlock from "./ActionBlock";
import SimZone from "./SimZone";
import "vue-swatches/dist/vue-swatches.min.css";

var count = 0;
const sourcePoint = {
  endpoint: "Dot",
  isSource: true
};
const targetPoint = {
  endpoint: "Dot",
  isTarget: true
};

export default {
  components: { ConditionBlock, StateBlock, ActionBlock, SimZone },
  data: () => ({
    stateBlocks: [],
    conditionBlocks: [],
    actionBlocks: []
  }),
  updated() {
    console.log("UPDATED");
    console.log(this.stateBlocks);
    console.log(this.conditionBlocks);
    console.log(this.actionBlocks);
  },
  computed: {
    rules() {
      // Fully construct the data needed for each rule here, to pass down to
      // SimZone which can use the data to implement the rules.
      return this.stateBlocks;
    }
  },
  mounted() {
    console.log("mounted");
    jsPlumb.setContainer(document.getElementById("points"));
    jsPlumb.ready(() => {});

    // Set up events to make sure changes down in the components are reflected in the data up here
    this.$root.$on("updateStateColour", data => {
      Vue.set(
        this.stateBlocks.find(x => x.id === data.id),
        "colour",
        data.colour
      );
    });
    this.$root.$on("updateConditionRequiredState", data => {
      Vue.set(
        this.conditionBlocks.find(x => x.id === data.id),
        "requiredState",
        data.requiredState
      );
    });
    this.$root.$on("updateConditionNeighbours", data => {
      Vue.set(
        this.conditionBlocks.find(x => x.id === data.id),
        "howManyNeighbours",
        data.neighbours
      );
    });
    this.$root.$on("updateActionDesiredState", data => {
      Vue.set(
        this.actionBlocks.find(x => x.id === data.id),
        "desiredState",
        data.desiredState
      );
    });
  },
  methods: {
    addState: function(event) {
      count = count + 1;
      var idOfThisState = "state_" + count;

      this.stateBlocks.push({
        id: idOfThisState
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        let neighbourNode = idOfThisState + "_neighbours";
        let stateNode = idOfThisState + "_state";

        jsPlumb.draggable(idOfThisState, {
          // grid: [50, 50]
        });
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
      });
    },
    addCondition: function(event) {
      count = count + 1;
      var idOfThisCond = "condition_" + count;

      this.conditionBlocks.push({
        id: idOfThisCond,
        source: "",
        actions: []
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        let targetId = idOfThisCond;
        console.log(targetId);
        jsPlumb.draggable(targetId, {
          // grid: [50, 50]
        });
        jsPlumb.makeSource(
          targetId,
          {
            maxConnections: 100,
            filter: ".thenSource",
            anchor: "BottomRight"
          },
          sourcePoint
        );
        jsPlumb.makeTarget(
          targetId,
          { maxConnections: 1, anchor: "TopCenter" },
          targetPoint
        );

        jsPlumb.bind("connection", info => {
          // If a connection is made from a state block to this condition block,
          // update the source of this block to the name of the property which was just connected to it.
          if (
            info.targetId == idOfThisCond &&
            info.sourceId.startsWith("state")
          ) {
            Vue.set(
              // Find the array entry for this block
              this.conditionBlocks.find(x => x.id === idOfThisCond),
              // Update the source field
              "source",
              // to the sourceId of the connection
              info.sourceId
            );
          }
          // If a connection is made from this condition block to an action block,
          // push the id of that action block into the actions array of this condition block
          else if (
            info.sourceId == idOfThisCond &&
            info.targetId.startsWith("action")
          ) {
            // Add the id of the source to the array of triggers
            this.conditionBlocks
              .find(x => x.id === idOfThisCond)
              .actions.push(info.targetId);
          }
        });
        console.log(this.conditionBlocks);
      });
    },
    addAction: function(event) {
      count = count + 1;
      var idOfThisAction = "action_" + count;

      this.actionBlocks.push({
        id: idOfThisAction,
        source: ""
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(() => {
        jsPlumb.draggable(idOfThisAction, {
          // grid: [50, 50]
        });
        jsPlumb.makeTarget(
          idOfThisAction,
          {
            maxConnections: 100,
            anchor: "LeftMiddle"
          },
          targetPoint
        );

        // When a connection is made, update the source of the block to
        // the name of the property which was just connected to it.
        jsPlumb.bind("connection", info => {
          console.log(info);
          if (
            info.targetId == idOfThisAction &&
            info.sourceId.startsWith("state")
          ) {
            // Only update source if we receive a connection from a State block
            Vue.set(
              // Find the array entry for this block
              this.actionBlocks.find(x => x.id === idOfThisAction),
              // Update the source field
              "source",
              // to the sourceId of the connection
              info.sourceId
            );
          }
        });
      });
    }
  }
};
</script>

<style>
#points {
  position: relative;
  background-color: aliceblue;
  height: 800px;
  resize: vertical;
  border: 1px solid #aaaaaa;
  overflow-y: scroll;
}
.condition {
  position: absolute;
  width: 200px;
  height: 100px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: beige;
}
.state {
  position: absolute;
  width: 200px;
  height: 150px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: rgb(255, 255, 255);
}
.action {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: rgb(255, 217, 217);
}
.neighboursSource {
  position: absolute;
  background-color: rgb(54, 173, 43);
  width: 30px;
  height: 30px;
  right: -15px;
  bottom: -15px;
  border-radius: 100%;
}
.stateSource {
  position: absolute;
  background-color: rgb(173, 0, 0);
  width: 30px;
  height: 30px;
  right: 85px;
  bottom: -15px;
  border-radius: 100%;
}
.thenSource {
  position: absolute;
  background-color: rgb(49, 155, 247);
  width: 30px;
  height: 30px;
  right: -15px;
  bottom: -15px;
  border-radius: 100%;
}
.selectColour {
  background-color: beige;
  box-shadow: 2px 2px 2px 2px rgba(190, 190, 190, 0.75);
}
</style>
