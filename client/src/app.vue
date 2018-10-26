<template lang="pug">
#app(:class="{waiting: waiting}")
  nav.navbar.is-primary#navbar
    .navbar-brand
      h1.navbar-item SEAL-V
    .navbar-menu
      .navbar-end
        .navbar-item.has-dropdown.is-hoverable
          a.navbar-link {{ $t("buttons.language") }}
          .navbar-dropdown
            a.navbar-item(:class="{'is-active': $i18n.locale === 'ja'}", @click="$i18n.locale = 'ja'") 日本語
            a.navbar-item(:class="{'is-active': $i18n.locale === 'en'}", @click="$i18n.locale = 'en'") English
  #controller-wrapper
    #controller.box
      .field
        label.label.is-small {{ $t("labels.cell_type") }}
        .control
          .select.is-fullwidth
            select(v-model="selectedCellType")
              option(value="1") {{ $t("options.prefecture") }}
              option(value="2") {{ $t("options.basin") }}
      .field
        label.label.is-small {{ $t("labels.cell") }}
        .control
          .select.is-fullwidth
            select(v-model="selectedCellId")
              option(v-for="cell in cells", :value="cell.id") {{ cell.name }}
      .field
        label.label.is-small {{ $t("labels.simulations") }}
        .control
          .select.is-fullwidth
            select(v-model="selectedExperimentId")
              option(v-for="experiment in experiments", :value="experiment.id") {{ $i18n.locale === 'ja' ? experiment.namejapanese : experiment.nameenglish }}
      .field
        label.label.is-small {{ $t("labels.ensembles") }}
        .control
          .columns.is-multiline
            .column.is-4(v-for="(simulations, model) in simulationColumns", :key="model")
              label.label.is-small.toggle(@click="toggleModel(model, $event)") {{ model }}
              .select.is-multiple.is-small.is-fullwidth
                select(v-model="selectedSimulationIds[model]", multiple)
                  option(v-for="simulation in simulations", :value="simulation.id")
                    span {{ simulation.name.split('/').slice(1).join('/') }}
      .field
        label.label.is-small {{ $t("labels.map_type") }}
        .control
          .select.is-fullwidth
            select(v-model="map")
              option(value="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png") OpenStreetMap.Mapnik
              option(value="http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png") Hydda.Base
              option(value="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png") OpenTopoMap
              option(value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}") Esri.WorldImagery
              option(value="http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png") MtbMap
  #leaflet-wrapper
    .box
      v-map(:zoom=6, :center="[35.4233, 136.7607]")
        v-tilelayer(:url="map")
        .loop(v-for="cell in cells")
          .polygons(v-for="multiPolygon in cell.geometry.coordinates")
            .polygon(v-for="polygon in multiPolygon" )
              v-polygon(:latLngs="swapLatLng(polygon)", :lStyle='{color: polygonColor(cell), weight: polygonWeight(cell)}', @l-click="handleClickPolygon($event, cell)")
  #charts-wrapper
    .box
      charts(:cellId="selectedCellId", :simulationIds="selectedSimulationIds", :start="start", :end="end")
  footer.footer
    .content.has-text-centered
      p &copy; 2018 SI-CAT課題1bチーム
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
    fetch('/api/experiments')
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
      this.selectedSimulationIds = Object.assign({}, this.selectedSimulationIds);
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
      fetch(`/api/simulations?${params.toString()}`)
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
      fetch(`/api/cells?${params.toString()}`)
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
#navbar
  z-index: 1000
  background-color: #1f9900
#controller-wrapper
  position: absolute
  top: 52px
  bottom: 50%
  left: 0
  width: 50%
  padding: 10px
  .box
    height: 100%
    padding: 10px
    overflow-x: hidden
    overflow-y: scroll
#controller
  .toggle
    cursor: pointer
#leaflet-wrapper
  padding: 10px
  position: absolute
  right: 0
  top: 52px
  bottom: 50%
  width: 50%
  .box
    height: 100%
    padding: 0
.vue2leaflet-map.leaflet-container
  cursor: crosshair
  .waiting &
    cursor: progress
#charts-wrapper
  padding: 10px
  position: absolute
  top: 50%
  bottom: 25px
  width: 100%
  .box
    height: 100%
    padding: 10px
    overflow: hidden
.footer
  position: absolute
  bottom: 0
  width: 100%
  padding: 0.3rem
  p
    font-size: 0.5rem
.waiting
  cursor: progress
</style>
