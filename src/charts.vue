<template lang="pug">
#chart
  .tabs.is-small
    ul
      li(v-for="tab in tabs", :class="{ 'is-active': tab === selectedTab }")
        a(@click="changeTab($event, tab)") {{ tab }}
  .tab-content
    histogram(v-if="selectedTab === 'histogram'", :cellId="cellId", :simulationIds="simulationIds", :start="start", :end="end")
    extremeEvents(v-if="selectedTab === 'extreme-events'", :cellId="cellId", :simulationIds="simulationIds", :start="start", :end="end")
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
  props: ['cellId', 'simulationIds', 'start', 'end'],
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
  height: 100%
  .tabs
    margin-bottom: 0.75rem
.tab-content
  height: calc(100% - 31px)
  overflow-x: hidden
  overflow-y: scroll
</style>
