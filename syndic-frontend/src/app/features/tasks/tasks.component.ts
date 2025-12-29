import { CommonModule } from '@angular/common';
import { AuthService } from '#services/auth';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { DbTaskService } from './services/task-service';
import { Task } from './services/task';
import { ActivatedRoute } from '@angular/router';
import { TimeToDatePipe } from '#pipes/timetodate';

@Component({
  selector: 'tasks',
  imports: [CommonModule, TimeToDatePipe],
  templateUrl: './tasks.component.html',
  standalone: true
})
export class TasksComponent {

  route = inject(ActivatedRoute)

  auth = inject(AuthService);
  user = computed(() => this.auth.user())

  taskService = inject(DbTaskService)
  tasks = signal<Task[]>([])
  selectedTask = signal<Task | null>(null)

  constructor(){
    effect(() => {
      if(this.user()){
        this.taskService.listYours(this.user().uid).then(docs => {
          this.tasks.set(docs)
          if(!this.selectedTask() && docs.length > 0){
            this.selectedTask.set(docs[0])
          }
        })
      }
    })
  }

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get("id")
    if(id){
      //todo get the specific task and display the details
    }
  }

  selectTask(task: Task){
    this.selectedTask.set(task)
  }

}
