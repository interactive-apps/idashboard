import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { mergeMap, map, catchError, tap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { DashboardSettingsService } from '../../services/dashboard-settings.service';

import {
  DashboardSettingsActionTypes,
  AddDashboardSettingsAction,
  LoadDashboardSettingsFailAction,
  LoadDashboardSettingsAction,
  LoadDashboardsAction
} from '../actions';

import { State } from '../reducers';

@Injectable()
export class DashboardSettingsEffects {
  @Effect()
  loadDashboardSettings$: Observable<any> = this.actions$.pipe(
    ofType(DashboardSettingsActionTypes.LoadDashboardSettings),
    mergeMap((action: LoadDashboardSettingsAction) =>
      this.dashboardSettingsService.loadAll().pipe(
        map(
          (dashboardSettings: any) =>
            new AddDashboardSettingsAction(
              dashboardSettings,
              action.currentUser
            )
        ),
        catchError((error: any) =>
          of(new LoadDashboardSettingsFailAction(error, action.currentUser))
        )
      )
    )
  );

  @Effect()
  dashboardSettingsLoaded$: Observable<any> = this.actions$.pipe(
    ofType(DashboardSettingsActionTypes.AddDashboardSettings),
    map(
      (action: AddDashboardSettingsAction) =>
        new LoadDashboardsAction(action.currentUser, action.dashboardSettings)
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private dashboardSettingsService: DashboardSettingsService
  ) {}
}