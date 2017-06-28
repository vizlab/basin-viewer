<template lang="pug">
#app
  #chart: graph(:chart-data="graphData")
  v-map(:zoom=10, :center="[35, 136]", @l-click="onClick")
    v-tilelayer(url="http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png")
    .loop(v-for="item in items")
      v-polygon(:latLngs="item.loc", :lStyle='{color: "#ff7800", weight: 1}')
</template>

<script>
import Graph from './graph.vue';

export default {
  components: { Graph },
  data: () => ({
    items: [],
    graphData: {}
  }),
  methods: {
    onClick(e) {
      fetch(`http://localhost:3000?lon=${e.latlng.lng}&lat=${e.latlng.lat}`)
      .then(res => res.json())
      .then(res => {
        if(res.length === 0) return;
        res.forEach(r => {
          r.loc = r.loc.coordinates[0].map(p => [p[1], p[0]]);
        });
        this.items = res;
        this.setGraphData(res);
      });
    },
    setGraphData(data) {
      if(this.items.length === 0) return;
      const labels = Object.keys(this.items[0].rainfall);
      const datasets = [];
      this.items.forEach(item => {
        const data = Object.keys(item.rainfall).sort((a, b) => {
          const a2 = a.slice(0,5).split('Z').reverse().join('');
          const b2 = b.slice(0,5).split('Z').reverse().join('');
          if(a2 > b2) return -1;
          if(a2 < b2) return 1;
          return 0;
        }).map(key => item.rainfall[key]);
        datasets.push({data, label: `${item.river_name}（水系：${item.valley_name}）`, backgroundColor: '#f87979'});
      });
      this.graphData = {datasets, labels};
    }
  }
}
</script>

<style lang="sass">
html, body, #app
  height: 100%
  margin: 0
.vue2leaflet-map.leaflet-container
  width: 50%
  float: right
#chart
  width: 50%
  height: 100vh
  float: left
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif

#app > div
  cursor: crosshair
</style>
