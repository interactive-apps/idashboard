import { Action, createAction, props } from '@ngrx/store';
import {
  Visualization,
  VisualizationLayer,
  VisualizationVm
} from '../../models';
import { User, SystemInfo } from '@iapps/ngx-dhis2-http-client';

export enum VisualizationObjectActionTypes {
  AddVisualizationObjects = '[Visualization] Add all visualization objects',
  ADD_VISUALIZATION_OBJECT = '[Visualization] Add visualization object',
  INITIALIZE_VISUALIZATION_OBJECT = '[Visualization] Initialize visualization object',
  UPDATE_VISUALIZATION_OBJECT = '[Visualization] Update visualization object',
  LOAD_VISUALIZATION_FAVORITE = '[Visualization] Load visualization favorite',
  LOAD_VISUALIZATION_FAVORITE_SUCCESS = '[Visualization] Load visualization favorite success',
  LOAD_VISUALIZATION_FAVORITE_FAIL = '[Visualization] Load visualization favorite fail',
  SaveVisualizationFavorite = '[Visualization] Save visualization favorite',
  SaveVisualizationFavoriteSuccess = '[Visualization] Save visualization favorite success',
  RemoveVisualizationFavorite = '[Visualization] Remove visualization favorite',
  RemoveVisualizationObject = '[Visualization] Remove visualization object',
  ToggleFullScreen = '[Visualization] toggle full screen'
}

export const initializeVisualizationObject = createAction(
  '[Visualization] Initialize visualization object',
  props<{
    visualizationObject: VisualizationVm;
    visualizationLayers: VisualizationLayer[];
    currentUser: User;
    systemInfo: SystemInfo;
    isNew: boolean;
  }>()
);

export const addVisualizationObject = createAction(
  '[Visualization] Add visualization object',
  props<{
    visualizationObject: VisualizationVm;
    visualizationLayers: VisualizationLayer[];
    isNew?: boolean;
    currentUser?: User;
    systemInfo?: SystemInfo;
  }>()
);
export class AddVisualizationObjectAction implements Action {
  readonly type = VisualizationObjectActionTypes.ADD_VISUALIZATION_OBJECT;

  constructor(public visualizationObject: VisualizationVm) {}
}

export class AddVisualizationObjectsAction implements Action {
  readonly type = VisualizationObjectActionTypes.AddVisualizationObjects;

  constructor(public visualizationObjects: VisualizationVm[]) {}
}

export class InitializeVisualizationObjectAction implements Action {
  readonly type =
    VisualizationObjectActionTypes.INITIALIZE_VISUALIZATION_OBJECT;

  constructor(
    public visualizationObject: any,
    public currentUser: any,
    public systemInfo: any
  ) {}
}

export class UpdateVisualizationObjectAction implements Action {
  readonly type = VisualizationObjectActionTypes.UPDATE_VISUALIZATION_OBJECT;

  constructor(public id: string, public changes: Partial<VisualizationVm>) {}
}

export class LoadVisualizationFavoriteAction implements Action {
  readonly type = VisualizationObjectActionTypes.LOAD_VISUALIZATION_FAVORITE;

  constructor(
    public visualization: VisualizationVm,
    public currentUser: any,
    public systemInfo: any
  ) {}
}

export class LoadVisualizationFavoriteSuccessAction implements Action {
  readonly type =
    VisualizationObjectActionTypes.LOAD_VISUALIZATION_FAVORITE_SUCCESS;

  constructor(
    public visualization: VisualizationVm,
    public favorite: any,
    public currentUser: any,
    public systemInfo: any
  ) {}
}

export class LoadVisualizationFavoriteFailAction implements Action {
  readonly type =
    VisualizationObjectActionTypes.LOAD_VISUALIZATION_FAVORITE_FAIL;

  constructor(public id: string, public error: any) {}
}

export class SaveVisualizationFavoriteAction implements Action {
  readonly type = VisualizationObjectActionTypes.SaveVisualizationFavorite;
  constructor(
    public id: string,
    public favoriteDetails: any,
    public dashboardId: string
  ) {}
}

export class SaveVisualizationFavoriteSuccessAction implements Action {
  readonly type =
    VisualizationObjectActionTypes.SaveVisualizationFavoriteSuccess;
  constructor(
    public dashboardId: string,
    public visualizationId: string,
    public favoriteType: string,
    public favoriteDetails: any,
    public action: string
  ) {}
}

export class RemoveVisualizationObjectAction implements Action {
  readonly type = VisualizationObjectActionTypes.RemoveVisualizationObject;
  constructor(public id: string, public options?: any) {}
}

export class RemoveVisualizationFavoriteAction implements Action {
  readonly type = VisualizationObjectActionTypes.RemoveVisualizationFavorite;
  constructor(
    public visualizationId: string,
    public favoriteId: string,
    public favoriteType: string
  ) {}
}

export class ToggleVisualizationFullScreenAction implements Action {
  readonly type = VisualizationObjectActionTypes.ToggleFullScreen;

  constructor(public id: string) {}
}

export type VisualizationObjectAction =
  | AddVisualizationObjectAction
  | AddVisualizationObjectsAction
  | SaveVisualizationFavoriteAction
  | LoadVisualizationFavoriteAction
  | LoadVisualizationFavoriteSuccessAction
  | LoadVisualizationFavoriteFailAction
  | InitializeVisualizationObjectAction
  | UpdateVisualizationObjectAction
  | RemoveVisualizationObjectAction
  | RemoveVisualizationFavoriteAction
  | SaveVisualizationFavoriteSuccessAction
  | ToggleVisualizationFullScreenAction;
