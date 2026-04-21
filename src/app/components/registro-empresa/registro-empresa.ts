import { Component, OnInit } from '@angular/core'; // Añadimos OnInit aquí
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa } from '../../models/empresa.model';
import { EmpresaService } from '../../services/empresa';

@Component({
  selector: 'app-registro-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-empresa.html',
  styleUrl: './registro-empresa.css'
})
export class RegistroEmpresaComponent implements OnInit {

  nuevaEmpresa: Empresa = {
    numeroRegistro: '',
    nombre: '',
    sector: '',
    pais: '',
    ciudad: '',
    tamano: 'mediana',
    correoContacto: '',
    password: ''
  };

  listaEmpresas: Empresa[] = [];

  // Inyectamos el Router
  constructor(
    private empresaService: EmpresaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  // Llamamos al servicio para pedir todas las empresas
  cargarEmpresas() {
    this.empresaService.findAll().subscribe({
      next: (data) => this.listaEmpresas = data,
      error: (err) => console.error('Error al cargar:', err)
    });
  }

  onSubmit() {
    this.empresaService.saveEmpresa(this.nuevaEmpresa).subscribe({
      next: (data) => {

        localStorage.setItem('usuario', JSON.stringify(data));

        this.router.navigate(['/dashboard']);
      },
      error: (err) => alert('Error al guardar la empresa')
    });
  }

  limpiarFormulario() {
    this.nuevaEmpresa = {
      numeroRegistro: '',
      nombre: '',
      sector: '',
      pais: '',
      ciudad: '',
      tamano: 'mediana',
      correoContacto: '',
      password: ''
    };
  }

  // Función para cerrar sesión
  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
