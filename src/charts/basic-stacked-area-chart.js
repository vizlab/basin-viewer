import {AbstractHighChart} from './abstract-highcharts';

class BasicStackedAreaChart extends AbstractHighChart {
  static get observedAttributes () {
    return [
      'y-axis-title'
    ];
  }

  constructor () {
    super();

    this.options = {
      title: {
        text: null
      },
      chart: {
        type: 'area',
        zoomType: 'x'
      },
      xAxis: {
        categories: [],
        tickInterval: 48
      },
      yAxis: {
        title: {
          text: this.yAxisTitle
        }
      },
      plotOptions: {
        area: {
          stacking: 'normal'
        }
      },
      series: []
    };
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    switch (attrName) {
      case 'y-axis-title':
        this.options.yAxis.title.text = this.yAxisTitle;
        break;
    }
  }

  load (data) {
    this.options.xAxis.categories = data.labels;
    this.options.series = data.ensembles;
    this.render();
  }

  get yAxisTitle () {
    if (this.hasAttribute('y-axis-title')) {
      return this.getAttribute('y-axis-title');
    }
    return '';
  }

  set yAxisTitle (value) {
    this.setAttribute('y-axis-title', value);
  }
}

window.customElements.define('viz-basic-stacked-area-chart', BasicStackedAreaChart);
