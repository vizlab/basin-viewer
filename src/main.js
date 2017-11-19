import Vue from 'vue';
import Vue2Leaflet from 'vue2-leaflet';
import App from './app.vue';
import './charts/basic-line-chart';
import './charts/basic-histogram';
import './charts/basic-stacked-area-chart';
import './charts/basic-box-plot';

Vue.component('v-map', Vue2Leaflet.Map);
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
Vue.component('v-polygon', Vue2Leaflet.Polygon);
Vue.component('v-polyline', Vue2Leaflet.Polyline);

new Vue({
  el: '#app',
  render: h => h(App)
});
