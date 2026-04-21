import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComunidadService } from '../../services/comunidad.service';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunidad.html',
  styleUrl: './comunidad.css'
})
export class ComunidadComponent implements OnInit {

  posts: any[] = [];
  nuevoPost: string = '';
  nombreEmpresa: string = '';

  constructor(private comunidadService: ComunidadService) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.nombreEmpresa = usuario.nombre || 'Empresa';

    this.cargarPosts();
  }

  cargarPosts() {
    this.comunidadService.getPosts().subscribe(data => {
      this.posts = data;
    });
  }

  publicar() {
    const post = {
      autor: this.nombreEmpresa,
      texto: this.nuevoPost
    };

    this.comunidadService.crearPost(post).subscribe(() => {
      this.nuevoPost = '';
      this.cargarPosts();
    });
  }

  darLike(post: any) {
    this.comunidadService.likePost(post.id).subscribe(() => {
      this.cargarPosts();
    });
  }

  comentar(post: any, texto: string) {
    if (!texto.trim()) return;

    this.comunidadService.addComentario(post.id, texto)
      .subscribe(() => {
        this.cargarPosts(); // recarga todo
      });
  }
}
