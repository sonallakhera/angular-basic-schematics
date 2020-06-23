// library imports 
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import map from 'lodash/map';
import has from 'lodash/has';
import { isNil } from 'lodash';

// helpers
import { updateMomentTimeZoneOnly, convertDateFilterWithTimeZone } from 'rise-shared-module-frontend/src/helpers/global.helper';
import { buildRouteLink } from 'src/app/shared/helpers';
import { User } from '../../../shared/store';
import { findTableSettings } from 'rise-shared-module-frontend/src/helpers/table-settings.helper';

// services & pipes
import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';
import { UsersService } from './../../../shared/store/users/users.service';
import { <%= classify(name) %>Service } from './../store/<%= dasherize(name) %>.service';
import { FlashMessagesService } from '../../../shared/services/flash-messages.service';
import { HttpValidationMessagesService } from 'src/app/shared/services/http-validation-messages.service';
import { UnitsService } from '../../../shared/store/units/units.service';
import { TableFiltersService } from './../../../shared/services/table-filters.service';

// constants
import { MODAL_WIDTHS, MODAL_VIEW_PORT_WIDTH, MODAL_VIEW_PORT_HEIGHTS } from 'rise-shared-module-frontend/src/constants/dialogs';
import { ROUTES } from './../../../shared/constants';
import {
  TABLES
} from 'rise-shared-module-frontend/src/constants/table-settings/table-settings';

// components
import { ConfirmationDialogComponent } from '../../../shared/components/dialogs/confirmation/confirmation-dialog.component';
import { RiseUserDataService } from 'src/app/shared/services/rise-user-data.service';
import { RiseUserData } from 'rise-shared-module-frontend/src/models/interfaces/rise-user-data.interface';
import {
  TableSettingsDialogComponent
} from '../../../shared/components/table-settings-dialog/table-settings-dialog.component';


const DEFAULT_NUMBER_OF_RESULTS = 25;
const DEFAULT_PAGE_NUMBER = 1;

@Component({
  selector: 'app-<%= dasherize(name_singular) %>-list',
  templateUrl: './<%= dasherize(name_singular) %>-list.component.html',
  styleUrls: ['./<%= dasherize(name_singular) %>-list.component.scss']
})
export class <%= classify(name_singular) %>ListComponent implements OnInit {

  confirmationDialogRef: MatDialogRef<ConfirmationDialogComponent>;

  user: Partial<User>;
  riseUserData: RiseUserData;

  currentPageSize = DEFAULT_NUMBER_OF_RESULTS;
  currentPageNumber = DEFAULT_PAGE_NUMBER;
  
  data: {
    results: any[],
    count: number
  };
  filters: any;

  constructor(
    private <%= camelize(name) %>Service: <%= classify(name) %>Service,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private flashMessagesService: FlashMessagesService,
    private httpValidationMessagesService: HttpValidationMessagesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private unitsService: UnitsService,
    private assetUrlPipe: AssetUrlPipe,
    private _riseUserDataService: RiseUserDataService,
    private tableFiltersService: TableFiltersService,
  ) {
    this._riseUserDataService.riseUserData.subscribe(
      userData => {
        this.riseUserData = userData;
      }
    );
  }

  ngOnInit() {
    this.<%= camelize(name_singular) %>TableSettings = findTableSettings(TABLES.<%= underscore(name).toUpperCase() %>);
    this.setUser();
    this.prepareFilters();
  }

  prepareFilters() {
    const filtersData = this.tableFiltersService.getFilters() || { filters: {}, values: {} };
    this.filters = filtersData.values;
  }

  setUser() {
    this.user = this.activatedRoute.snapshot.data.user;

    this.getUserTableSettings(this.user._id, this.<%= camelize(name_singular) %>TableSettings.type);
  }

  fetch<%= classify(name) %>(tableData) {

    // Convert System Date Filter Timezone with Property Timezone
    if (this.filters
      && has(this.filters, 'creation_date_range')
      && this.filters.creation_date_range) {
      const { startDate, endDate } = convertDateFilterWithTimeZone(
        this.filters.creation_date_range.startDate,
        this.filters.creation_date_range.endDate,
        this.riseUserData.timezone
      );
      this.filters.creation_date_range.startDate = startDate;
      this.filters.creation_date_range.endDate = endDate;
    }

    if (this.filters
      && has(this.filters, 'expiration_date_range')
      && this.filters.expiration_date_range) {
      const { startDate, endDate } = convertDateFilterWithTimeZone(
        this.filters.expiration_date_range.startDate,
        this.filters.expiration_date_range.endDate,
        this.riseUserData.timezone
      );
      this.filters.expiration_date_range.startDate = startDate;
      this.filters.expiration_date_range.endDate = endDate;
    }

    this.currentPageSize = tableData.pageSize;
    this.<%= camelize(name) %>Service.get<%= classify(name) %>(
      {
        ...(this.filters || {}),
        property_id: [this.user.property_id]
      },
      tableData.pageIndex + 1,
      tableData.pageSize,
      tableData.sortField,
      tableData.sortOrder
    ).subscribe(
      (response: { results: any[], count: number }) => {
        this.data = {
          ...response,
          results: map(
            response.results,
            (<%= camelize(name_singular) %>) => {
              // modify data with assetUrl pipe to be transfered to shared module --
              if (<%= camelize(name_singular) %>.author) {
                <%= camelize(name_singular) %>.author.profile_img = this.assetUrlPipe.transform(
                  <%= camelize(name_singular) %>.author.profile_img,
                  true
                );
              }
              return <%= camelize(name_singular) %>;
            }
          )
        };
      });
  }

  setFilters(filterData) {
    if (
      filterData.creation_date_range
      && (isNil(filterData.creation_date_range.startDate) && isNil(filterData.creation_date_range.endDate))
    ) {
      delete filterData.creation_date_range;
    }

    if (
      filterData.expiration_date_range
      && (isNil(filterData.expiration_date_range.startDate) && isNil(filterData.expiration_date_range.endDate))
    ) {
      delete filterData.expiration_date_range;
    }

    this.filters = filterData;
    this.tableFiltersService.setFilters({}, this.filters);
    this.fetch<%= classify(name) %>({
      pageIndex: 0,
      pageSize: this.currentPageSize
    });
  }

  downloadPDF(<%= camelize(name_singular) %>Id) {
    return this.<%= camelize(name) %>Service.exportDetails(<%= camelize(name_singular) %>Id).subscribe();
  }

  goto<%= classify(name) %>(<%= camelize(name_singular) %>Id) {
    this.router.navigate(
      buildRouteLink(
        [
          ROUTES.<%= underscore(name).toUpperCase() %>,
          ROUTES.<%= underscore(name).toUpperCase() %>_DETAILS
        ],
        { <%= camelize(name_singular) %>Id }
      )
    );
  }

  exportFile(exportData) {
    return this.<%= camelize(name) %>Service.exportFile(
      exportData.exportType,
      (this.filters || {}),
      exportData.page,
      exportData.pageSize
    ).subscribe();
  }

  fetchUnits(filters) {
    return this.unitsService.getUnits(
      {
        ...filters,
        property_id: [this.user.property_id]
      },
      1,
      DEFAULT_NUMBER_OF_RESULTS
    );
  }

  getUserTableSettings(userId, type) {
    this.tableSettingsService.getByUserAndType(userId, type)
      .subscribe((settings) => {
        this.userTableSettings = settings;
      });
  }
  
  openTableSettingsDialog() {
    const defaultProperty = this.user.property_id;
    const config = new MatDialogConfig();
    config.width = MODAL_WIDTHS.MEDIUM;
    config.data = {
      type: this.<%= camelize(name_singular) %>TableSettings.type,
      userId: this.user._id,
      allowedTableSettings: this.<%= camelize(name_singular) %>TableSettings.allowedSettings,
      existingTableSettings: this.userTableSettings,
      disabledTableSettings: this.<%= camelize(name_singular) %>TableSettings.defaultSettings,
      manageTableSettings: (settingsId, data) => {
        this.updateTableSettings(settingsId, data);
        this.tableSettingsDialogComponent.close();
      }
    };
    this.tableSettingsDialogComponent = this.dialog.open(
      TableSettingsDialogComponent,
      config
    );
  }

  updateTableSettings(settingsId, data) {
    const method = settingsId  ? 'updateTableSettings' : 'createTableSettings';

    this.tableSettingsService[method]({
      ...data,
      type: this.<%= camelize(name_singular) %>TableSettings.type,
      _id: settingsId
    }).subscribe(() => {
      const messageKey = settingsId
        ? 'TABLE_SETTINGS.SUCCESSFULLY_UPDATED_SETTINGS'
        : 'TABLE_SETTINGS.SUCCESSFULLY_CREATED_SETTINGS';
      this.flashMessageService.displayMessage(this.translateService.instant(messageKey));

      this.getUserTableSettings(this.user._id, this.<%= camelize(name_singular) %>TableSettings.type);
    }, (res) => {
      this.httpValidationMessagesService.displayErrors(
        res.error, 'TABLE_SETTINGS.VALIDATION'
      );
    });
  }
}
