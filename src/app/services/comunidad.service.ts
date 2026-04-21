import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ComunidadService {

  constructor(private http: HttpClient) {}

  getPosts() {
    return this.http.get<any[]>('/api/posts');
  }

  crearPost(post: any) {
    return this.http.post('/api/posts', post);
  }

  likePost(id: number) {
    return this.http.put(`/api/posts/${id}/like`, {});
  }

  addComentario(postId: number, texto: string) {
    return this.http.post(`/api/comentarios/${postId}`, {
      texto,
      autor: localStorage.getItem('usuarioNombre')
    });
  }

  getComentarios(postId: number) {
    return this.http.get<any[]>(`/api/comentarios/${postId}`);
  }
}
