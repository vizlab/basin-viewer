import Vue from 'vue';
import Vue2Leaflet from 'vue2-leaflet';
import VueI18n from 'vue-i18n';
import App from './app.vue';
import './charts/basic-line-chart';
import './charts/basic-histogram';
import './charts/basic-stacked-area-chart';
import './charts/basic-box-plot';
import './charts/basic-error-bar-chart';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'en',
  messages: require('./texts.json')
});

Vue.component('v-map', Vue2Leaflet.Map);
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
Vue.component('v-polygon', Vue2Leaflet.Polygon);
Vue.component('v-polyline', Vue2Leaflet.Polyline);

new Vue({
  el: '#app',
  render: h => h(App),
  i18n
});
