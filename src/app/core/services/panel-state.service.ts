import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PanelStateService {
  private activeSectionSubject = new BehaviorSubject<string>('dashboard');
  activeSection$: Observable<string> = this.activeSectionSubject.asObservable();

  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  sidebarCollapsed$: Observable<boolean> = this.sidebarCollapsedSubject.asObservable();

  private mobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
  mobileMenuOpen$: Observable<boolean> = this.mobileMenuOpenSubject.asObservable();

  get activeSection(): string { return this.activeSectionSubject.value; }
  get sidebarCollapsed(): boolean { return this.sidebarCollapsedSubject.value; }
  get mobileMenuOpen(): boolean { return this.mobileMenuOpenSubject.value; }

  setActiveSection(section: string): void { this.activeSectionSubject.next(section); }
  toggleSidebar(): void { this.sidebarCollapsedSubject.next(!this.sidebarCollapsedSubject.value); }
  toggleMobileMenu(): void { this.mobileMenuOpenSubject.next(!this.mobileMenuOpenSubject.value); }
  closeMobileMenu(): void { this.mobileMenuOpenSubject.next(false); }
}
