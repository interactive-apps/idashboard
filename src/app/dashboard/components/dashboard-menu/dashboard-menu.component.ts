import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { Dashboard } from '../../models';

@Component({
  selector: 'app-dashboard-menu',
  templateUrl: './dashboard-menu.component.html',
  styleUrls: ['./dashboard-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardMenuComponent implements OnInit {
  @Input() dashboardMenuList: Dashboard[];
  @Input() currentDashboardId: string;

  @Output()
  setCurrentDashboard: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  toggleDashboardBookmark: EventEmitter<{
    id: string;
    bookmarked: boolean;
    supportBookmark;
  }> = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  onSetCurrentDashboard(dashboardId: string) {
    this.setCurrentDashboard.emit(dashboardId);
  }

  onToggleDashboardMenuItemBookmark(dashboardMenuDetails: any) {
    this.toggleDashboardBookmark.emit(dashboardMenuDetails);
  }
}