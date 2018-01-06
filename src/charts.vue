<template lang="pug">
#chart
  viz-basic-line-chart(ref="lineChart", y-axis-title="rainfall", v-if="graphType == 'basic-line-chart'")
  viz-basic-histogram(ref="histogram", y-axis-title="rainfall", v-if="graphType == 'basic-histogram'")
  viz-basic-stacked-area-chart(ref="stackedAreaChart", y-axis-title="rainfall", v-if="graphType == 'basic-stacked-area-chart'")
  viz-basic-box-plot(ref="boxPlot", y-axis-title="rainfall", v-if="graphType == 'basic-box-plot'")
  viz-basic-error-bar-chart(ref="errorBarChart", y-axis-title="rainfall", v-if="graphType == 'basic-error-bar-chart'")
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  props: ['graphType', 'data'],
  watch: {
    data() {
      this.render();
    }
  },
  methods: {
    render() {
      if(!this.data || !this.graphType) return;
      switch (this.graphType) {
        case ('basic-line-chart'):
          this.$refs.lineChart.load(this.data);
          break;
        case ('basic-histogram'):
          this.$refs.histogram.load(this.data, { bins: 20 });
          break;
        case ('basic-stacked-area-chart'):
          this.$refs.stackedAreaChart.load(this.data);
          break;
        case ('basic-box-plot'):
          this.$refs.boxPlot.load(this.data);
          break;
        case ('basic-error-bar-chart'):
          this.$refs.errorBarChart.load(this.data);
          break;
      }
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
#chart
  position: fixed
  top: 50%
  width: 100%
  height: 50vh
</style>
