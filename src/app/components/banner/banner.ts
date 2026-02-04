import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrls: ['./banner.css']
})
export class BannerComponent {
  // Podés pasarle el nombre del local desde el Home
  @Input() titulo: string = '¡Bienvenidos a Nuestro Menú!';
  @Input() subtitulo: string = 'Disfrutá de los mejores platos con ingredientes frescos.';
}
