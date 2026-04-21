import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {

  isLoggedIn: boolean = false;
  nombreEmpresa: string = '';

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.checkLogin();

    // Escucha cuando el localStorage cambia (para el login/logout)
    window.addEventListener('storage', () => {
      this.checkLogin();
    });

    // cada vez q cambiamos de ruta se vuelve a ejecutar checkLogin
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLogin();
      });
  }

  // Busca si existe un usuario guardado
  checkLogin() {

    // 🔐 Validar token
    if (!this.auth.isLogged()) {
      this.isLoggedIn = false;
      this.nombreEmpresa = '';
      return;
    }

    // Si el token es válido, obtenemos usuario
    const usuario = this.auth.getUser();

    if (usuario) {
      this.isLoggedIn = true;
      this.nombreEmpresa = usuario.nombre || 'Empresa';
    } else {
      this.isLoggedIn = false;
    }
  }


  logout() {
    this.auth.logout();
    sessionStorage.clear();

    this.isLoggedIn = false;
    this.nombreEmpresa = '';

    this.router.navigate(['/home']);
  }

}
