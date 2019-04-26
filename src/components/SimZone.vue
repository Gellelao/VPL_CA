<template>
  <div>
    <tr v-for="(row, idx1) in grid" :key="idx1">
      <td v-for="(col, idx2) in row" :key="idx2">
        <div class="cell" :style="{'background-color': grid[idx1][idx2]}"></div>
      </td>
    </tr>
  </div>
</template>

<script>
export default {
  data: () => ({
    grid: [
      ["#1df954", "#1CA085", "#3ba07e", "#1CA085", "#1df954"],
      ["#1df954", "#1CA085", "#3ba07e", "#1CA085", "#1df954"],
      ["#5a704d", "#1CA085", "#3ba07e", "#1CA085", "#1df954"],
      ["#1df954", "#1CA085", "#3ba07e", "#d21ad8", "#1df954"],
      ["#1df954", "#1CA085", "#3ba07e", "#1CA085", "#1df954"]
    ]
  })
};
</script>

<style scoped>
  .cell{
    width: 20px;
    height: 20px;
  }
</style>
