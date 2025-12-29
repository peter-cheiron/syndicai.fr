import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { buildingServiceFactory } from '../building/services/building-service';
import { BuildingDocument, CoproBuilding } from '../building/building-models';
import { DocumentItemComponent } from './document-viewer/document-item.component';

@Component({
  selector: 'building-documents',
  imports: [CommonModule, DocumentItemComponent],
  templateUrl: './documents.component.html',
  standalone: true
})
export class DocumentsComponent {

  //TODO inject from user profile
  buildingService = buildingServiceFactory("DEMO");
  building: CoproBuilding | undefined = this.buildingService?.getBuilding("copro-001");
  documents: BuildingDocument[] = this.building?.documents ?? [];
  selectedDocument = signal<BuildingDocument | null>(this.documents[0] ?? null);

  selectDocument(document: BuildingDocument): void {
    this.selectedDocument.set(document);
  }

  documentPreview(document: BuildingDocument): string {
    const text = document.text || '';
    const limit = 90;
    if (!text) return 'Aucun résumé disponible.';
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  }

}
