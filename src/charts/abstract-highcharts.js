import {html, render} from 'lit-html';
import HighChart from 'highcharts';

const template = html`
<style>
:host {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
<div class="chart" />
`;

export class AbstractHighChart extends window.HTMLElement {
  constructor () {
    super();

    const shadowRoot = this.attachShadow({mode: 'open'});
    render(template, shadowRoot);
  }

  connectedCallback () {
    this.options.chart.width = this.clientWidth;
    this.options.chart.height = this.clientHeight;
    this.render();
    window.addEventListener('resize', this.handleResize);
  }

  handleResize () {
    this.chart.setSize(this.clientWidth, this.clientHeight, false);
  }

  disconnectedCallback () {
    this.chart.destroy();
    window.removeEventListener('resize', this.handleResize);
  }

  render () {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = HighChart.chart(this.shadowRoot.querySelector('.chart'), this.options);
  }
}
