<template lang="pug">
highcharts(:options="chartOptions")
</template>
<script>
export default {
  props: ['rainfall'],
  data: () => ({
    chartOptions: {}
  }),
  watch: {
    rainfall (rainfall) {
      const labels = Object.keys(rainfall).map(r => {
        const d = new Date(`${r.slice(8,12)}/${r.slice(5,8)}/${r.slice(3,5)} ${r.slice(0,2)}:00`);
        d.setTime(d.getTime() - d.getTimezoneOffset()*60*1000);
        return d.toISOString().replace(/-/g, '/').replace('T', ' ').slice(0, 16);
      });
      const data = Object.keys(rainfall).sort((a, b) => {
        const a2 = a.slice(0,5).split('Z').reverse().join('');
        const b2 = b.slice(0,5).split('Z').reverse().join('');
        return a2 > b2 ? -1 : 1;
      }).map(key => rainfall[key]);
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
        series: [
          {name: 'Ensemble 1', data},
          {name: 'Ensemble 2', data: data.map(n => n * Math.random())},
          {name: 'Ensemble 3', data: data.map(n => n * Math.random() * 2)},
          {name: 'Ensemble 4', data: data.map(n => n * Math.random() * 4)},
          {name: 'Ensemble 5', data: data.map(n => n * Math.random() * 8)},
        ]
      };
    }
  }
};
</script>
<style lang="sass">
</style>
