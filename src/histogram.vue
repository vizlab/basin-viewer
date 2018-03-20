<template lang="pug">
#histogram
  .columns
    .column
      viz-basic-histogram(ref="histogram", y-axis-title="rainfall")
</template>

<script>
import Vue from 'vue';

const fetchHistogramData = (cellId, simulationIds, start, end) => {
  const params = new URLSearchParams();
  params.set('cellId', cellId);
  params.set('simulationIds', simulationIds.join(','));
  params.set('startDate', start);
  params.set('endDate', end);
  params.set('range', 'year');
  params.set('measure', 'max');
  return fetch(`/yearly-rains?${params.toString()}`)
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
  watch: {
    cellId() {
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
          this.$refs.histogram.load(data, { bins: 50 });
        });
    }
  },
  mounted() {
    this.render();
  },
  updated() {
    this.render();
  }
});
</script>

<style lang="sass">
</style>
