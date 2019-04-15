<template>
  <div id="points">
    <button @click="addState">Add a new State</button>
    <button @click="addCondition">Add a new Condition</button>
    <button @click="addAction">Add a new Action</button>
    <ul>
      <li v-for="block in conditionBlocks" :key="block.id">
        <div :id="block.id" :class="block.type">
          {{block.name}}
          <div class="dragSource"></div>
        </div>
        <button @click="deleteRow(index)">Delete</button>
      </li>
    </ul>
    <ul>
      <li v-for="block in stateBlocks" :key="block.id">
        <div :id="block.id" :class="block.type">
          {{block.name}}
          <div class="dragSource"></div>
        </div>
      </li>
    </ul>
    <ul>
      <li v-for="block in actionBlocks" :key="block.id">
        <div :id="block.id" :class="block.type">
          {{block.name}}
          <div class="dragSource"></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
var count = 0;
const sourcePoint = {
  endpoint: "Dot",
  isSource: true
};
const targetPoint = {
  endpoint: "Dot",
  isTarget: true
};
import Vue from "vue";

export default {
  updated() {
    console.log("UPDATED");
  },
  methods: {
    mounted() {
      jsPlumb.ready(() => {
        jsPlumb.importDefaults({
          Anchors: ["Bottom", "Top"]
        });

        const color = "#acd";
        const instance = jsPlumb.getInstance({
          // notice the 'curviness' argument to this Bezier curve.
          // the curves on this page are far smoother
          // than the curves on the first demo, which use the default curviness value.
          Connector: ["StateMachine", { curviness: 50 }],
          Endpoint: ["Dot", { radius: 5 }],
          DragOptions: { cursor: "pointer", zIndex: 5000 },
          PaintStyle: { lineWidth: 5, stroke: "#445566" },
          EndpointStyle: { radius: 9, fill: color, stroke: "red" },
          HoverPaintStyle: { stroke: "#ec9f2e", lineWidth: 4 },
          EndpointHoverStyle: { fill: "#ec9f2e", stroke: "#acd" },
          ConnectionOverlays: [
            [
              "Arrow",
              {
                location: 1,
                id: "arrow",
                length: 4,
                foldback: 0.8,
                paintStyle: {
                  lineWidth: 15,
                  stroke: "lightgray",
                  fill: "lightgray"
                }
              }
            ]
          ],
          Container: "points"
        });
      });
    },
    addState: function(event) {
      count = count + 1;
      this.stateBlocks.push({
        id: "state_" + count,
        name: "State",
        type: "state"
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(function() {
        let targetId = "state_" + count;
        console.log(targetId);
        jsPlumb.draggable(targetId, {
          grid: [50, 50]
        });
        jsPlumb.makeSource(
          targetId,
          {
            maxConnections: 100,
            filter: ".dragSource",
            anchor: "BottomCenter"
          },
          sourcePoint
        );
      });
    },
    addCondition: function(event) {
      count = count + 1;
      this.conditionBlocks.push({
        id: "condition_" + count,
        name: "Condition",
        type: "condition"
      });
      // Wait for the DOM to update before setting up plumbing
      Vue.nextTick(function() {
        let targetId = "condition_" + count;
        console.log(targetId);
        jsPlumb.draggable(targetId, {
          grid: [50, 50]
        });
        jsPlumb.makeSource(
          targetId,
          {
            maxConnections: 100,
            filter: ".dragSource",
            anchor: "BottomCenter"
          },
          sourcePoint
        );
        jsPlumb.makeTarget(
          targetId,
          { maxConnections: 1, anchor: "TopCenter" },
          targetPoint
        );
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
          grid: [50, 50]
        });
        jsPlumb.makeTarget(
          targetId,
          { maxConnections: 1, anchor: "TopCenter" },
          targetPoint
        );
      });
    }
  },
  data: () => ({
    stateBlocks: [],
    conditionBlocks: [],
    actionBlocks: [],
    point: [
      {
        _id: "58c21d713819d56d68763918",
        name: "Cell",
        status: "0"
      },
      {
        _id: "58c21d803819d56d68763919",
        name: "Condition",
        status: "1"
      },
      {
        _id: "58c21da83819d56d6876391a",
        name: "Action",
        status: "0"
      },
      {
        _id: "58c63ecf3819d5a22f2c7f24",
        name: "Condition",
        status: "1"
      }
    ],
    location: [
      ["Cell", 4, 14],
      ["Condition", 4, 24],
      ["Condition", 4, 34],
      ["Action", 20, 24],
      ["Action", 4, 4]
    ],
    line: [
      ["58c21d713819d56d68763918", "58c21d803819d56d68763919"],
      ["58c21d803819d56d68763919", "58c21da83819d56d6876391a"],
      ["58c21d803819d56d68763919", "58c63ecf3819d5a22f2c7f24"],
      ["58c21da83819d56d6876391a", "58c63ecf3819d5a22f2c7f24"]
    ]
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
  height: 200px;
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
.dragSource {
  position: absolute;
  background-color: rgb(43, 113, 173);
  width: 30px;
  height: 30px;
  right: 10px;
  bottom: 10px;
  border-radius: 100%;
}
/* ._jsPlumb_endpoint{
  display: block;
  z-index: 999999999;
  color:yellow;
  background-color:yellow;
}
._jsPlumb_connector{
  display: block;
  z-index: 999999999;
  color:yellow;
  background-color:yellow;
}
._jsPlumb_overlay{
  display: block;
  z-index: 999999999;
  color:yellow;
  background-color:yellow;
}
._jsPlumb_hover{
  display: block;
  z-index: 999999999;
  color:yellow;
  background-color:yellow;
} */
</style>
