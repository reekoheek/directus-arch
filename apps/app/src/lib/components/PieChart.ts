import { html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { Chart, PieController, ArcElement, Legend, Tooltip } from 'chart.js';

Chart.register(PieController, ArcElement, Legend, Tooltip);
const colors = [
  '#FF6384', // Red
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#66FF66', // Light Green
  '#FF6666', // Pink
  '#3399FF', // Light Blue
  '#FFCC99', // Peach
];

export interface PieData {
  key: string;
  value: number;
}

export type PieDatum = PieData[];

@customElement('c-pie-chart')
export class PieChart extends LitElement {
  @state()
  private _datum: PieData[] = [];

  @query('canvas')
  private canvas!: HTMLCanvasElement;

  private chart?: Chart<'pie', number[], string>;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  get datum() {
    return this._datum;
  }

  set datum(datum: PieData[]) {
    this._datum = datum;

    if (!this.chart) {
      return;
    }

    this.chart.data.labels = this.datum.map((data) => data.key);
    this.chart.data.datasets[0].data = this.datum.map((data) => data.value);
    this.chart.update();
  }

  firstUpdated(): void {
    this.chart = new Chart(this.canvas, {
      type: 'pie',
      data: {
        labels: this.datum.map((data) => data.key),
        datasets: [
          {
            data: this.datum.map((data) => data.value),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }

  protected render(): unknown {
    return html`
      <canvas></canvas>
    `;
  }
}
