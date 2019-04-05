<template>
  <div id="points">
    <button @click="addCondition">Add a Condition Component</button>
    <ul>
      <li v-for="point in components" :key="point.id">
        <div :id="point.id" :class="point.type">{{point.name}}</div>
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
    jsPlumb.connect({
    source:"unique1",
    target:"unique2",
    endpoint:"Dot"
});
  },
  methods: {
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
    ],
    methods: {
      deleteComponent(index) {
        this.components.splice(index, 1);
      },
      createFlow(flowData) {
        // console.log('Index created');
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

        // suspend drawing and initialise.
        instance.batch(() => {
          // declare some common values:
          const arrowCommon = { foldback: 0.7, width: 12 };
          // use three-arg spec to create two different arrows with the common values:
          const overlays = [
            ["Arrow", { location: 0.7 }, arrowCommon],
            ["Label", { label: "custom label", id: "label" }]
          ];
          // init point
          for (const point of flowData.point) {
            console.log(point.name);
            addComponent(point);

            instance.addEndpoint(
              point._id,
              {
                uuid: `${point._id}-bottom`,
                anchor: "Bottom",
                maxConnections: -1
                // connectorStyle: { stroke: 'green' },
              },
              {
                isSource: true,
                isTarget: true,
                dragAllowedWhenFull: true
              }
            );
            instance.addEndpoint(
              point._id,
              {
                uuid: `${point._id}-top`,
                anchor: "Top",
                maxConnections: -1
                // connectorStyle: { stroke: 'gray' },
              },
              {
                isSource: true,
                isTarget: true,
                dragAllowedWhenFull: true
              }
            );
          }

          // init transition
          for (const i of flowData.line) {
            const uuid = [`${i[0]}-bottom`, `${i[1]}-top`];
            instance.connect({
              uuids: uuid,
              overlays
            });
          }

          // init location
          for (const i of flowData.location) {
            $(`.${i[0]}`).css("left", i[1] * 20);
            $(`.${i[0]}`).css("top", i[2] * 20);
          }

          for (const point of flowData.point) {
            instance.draggable(`${point._id}`);
          }
        });

        jsPlumb.fire("jsPlumbDemoLoaded", instance);
      }
    },
    mounted() {
      jsPlumb.ready(() => {
        this.createFlow(this.data);
      });
    }
  })
};
</script>

<style scoped>
#points {
  position: relative;
}
.condition {
  position: absolute;
  width: 200px;
  height: 100px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px 0px rgba(190, 190, 190, 0.75);
  background-color: beige;
}
</style>
