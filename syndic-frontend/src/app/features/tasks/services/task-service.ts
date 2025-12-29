import { DbInstanceService } from "#services/db/db-instance.service";
import { Injectable } from "@angular/core";
import { Task } from "./task";

@Injectable({ providedIn: 'root' })
export class DbTaskService extends DbInstanceService<Task> {

    constructor(){
        super();
        this.collectionName = 'tasks';
    }

}