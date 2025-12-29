// audio-storage.service.ts
import { Announcement, BuildingDocument, BuildingIssue, CoproBuilding, Resident, WorkItem } from '../building-models';
import { BuildingServiceDemo } from './building-service-demo';

export interface BuildingService {
    
    getBuilding(id: any): CoproBuilding;

    getTopic(reference): Resident | BuildingDocument | BuildingIssue | Announcement | WorkItem;

}

export function buildingServiceFactory(type: string): BuildingService | undefined {
    if (type === 'DEMO') {
        return new BuildingServiceDemo();
    }

    return undefined;
}
