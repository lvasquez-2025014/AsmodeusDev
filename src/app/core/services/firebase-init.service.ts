import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class FirebaseInitService {
  private app: FirebaseApp | null = null;
  auth: Auth | null = null;
  googleProvider: GoogleAuthProvider | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(private configService: ConfigService) {}

  init(): Promise<void> {
    if (this.app) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.configService.loadConfig()
      .then(() => {
        const cfg = this.configService.getFirebaseConfig();
        if (cfg && cfg.apiKey) {
          this.app = initializeApp(cfg);
          this.auth = getAuth(this.app);
          this.googleProvider = new GoogleAuthProvider();
          this.googleProvider.addScope('email');
          this.googleProvider.addScope('profile');
        } else {
          console.error('[Firebase] Config missing apiKey');
        }
      })
      .catch(err => {
        console.error('[Firebase] Init error:', err);
      });

    return this.initPromise;
  }

  isReady(): boolean {
    return this.app !== null && this.auth !== null;
  }
}
