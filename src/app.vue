<template lang="pug">
#app
  #controller
    dl
      dt Period
      dd
        datepicker(v-model="start", format="yyyy/MM/dd")
        span  ~ 
        datepicker(v-model="end", format="yyyy/MM/dd")
      dt Include upstream basins
      dd: input(type="checkbox", v-model="includeUpstreamBasins")
      dt Map type
      dd: select(v-model="map")
        option(value="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png") Ordinary
        option(value="http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png") Hydda
    hr
    .information(v-if="basins.length > 0")
      p Selected river: {{ basins[0].properties.W07_005 }}
      p Upstreams: {{ basins.map(b => b.properties.W07_005).join(', ') }}
  v-map(:zoom=10, :center="[35.4233, 136.7607]", @l-click="onClick")
    v-tilelayer(:url="map")
    .loop(v-for="basin in basins")
      .polygons(v-for="polygon in basin.geometry.coordinates")
        v-polygon(:latLngs="swapLatLng(polygon)", :lStyle='{color: polygonColor(basin), weight: 1}')
  #chart: basic-line-chart(:rainfall="rainfall")
</template>

<script>
import Datepicker from 'vuejs-datepicker';

export default {
  components: {Datepicker},
  data: () => ({
    basins: [],
    rainfall: {},
    map: 'http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png',
    start: new Date('2050/09/01'),
    end: new Date('2050/09/30'),
    includeUpstreamBasins: true
  }),
  methods: {
    polygonColor(basin) {
      if(basin.properties.W07_003 === this.basins[0].properties.W07_003) return '#0078ff';
      return basin.properties.W07_003.endsWith('0000') ? '#33333' : '#ff7800';
    },
    onClick(e) {
      fetch(`/basin?lon=${e.latlng.lng}&lat=${e.latlng.lat}`)
      .then(res => res.json())
      .then(res => {
        if(res.length === 0) return;
        this.basins = res.basins;
        this.rainfall = res.rainfall;
      });
    },
    swapLatLng(polygon) {
      return polygon[0].map(n => [n[1], n[0]]);
    }
  }
};
</script>

<style lang="sass">
html, body, #app
  height: 100%
  margin: 0
.vue2leaflet-map.leaflet-container, #controller
  width: 50%
  height: 50vh
#controller
  float: left
  dt
    float: left
    margin: 0 10px
  .vdp-datepicker
    display: inline-block
  .information
    padding: 0 10px
.vue2leaflet-map.leaflet-container
  float: right
  cursor: crosshair
#chart
  position: fixed
  top: 50%
  width: 100%
  height: 50vh
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
</style>
