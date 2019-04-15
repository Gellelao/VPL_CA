<template>
  <div id="points">
    <button @click="addCondition">Add a Condition Component</button>
    <ul>
      <li v-for="point in components" :key="point.id">
        <div :id="point.id" :class="point.type">
          {{point.name}}
          <div class="dragSource"></div>
          </div>
        <button @click="deleteRow(index)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
var count = 0;
export default {
  updated() {
    console.log("UPDATED");
    let targetId = "unique" + count;
    console.log(targetId);
    jsPlumb.draggable(targetId, {
      grid: [50, 50]
    });
    var sourcePoint = {
      endpoint: "Rectangle",
      paintStyle: {
        width: 25,
        height: 21,
        fillStyle: "blue",
        outlineColor: "black",
        outlineWidth: 1
      },
      isSource: true,
      connectorStyle: { strokeStyle: "blue", lineWidth: 10 }
    };
    var targetPoint = {
      endpoint: "Dot",
      paintStyle: {
        width: 25,
        height: 21,
        fillStyle: "blue",
        outlineColor: "black",
        outlineWidth: 1
      },
      isTarget: true,
      connectorStyle: { strokeStyle: "blue", lineWidth: 10 }
    };
    jsPlumb.makeSource(
      targetId,
      {
        filter: ".dragSource",
        maxConnections: 1,
      },
      sourcePoint
    );
    jsPlumb.makeTarget(targetId, targetPoint);
  },
  methods: {
    mounted() {
      jsPlumb.ready(() => {
        jsPlumb.importDefaults({
          Anchors: ["Bottom", "TopLeft"]
        });

        const color = "#acd";
        const instance = jsPlumb.getInstance({
          // notice the 'curviness' argument to this Bezier curve.
          // the curves on this page are far smoother
          // than the curves on the first demo, which use the default curviness value.
          Connector: ["Bezier", { curviness: 50 }],
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
    addCondition: function(event) {
      count = count + 1;
      this.components.push({
        id: "unique" + count,
        name: "Condition",
        type: "condition"
      });
    }
  },
  data: () => ({
    components: [],
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
.dragSource{
  position: absolute;
  background-color: rgb(43, 113, 173);
  width: 30px;
  height: 30px;
  right: 10px;
  bottom: 10px;
  border-radius: 100%;
}
</style>
