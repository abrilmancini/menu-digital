import { Component, Input } from '@angular/core'; // Agregamos Input aquí
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-nav.html',
  styleUrls: ['./quick-nav.css']
})
export class QuickNavComponent {
  // Esta línea ahora funcionará sin el subrayado rojo
  @Input() categories: any[] = []; 
}