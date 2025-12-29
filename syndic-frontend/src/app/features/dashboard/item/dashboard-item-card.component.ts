import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TimeToDatePipe } from "#pipes/timetodate";
import { DashboardItem, DashboardItemType } from "../item/dashboard-item.model";

type DashboardCardVariant = "primary" | "danger" | "warning";

@Component({
  selector: "app-dashboard-item-card",
  standalone: true,
  imports: [CommonModule, TimeToDatePipe],
  templateUrl: "./dashboard-item-card.component.html",
})
export class DashboardItemCardComponent {
  @Input({ required: true }) item!: DashboardItem;
  @Input({ required: true }) label!: string;
  @Input({ required: true }) icon!: string;
  @Input() variant: DashboardCardVariant = "primary";
  @Input() useTimeToDate = false;

  @Output() tileAction = new EventEmitter<{
    action: "ai" | "open";
    type: DashboardItemType;
    id: string;
  }>();

  emitAction(action: "ai" | "open"): void {
    this.tileAction.emit({ action, type: this.item.type, id: this.item.id });
  }
}

