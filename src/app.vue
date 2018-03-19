<template lang="pug">
#app(:class="{waiting: waiting}")
  #controller
    .language-selector.buttons.has-addons
      a.button.is-text(:class="{'is-active': $i18n.locale === 'ja'}", @click="$i18n.locale = 'ja'") 日本語
      a.button.is-text(:class="{'is-active': $i18n.locale === 'en'}", @click="$i18n.locale = 'en'") English
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.cell_type") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedCellType")
          option(value="1") {{ $t("options.prefecture") }}
          option(value="2") {{ $t("options.basin") }}
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.experiment") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedExperimentId")
          option(v-for="experiment in experiments", :value="experiment.id") {{ experiment.nameenglish }}
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.simulations") }}
      .field-body: .field.is-narrow: .control: .select.is-multiple
        select(v-model="selectedSimulations" multiple)
          option(v-for="simulation in simulations", :value="simulation.id") {{ simulation.name }}
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.period") }}
      .field-body: .field.is-narrow: .control
        datepicker(v-model="start", format="yyyy/MM/dd" :disabled="disabledDates", input-class="input")
        span.tilda ~
        datepicker(v-model="end", format="yyyy/MM/dd" :disabled="disabledDates", input-class="input")
        span &nbsp;
        button.button(@click="showEventList") {{ $t("buttons.show_event_list") }}
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.range") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedRange")
          each val in ['year', 'month', 'day', 'hour']
            option(value=val)= `{{ $t("options.${val}") }}`
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.measure") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedMeasure")
          each val in ['avg', 'max', 'min']
            option(value=val)= `{{ $t("options.${val}") }}`
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.map_type") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="map")
          option(value="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png") {{ $t("options.ordinary") }}
          option(value="http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png") {{ $t("options.hydda") }}
    .field.is-horizontal
      .field-label.is-normal: label.label {{ $t("labels.chart_type") }}
      .field-body: .field.is-narrow: .control: .select
        select(v-model="selectedGraph")
          each val in ['line_chart', 'histogram', 'stacked_area_chart', 'box_plot', 'error_bar_chart']
            option(value=`basic-${val.replace(/_/g, '-')}`)= `{{ $t("graphs.${val}") }}`
    .information(v-if="cells.length > 0")
  v-map(:zoom=6, :center="[35.4233, 136.7607]")
    v-tilelayer(:url="map")
    .loop(v-for="cell in cells")
      .polygons(v-for="multiPolygon in cell.geometry.coordinates")
        .polygon(v-for="polygon in multiPolygon" )
          v-polygon(:latLngs="swapLatLng(polygon)", :lStyle='{color: polygonColor(cell), weight: polygonWeight(cell)}', @l-click="handleClickPolygon($event, cell)")
  charts(:graphType="selectedGraph", :data="data")
  modal(v-if="showModal", :events="events", @close="showModal = false", @handleSelectEvent="selectEvent")
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import Charts from './charts.vue';
import Modal from './modal.vue';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';

export default {
  components: {
    datepicker: Datepicker,
    charts: Charts,
    modal: Modal
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
  data: () => ({
    cellColorScale: scaleLinear().range(['#aaaaff', '#0000ff']),
    selectedCellType: null,
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
    selectedRange: 'year',
    events: [],
    selectedMeasure: 'avg',
    waiting: false,
    showModal: false
  }),
  methods: {
    polygonColor(cell) {
      if (cell[this.selectedMeasure] == null) {
        return '#888888';
      }
      return this.cellColorScale(cell[this.selectedMeasure]);
    },
    polygonWeight(cell) {
      return this.selectedCell && cell.id === this.selectedCell.id ? 3 : 1;
    },
    handleClickPolygon(e, cell) {
      console.log(e, cell);
      this.selectedCell = cell;
      this.fetchRains();
    },
    showEventList(e) {
      const params = new URLSearchParams();
      params.set('experimentId', this.selectedExperimentId);
      params.set('cellId', this.selectedCell.id);
      params.set('startDate', this.start);
      params.set('endDate', this.end);
      fetch(`/events?${params.toString()}`)
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
      params.set('cellId', this.selectedCell.id);
      params.set('simulationIds', this.selectedSimulations.join(','));
      params.set('startDate', this.start);
      params.set('endDate', this.end);
      params.set('range', this.selectedRange);
      params.set('measure', this.selectedMeasure);
      this.waiting = true;
      fetch(`/rains?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          data.labels = data.labels.map(s => {
            const d = new Date(s);
            return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:00`;
          });
          this.data = data;
          this.waiting = false;
        });
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
      this.cellColorScale.domain(extent(this.cells, v => v[this.selectedMeasure]));
    },
    selectedMeasure (val) {
      this.cellColorScale.domain(extent(this.cells, v => v[this.selectedMeasure]));
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
