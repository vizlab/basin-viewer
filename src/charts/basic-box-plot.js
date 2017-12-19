import {html, render} from 'lit-html';
import HighCharts from 'highcharts';
import HighChartsMore from 'highcharts/highcharts-more';

HighChartsMore(HighCharts);

const median = (d, start, stop) => {
  const size = stop - start + 1;
  return size % 2 == 0
    ? (d[start + size / 2 - 1] + d[start + size / 2]) / 2
    : d[start + (size - 1) / 2];
};

const template = html`
<style>
:host {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
<div class="box-plot-content" />
`;

class BasicBoxPlot extends window.HTMLElement {
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
        type: 'boxplot',
        zoomType: 'x'
      },
      xAxis: {
        categories: [],
      },
      yAxis: {
        title: {
          text: this.yAxisTitle
        },
        min: 0,
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
        // this.options.yAxis.title.text = this.yAxisTitle;
        break;
    }
  }

  adoptedCallback () {
  }

  load (data) {
    const boxes = data.labels.map((_, i) => {
      const d = data.ensembles.map(({data}) => data[i]);
      d.sort((v1, v2) => v2 - v1);
      const min = d[0];
      const lq = median(d, 0, (d.length - (d.length % 2 == 0 ? 2 : 1)) / 2);
      const m = median(d, 0, d.length - 1);
      const uq = median(d, (d.length - (d.length % 2 == 0 ? 0 : 1)) / 2, d.length - 1);
      const max = d[d.length - 1];
      return [max, uq, m, lq, min];
    });

    this.options.series = [
      {
        showInLegend: false,
        data: boxes,
      }
    ];
    this.options.xAxis.categories = data.labels;
    this.render();
  }

  render () {
    // TODO use redraw
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.options) {
      this.chart = HighCharts.chart(this.shadowRoot.querySelector('.box-plot-content'), this.options);
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

window.customElements.define('viz-basic-box-plot', BasicBoxPlot);
