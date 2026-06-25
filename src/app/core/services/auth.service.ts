import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, UserCredential, getRedirectResult } from 'firebase/auth';
import { FirebaseInitService } from './firebase-init.service';
import { environment } from '@env/environment';
import { LoginRequest, LoginResponse, ApiResponse } from '@models/index';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private firebaseInit: FirebaseInitService
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      map((res) => res.data),
      tap((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
    );
  }

  register(data: { name: string; email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/register`, data).pipe(
      map((res) => res.data),
      tap((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
    );
  }

  googleLogin(): Promise<LoginResponse> {
    return this.firebaseInit.init().then(async () => {
      if (!this.firebaseInit.auth || !this.firebaseInit.googleProvider) {
        throw new Error('Firebase no configurado correctamente');
      }
      try {
        const result = await signInWithPopup(this.firebaseInit.auth, this.firebaseInit.googleProvider);
        return this.handleGoogleResult(result);
      } catch (err: any) {
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(this.firebaseInit.auth, this.firebaseInit.googleProvider);
          return undefined as any;
        }
        throw err;
      }
    }) as Promise<LoginResponse>;
  }

  async handleRedirectLogin(): Promise<LoginResponse | null> {
    await this.firebaseInit.init();
    if (!this.firebaseInit.auth) return null;
    try {
      const result = await getRedirectResult(this.firebaseInit.auth);
      if (result) {
        return this.handleGoogleResult(result as UserCredential);
      }
    } catch {}
    return null;
  }

  private async handleGoogleResult(result: UserCredential): Promise<LoginResponse> {
    const idToken = await result.user.getIdToken();
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/google`, { idToken })
      .pipe(
        map((res) => res.data),
        tap((data) => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        })
      ).toPromise() as Promise<LoginResponse>;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get user(): LoginResponse['user'] | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
