import { Component, Input, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import {
  MatPaginator,
  MatSort
} from '@angular/material';
import { merge } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { DATETIME_FORMATS } from './../../../constants/dateFormats';
import { FILES_TYPES } from './../../../constants/files';
const PAGE_OPTIONS = [25, 50, 75, 100, 250, 500, 1000];
import { RISE_AVATAR } from '../../../constants/global';
import { TranslateService } from '@ngx-translate/core';
import { PROPERTY_TYPES, DEFAULT_PROPERTY_TYPE } from '../../../constants/properties';
import { RiseUserData } from '../../../models/interfaces/rise-user-data.interface';
import { DEFAULT_TIMEZONE } from '../../../constants/dateFormats';

@Component({
  selector: 'rise-assignments-table',
  templateUrl: './assignments-table.component.html',
  styleUrls: [
    './assignments-table.component.scss',
    './../../../assets/styles/global.scss'
  ]
})

export class AssignmentsTableComponent {

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  @Input() riseUserData: RiseUserData;
  @Input() data: {
    results: any[],
    count: number
  };
  @Input() isDetailsPage: boolean;

  @Output() tableUpdated = new EventEmitter<any>();
  @Output() deleteAssignmentTriggered = new EventEmitter<any>();
  @Output() editAssignmentTriggered = new EventEmitter<any>();
  @Output() gotoAssignment = new EventEmitter<any>();
  @Output() deactivateAssignmentTriggered = new EventEmitter<any>();
  @Output() activateAssignmentTriggered = new EventEmitter<any>();
  @Output() downloadPdfTriggered = new EventEmitter<any>();
  @Output() exportFileTriggered = new EventEmitter<any>();
  @Output() reassignAssignmentTriggered = new EventEmitter<any>();
  @Output() openAssignmentCategoryTriggered = new EventEmitter<any>();

  bulkActionsTrigger: any = {
    'ACTION_DELETE': this.deleteAssignmentTriggered,
    'ACTION_DEACTIVATE': this.deactivateAssignmentTriggered,
    'ACTION_ACTIVATE': this.activateAssignmentTriggered,
    'ACTION_OPEN': this.gotoAssignment,
    'ACTION_EDIT': this.editAssignmentTriggered,
    'ACTION_DOWNLOAD_AS_PDF': this.downloadPdfTriggered,
    'ACTION_REASSIGN': this.reassignAssignmentTriggered,
    'ACTION_CATEGORY_OPEN': this.openAssignmentCategoryTriggered,
  };

  displayedColumns: string[] = [
    'service_number',
    'unit_number',
    'assignment_category_name',
    'resident',
    'created',
    'author.firstname',
    'status',
    'actions'
  ];
  pageSizeOptions = PAGE_OPTIONS;
  perPage = PAGE_OPTIONS[0];
  DEFAULT_SORT_COLUMN = '_id';
  DEFAULT_SORT_DIRECTION = 'desc';
  isPageChanged = false;
  DATETIME_FORMATS = DATETIME_FORMATS;
  RISE_AVATAR = RISE_AVATAR;
  fileTypes = {
    csv: FILES_TYPES.CSV
  };

  constructor(
    private translate: TranslateService,
  ) { }

  ngAfterViewInit() {
    this.listenChanges();
    if (this.isDetailsPage) {
      this.displayedColumns.pop();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !this.isPageChanged) {
      this.paginator.pageIndex = 0;
    }

    this.isPageChanged = false;
  }

  get displayedResults() {
    return this.data ? this.data.results : [];
  }

  get totalNumberOfResults() {
    return this.data ? this.data.count : 0;
  }

  getLabel(label: string): string {
    const unitText = `COMMON.${label}.${
      PROPERTY_TYPES[this.riseUserData.app_type] || DEFAULT_PROPERTY_TYPE
      }`;
    return this.translate.instant(unitText);
  }

  get propertyAppType() {
    return this.riseUserData.app_type ? this.riseUserData.app_type : null;
  }

  listenChanges() {
    merge(this.sort.sortChange)
      .subscribe(() => {
        this.paginator.pageIndex = 0;
      });

    merge(this.paginator.page, this.sort.sortChange)
      .pipe(
        startWith({
          initial: true,
          pageIndex: 0,
          pageSize: this.pageSizeOptions[0],
          sortField: this.DEFAULT_SORT_COLUMN,
          sortOrder: this.DEFAULT_SORT_DIRECTION
        }),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value: { pageSize?: number, pageIndex?: number }) => {
        this.isPageChanged = true;
        this.perPage = value.pageSize || PAGE_OPTIONS[0];
        this.tableUpdated.emit({
          ...value,
          pageIndex: value.pageIndex || 0,
          pageSize: this.perPage,
          sortField: this.sort.active || this.DEFAULT_SORT_COLUMN,
          sortOrder: this.sort.direction || this.DEFAULT_SORT_DIRECTION
        });
      });
  }

  selectedAction(assignmentId: any, action: any) {
    this.bulkActionsTrigger[action].emit(assignmentId);
  }

  editAssignment(assignment: Object) {
    this.editAssignmentTriggered.emit(assignment);
  }

  displayDeactivateButton(assignment: any) {
    return assignment.status;
  }

  triggerExportFile(exportType: { type: string, download_type: string }) {
    this.exportFileTriggered.emit({
      exportType: exportType,
      page: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize
    });
  }

  getUserName(user: any): string {
    return user && user.firstname ? `${user.firstname} ${user.lastname}` : this.translate.instant('COMMON.USER_UNAVAILABLE');
  }
}
