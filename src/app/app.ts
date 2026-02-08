import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {RegistroEmpresaComponent} from './components/registro-empresa/registro-empresa';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RegistroEmpresaComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('UT4');
}
