<template>
  <div id="points">
    <button @click="addState">Add a new State</button>
    <button @click="addCondition">Add a new Condition</button>
    <button @click="addAction">Add a new Action</button>
    
    <div v-if="stateBlocks.length > 0">
      <StateBlock v-for="block in stateBlocks" :key="block.id" :id="block.id"></StateBlock>
    </div>

    <div v-if="conditionBlocks.length > 0">
      <ConditionBlock v-for="block in conditionBlocks" :key="block.id" :id="block.id" :source="block.source"></ConditionBlock>
    </div>

    <div v-if="actionBlocks.length > 0">
      <ActionBlock v-for="block in actionBlocks" :key="block.id" :id="block.id"></ActionBlock>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import StateBlock from "./StateBlock";
import ConditionBlock from "./ConditionBlock";
import ActionBlock from "./ActionBlock";
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
  components: {ConditionBlock, StateBlock, ActionBlock },
  updated() {
    console.log("UPDATED");
  },
  mounted() {
    console.log("mounted");
    jsPlumb.setContainer(document.getElementById("points"));
    jsPlumb.ready(() => {});
  },
  methods: {
    addState: function(event) {
      count = count + 1;
      var idOfThisState = "state_" + count;
      this.stateBlocks.push({
        id: idOfThisState,
        name: "State",
        type: "state"
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(function() {
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
        document
          .getElementById(idOfThisState)
          .setAttribute("position", "absolute");
      });
    },
    addCondition: function(event) {
      count = count + 1;
      var idOfThisCond = "condition_" + count;
      this.conditionBlocks.push({
        id: idOfThisCond,
        source: ""
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

        // Update the source of the block to the name of the property which
        // was just connected to it.
        jsPlumb.bind("connection", (info) => {
          if (info.target.id == idOfThisCond) {
            Vue.set(
              // Find the array entry for this block
              this.conditionBlocks.find(x => x.id === idOfThisCond),
              // Update the source field
              "source",
              // to the sourceId of the connection
              info.sourceId
            );
          }
        });
        console.log(this.conditionBlocks);
      });
    },
    addAction: function(event) {
      count = count + 1;
      this.actionBlocks.push({
        id: "action_" + count,
        name: "Action",
        type: "action"
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(function() {
        let targetId = "action_" + count;
        console.log(targetId);
        jsPlumb.draggable(targetId, {
          // grid: [50, 50]
        });
        jsPlumb.makeTarget(
          targetId,
          {
            maxConnections: 100,
            anchor: "LeftMiddle"
          },
          targetPoint
        );
      });
    }
  },
  data: () => ({
    stateBlocks: [],
    conditionBlocks: [],
    actionBlocks: []
  })
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
}
</style>
