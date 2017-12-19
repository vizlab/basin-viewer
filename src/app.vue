<template lang="pug">
#app(:class="{waiting: waiting}")
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
      .field-label.is-normal
      .field-body: .field.is-narrow: .control: button.button(@click="showEventList") Show Event List
    .field.is-horizontal
      .field-label.is-normal: label.label Range
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedRange")
          option(v-for="option in rangeOptions", :value="option.value") {{ option.text }}
    .field.is-horizontal
      .field-label.is-normal: label.label Map Type
      .field-body: .field.is-narrow: .control: .select
        select(v-model="map")
          option(value="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png") Ordinary
          option(value="http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png") Hydda
    .field.is-horizontal
      .field-label.is-normal: label.label Chart Type
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedGraph")
          option(v-for="option in graphOptions", :value="option.value") {{ option.text }}
    .information(v-if="cells.length > 0")
  v-map(:zoom=6, :center="[35.4233, 136.7607]", @l-click="handleClickMap")
    v-tilelayer(:url="map")
    .loop(v-for="cell in cells")
      .polygons(v-for="polygon in cell.geometry.coordinates")
        v-polygon(:latLngs="swapLatLng(polygon)", :lStyle='{color: polygonColor(cell), weight: 1}')
  charts(:graphType="selectedGraph", :data="data")
  modal(v-if="showModal", :events="events", @close="showModal = false", @handleSelectEvent="selectEvent")
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
    data: {
      cell: null,
      ensembles: [],
      labels: []
    },
    selectedCell: null,
    experiments: [],
    selectedExperimentId: null,
    simulations: [],
    selectedSimulations: [],
    map: 'http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png',
    start: new Date('2050/09/01'),
    end: new Date('2050/09/30'),
    disabledDates: {},
    selectedGraph: 'basic-box-plot',
    graphOptions: [
      { text: 'Line Chart', value: 'basic-line-chart' },
      { text: 'Histogram', value: 'basic-histogram' },
      { text: 'Area Chart', value: 'basic-stacked-area-chart' },
      { text: 'Box Plot', value: 'basic-box-plot' }
    ],
    selectedRange: 'hour',
    rangeOptions: [
      { text: 'Year', value: 'year' },
      { text: 'Month', value: 'month' },
      { text: 'Day', value: 'day' },
      { text: 'Hour', value: 'hour' }
    ],
    events: [],
    waiting: false,
    showModal: false
  }),
  methods: {
    polygonColor(cell) {
      return this.selectedCell && cell.id === this.selectedCell.id ? '#ff7800' : '#333333';
    },
    handleClickMap(e) {
      this.fetchRains(e.latlng.lng, e.latlng.lat);
    },
    showEventList(e) {
      fetch('/events')
        .then(res => res.json())
        .then(data => {
          this.events = data.events;
          this.showModal = true;
        });
    },
    selectEvent(event) {
      const t = new Date(event.start_date).getTime();
      this.start = new Date(t - (3 * 24 * 60 * 60 * 1000));
      this.end = new Date(t + (3 * 24 * 60 * 60 * 1000));
      this.showModal = false;
    },
    fetchRains(lng, lat) {
      const params = new URLSearchParams();
      params.set('lon', lng);
      params.set('lat', lat);
      params.set('simulationIds', this.selectedSimulations.join(','));
      params.set('startDate', this.start);
      params.set('endDate', this.end);
      this.waiting = true;
      fetch(`/rains?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          data.labels = data.labels.map(s => {
            const d = new Date(s);
            return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:00`;
          });
          this.selectedCell = data.cell;
          this.data = data;
          this.waiting = false;
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
      // this.end = end;
      this.end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
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
  overflow-y: scroll
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
  .waiting &
    cursor: progress
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
.waiting
  cursor: progress
</style>
