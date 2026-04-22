import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-buscador-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './buscador-proveedores.html',
  styleUrl: './buscador-proveedores.css'
})
export class BuscadorProveedoresComponent implements OnInit {

  filtroTipo: string = '';
  filtroSector: string = '';
  filtroUbicacion: string = '';
  textoBusqueda: string = '';

  cargando: boolean = false;
  error: boolean = false;

  proveedoresFiltrados: any[] = [];
  todosProveedores: any[] = [];

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit() {
    this.buscarEnWikidata();
  }

  buscarEnWikidata() {
    this.cargando = true;
    this.error = false;

    let terminado = false;

    // ⏳ Timeout de seguridad
    const timeout = setTimeout(() => {
      if (!terminado) {
        console.warn('Timeout → usando datos locales');
        this.cargarProveedoresReales();
        this.cargando = false;
        this.filtrar();
      }
    }, 3000);

    // 🔎 Query mejorada
    const query = `
      SELECT ?empresaLabel ?paisLabel WHERE {
        ?empresa wdt:P31 wd:Q783794.
        ?empresa wdt:P17 wd:Q29.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
      }
      LIMIT 10
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

    console.log('Llamando a Wikidata...');

    fetch(url)
      .then(r => r.json())
      .then((data: any) => {
        terminado = true;
        clearTimeout(timeout);

        this.ngZone.run(() => {

          const resultados = data.results.bindings;

          if (resultados.length > 0) {
            this.todosProveedores = resultados.map((r: any) => ({
              nombre: r.empresaLabel?.value || 'Sin nombre',
              ubicacion: r.paisLabel?.value || 'España',
              sitioWeb: null,
              descripcion: 'Empresa verificada en Wikidata.',
              icono: '🏭',
              tags: ['Wikidata', 'Verificada'],
              tipo: 'general',
              tipoLabel: 'Empresa',
              sector: 'Industria',
              filtroSector: '',
              filtroUbicacion: '',
              razonSostenible: 'Empresa verificada en Wikidata.'
            }));
          } else {
            this.cargarProveedoresReales();
          }

          this.cargando = false;
          this.filtrar();
        });
      })
      .catch(err => {
        terminado = true;
        clearTimeout(timeout);

        this.ngZone.run(() => {
          this.error = true;
          this.cargarProveedoresReales();
          this.cargando = false;
          this.filtrar();
        });
      });
  }

  cargarProveedoresReales() {
    this.todosProveedores = [
      {
        nombre: 'Acciona',
        icono: '🌬️',
        descripcion: 'Grupo empresarial español líder en energías renovables, agua y servicios.',
        razonSostenible: 'Una de las mayores empresas de energía renovable del mundo.',
        tags: ['Energía renovable', 'ISO 14001', 'ESG'],
        tipo: 'energia',
        tipoLabel: 'Energía renovable',
        sector: 'Manufactura',
        ubicacion: 'España',
        sitioWeb: 'https://www.acciona.com',
        filtroSector: 'manufactura',
        filtroUbicacion: 'españa'
      },
      {
        nombre: 'Iberdrola',
        icono: '⚡',
        descripcion: 'Compañía energética española.',
        razonSostenible: 'Líder mundial en energía eólica.',
        tags: ['Eólica', 'Solar', 'Cero emisiones'],
        tipo: 'energia',
        tipoLabel: 'Energía renovable',
        sector: 'Manufactura',
        ubicacion: 'España',
        sitioWeb: 'https://www.iberdrola.com',
        filtroSector: 'manufactura',
        filtroUbicacion: 'españa'
      }
    ];
  }

  filtrar() {
    this.proveedoresFiltrados = this.todosProveedores.filter(p => {
      const okTipo      = !this.filtroTipo      || p.tipo === this.filtroTipo || p.tipo === 'general';
      const okSector    = !this.filtroSector    || p.filtroSector === this.filtroSector || p.filtroSector === '';
      const okUbicacion = !this.filtroUbicacion || p.filtroUbicacion === this.filtroUbicacion || p.filtroUbicacion === '';
      const okTexto     = !this.textoBusqueda   || p.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      return okTipo && okSector && okUbicacion && okTexto;
    });

    console.log('Filtrados:', this.proveedoresFiltrados.length);
  }

  limpiarFiltros() {
    this.filtroTipo = '';
    this.filtroSector = '';
    this.filtroUbicacion = '';
    this.textoBusqueda = '';
    this.filtrar();
  }

  abrirWeb(url: string) {
    if (url) window.open(url, '_blank');
  }

  trackByNombre(index: number, item: any): string {
    return item.nombre;
  }
}
