import {html, render} from 'lit-html';
import HighCharts from 'highcharts';

const template = html`
<style>
:host {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
<div class="stacked-area-chart-content" />
`;

class BasicStackedAreaChart extends window.HTMLElement {
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

    const shadowRoot = this.attachShadow({mode: 'open'});
    render(template, shadowRoot);
  }

  connectedCallback () {
    this.options.chart.width = this.clientWidth;
    this.options.chart.height = this.clientHeight;
    this.render();
    this.handleResize = () => {
      this.chart.setSize(this.clientWidth, this.clientHeight, false);
    };
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback () {
    this.chart.destroy();
    window.removeEventListener('reisze', this.handleResize);
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    switch (attrName) {
      case 'y-axis-title':
        this.options.yAxis.title.text = this.yAxisTitle;
        break;
    }
  }

  adoptedCallback () {
  }

  load (data) {
    this.options.xAxis.categories = data.labels;
    this.options.series = data.ensembles;
    this.render();
  }

  render () {
    // TODO use redraw
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.options) {
      this.chart = HighCharts.chart(this.shadowRoot.querySelector('.stacked-area-chart-content'), this.options);
    }
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
