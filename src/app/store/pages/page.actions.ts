import {Action} from '@ngrx/store';
import {PageState, SinglePageState} from './page.state';


export enum PageActions {
  LOAD = '[ Page ] Load the page',
  LOAD_SUCCESS = '[ Page ] Load the page success',
  LOAD_FAIL = '[ Page ] Load the page fail',
  LOAD_TOP_SCROLL_BAR = '[Home top bar] Load top scroll bar',
  LOAD_TOP_SCROLL_BAR_SUCCESS = '[Home top bar] Load top scroll bar success',
  LOAD_TOP_SCROLL_BAR_FAIL = '[Home top bar] Load top scroll bar fail'
}

export class LoadAction implements Action {
  readonly type = PageActions.LOAD;
}

export class LoadSuccessAction implements Action {
  readonly type = PageActions.LOAD_SUCCESS;

  constructor(public payload: PageState) {
  }
}

export class LoadFailAction implements Action {
  readonly type = PageActions.LOAD_FAIL;

  constructor(public payload: any) {}
}

export class LoadTopScrollAction implements Action {
  readonly type = PageActions.LOAD_TOP_SCROLL_BAR;
}

export class LoadTopScrollSuccessAction implements Action {
  readonly type = PageActions.LOAD_TOP_SCROLL_BAR_SUCCESS;

  constructor(public payload: SinglePageState) {
  }
}

export class LoadTopScrollFailAction implements Action {
  readonly type = PageActions.LOAD_TOP_SCROLL_BAR_FAIL;

  constructor(public payload: any) {}
}


export type PageAction =  LoadAction
  | LoadSuccessAction
  | LoadFailAction
  | LoadTopScrollAction
  | LoadTopScrollSuccessAction
  | LoadTopScrollFailAction;