import { Component, computed, effect, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { buildingServiceFactory } from '../building/services/building-service';
import { Announcement, AnnouncementKind } from '../building/building-models';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '#services/auth';
import { DbUserService } from '#services/db';


@Component({
  standalone: true,
  selector: 'bulletin-board',
  imports: [CommonModule, FormsModule],
  templateUrl: './bulletin-board.component.html',
})
export class BulletinBoardComponent implements OnInit {

  auth = inject(AuthService)
  profileService = inject(DbUserService)
  user = computed(() => this.auth.user())

  route = inject(ActivatedRoute)

  @Input({ required: true }) contextId!: string;  // e.g. buildingId
  @Input() contextType?: string; 
  //TODO add a role that allows posting or not                // e.g. 'building'
  @Input() canPost = false;                      // allow posting UI
  @Input() currentUserName = 'Syndic';           // for demo
  @Input() currentUserId = 'syndic-1';

  buildingService = buildingServiceFactory("DEMO");
  building;
  items = signal<Announcement[]>([]);
  selectedBulletin = signal<Announcement | null>(null);

  // new bulletin form
  newTitle = signal('');
  newBody = signal('');
  newLevel = signal<AnnouncementKind>('info');

  constructor(){
    effect(() => {
      if(this.user()){
        this.profileService.getById(this.user().uid).then(profile => {
          if(profile.roles.includes("CAN_POST_BULLETIN")){
            this.canPost = true;
          }
          this.currentUserId = this.user().uid
          this.currentUserName = profile.displayName
        })
      }
    })
  }

  ngOnInit(): void {
    this.building = this.buildingService.getBuilding(this.contextId);
    this.items.set(
      [...this.building.announcements].sort(
        (a, b) => Date.parse(b.date) - Date.parse(a.date)
      )
    );

    if (this.items().length) {
      this.selectedBulletin.set(this.items()[0]);
    }

    const id = this.route.snapshot.paramMap.get("id")
    if(id){
      const bulletin = this.items().find(item => item.id === id);
      if (bulletin) {
        this.selectedBulletin.set(bulletin);
      }
    }

  }

  /*
  postBulletin() {
    const title = this.newTitle().trim();
    const body = this.newBody().trim();
    if (!title || !body) return;

    this.board.post(
      this.contextId,
      this.contextType,
      title,
      body,
      this.newLevel(),
      {
        id: this.currentUserId,
        name: this.currentUserName,
        role: 'syndic', // or 'ai' / 'resident' depending on context
      },
    );

    this.newTitle.set('');
    this.newBody.set('');
    this.newLevel.set('info');
  }*/

  levelLabel(level: AnnouncementKind): string {
    switch (level) {
      case 'works':
        return 'Travaux';
      case 'info':
        return 'Info';
    }
  }

  selectBulletin(item: Announcement): void {
    this.selectedBulletin.set(item);
  }

  bodyPreview(message: string): string {
    const limit = 120;
    if (!message) return '';
    return message.length > limit ? `${message.slice(0, limit)}…` : message;
  }
}
