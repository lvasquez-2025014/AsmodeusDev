import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, Conversation, Message, Notification, User } from '@models/index';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConversations(): Observable<ApiResponse<Conversation[]>> {
    return this.http.get<ApiResponse<Conversation[]>>(`${this.apiUrl}/chat/conversations`);
  }

  createConversation(participantId: string): Observable<ApiResponse<Conversation>> {
    return this.http.post<ApiResponse<Conversation>>(`${this.apiUrl}/chat/conversations`, { participantId });
  }

  getMessages(conversationId: string): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/chat/conversations/${conversationId}/messages`);
  }

  sendMessage(conversationId: string, content: string, type: string = 'text', replyToId?: string): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(`${this.apiUrl}/chat/conversations/${conversationId}/messages`, { content, type, replyToId });
  }

  deleteMessage(convId: string, msgId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/chat/conversations/${convId}/messages/${msgId}`);
  }

  addReaction(msgId: string, emoji: string): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(`${this.apiUrl}/chat/messages/${msgId}/reactions`, { emoji });
  }

  togglePin(msgId: string): Observable<ApiResponse<{ isPinned: boolean }>> {
    return this.http.put<ApiResponse<{ isPinned: boolean }>>(`${this.apiUrl}/chat/messages/${msgId}/pin`, {});
  }

  markAsRead(conversationId: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/chat/conversations/${conversationId}/read`, {});
  }

  getChatUsers(): Observable<ApiResponse<(User & { isOnline: boolean })[]>> {
    return this.http.get<ApiResponse<(User & { isOnline: boolean })[]>>(`${this.apiUrl}/chat/users`);
  }

  getNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/chat/notifications`);
  }

  markNotificationRead(id: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/chat/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/chat/notifications/read-all`, {});
  }

  sendHeartbeat(): Observable<{ success: boolean; token: string }> {
    return this.http.post<{ success: boolean; token: string }>(`${this.apiUrl}/chat/heartbeat`, {});
  }

  getOnlineUsers(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/chat/online`);
  }
}
