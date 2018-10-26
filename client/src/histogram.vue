<template lang="pug">
#histogram
  .columns
    .column.is-full
      .field
        .control
          a.button.is-small(ref="download", @click="download", :disabled="data == null") {{ $t("buttons.download_data") }}
      viz-basic-histogram(ref="histogram",  :x-axis-title="$t('axes.precipitation')", :y-axis-title="$t('axes.frequency')")
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';

const fetchHistogramData = (cellId, simulationIds, start, end) => {
  const params = new URLSearchParams();
  params.set('cellId', cellId);
  params.set('simulationIds', _.values(_.omitBy(simulationIds, _.isEmpty)).join());
  params.set('startDate', start);
  params.set('endDate', end);
  params.set('range', 'year');
  params.set('measure', 'max');
  return fetch(`/api/yearly-rains?${params.toString()}`)
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
  data: () => ({
    data: null
  }),
  watch: {
    cellId() {
      this.render();
    },
    simulationIds() {
      this.render();
    }
  },
  methods: {
    render() {
      if (this.cellId == null) {
        return;
      }
      fetchHistogramData(this.cellId, this.simulationIds, this.start, this.end)
        .then(data => {
          this.data = data;
          this.$refs.histogram.load(data, { bins: 50 });
        });
    },
    download() {
      const head = 'simulation,year,amount';
      const content = this.data.ensembles.map(ensemble => {
        return ensemble.data.map((v, i) => {
          return [ensemble.name, this.data.labels[i].substr(0, 4), v];
        }).join('\n');
      }).join('\n');
      const data = btoa(encodeURIComponent(`${head}\n${content}`).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(`0x${p1}`)));
      this.$refs.download.href = `data:text/csv;base64,${data}`;
      this.$refs.download.download = 'data.csv';
    }
  },
  mounted() {
    this.render();
  }
});
</script>

<style lang="sass">
</style>
