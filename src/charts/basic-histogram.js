import {AbstractHighChart} from './abstract-highcharts';

const groupBy = (items, keyfunc) => {
  const groups = new Map();
  for (const item of items) {
    const key = keyfunc(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }
  return groups;
};

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
        type: 'column'
      },
      title: {
        text: ''
      },
      series: [
      ],
      yAxis: {
        title: {
          text: ''
        }
      },
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
        this.options.yAxis.title.text = this.yAxisTitle;
        break;
    }
  }

  load (data, options) {
    const bins = options.bins;
    const max = Math.max(...data.ensembles.map(ensemble => {
      return Math.max(...ensemble.data);
    }));
    const min = Math.min(...data.ensembles.map(ensemble => {
      return Math.min(...ensemble.data);
    }));

    const h = (max - min) / bins;
    const models = groupBy(data.ensembles, ensemble => ensemble.name.split('/')[1]);
    this.options.series = Array.from(models.entries()).map(([key, ensembles]) => {
      return {
        name: key,
        data: [...Array(bins).keys()].map(idx => {
          const start = h * idx + min;
          const end = h * (idx + 1) + min;
          let count = 0;
          for (const ensemble of ensembles) {
            count += ensemble.data.filter(d => start <= d && d < end).length;
          }
          return [start, count];
        })
      };
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
