import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { containers } from './containers';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { CurrentDashboardComponent } from './pages/current-dashboard/current-dashboard.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { services } from './services';
import { dashboardEffects } from './store/effects';
import { dashboardReducers } from './store/reducers';

@NgModule({
  declarations: [DashboardComponent, CurrentDashboardComponent, ...containers],
  providers: [...services],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ...dashboardReducers,
    EffectsModule.forFeature(dashboardEffects)
  ]
})
export class DashboardModule {}