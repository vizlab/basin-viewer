import {html, render} from 'lit-html';
import HighCharts from 'highcharts';
import HighChartsMore from '../../node_modules/highcharts/highcharts-more';
HighChartsMore(HighCharts);

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
        tickInterval: 48
      },
      yAxis: {
        title: {
          text: this.yAxisTitle
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
        // this.options.yAxis.title.text = this.yAxisTitle;
        break;
    }
  }

  adoptedCallback () {
  }

  load (data) {
    this.options.xAxis.categories = data.ensembles.map(d => d.name);
    const boxes = [];
    data.ensembles.forEach((d, idx) => {
      let min = 0;
      let max = 0;
      const m = median(d.data);
      const lq = median(d.data.filter(_d => _d <= m));
      const uq = median(d.data.filter(_d => _d >= m));

      d.data.forEach(_d => {
        min = Math.min(min, _d);
        max = Math.max(max, _d);
      });
      boxes.push([min, lq, m, uq, max]);
    });
    console.log(boxes);
    this.options.series = [
      {
        data: boxes,
      }
    ];
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

const median = (arr, fn) => {
  const half = (arr.length/2)|0;
  const temp = arr.sort(fn);

  if (temp.length%2) {
    return temp[half];
  }

  return (temp[half-1] + temp[half])/2;
};
