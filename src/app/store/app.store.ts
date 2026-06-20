import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '@models/index';

@Injectable({ providedIn: 'root' })
export class AppStore {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  setUser(user: User | null): void {
    this.userSubject.next(user);
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }
}
