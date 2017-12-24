import {html, render} from 'lit-html';
import HighCharts from 'highcharts';
import HighChartsMore from 'highcharts/highcharts-more';
HighChartsMore(HighCharts);


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
    // TODO use redraw
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = HighCharts.chart(this.shadowRoot.querySelector('.chart'), this.options);
  }
}
