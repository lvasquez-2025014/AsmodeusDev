import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { OrdersComponent } from './components/orders/orders.component';
import { ChatComponent } from './components/chat/chat.component';
import { EarningsComponent } from './components/earnings/earnings.component';
import { UsersComponent } from './components/users/users.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LogsComponent } from './components/logs/logs.component';

const routes: Routes = [{ path: '', component: HomeComponent }];

@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
    ProductsComponent,
    OrdersComponent,
    ChatComponent,
    EarningsComponent,
    UsersComponent,
    AnalyticsComponent,
    NotificationsComponent,
    SettingsComponent,
    ProfileComponent,
    LogsComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class HomeModule {}
