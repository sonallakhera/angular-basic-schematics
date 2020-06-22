import { Component, OnInit } from '@angular/core';
import { UsersService } from './../../../shared/store/users/users.service';
import { User } from '../../../shared/store';
import { AssignmentsService } from './../store/assignments.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { MODAL_WIDTHS, MODAL_VIEW_PORT_WIDTH, MODAL_VIEW_PORT_HEIGHTS } from 'rise-shared-module-frontend/src/constants/dialogs';
import { ConfirmationDialogComponent } from '../../../shared/components/dialogs/confirmation/confirmation-dialog.component';
import { FlashMessagesService } from '../../../shared/services/flash-messages.service';
import { HttpValidationMessagesService } from 'src/app/shared/services/http-validation-messages.service';
import { AssignmentDialogComponent } from './../assignment-dialog/assignment-dialog.component';
import { ReassignAssignmentDialogComponent } from './../reassign-assignment-dialog/reassign-assignment-dialog.component';
import { UnitsService } from '../../../shared/store/units/units.service';
import { AssignmentCategoriesService } from './../store/assignment-categories.service';
import { TableFiltersService } from './../../../shared/services/table-filters.service';
import {
  ROUTES
} from './../../../shared/constants';
import { buildRouteLink } from 'src/app/shared/helpers';
import { Router, ActivatedRoute } from '@angular/router';
import map from 'lodash/map';
import has from 'lodash/has';
import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';
import { RiseUserDataService } from 'src/app/shared/services/rise-user-data.service';
import { RiseUserData } from 'rise-shared-module-frontend/src/models/interfaces/rise-user-data.interface';
import {
  updateMomentTimeZoneOnly,
  convertDateFilterWithTimeZone
} from 'rise-shared-module-frontend/src/helpers/global.helper';
import { isNil } from 'lodash';

const DEFAULT_NUMBER_OF_RESULTS = 25;
const DEFAULT_PAGE_NUMBER = 1;

@Component({
  selector: 'app-assignments-list',
  templateUrl: './assignments-list.component.html',
  styleUrls: ['./assignments-list.component.scss']
})
export class AssignmentsListComponent implements OnInit {

  constructor(
    private assignmentsService: AssignmentsService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private flashMessagesService: FlashMessagesService,
    private httpValidationMessagesService: HttpValidationMessagesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assignmentCategoriesService: AssignmentCategoriesService,
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
  user: Partial<User>;
  currentPageSize = DEFAULT_NUMBER_OF_RESULTS;
  currentPageNumber = DEFAULT_PAGE_NUMBER;
  confirmationDialogRef: MatDialogRef<ConfirmationDialogComponent>;
  assignmentDialogRef: MatDialogRef<AssignmentDialogComponent>;
  reassignAssignmentDialogRef: MatDialogRef<ReassignAssignmentDialogComponent>;
  data: {
    results: any[],
    count: number
  };
  filters: any;
  riseUserData: RiseUserData;

  ngOnInit() {
    this.setLoggedInUser();
    this.prepareFilters();
  }

  prepareFilters() {
    const filtersData = this.tableFiltersService.getFilters() || { filters: {}, values: {} };
    this.filters = filtersData.values;
  }

  setLoggedInUser() {
    this.user = this.activatedRoute.snapshot.data.user;
  }

  fetchAssignments(tableData) {

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
    this.assignmentsService.getAssignments(
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
            (assignment) => {
              // modify data with assetUrl pipe to be transfered to shared module --
              if (assignment.author) {
                assignment.author.profile_img = this.assetUrlPipe.transform(
                  assignment.author.profile_img,
                  true
                );
              }
              return assignment;
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
    this.fetchAssignments({
      pageIndex: 0,
      pageSize: this.currentPageSize
    });
  }

  downloadPDF(assignmentId) {
    return this.assignmentsService.exportDetails(assignmentId).subscribe();
  }

  openActivateAssignmentDialog(id) {
    const dialogConfig = new MatDialogConfig();
    const successMsg = this.translateService.instant('ASSIGNMENTS.SUCCESSFULLY_ACTIVATED_ASSIGNMENT');
    dialogConfig.width = MODAL_WIDTHS.MEDIUM;
    dialogConfig.data = {
      title: this.translateService.instant('COMMON.CONFIRMATION'),
      message: this.translateService.instant(
        'ASSIGNMENTS.ACTIVATE_ASSIGNMENT_CONFIRMATION'
      ),
      confirm: () => {
        this.toggleAmenityStatus(id, true, successMsg);
        this.confirmationDialogRef.close();
      },
      decline: () => {
        this.confirmationDialogRef.close();
      }
    };

    this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
  }

  openDeactivateAssignmentDialog(id) {
    const dialogConfig = new MatDialogConfig();
    const successMsg = this.translateService.instant('ASSIGNMENTS.SUCCESSFULLY_DEACTIVATED_ASSIGNMENT');

    dialogConfig.width = MODAL_WIDTHS.MEDIUM;
    dialogConfig.data = {
      title: this.translateService.instant('COMMON.CONFIRMATION'),
      message: this.translateService.instant(
        'ASSIGNMENTS.DEACTIVATE_ASSIGNMENT_CONFIRMATION'
      ),
      confirm: () => {
        this.toggleAmenityStatus(id, false, successMsg);
        this.confirmationDialogRef.close();
      },
      decline: () => {
        this.confirmationDialogRef.close();
      }
    };

    this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
  }

  toggleAmenityStatus(id, status, successMsg) {
    const data = {
      'status': status
    };
    this.assignmentsService.updateAssignmentStatus(data, id)
      .subscribe(
        () => {
          this.flashMessagesService.displayMessage(successMsg);
          this.fetchAssignments({
            pageIndex: 0,
            pageSize: this.currentPageSize
          });
        },
        (res) => {
          this.httpValidationMessagesService.displayErrors(
            res.error, 'ASSIGNMENTS.VALIDATION'
          );
        });
  }

  openDeleteAssignmentDialog(id) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = MODAL_WIDTHS.MEDIUM;
    dialogConfig.data = {
      title: this.translateService.instant('COMMON.CONFIRMATION'),
      message: this.translateService.instant(
        'ASSIGNMENTS.DELETE_ASSIGNMENT_CONFIRMATION'
      ),
      confirm: () => {
        this.deleteAssignment(id);
        this.confirmationDialogRef.close();
        this.fetchAssignments({
          pageIndex: 0,
          pageSize: this.currentPageSize
        });
      },
      decline: () => {
        this.confirmationDialogRef.close();
      }
    };

    this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
  }

  deleteAssignment(id) {
    this.assignmentsService.deleteAssignment(id)
      .subscribe(
        () => {
          this.flashMessagesService.displayMessage(
            this.translateService.instant(
              'ASSIGNMENTS.SUCCESSFULLY_DELETED_ASSIGNMENT'
            )
          );
        },
        (res) => {
          this.httpValidationMessagesService.displayErrors(
            res.error, 'ASSIGNMENTS.VALIDATION'
          );
        });
  }

  openEditAssignmentDialog(assignment) {
    const config = new MatDialogConfig();

    config.width = MODAL_VIEW_PORT_WIDTH.LARGE;
    config.maxHeight = MODAL_VIEW_PORT_HEIGHTS.MEDIUM;
    config.data = {
      assignment: assignment,
      manageAssignment: (data) => {
        this.editAssignment(data, assignment._id);
        this.assignmentDialogRef.close();
      }
    };
    this.assignmentDialogRef = this.dialog.open(
      AssignmentDialogComponent,
      config
    );
  }

  editAssignment(data, assignmentId) {
    this.assignmentsService.updateAssignment(
      data,
      assignmentId
    ).subscribe((result: any) => {
      this.flashMessagesService.displayMessage(
        this.translateService.instant('ASSIGNMENTS.SUCCESSFULLY_UPDATED_ASSIGNMENT')
      );
      this.gotoAssignment(result._id);
    },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, 'ASSIGNMENTS.VALIDATION'
        );
      }
    );
  }

  reassignAssignment(data, assignmentId) {
    this.assignmentsService.reassignAssignment(
      data,
      assignmentId
    ).subscribe((result: any) => {
      this.flashMessagesService.displayMessage(
        this.translateService.instant('ASSIGNMENTS.SUCCESSFULLY_REASSIGN_ASSIGNMENT')
      );
      this.gotoAssignment(result._id);
    },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, 'ASSIGNMENTS.VALIDATION'
        );
      }
    );
  }

  reassignAssignmentDialog(assignmentId) {
    const config = new MatDialogConfig();
    config.width = MODAL_WIDTHS.MEDIUM;
    config.data = {
      assignmentId: assignmentId,
      manageReassignAssignment: (data) => {
        this.reassignAssignment(data, assignmentId);
        this.reassignAssignmentDialogRef.close();
      }
    };
    this.reassignAssignmentDialogRef = this.dialog.open(
      ReassignAssignmentDialogComponent,
      config
    );
  }

  gotoAssignment(assignmentId) {
    this.router.navigate(
      buildRouteLink(
        [
          ROUTES.ASSIGNMENTS,
          ROUTES.ASSIGNMENTS_DETAILS
        ],
        { assignmentId }
      )
    );
  }

  exportFile(exportData) {
    return this.assignmentsService.exportFile(
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

  fetchAssignmentCategories(filters) {
    return this.assignmentCategoriesService.getAssignmentCategories(
      {
        ...filters,
        property_id: [this.user.property_id]
      },
      1,
      DEFAULT_NUMBER_OF_RESULTS,
    );
  }

  openAddAssignment() {
    const config = new MatDialogConfig();
    config.width = MODAL_VIEW_PORT_WIDTH.LARGE;
    config.maxHeight = MODAL_VIEW_PORT_HEIGHTS.MEDIUM;
    config.data = {
      manageAssignment: (data) => {
        this.addAssignment(data);
        this.assignmentDialogRef.close();
      }
    };
    this.assignmentDialogRef = this.dialog.open(
      AssignmentDialogComponent,
      config
    );
  }

  addAssignment(data) {
    this.assignmentsService.addAssignment(
      data
    ).subscribe((result: any) => {
      this.flashMessagesService.displayMessage(
        this.translateService.instant('ASSIGNMENTS.SUCCESSFULLY_CREATED_ASSIGNMENT')
      );
      this.gotoAssignment(result._id);
    },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, 'ASSIGNMENTS.VALIDATION'
        );
      }
    );
  }

}
