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
    const boxes = [];

    const timestampData = [];
    data.ensembles.forEach(d => {
      d.data.forEach((_d, idx) => {
        if(!timestampData[idx]) {
          timestampData[idx] = [];
        }
        timestampData[idx].push(_d);
      });
    });

    timestampData.forEach((d, idx) => {
      let min = 0;
      let max = 0;
      const m = median(d);
      const lq = median(d.filter(_d => _d <= m));
      const uq = median(d.filter(_d => _d >= m));

      d.forEach(_d => {
        min = Math.min(min, _d);
        max = Math.max(max, _d);
      });
      boxes.push([min, lq, m, uq, max]);
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

const median = (arr, fn) => {
  const half = (arr.length/2)|0;
  const temp = arr.sort(fn);

  if (temp.length%2) {
    return temp[half];
  }

  return (temp[half-1] + temp[half])/2;
};
