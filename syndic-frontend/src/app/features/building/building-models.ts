// --- Basic types ---------------------------------------------------------

export type ManagementType = 'benevole' | 'pro';

export type IssueCategory =
  | 'heating'
  | 'noise'
  | 'water'
  | 'waste'
  | 'elevator'
  | 'humidity'
  | 'pests';

export type IssueStatus = 'open' | 'in-progress' | 'resolved';

export type WorkStatus = 'planned' | 'in-progress' | 'done';

export type AnnouncementKind = 'works' | 'info';

// --- People --------------------------------------------------------------

export interface Resident {
  id: string;
  name: string;
  lot: string;   // e.g. "3B"
  owner: boolean;
  thousandths: number; // millemes for cost allocation
  image?: string;
}

export interface VolunteerManager {
  name: string;
  email: string;
  since: string; // ISO date
}

// --- Rules ---------------------------------------------------------------

export interface WastePolicy {
  binsOut: string;
  recyclingRules: string;
}

export interface PetsPolicy {
  allowed: boolean;
  rules: string;
}

export interface RenovationPolicy {
  noticeRequired: string;
  forbiddenHours: string;
}

export interface SmokingPolicy {
  forbiddenAreas: string[];
  notes: string;
}

export interface Rules {
  quietHours: string;
  wastePolicy: WastePolicy;
  pets: PetsPolicy;
  renovationPolicy: RenovationPolicy;
  smoking: SmokingPolicy;
  image?: string;
}

// --- History / issues ----------------------------------------------------

//somewhat like a ticket
export interface BuildingIssue {
  id: string;
  title: string;
  category: IssueCategory;
  status: IssueStatus;
  reportedBy: string; // resident id
  date: string;       // ISO
  description: string;
  resolution: string | null;
  image?: string;
}

// --- Announcements / works / docs / AGM ---------------------------------

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;        // ISO
  kind: AnnouncementKind;
  image?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  status: WorkStatus;
  startDate: string;
  endDate: string | null;
  budget: number;
  contractor: string;
  image?: string;
}

export interface BuildingDocument {
  id: string;
  language: string;
  date: Date;
  content: any;
  buildingId: string;
  type: string;
  title: string;
  tags: string[];
  url?: string;
  text?: string;       // optional inline text (e.g. extracted copro rules)
}

/*
export interface AGM {
  id: string;
  date: string;
  location: string;
  topics: string[];
  documents: string[]; // document ids
}*/

// --- Root building / copro model ----------------------------------------

export interface CoproBuilding {
  id: string;
  name: string;
  address: string;
  floors: number;
  lots: number;
  elevator: boolean;
  yearBuilt: number;
  managementType: ManagementType;
  volunteerManager: VolunteerManager;
  residents: Resident[];
  rules: Rules;
  history: BuildingIssue[];
  announcements: Announcement[];
  works: WorkItem[];
  documents: BuildingDocument[];
  image?: string;
  //AGM: AGM[]; its a document type now
}
