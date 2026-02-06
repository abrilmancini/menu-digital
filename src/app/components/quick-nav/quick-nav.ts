import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category } from '../../core/interfaces/category';

@Component({
  selector: 'app-quick-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-nav.html',
  styleUrls: ['./quick-nav.css']
})
export class QuickNavComponent {
  @Input() categories: Category[] = [];
  @Output() onSelect = new EventEmitter<number | null>();
  selectedId: number | null = null;

  selectCategory(categoryId: number | null): void {
    this.selectedId = categoryId;
    this.onSelect.emit(categoryId);
  }
}
