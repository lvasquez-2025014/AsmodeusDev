import { Component, OnInit } from '@angular/core';
import { ChatService } from '@core/services/chat.service';
import { Notification } from '@models/index';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  apiNotifications: Notification[] = [];

  get unreadNotifCount(): number {
    return this.apiNotifications.filter((n: any) => !n.isRead).length;
  }

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.chatService.getNotifications().subscribe({
      next: (res) => {
        if (res.data) {
          this.apiNotifications = res.data;
        }
      },
      error: () => {}
    });
  }

  markNotifRead(id: string): void {
    this.chatService.markNotificationRead(id).subscribe({
      next: () => {
        const n = this.apiNotifications.find((x: any) => x._id === id);
        if (n) n.isRead = true;
      },
      error: () => {}
    });
  }

  markAllNotifsRead(): void {
    this.chatService.markAllNotificationsRead().subscribe({
      next: () => {
        this.apiNotifications.forEach((n: any) => n.isRead = true);
      },
      error: () => {}
    });
  }
}
