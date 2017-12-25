import {AbstractHighChart} from './abstract-highcharts';

class BasicHistogram extends AbstractHighChart {
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
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    switch (attrName) {
      case 'y-axis-title':
        // this.options.yAxis[0].title.text = this.yAxisTitle;
        break;
    }
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
