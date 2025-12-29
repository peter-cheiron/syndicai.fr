import { Component, effect, inject, input, output, signal } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';

import { BuildingIssue, CoproBuilding } from '../building/building-models';
import { buildingServiceFactory } from '../building/services/building-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ui-ticket-board',
  standalone: true,
  imports: [NgClass],
  templateUrl: './ticket-board.component.html',
})
export class TicketBoardComponent {

  route = inject(ActivatedRoute)

  //TODO inject from user profile
  buildingService = buildingServiceFactory("DEMO");
  building: CoproBuilding | undefined = this.buildingService?.getBuilding("copro-001");

  tickets = input<BuildingIssue[]>(this.building?.history ?? []);
  selectedTicket = signal<BuildingIssue | null>(null);
  config = input<TicketBoardConfig>({
    title: 'Tickets',
    emptyStateText: 'No tickets yet.',
    showEntityColumn: false,
    showCategory: true,
    showStatusBadge: true,
    statusLabels: {
      open: 'Open',
      'in-progress': 'In progress',
      resolved: 'Resolved',
    },
    statusColors: {
      open: 'bg-amber-100 text-amber-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-emerald-100 text-emerald-800',
    },
  });

  ticketClick = output<BuildingIssue>();

  constructor() {
    effect(() => {
      //sort tickets open first then in progress and after resolved
      const list = this.tickets().sort((a,b) => {
        if(a.status === "open"){
          return - 1
        }else {
          if(a.status === "in-progress" && b.status !== "open"){
            return -1
          }else {
            0
          }
          return 0;
        }
      });

      const current = this.selectedTicket();

      if (!list?.length) {
        if (current !== null) this.selectedTicket.set(null);
        return;
      }

      if (!current || !list.find((item) => item.id === current.id)) {
        this.selectedTicket.set(list[0]);
      }
    });
  }

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get("id")
    if(id){
      const selected = this.tickets().find((ticket) => ticket.id === id);
      if (selected) this.selectedTicket.set(selected);
    }
  }

  onClick(ticket: BuildingIssue) {
    this.selectedTicket.set(ticket);
    const cfg = this.config();
    if (cfg.onTicketClick) cfg.onTicketClick(ticket);
    this.ticketClick.emit(ticket);
  }

  labelForStatus(status: string): string {
    return this.config().statusLabels?.[status] ?? status;
  }

  classForStatus(status: string): string {
    return this.config().statusColors?.[status] ?? '';
  }
}

interface TicketBoardConfig {
  title: string;
  emptyStateText: string;
  showEntityColumn: boolean;
  showCategory: boolean;
  showStatusBadge: boolean;
  statusLabels?: Record<string, string>;
  statusColors?: Record<string, string>;
  entityLabel?: string;
  onTicketClick?: (ticket: BuildingIssue) => void;
}
