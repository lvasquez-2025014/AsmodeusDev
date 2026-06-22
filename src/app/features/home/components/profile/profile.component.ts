import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;

  imageUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  profileForm = { name: '', bio: '', discord: '', country: '', phone: '' };
  profileError = '';
  profileSuccess = '';
  profileSaving = false;

  avatarUrlInput = '';
  showAvatarInput = false;

  viewUserProfile: any = null;

  private userColors: Record<string, string> = {};
  private colorPalette = [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
    '#3498db', '#9b59b6', '#e84393', '#00b894', '#6c5ce7',
    '#fd79a8', '#00cec9', '#a29bfe', '#ffeaa7', '#fab1a0',
    '#74b9ff', '#55efc4', '#ff7675', '#fdcb6e', '#a29bfe'
  ];

  constructor(
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.user;
    if (this.user) {
      this.loadProfile();
    }
  }

  loadProfile(): void {
    this.profileForm = {
      name: this.user?.name || '',
      bio: this.user?.bio || '',
      discord: this.user?.discord || '',
      country: this.user?.country || '',
      phone: this.user?.phone || '',
    };
    this.profileError = '';
    this.profileSuccess = '';
  }

  saveProfile(): void {
    this.profileSaving = true;
    this.profileError = '';
    this.profileSuccess = '';
    this.api.put<any>('profile', this.profileForm).subscribe({
      next: (res) => {
        this.profileSaving = false;
        this.profileSuccess = 'Perfil actualizado';
        const updated = res.data;
        this.user = { ...this.user, ...updated };
        localStorage.setItem('user', JSON.stringify(this.user));
        setTimeout(() => this.profileSuccess = '', 3000);
      },
      error: (err) => {
        this.profileSaving = false;
        this.profileError = err.error?.message || 'Error al guardar';
      }
    });
  }

  toggleAvatarInput(): void {
    this.showAvatarInput = !this.showAvatarInput;
    if (!this.showAvatarInput) this.avatarUrlInput = '';
  }

  saveAvatarUrl(): void {
    const url = this.avatarUrlInput.trim();
    if (!url) return;
    this.api.put<any>('profile', { avatar: url }).subscribe({
      next: (res) => {
        this.user = { ...this.user, avatar: url };
        localStorage.setItem('user', JSON.stringify(this.user));
        this.showAvatarInput = false;
        this.avatarUrlInput = '';
        this.showToast('Avatar actualizado', 'Tu foto de perfil se ha cambiado', 'success');
      },
      error: () => {}
    });
  }

  viewUserProfileById(userId: string): void {
    this.api.get<any>(`profile/${userId}`).subscribe({
      next: (res) => {
        this.viewUserProfile = res.data;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.showToast('Error', 'No se pudo cargar el perfil del usuario', 'error');
      }
    });
  }

  closeUserProfile(): void {
    this.viewUserProfile = null;
  }

  getUserColor(name: string): string {
    if (!name) return this.colorPalette[0];
    if (this.userColors[name]) return this.userColors[name];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % this.colorPalette.length;
    this.userColors[name] = this.colorPalette[idx];
    return this.userColors[name];
  }

  toasts: { id: number; title: string; message: string; type: string }[] = [];
  private toastCounter = 0;

  showToast(title: string, message: string, type: string = 'info'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, title, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }
}
