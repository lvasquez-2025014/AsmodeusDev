import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { PaymentMethodOption } from '@models/index';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  discordUrl = 'https://discord.gg/KdZVK4jnuZ';

  settings = {
    storeName: 'Supremo Cheats',
    storeEmail: 'admin@supremocheats.com',
    notifications: true,
    emailAlerts: true,
    darkMode: true,
    twoFactor: false,
  };

  paymentMethods: PaymentMethodOption[] = [
    { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal', color: '#003087', description: 'Pago instantáneo con PayPal' },
    { id: 'binance', name: 'Binance Pay', icon: 'fas fa-coins', color: '#f0b90b', description: 'Paga con BNB, BTC, USDT y más' },
    { id: 'transferencia', name: 'Transferencia Bancaria', icon: 'fas fa-university', color: '#22d3ee', description: 'Transferencia o depósito directo' },
  ];

  toasts: { id: number; title: string; message: string; type: string }[] = [];
  private toastCounter = 0;

  constructor(private auth: AuthService) {}

  showToast(title: string, message: string, type: string = 'info'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, title, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }
}
