// libraries
import { Component, Input, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import {
  MatPaginator,
  MatSort
} from '@angular/material';
import { merge } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { omit } from 'lodash';

// constants
import { DATETIME_FORMATS } from './../../../constants/dateFormats';
import { FILES_TYPES } from './../../../constants/files';
import { RISE_AVATAR } from '../../../constants/global';
import { PROPERTY_TYPES, DEFAULT_PROPERTY_TYPE } from '../../../constants/properties';
import { DEFAULT_TIMEZONE } from '../../../constants/dateFormats';

// interfaces
import { RiseUserData } from '../../../models/interfaces/rise-user-data.interface';

const PAGE_OPTIONS = [25, 50, 75, 100, 250, 500, 1000];

@Component({
  selector: 'rise-<%= dasherize(name) %>-table',
  templateUrl: './<%= dasherize(name) %>-table.component.html',
  styleUrls: [
    './<%= dasherize(name) %>-table.component.scss',
    './../../../assets/styles/global.scss'
  ]
})

export class <%= classify(name) %>TableComponent {

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  @Input() riseUserData: RiseUserData;
  @Input() data: {
    results: any[],
    count: number
  };
  @Input() isDetailsPage: boolean;

  @Output() tableUpdated = new EventEmitter<any>();
  @Output() goto<%= classify(name_singular) %> = new EventEmitter<any>();
  @Output() exportFileTriggered = new EventEmitter<any>();
  @Output() downloadPdfTriggered = new EventEmitter<any>();

  bulkActionsTrigger: any = {
    'ACTION_OPEN': this.goto<%= classify(name_singular) %>,
    'ACTION_DOWNLOAD_AS_PDF': this.downloadPdfTriggered,
  };

  displayedColumns: string[] = [
    'service_number',
    'author.firstname',
    'unit_number',
    'created',
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
      omit(this.displayedColumns, 'actions')
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

  selectedAction(<%= camelize(name_singular) %>Id: any, action: any) {
    this.bulkActionsTrigger[action].emit(<%= camelize(name_singular) %>Id);
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

  getLabel(label: string): string {
    const unitText = `COMMON.${label}.${
      PROPERTY_TYPES[this.riseUserData.app_type] || DEFAULT_PROPERTY_TYPE
      }`;
    return this.translate.instant(unitText);
  }
}
