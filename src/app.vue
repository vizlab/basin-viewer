<template lang="pug">
#app(:class="{waiting: waiting}")
  #controller
    .language-selector.buttons.has-addons
      a.button.is-text(:class="{'is-active': $i18n.locale === 'ja'}", @click="$i18n.locale = 'ja'") 日本語
      a.button.is-text(:class="{'is-active': $i18n.locale === 'en'}", @click="$i18n.locale = 'en'") English
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.map_type") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="map")
          option(value="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png") {{ $t("options.ordinary") }}
          option(value="http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png") {{ $t("options.hydda") }}
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.cell_type") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedCellType")
          option(value="1") {{ $t("options.prefecture") }}
          option(value="2") {{ $t("options.basin") }}
    .field.is-horizontal
      .field-label.is-normal: label.label Cell
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedCellId")
          option(v-for="cell in cells", :value="cell.id") {{ cell.name }}
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.experiment") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedExperimentId")
          option(v-for="experiment in experiments", :value="experiment.id") {{ experiment.nameenglish }}
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.simulations") }}
      .field-body: .field.is-narrow: .control
        .columns.is-multiline
          .column.is-4(v-for="(simulations, model) in simulationColumns")
            a.button.is-small.is-text(v-if="Object.keys(simulationColumns).length > 1", @click="toggleModel(model, $event)")
              small {{ model }}<br>
            .select.is-multiple.is-small
              select(v-model="selectedSimulationIds[model]", multiple)
                option(v-for="simulation in simulations", :value="simulation.id")
                  span {{ simulation.name.split('/').slice(1).join('/') }}
  v-map(:zoom=6, :center="[35.4233, 136.7607]")
    v-tilelayer(:url="map")
    .loop(v-for="cell in cells")
      .polygons(v-for="multiPolygon in cell.geometry.coordinates")
        .polygon(v-for="polygon in multiPolygon" )
          v-polygon(:latLngs="swapLatLng(polygon)", :lStyle='{color: polygonColor(cell), weight: polygonWeight(cell)}', @l-click="handleClickPolygon($event, cell)")
  charts(:cellId="selectedCellId", :experimentId="selectedExperimentId", :simulationIds="selectedSimulationIds", :start="start", :end="end")
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import Charts from './charts.vue';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';
import _ from 'lodash';

export default {
  components: {
    datepicker: Datepicker,
    charts: Charts
  },
  mounted () {
    this.selectedCellType = 1;
    fetch('/experiments')
      .then(res => res.json())
      .then(data => {
        this.experiments = data;
        this.selectedExperimentId = data[0].id;
      });
  },
  computed: {
    simulationColumns() {
      return _.groupBy(this.simulations, s => s.model);
    }
  },
  data: () => ({
    cellColorScale: scaleLinear().range(['#aaaaff', '#0000ff']),
    selectedCellType: null,
    cells: [],
    selectedCellId: null,
    experiments: [],
    selectedExperimentId: null,
    simulations: [],
    selectedSimulationIds: {},
    map: 'http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png',
    start: new Date('2050/09/01'),
    end: new Date('2050/09/30'),
    waiting: false,
  }),
  methods: {
    toggleModel(model, e) {
      if(this.selectedSimulationIds[model].length > 0) {
        this.selectedSimulationIds[model] = [];
      } else {
        this.selectedSimulationIds[model] = this.simulationColumns[model].map(s => s.id);
      }
    },
    polygonColor(cell) {
      if (cell.max == null) {
        return '#888888';
      }
      return this.cellColorScale(cell.max);
    },
    polygonWeight(cell) {
      return this.selectedCellId && cell.id === this.selectedCellId ? 3 : 1;
    },
    handleClickPolygon(e, cell) {
      this.selectedCellId = cell.id;
    },
    swapLatLng(polygon) {
      return polygon.map(n => [n[1], n[0]]);
    }
  },
  watch: {
    selectedExperimentId (val) {
      const experiment = this.experiments.find(e => e.id === this.selectedExperimentId);
      const start = new Date(experiment.start_date);
      const end = new Date(experiment.end_date);
      this.start = start;
      this.end = end;

      const params = new URLSearchParams();
      params.set('experimentId', this.selectedExperimentId);
      fetch(`/simulations?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          this.simulations = data;
          this.selectedSimulationIds = _.mapValues(this.simulationColumns, v => v.map(s => s.id)); // select all
        });
    },
    selectedCellType (val) {
      const params = new URLSearchParams();
      params.set('cellType', this.selectedCellType);
      params.set('limit', 200);
      fetch(`/cells?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          this.cells = data;
        });
    },
    cells (val) {
      this.cellColorScale.domain(extent(this.cells, v => v.max));
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
  position: relative
  dt
    float: left
    margin: 0 10px
  .language-selector
    position: absolute
    top: 10px
    right: 20px
  .vdp-datepicker
    display: inline-block
  .information
    padding: 0 10px
  .tilda
    vertical-align: -10px
  .field
    width: 100%
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
