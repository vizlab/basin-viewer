import Vue from 'vue';
import Vue2Leaflet from 'vue2-leaflet';
import VueHighcharts from 'vue-highcharts';
import App from './app.vue';
import BasicLineChart from './charts/basic-line-chart.vue';

Vue.component('v-map', Vue2Leaflet.Map);
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
Vue.component('v-polygon', Vue2Leaflet.Polygon);
Vue.component('v-polyline', Vue2Leaflet.Polyline);
Vue.use(VueHighcharts);
Vue.component('basic-line-chart', BasicLineChart);

new Vue({
  el: '#app',
  render: h => h(App)
});
