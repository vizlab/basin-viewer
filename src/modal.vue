<template lang="pug">
.modal.is-active
  .modal-background(@click="$emit('close')")
  .modal-content: .box
    p: b Cumulative rainfall for three days
    table.table.is-hoverable.is-fullwidth
      thead: tr
        td.date Date
        td.three-day-rain Cumulative rainfall [mm]
        td.simulation-name Ensemble name
      tbody
        tr(v-for="event in events", @click="$emit('handleSelectEvent', event)")
          th.date {{ event.start_date | truncateDate }}
          td.three-day-rain {{ event.three_day_rain | fixFloatingDecimal }}
          td.simulation-name {{ event.simulation_name }}
  button.modal-close.is-large(@click="$emit('close')")
</template>

<script>
export default {
  props: ['events'],
  filters: {
    fixFloatingDecimal: v => {
      return v.toFixed(4);
    },
    truncateDate: v => {
      return v.slice(0, 10).replace(/-/g, '/');
    }
  }
};
</script>

<style lang="sass" scoped>
.modal
  z-index: 2000
.table
  margin: 20px 0 0
.three-day-rain
  text-align: right
tbody
  tr
    cursor: pointer
    &:active
      transform: translateY(1px)
</style>
