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
<div class="histogram-content" />
`;

class BasicHistogram extends window.HTMLElement {
  static get observedAttributes () {
    return [
      'y-axis-title'
    ];
  }

  constructor () {
    super();
    this.options = {
      chart: {
        type: 'column',
        zoomType: 'x'
      },
      title: {
        text: ''
      },
      series: [
      ],
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      }
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
        console.log(this.yAxisTitle);
        // this.options.yAxis[0].title.text = this.yAxisTitle;
        break;
    }
  }

  adoptedCallback () {
  }

  load (data, options) {
    const bins = options.bins;
    const max = Math.max.apply(null, data.ensembles.map(ensemble => {
      return Math.max.apply(null, ensemble.data);
    }));
    const min = Math.min.apply(null, data.ensembles.map(ensemble => {
      return Math.min.apply(null, ensemble.data);
    }));

    const h = (max - min) / bins;
    const histograms = data.ensembles.map(ensemble => {
      return [...Array(bins).keys()].map(idx => {
        const range = [h * idx, h * (idx + 1)];
        return [h * idx, ensemble.data.filter(d => (d > range[0]) && (d < range[1])).length ];
      });
    });

    histograms.forEach((histogram, idx) => {
      this.options.series.push({
        name: data.ensembles[idx].name,
        data: histogram
      });
    });

    this.render();
  }

  render () {
    // TODO use redraw
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.options) {
    }
      this.chart = HighCharts.chart(this.shadowRoot.querySelector('.histogram-content'), this.options);
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

window.customElements.define('viz-basic-histogram', BasicHistogram);
