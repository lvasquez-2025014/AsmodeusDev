import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseInitService {
  private app: FirebaseApp;
  auth: Auth;
  googleProvider: GoogleAuthProvider;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
  }
}
