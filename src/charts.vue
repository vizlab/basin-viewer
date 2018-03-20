<template lang="pug">
#chart
  .tabs
    ul
      li(v-for="tab in tabs", :class="{ 'is-active': tab === selectedTab }")
        a(@click="changeTab($event, tab)") {{ tab }}
  .content
    histogram(v-if="selectedTab === 'histogram'", :cellId="cellId", :simulationIds="simulationIds", :start="start", :end="end")
    extremeEvents(v-if="selectedTab === 'extreme-events'", :cellId="cellId", :experimentId="experimentId", :start="start", :end="end")
</template>

<script>
import Vue from 'vue';
import Histogram from './histogram.vue';
import ExtremeEvents from './extreme-events.vue';

export default Vue.extend({
  components: {
    histogram: Histogram,
    extremeEvents: ExtremeEvents
  },
  props: ['cellId', 'experimentId', 'simulationIds', 'start', 'end'],
  data: () => ({
    tabs: [
      'histogram',
      'extreme-events'
    ],
    selectedTab: 'histogram'
  }),
  methods: {
    changeTab(e, tab) {
      this.selectedTab = tab;
    }
  }
});

</script>

<style lang="sass">
#chart
  position: fixed
  top: 50%
  width: 100%
  height: 50vh
  overflow-x: hidden;
  overflow-y: scroll;
</style>
