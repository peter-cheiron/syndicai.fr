export type DashboardItemType = "bulletin" | "issue" | "task";

export interface DashboardItem {
  id: string;
  type: DashboardItemType;
  title: string;
  detail?: string;
  status?: string;
  date?: string;
  buildingName?: string;
  image?:string;
}

