import {AbstractHighChart} from './abstract-highcharts';

class BasicLineChart extends AbstractHighChart {
  static get observedAttributes () {
    return [
      'x-axis-title',
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
        title: {
          text: this.xAxisTitle
        },
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
      case 'x-axis-title':
        this.options.xAxis.title.text = this.xAxisTitle;
        break;
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

  get xAxisTitle () {
    if (this.hasAttribute('x-axis-title')) {
      return this.getAttribute('x-axis-title');
    }
    return '';
  }

  set xAxisTitle (value) {
    this.setAttribute('x-axis-title', value);
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
