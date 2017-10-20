<template lang="pug">
highcharts(:options="chartOptions")
</template>
<script>
export default {
  props: ['rainfall'],
  data: () => ({
    chartOptions: {
      title: {
        text: null
      }
    }
  }),
  watch: {
    rainfall ({ensembles, labels}) {
      this.chartOptions = {
        title: {
          text: null
        },
        chart: {
          height: window.innerHeight / 2
        },
        xAxis: {
          categories: labels,
          tickInterval: 48
        },
        yAxis: {
          title: {
            text: 'Rainfall'
          }
        },
        series: ensembles
      };
    }
  }
};
</script>
<style lang="sass">
</style>
