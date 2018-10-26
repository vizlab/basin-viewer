import {AbstractHighChart} from './abstract-highcharts';

const average = d => {
  let sum = 0;
  d.forEach(_a => {
    sum = sum + _a;
  });
  return sum / d.length;
};

const stdDev = d => {
  const ave = average(d);
  let v = 0;
  d.forEach(_a => {
    v = v + Math.pow(_a - ave, 2);
  });
  return Math.sqrt(v / d.length);
};

class BasicErrorBarChart extends AbstractHighChart {
  static get observedAttributes () {
    return [
      'y-axis-title'
    ];
  }

  constructor () {
    super();

    this.options ={
      chart: {
        zoomType: 'x'
      },
      title: {
        text: ''
      },
      xAxis: {},
      yAxis: {
        title: {
          text: 'Rainfall'
        },
      },
      tooltip: {
        shared: true
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
    const d = [];
    data.ensembles.forEach(_a => {
      _a.data.forEach((_b, i) => {
        if (!d[i]) d[i] = [];
        d[i].push(_b);
      });
    });
    const aves = d.map(_a => {
      return average(_a);
    });
    const stds = d.map(_a => {
      return stdDev(_a);
    });
    const stdBars = aves.map((ave, idx) => {
      return [ave - stds[idx], ave + stds[idx]];
    });
    this.options.series = [{
      name: 'Rainfall',
      type: 'column',
      data: aves,
      tooltip: {
        pointFormat: '<span style="font-weight: bold; color: {series.color}">{series.name}</span>: <b>{point.y:.1f} mm</b> '
      }
    },
      {
      name: 'Rainfall error',
      type: 'errorbar',
      data: stdBars,
        tooltip: {
        pointFormat: '(error range: {point.low}-{point.high} mm)<br/>'
      }
    }
    ];
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

window.customElements.define('viz-basic-error-bar-chart', BasicErrorBarChart);
