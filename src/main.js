import App from './app.vue';
import Vue from 'vue';
import Vue2Leaflet from 'vue2-leaflet';
import VueHighcharts from 'vue-highcharts';

Vue.component('v-map', Vue2Leaflet.Map);
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
Vue.component('v-polygon', Vue2Leaflet.Polygon);
Vue.component('v-polyline', Vue2Leaflet.Polyline);
Vue.use(VueHighcharts);

new Vue({
  el: '#app',
  render: h => h(App)
});
