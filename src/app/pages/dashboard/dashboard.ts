import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

import { EmpresaService } from '../../services/empresa';
import { GamificacionService } from '../../services/gamificacion.service';
import { InsightsService } from '../../services/insights.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  impactos: any[] = [];
  sinDatos = true;

  nombreEmpresa = 'Empresa';
  sectorEmpresa = '';

  totalEnergia = 0;
  totalAgua = 0;
  totalCo2 = 0;
  totalResiduos = 0;

  badgeEnergia = '';
  badgeAgua = '';
  badgeCo2 = '';
  badgeResiduos = '';

  textoEnergia = '';
  textoAgua = '';
  textoCo2 = '';
  textoResiduos = '';

  indicePorcentaje = 0;
  indiceClase = '';
  indiceMensaje = '';

  graficoLineas?: Chart;
  graficoDona?: Chart;

  puntos = 0;
  medallas: string[] = [];

  insights: string[] = [];

  @ViewChild('graficoLineas') graficoLineasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoDona') graficoDonaRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private empresaService: EmpresaService,
    private gamificacionService: GamificacionService,
    private insightsService: InsightsService
  ) {}

  ngOnInit() {

    // Usuario
    const usuarioData = localStorage.getItem('usuario');

    if (usuarioData) {
      const usuario = JSON.parse(usuarioData);
      this.nombreEmpresa = usuario.nombre || 'Empresa';
      this.sectorEmpresa = usuario.sector || '';
    }

    // Impactos
    const data = sessionStorage.getItem('impactos');

    if (data) {
      this.impactos = JSON.parse(data);

      if (this.impactos.length > 0) {

        this.sinDatos = false;

        this.calcularKPIs();
        this.calcularIndice();

        this.puntos = this.gamificacionService.calcularPuntos(this.impactos);
        this.medallas = this.gamificacionService.obtenerMedallas(this.puntos);

        // 🔥 INSIGHTS (aquí estaba el cambio importante)
        this.insights = this.insightsService.generar(this.impactos);

        setTimeout(() => {
          this.crearGraficoLineas();
          this.crearGraficoDona();
        }, 100);
      }
    }
  }

  calcularKPIs() {

    this.totalEnergia = this.impactos.reduce((s, i) => s + (i.energia || 0), 0);
    this.totalAgua = this.impactos.reduce((s, i) => s + (i.agua || 0), 0);
    this.totalCo2 = this.impactos.reduce((s, i) => s + (i.co2 || 0), 0);
    this.totalResiduos = this.impactos.reduce((s, i) => s + (i.residuos || 0), 0);

    const n = this.impactos.length;

    this.badgeEnergia = this.calcBadge(this.totalEnergia, 1200 * n);
    this.badgeAgua = this.calcBadge(this.totalAgua, 5000 * n);
    this.badgeCo2 = this.calcBadge(this.totalCo2, 500 * n);
    this.badgeResiduos = this.calcBadge(this.totalResiduos, 300 * n);

    this.textoEnergia = this.textoEstado(this.badgeEnergia);
    this.textoAgua = this.textoEstado(this.badgeAgua);
    this.textoCo2 = this.textoEstado(this.badgeCo2);
    this.textoResiduos = this.textoEstado(this.badgeResiduos);
  }

  calcBadge(valor: number, ref: number): string {
    if (valor <= ref * 0.8) return 'badge-verde';
    if (valor <= ref) return 'badge-amarillo';
    return 'badge-rojo';
  }

  textoEstado(badge: string): string {
    if (badge === 'badge-verde') return '✅ Eficiente';
    if (badge === 'badge-amarillo') return '⚠️ Mejorable';
    return '🔴 Alto';
  }

  calcularIndice() {

    const badges = [
      this.badgeEnergia,
      this.badgeAgua,
      this.badgeCo2,
      this.badgeResiduos
    ];

    const puntos = badges.reduce((suma, b) => {
      if (b === 'badge-verde') return suma + 100;
      if (b === 'badge-amarillo') return suma + 50;
      return suma + 10;
    }, 0);

    this.indicePorcentaje = Math.round(puntos / 4);

    if (this.indicePorcentaje >= 80) {
      this.indiceClase = 'indice-verde';
      this.indiceMensaje = '🟢 Muy bien, sigue así';
    } else if (this.indicePorcentaje >= 40) {
      this.indiceClase = 'indice-amarillo';
      this.indiceMensaje = '🟡 Puedes mejorar';
    } else {
      this.indiceClase = 'indice-rojo';
      this.indiceMensaje = '🔴 Necesitas mejorar mucho';
    }
  }

  crearGraficoLineas() {

    if (!this.graficoLineasRef) return;
    if (this.graficoLineas) this.graficoLineas.destroy();

    const etiquetas = this.impactos.map((_, i) => `Registro ${i + 1}`);

    this.graficoLineas = new Chart(this.graficoLineasRef.nativeElement, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Energía',
            data: this.impactos.map(i => i.energia),
            tension: 0.4,
            fill: true
          },
          {
            label: 'Agua',
            data: this.impactos.map(i => i.agua),
            tension: 0.4,
            fill: true
          }
        ]
      }
    });
  }

  crearGraficoDona() {

    if (!this.graficoDonaRef) return;
    if (this.graficoDona) this.graficoDona.destroy();

    this.graficoDona = new Chart(this.graficoDonaRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Energía', 'Agua', 'CO₂', 'Residuos'],
        datasets: [{
          data: [
            this.totalEnergia,
            this.totalAgua,
            this.totalCo2,
            this.totalResiduos
          ],
          backgroundColor: ['#f59e0b', '#3b82f6', '#6b7280', '#10b981'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}
