import Vue from 'vue'
import App from './app.vue'
import Vue2Leaflet from 'vue2-leaflet';

Vue.component('v-map', Vue2Leaflet.Map);
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
Vue.component('v-polygon', Vue2Leaflet.Polygon);

new Vue({
  el: '#app',
  render: h => h(App)
})
