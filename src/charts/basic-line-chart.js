import {AbstractHighChart} from './abstract-highcharts';

class BasicLineChart extends AbstractHighChart {
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

window.customElements.define('viz-basic-line-chart', BasicLineChart);
