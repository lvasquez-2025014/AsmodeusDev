import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { PanelStateService } from '@core/services/panel-state.service';

interface CmdLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
  timestamp: Date;
}

@Component({
  selector: 'app-cmd',
  templateUrl: './cmd.component.html',
  styleUrls: ['./cmd.component.scss']
})
export class CmdComponent implements OnInit, AfterViewChecked {
  @ViewChild('cmdOutput') cmdOutputRef!: ElementRef;
  @ViewChild('cmdInput') cmdInputRef!: ElementRef;

  lines: CmdLine[] = [];
  currentInput = '';
  commandHistory: string[] = [];
  historyIndex = -1;
  isExecuting = false;
  showCursor = true;
  isSuperAdmin = false;
  currentTimeStr = '';

  private cursorInterval: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    public panelState: PanelStateService
  ) {}

  ngOnInit(): void {
    const user = this.auth.user;
    this.isSuperAdmin = user?.role === 'superadmin';
    this.lines.push({
      text: 'Supremo Cheats Terminal v1.0.0',
      type: 'system',
      timestamp: new Date()
    });
    this.lines.push({
      text: 'Escribe "help" para ver los comandos disponibles.\n',
      type: 'system',
      timestamp: new Date()
    });
    this.cursorInterval = setInterval(() => {
      this.showCursor = !this.showCursor;
      this.updateTime();
    }, 530);
    this.updateTime();
  }

  ngOnDestroy(): void {
    if (this.cursorInterval) clearInterval(this.cursorInterval);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.cmdOutputRef?.nativeElement) {
      const el = this.cmdOutputRef.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  focusInput(): void {
    this.cmdInputRef?.nativeElement?.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.executeCommand();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory(1);
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      this.lines = [];
      this.pushLine('Terminal limpiada.\n', 'system');
    }
  }

  navigateHistory(direction: number): void {
    if (this.commandHistory.length === 0) return;
    this.historyIndex += direction;
    if (this.historyIndex < -1) this.historyIndex = -1;
    if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length - 1;
    }
    this.currentInput = this.historyIndex >= 0
      ? this.commandHistory[this.commandHistory.length - 1 - this.historyIndex]
      : '';
  }

  executeCommand(): void {
    const cmd = this.currentInput.trim();
    this.pushLine(`> ${this.currentInput}`, 'input');
    this.currentInput = '';
    this.historyIndex = -1;

    if (!cmd) return;

    this.commandHistory.push(cmd);

    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        this.cmdHelp();
        break;
      case 'clear':
      case 'cls':
        this.lines = [];
        break;
      case 'date':
        this.pushLine(new Date().toLocaleString('es-ES'), 'output');
        break;
      case 'whoami':
        this.cmdWhoami();
        break;
      case 'users':
        this.cmdUsers();
        break;
      case 'stats':
        this.cmdStats();
        break;
      case 'products':
        this.cmdProducts();
        break;
      case 'echo':
        this.pushLine(args.join(' ') || '', 'output');
        break;
      case 'ping':
        this.pushLine('Pong! Backend activo.', 'output');
        break;
      case 'version':
        this.pushLine('Supremo Cheats Panel v1.0.0 | Angular 15 + Express', 'output');
        break;
      default:
        this.pushLine(`Comando no encontrado: ${command}. Escribe "help" para ver los comandos.`, 'error');
    }

    this.pushLine('', 'output');
  }

  private pushLine(text: string, type: CmdLine['type']): void {
    this.lines.push({ text, type, timestamp: new Date() });
  }

  private cmdHelp(): void {
    const helpText = [
      'Comandos disponibles:',
      '',
      '  help          Muestra esta ayuda',
      '  clear         Limpia la terminal',
      '  whoami        Muestra el usuario actual',
      '  users         Lista todos los usuarios',
      '  stats         Estadísticas del panel',
      '  products      Lista productos disponibles',
      '  date          Fecha y hora actual',
      '  echo [text]   Imprime texto',
      '  ping          Verifica conexión con el backend',
      '  version       Versión del sistema',
      '',
      'Atajos: ↑↓ historial | Ctrl+L limpiar',
    ];
    helpText.forEach(line => this.pushLine(line, 'output'));
  }

  private cmdWhoami(): void {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.pushLine(`Usuario: ${user.name || 'Desconocido'}`, 'output');
      this.pushLine(`Email:   ${user.email || 'N/A'}`, 'output');
      this.pushLine(`Rol:     ${(user.role || 'N/A').toUpperCase()}`, 'output');
    } catch {
      this.pushLine('No se pudo obtener la información del usuario.', 'error');
    }
  }

  private cmdUsers(): void {
    this.isExecuting = true;
    this.pushLine('Cargando usuarios...', 'system');
    this.api.get<any>('admin/users').subscribe({
      next: (res) => {
        const users = res.data || [];
        this.pushLine(`Total: ${users.length} usuarios\n`, 'output');
        users.forEach((u: any) => {
          const role = (u.role || 'N/A').toUpperCase().padEnd(12);
          this.pushLine(`  [${role}] ${u.name} <${u.email}>`, 'output');
        });
        this.pushLine('', 'output');
        this.isExecuting = false;
      },
      error: () => {
        this.pushLine('Error al cargar usuarios.', 'error');
        this.isExecuting = false;
      }
    });
  }

  private cmdStats(): void {
    this.isExecuting = true;
    this.pushLine('Cargando estadísticas...', 'system');
    this.api.get<any>('admin/stats').subscribe({
      next: (res) => {
        const d = res.data || {};
        this.pushLine('=== Estadísticas del Panel ===', 'output');
        this.pushLine(`  Usuarios totales:  ${d.totalUsers || 0}`, 'output');
        this.pushLine(`  Super Admins:      ${d.superadmins || 0}`, 'output');
        this.pushLine(`  Admins:            ${d.admins || 0}`, 'output');
        this.pushLine(`  Clientes:          ${d.clientes || 0}`, 'output');
        this.pushLine(`  Productos:         ${d.totalProducts || 0}`, 'output');
        this.pushLine(`  Pedidos:           ${d.totalOrders || 0}`, 'output');
        this.pushLine('', 'output');
        this.isExecuting = false;
      },
      error: () => {
        this.pushLine('Error al cargar estadísticas.', 'error');
        this.isExecuting = false;
      }
    });
  }

  private cmdProducts(): void {
    this.isExecuting = true;
    this.pushLine('Cargando productos...', 'system');
    this.api.get<any>('products').subscribe({
      next: (res) => {
        const products = res.data || [];
        this.pushLine(`Total: ${products.length} productos\n`, 'output');
        products.forEach((p: any) => {
          const price = p.prices?.length > 0 ? `$${p.prices[0].price}` : 'N/A';
          this.pushLine(`  ${p.name} (${p.category}) - ${price}`, 'output');
        });
        this.pushLine('', 'output');
        this.isExecuting = false;
      },
      error: () => {
        this.pushLine('Error al cargar productos.', 'error');
        this.isExecuting = false;
      }
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  private updateTime(): void {
    this.currentTimeStr = this.formatTime(new Date());
  }
}
