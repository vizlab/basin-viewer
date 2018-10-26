<template lang="pug">
#extreme-events
  .columns
    .column.is-full
      .field
        label.label.is-small {{ $t("labels.event_type") }}
        .control
          .select
            select(v-model="selectedEventType")
              option(v-for="eventType in eventTypes", :value="eventType") {{ $t(`events.${eventType}`) }}
          span &nbsp;
          button.button(@click="showEventList", :class="{'is-loading': loading}") {{ $t("buttons.show_event_list") }}
  .columns
    .column.is-half
      .events
        table.table.is-hoverable.is-fullwidth
          thead: tr
            td.date {{ $t("modal.date") }}
            td.three-day-rain {{ $t("modal.precipitation") }}
            td.simulation-name {{ $t("modal.ensemble") }}
          tbody
            tr(v-for="event in events", @click="showHourlyRain($event, event)")
              th.date {{ event.start_date | truncateDate }}
              td.three-day-rain {{ event.three_day_rain | fixFloatingDecimal }}
              td.simulation-name {{ event.simulation_name }}
    .column.is-half
      .field
        .control
          a.button.is-small(ref="download", @click="download", :disabled="data == null") {{ $t("buttons.download_data") }}
      viz-basic-line-chart(ref="lineChart", :x-axis-title="$t('axes.date')" :y-axis-title="$t('axes.precipitation')")
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';

const fetchEvents = (cellId, simulationIds, start, end) => {
  const params = new URLSearchParams();
  params.set('cellId', cellId);
  params.set('simulationIds', _.values(_.omitBy(simulationIds, _.isEmpty)).join());
  params.set('startDate', start);
  params.set('endDate', end);
  params.set('days', 3);
  return fetch(`api/events?${params.toString()}`)
    .then(res => res.json())
    .then(data => data.events);
};

const fetchData = (cellId, simulationId, start, end) => {
  const params = new URLSearchParams();
  params.set('cellId', cellId);
  params.set('simulationIds', simulationId);
  params.set('startDate', start);
  params.set('endDate', end);
  params.set('range', 'hour');
  params.set('measure', 'avg');
  return fetch(`api/rains?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      data.labels = data.labels.map(s => {
        const d = new Date(s);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:00`;
      });
      return data;
    });
};

export default Vue.extend({
  props: ['cellId', 'simulationIds', 'start', 'end'],
  filters: {
    fixFloatingDecimal: v => v.toFixed(4),
    truncateDate: v => v.slice(0, 10).replace(/-/g, '/')
  },
  data: () => ({
    loading: false,
    data: null,
    events: [],
    eventTypes: [
      '3day_cumulative_precipitation'
    ],
    selectedEventType: '3day_cumulative_precipitation'
  }),
  watch: {
    cellId() {
      this.events = [];
    }
  },
  methods: {
    showEventList() {
      this.loading = true;
      fetchEvents(this.cellId, this.simulationIds, this.start, this.end)
        .then(events => {
          this.events = events;
          this.loading = false;
        });
    },
    showHourlyRain(e, event) {
      const t = new Date(event.start_date).getTime();
      const start = new Date(t - (3 * 24 * 60 * 60 * 1000));
      const end = new Date(t + (3 * 24 * 60 * 60 * 1000));
      fetchData(this.cellId, event.simulation_id, start, end)
        .then(data => {
          this.data = data;
          this.$refs.lineChart.load(data);
        });
    },
    download() {
      const head = 'datetime,amount';
      const content = this.data.ensembles[0].data.map((v, i) => {
        return [this.data.labels[i], v];
      }).join('\n');
      const data = btoa(encodeURIComponent(`${head}\n${content}`).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(`0x${p1}`)));
      this.$refs.download.href = `data:text/csv;base64,${data}`;
      this.$refs.download.download = 'data.csv';
    }
  }
});
</script>

<style lang="sass">
</style>
