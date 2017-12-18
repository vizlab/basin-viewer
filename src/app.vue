<template lang="pug">
#app
  #controller
    .field.is-horizontal
      .field-label.is-normal: label.label Experiment
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedExperimentId")
          option(v-for="experiment in experiments", :value="experiment.id") {{experiment.nameenglish}}
    .field.is-horizontal
      .field-label.is-normal: label.label Simulations
      .field-body: .field.is-narrow: .control: .select.is-multiple
        select(v-model="selectedSimulations" multiple)
          option(v-for="simulation in simulations", :value="simulation.id") {{simulation.name}}
    .field.is-horizontal
      .field-label.is-normal: label.label Period
      .field-body: .field.is-narrow: .control
        datepicker(v-model="start", format="yyyy/MM/dd" :disabled="disabledDates", input-class="input")
        span.tilda  ~
        datepicker(v-model="end", format="yyyy/MM/dd" :disabled="disabledDates", input-class="input")
    .field.is-horizontal
      .field-label.is-normal: label.label Map type
      .field-body: .field.is-narrow: .control: .select
        select(v-model="map")
          option(value="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png") Ordinary
          option(value="http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png") Hydda
    .field.is-horizontal
      .field-label.is-normal: label.label Chart type
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedGraph")
          option(v-for="option in graphOptions" v-bind:value="option.value") {{ option.text }}
    .information(v-if="cells.length > 0")
  v-map(:zoom=6, :center="[35.4233, 136.7607]", @l-click="onClick")
    v-tilelayer(:url="map")
    .loop(v-for="cell in cells")
      .polygons(v-for="polygon in cell.geometry.coordinates")
        v-polygon(:latLngs="swapLatLng(polygon)", :lStyle='{color: polygonColor(cell), weight: 1}')
  charts(:graphType="selectedGraph", :data="data")
  modal(v-if="showModal", :events="events", @close="showModal = false", @fetchRainByEvent="fetchRainByEvent")
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import Charts from './charts.vue';
import Modal from './modal.vue';

export default {
  components: {
    datepicker: Datepicker,
    charts: Charts,
    modal: Modal
  },
  mounted () {
    fetch('/cells')
      .then(res => res.json())
      .then(data => {
        this.cells = data;
      });
    fetch('/experiments')
      .then(res => res.json())
      .then(data => {
        this.experiments = data;
        this.selectedExperimentId = data[0].id;
      });
  },
  data: () => ({
    cells: [],
    data: null,
    selectedCell: null,
    experiments: [],
    selectedExperimentId: null,
    simulations: [],
    selectedSimulations: [],
    map: 'http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png',
    start: new Date('2050/09/01'),
    end: new Date('2050/09/30'),
    disabledDates: {},
    selectedGraph: 'basic-line-chart',
    graphOptions: [
      { text: 'line chart', value: 'basic-line-chart' },
      { text: 'histogram', value: 'basic-histogram' },
      { text: 'area chart', value: 'basic-stacked-area-chart' },
      { text: 'box plot', value: 'basic-box-plot' }
    ],
    events: [],
    showModal: false
  }),
  methods: {
    polygonColor(cell) {
      return this.selectedCell && cell.id === this.selectedCell.id ? '#ff7800' : '#333333';
    },
    onClick(e) {
      this.fetchRainsByCoord(e.latlng.lng, e.latlng.lat);
    },
    fetchEvents() {
      fetch('/events')
        .then(res => res.json())
        .then(data => {
          this.events = data.events;
          this.showModal = true;
        });
    },
    fetchRainByEvent(event) {
      const params = new URLSearchParams();
      params.set('simulationId', this.simulations.find(s => s.name === event.simulation_name).id);
      params.set('cellId', this.selectedCell.id);
      params.set('startDate', new Date(Date.parse(this.start) - (6 * 24 * 60 * 60 * 1000)));
      params.set('endDate', new Date(Date.parse(this.start) + (8 * 24 * 60 * 60 * 1000)));
      fetch(`/rain?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          this.data = data;
          this.showModal = false;
        });
    },
    fetchRainsByCoord(lng, lat) {
      const params = new URLSearchParams();
      params.set('lon', lng);
      params.set('lat', lat);
      params.set('simulationIds', this.selectedSimulations.join(','));
      params.set('startDate', this.start);
      params.set('endDate', this.end);
      fetch(`/rains?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          this.selectedCell = data.cell;
          this.data = data;
          this.fetchEvents();
        });
    },
    swapLatLng(polygon) {
      return polygon[0].map(n => [n[1], n[0]]);
    }
  },
  watch: {
    selectedExperimentId (val) {
      const experiment = this.experiments.find(e => e.id === this.selectedExperimentId);
      const start = new Date(experiment.start_date);
      const end = new Date(experiment.end_date);
      this.start = start;
      this.end = end;
      this.disabledDates = {
        to: start,
        from: end,
      };

      const params = new URLSearchParams();
      params.set('experimentId', this.selectedExperimentId);
      fetch(`/simulations?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          this.simulations = data;
          this.selectedSimulations = data.map(d => d.id);
        });
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
  padding: 20px
  dt
    float: left
    margin: 0 10px
  .vdp-datepicker
    display: inline-block
  .information
    padding: 0 10px
  .tilda
    vertical-align: -10px
.vue2leaflet-map.leaflet-container
  float: right
  cursor: crosshair
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
</style>
