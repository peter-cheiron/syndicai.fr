import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BuildingDocument } from '../../building/building-models';
import { DocViewerComponent } from "./doc-viewer";

@Component({
  selector: 'building-document-item',
  standalone: true,
  imports: [CommonModule, DocViewerComponent],
  templateUrl: './document-item.component.html'
})
export class DocumentItemComponent {
  @Input({ required: true }) document!: BuildingDocument;
}
