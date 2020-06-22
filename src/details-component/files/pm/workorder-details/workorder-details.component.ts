import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { find, first, has, head } from 'lodash';

import { User } from '../../../shared/store';
import { ROLES, ROUTES, LINK_ROUTES } from '../../../shared/constants';
import { WORKORDER_STATUS, ASSIGNED_TO, ASSIGNED_TO_GROUP } from 'rise-shared-module-frontend/src/constants/workorder';
import { buildRouteLink, getAllParams } from 'src/app/shared/helpers';

import { FlashMessagesService } from '../../../shared/services/flash-messages.service';
import { HttpValidationMessagesService } from 'src/app/shared/services/http-validation-messages.service';
import { UsersService } from '../../../shared/store/users/users.service';
import { WorkordersService } from '../store/workorders.service';
import { RiseUserDataService } from 'src/app/shared/services/rise-user-data.service';
import { UnitsService } from 'src/app/shared/store/units/units.service';

import {
  TaskDialogComponent
} from './../../../shared/components/task-dialog/task-dialog.component';
import {
  WorkorderAddLaborDialogComponent
} from '../workorder-add-labor-dialog/workorder-add-labor-dialog.component';
import {
  WorkorderAddMaterialDialogComponent
} from '../workorder-add-material-dialog/workorder-add-material-dialog.component';
import {
  WorkordersPaymentDialogComponent
} from '../workorders-payment-dialog/workorders-payment-dialog.component';
import {
  WorkordersAssignDialogComponent
} from '../workorders-assign-dialog/workorders-assign-dialog.component';
import {
  WorkorderDetailsTaskComponent
} from 'rise-shared-module-frontend/src/components/workorders/workorder-details-task/workorder-details-task.component';
import {
  ConfirmationDialogComponent
} from './../../../shared/components/dialogs/confirmation/confirmation-dialog.component';
import {
  WorkorderDialogComponent
} from './../workorder-dialog/workorder-dialog.component';
import {
  TextConfirmationDialogComponent
} from 'src/app/shared/components/dialogs/text-confirmation/text-confirmation-dialog.component';
import {
  SelectResourceDialogComponent
} from 'src/app/shared/components/dialogs/select-resource-dialog/select-resource-dialog.component';

import { WORK_ORDER_TYPES } from 'rise-shared-module-frontend/src/constants/workorder';
import { TASK_TYPES } from 'rise-shared-module-frontend/src/constants/tasks';

import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';
import { MODAL_WIDTHS, MODAL_VIEW_PORT_HEIGHTS, MODAL_VIEW_PORT_WIDTH } from 'rise-shared-module-frontend/src/constants/dialogs';

@Component({
  selector: 'app-workorder-details',
  templateUrl: './workorder-details.component.html'
})
export class WorkorderDetailsComponent implements OnInit {

  @ViewChild('taskDetailsSection') taskDetailsSection: WorkorderDetailsTaskComponent;

  confirmationDialogRef: MatDialogRef<ConfirmationDialogComponent>;
  textConfirmationDialogRef: MatDialogRef<TextConfirmationDialogComponent>;
  selectResourceDialogRef: MatDialogRef<SelectResourceDialogComponent>;
  addTaskDialogComponent: MatDialogRef<TaskDialogComponent>;
  assignUserDialogComponent: MatDialogRef<WorkordersAssignDialogComponent>;
  addLaborDialogComponent: MatDialogRef<WorkorderAddLaborDialogComponent>;
  addMaterialDialogComponent: MatDialogRef<WorkorderAddMaterialDialogComponent>;
  addPaymentDialogComponent: MatDialogRef<WorkordersPaymentDialogComponent>;
  workorderDialogComponent: MatDialogRef<WorkorderDialogComponent>;

  routeParams = {
    workorderId: null
  };
  user: User;
  propertyAppType: any;
  timezone: string;
  estimateTask = null;
  workorderData: any = {};
  workorderComments = [];
  workorderLogs = [];
  workorderTasks = [];

  LINK_ROUTES = LINK_ROUTES;
  ROUTES = ROUTES;
  ROLES = ROLES;
  WORKORDER_STATUS = WORKORDER_STATUS;

  buildRouteLink = buildRouteLink;
  property: any;

  constructor(
    private router: Router,
    private assetUrlPipe: AssetUrlPipe,
    private activatedRoute: ActivatedRoute,
    private workorderService: WorkordersService,
    private flashMessageService: FlashMessagesService,
    private httpValidationMessagesService: HttpValidationMessagesService,
    private usersService: UsersService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private riseUserDataService: RiseUserDataService,
    private unitsService: UnitsService
  ) {
    this.riseUserDataService.riseUserData.subscribe(
      riseUserData => {
        this.timezone = riseUserData.timezone;
        this.propertyAppType = riseUserData.app_type;
      }
    );
  }

  get isWorkorderReopned() {
    if (!this.workorderData) {
      return;
    }

    return this.workorderData.work_order_status === WORKORDER_STATUS.CLOSED
        || this.workorderData.work_order_status === WORKORDER_STATUS.COMPLETED;
  }

  get workOrderType() {
    if (!this.workorderData || !this.workorderData.service_category) {
      return;
    }

    const workOrderType = find(WORK_ORDER_TYPES, { SLUG: this.workorderData.service_category.slug });

    return workOrderType.CODE;
  }

  ngOnInit() {
    this.setUserData();
    this.getWorkorderDetails();
  }

  getWorkorderDetails(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.routeParams.workorderId = params.has('workorderId') && params.get('workorderId');

      this.getWorkorder();
      this.getWorkorderComments();
      this.getWorkorderLogs();

      this.getWorkorderTasks(
        {
          service_id: [this.routeParams.workorderId],
          property_id: [this.property._id],
          task_type: [TASK_TYPES.ESTIMATE]
        },
        1,
        1
      ).subscribe(
        tasks => {
          this.estimateTask = head(tasks.results);
        }
      );
    });
  }

  getWorkorderId(): any {
    return this.routeParams.workorderId;
  }

  setUserData() {
    this.user = this.activatedRoute.snapshot.data.user;
    this.property = this.user.property;

    // modify data with assetUrl pipe to be transfered to shared module --
    if (this.user && this.user.profile_img) {
      this.user.profile_img = this.assetUrlPipe.transform(this.user.profile_img, true);
    }
  }

  getWorkorder(): void {
    this.workorderService.getWorkorder(this.getWorkorderId()).subscribe(
      response => {
        this.workorderData = response;

        // modify data with assetUrl pipe to be transfered to shared module --
        if (this.workorderData['author'] && this.workorderData['author'].profile_img) {
          this.workorderData['author'].profile_img = this.assetUrlPipe.transform(this.workorderData['author'].profile_img, true);
        }
        this.workorderData['images'].map( image =>
          image.url = this.assetUrlPipe.transform(image.url, true)
        );
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error,
          this.translateService.instant('WORKORDER_DETAILS.ERROR.FETCH_LIST')
        );
        this.router.navigate(
          this.buildRouteLink(
            [ROUTES.WORKORDERS]
          )
        );
      }
    );
  }

  getWorkorderComments(): void {
    this.workorderService.getWorkorderComments(this.getWorkorderId()).subscribe(
      response => {
        this.workorderComments = response;

        // modify data with assetUrl pipe to be transfered to shared module --
        this.workorderComments.map( comment =>
          (comment.images || []).map( commentImage =>
            commentImage.url = this.assetUrlPipe.transform(commentImage.url, true)
          )
        );
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error,
          this.translateService.instant('WORKORDER_DETAILS.COMMENTS.ERROR.FETCH_LIST')
        );
      }
    );
  }

  getWorkorderLogs(): void {
    this.workorderService.getWorkorderLogs(this.getWorkorderId()).subscribe(
      response => {
        this.workorderLogs = response;

        // modify data with assetUrl pipe to be transfered to shared module --
        this.workorderLogs.map( log => {
            if (log.user && log.user.profile_img) {
              log.user.profile_img = this.assetUrlPipe.transform(log.user.profile_img, true);
          }
        });
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error,
          this.translateService.instant('WORKORDER_DETAILS.LOGS.ERROR.FETCH_LIST')
        );
      }
    );
  }

  getWorkorderTasks(filters: any = {}, page, perPage): Observable<any> {
    return this.workorderService.getWorkorderTasks(
      filters,
      page,
      perPage
    );
  }

  addComment(eventData: Event): void {
    this.workorderService.addWorkorderComment(this.routeParams['workorderId'], eventData).subscribe(
      response => {
        this.getWorkorderComments();
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error,
          this.translateService.instant('WORKORDER_DETAILS.COMMENTS.ERROR.ADD_NEW')
        );
      }
    );
  }

  openAddTaskDialog() {
    const config = new MatDialogConfig();
    config.width = MODAL_VIEW_PORT_WIDTH.LARGE;
    config.maxHeight = MODAL_VIEW_PORT_HEIGHTS.MEDIUM;

    config.data = {
      propertyId: this.workorderData.property_id,
      addWorkorderTask: (taskData) => {
        this.createWorkorderTask(taskData);
        this.addTaskDialogComponent.close();
      }
    };
    this.addTaskDialogComponent = this.dialog.open(
      TaskDialogComponent,
      config
    );
  }

  createWorkorderTask(data) {
    this.workorderService.addWorkorderTask(data, this.getWorkorderId()).subscribe(() => {
      this.taskDetailsSection.resetTasksList();

      this.flashMessageService.displayMessage(
        this.translateService.instant('WORKORDER_DETAILS.TASKS.SUCCESSFULLY_CREATED_TASK')
      );
    }, (res) => {
      this.httpValidationMessagesService.displayErrors(
        res.error, 'WORKORDERS.VALIDATION'
      );
    });
  }

  openAddLaborDialog(labor = null) {
    const config = new MatDialogConfig();
    config.width = MODAL_VIEW_PORT_WIDTH.LARGE;
    config.maxHeight = MODAL_VIEW_PORT_HEIGHTS.MEDIUM;

    config.data = {
      propertyId: this.workorderData.property_id,
      ...(
        labor ? { labor } : {}
      ),
      laborFormAction: (laborData, shouldOpenAddLaborDialog) => {
        this.addLaborDialogComponent.close();
        return labor
          ? this.updateWorkorderLabor(laborData, labor._id)
          : this.createWorkorderLabor(laborData, shouldOpenAddLaborDialog);
      },
    };
    this.addLaborDialogComponent = this.dialog.open(
      WorkorderAddLaborDialogComponent,
      config
    );
  }

  createWorkorderLabor(data, shouldOpenAddLaborDialog = false) {
    this.workorderService.addWorkorderLabor(data, this.getWorkorderId()).subscribe(() => {
      // reinitialize component to update details
      this.getWorkorderDetails();

      if (shouldOpenAddLaborDialog) {
        this.openAddLaborDialog();
      }

      this.flashMessageService.displayMessage(
        this.translateService.instant('WORKORDER_DETAILS.LABORS.SUCCESSFULLY_ADDED_LABOR')
      );
    }, (res) => {
      this.httpValidationMessagesService.displayErrors(
        res.error, 'WORKORDERS.VALIDATION'
      );
    });
  }

  updateWorkorderLabor(data, laborId) {
    this.workorderService.updateWorkorderLabor(
        data,
        this.getWorkorderId(),
        laborId
      ).subscribe(() => {
      // reinitialize component to update details
      this.getWorkorderDetails();

      this.flashMessageService.displayMessage(
        this.translateService.instant('WORKORDER_DETAILS.LABORS.SUCCESSFULLY_UPDATED_LABOR')
      );
    }, (res) => {
      this.httpValidationMessagesService.displayErrors(
        res.error, 'WORKORDERS.VALIDATION'
      );
    });
  }

  openAddMaterialDialog(material = null) {
    const config = new MatDialogConfig();
    config.width = MODAL_WIDTHS.MEDIUM;
    config.data = {
      propertyId: this.workorderData.property_id,
      ...(
        material ? { material } : {}
      ),
      materialFormAction: (materialData, shouldOpenAddMaterialDialog) => {
        this.addMaterialDialogComponent.close();
        return material
          ? this.updateWorkorderMaterial(materialData, material._id)
          : this.createWorkorderMaterial(materialData, shouldOpenAddMaterialDialog);
      }
    };
    this.addMaterialDialogComponent = this.dialog.open(
      WorkorderAddMaterialDialogComponent,
      config
    );
  }

  createWorkorderMaterial(data, shouldOpenAddMaterialDialog = false) {
    this.workorderService.addWorkorderMaterial(data, this.getWorkorderId()).subscribe(() => {
      // reinitialize component to update details
      this.getWorkorderDetails();

      if (shouldOpenAddMaterialDialog) {
        this.openAddMaterialDialog();
      }

      this.flashMessageService.displayMessage(
        this.translateService.instant('WORKORDER_DETAILS.MATERIALS.SUCCESSFULLY_ADDED_MATERIAL')
      );
    }, (res) => {
      this.httpValidationMessagesService.displayErrors(
        res.error, 'WORKORDERS.VALIDATION'
      );
    });
  }

  updateWorkorderMaterial(data, materialId) {
    this.workorderService.updateWorkorderMaterial(
      data,
      this.getWorkorderId(),
      materialId
    ).subscribe(() => {
    // reinitialize component to update details
    this.getWorkorderDetails();

    this.flashMessageService.displayMessage(
      this.translateService.instant('WORKORDER_DETAILS.MATERIALS.SUCCESSFULLY_UPDATED_MATERIAL')
    );
  }, (res) => {
    this.httpValidationMessagesService.displayErrors(
      res.error, 'WORKORDERS.VALIDATION'
    );
  });
  }

  openPaymentDialog() {
    const config = new MatDialogConfig();
    config.width = MODAL_WIDTHS.MEDIUM;
    config.data = {
      workorder: this.workorderData,
      addWorkorderPayment: (paymentData) => {
        this.addWorkorderPayment(paymentData);
        this.addPaymentDialogComponent.close();
      }
    };
    this.addPaymentDialogComponent = this.dialog.open(
      WorkordersPaymentDialogComponent,
      config
    );
  }

  addWorkorderPayment(data) {
    this.workorderService.addWorkorderPayment(data, this.getWorkorderId()).subscribe(() => {
      // reinitialize component to update details
      this.getWorkorderDetails();

      this.flashMessageService.displayMessage(
        this.translateService.instant('WORKORDER_DETAILS.PAYMENT.SUCCESSFULLY_UPDATED_PAYMENT')
      );
    }, (res) => {
      this.httpValidationMessagesService.displayErrors(
        res.error, 'WORKORDERS.VALIDATION'
      );
    });
  }

  openAssignUserDialog() {
    const config = new MatDialogConfig();
    config.width = MODAL_WIDTHS.MEDIUM;
    config.data = {
      workorderType: this.workOrderType,
      propertyId: this.workorderData.property_id,
      assignUser: (data) => {
        this.assignWorkorder(data);
        this.assignUserDialogComponent.close();
      }
    };
    this.assignUserDialogComponent = this.dialog.open(
      WorkordersAssignDialogComponent,
      config
    );
  }

  assignWorkorder(data) {
    const formData = {};
    formData[data.assignee_type] = data.assigned_to;

    const assignmentSuccessMsg = data.assignee_type === ASSIGNED_TO
      ? 'WORKORDERS.SUCCESSFULLY_ASSINGED_USER'
      : 'WORKORDERS.SUCCESSFULLY_ASSINGED_GROUP';
    this.workorderService.assignStaff(this.getWorkorderId(), formData).subscribe(() => {
      this.flashMessageService.displayMessage(
        this.translateService.instant(assignmentSuccessMsg)
      );
      this.getWorkorder();
    }, (res) => {
      this.httpValidationMessagesService.displayErrors(
        res.error, 'WORKORDERS.VALIDATION'
      );
    });
  }

  closeWorkorder(data) {
    this.workorderService.closeWorkOrder(this.getWorkorderId(), data).subscribe(
      () => {
        this.flashMessageService.displayMessage(
          this.translateService.instant(
            'WORKORDERS.WORKORDER_ACTION_SUCCESS',
            { action: this.translateService.instant('COMMON.ACTION.CLOSED') }
          )
        );
        this.getWorkorder();
      },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  completeWorkorder(data) {
    this.workorderService.completeWorkOrder(this.getWorkorderId()).subscribe(
      () => {
        this.flashMessageService.displayMessage(
          this.translateService.instant(
            'WORKORDERS.WORKORDER_ACTION_SUCCESS',
            { action: this.translateService.instant('COMMON.ACTION.COMPLETED') }
          )
        );
        this.getWorkorder();
      },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  startWorkorder() {
    this.workorderService.startWorkOrder(this.getWorkorderId()).subscribe(
      () => {
        const actionLiteral = this.translateService.instant(
          this.isWorkorderReopned
          ? 'COMMON.ACTION.REOPENED'
          : 'COMMON.ACTION.ACCEPTED'
        );

        this.flashMessageService.displayMessage(
          this.translateService.instant(
            'WORKORDERS.WORKORDER_ACTION_SUCCESS',
            { action: actionLiteral }
          )
        );
        this.getWorkorder();
      },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  approveWorkorder() {
    this.workorderService.approveWorkOrder(this.getWorkorderId()).subscribe(
      () => {
        this.flashMessageService.displayMessage(
          this.translateService.instant(
            'WORKORDERS.WORKORDER_ACTION_SUCCESS',
            { action: this.translateService.instant('COMMON.ACTION.APPROVED') }
          )
        );
        this.getWorkorder();
      },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  openDeclineWorkOrderDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = MODAL_WIDTHS.MEDIUM;
    dialogConfig.data = {
      title: this.translateService.instant('WORKORDERS.ACTIONS.DECLINE'),
      message: this.translateService.instant(
        `WORKORDERS.FORM.FIELDS.DECLINE_REASON`
      ),
      confirm: (message: string) => {
        this.declineWorkorder({ wo_decline_reason: message });
        this.textConfirmationDialogRef.close();
      },
      decline: () => {
        this.textConfirmationDialogRef.close();
      }
    };

    this.textConfirmationDialogRef = this.dialog.open(TextConfirmationDialogComponent, dialogConfig);
  }

  declineWorkorder(data) {
    this.workorderService.declineWorkOrder(
      this.getWorkorderId(),
      data
    ).subscribe(
      () => {
        this.flashMessageService.displayMessage(
          this.translateService.instant(
            'WORKORDERS.WORKORDER_ACTION_SUCCESS',
            { action: this.translateService.instant('COMMON.ACTION.DECLINED') }
          )
        );
        this.getWorkorder();
      },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  downloadPDF() {
    return this.workorderService.exportDetails(this.getWorkorderId()).subscribe();
  }

  getPropertyChargeCode(propertyId, properties) {
    const property = find(properties, item => item.property_id === propertyId);
    return has(property, 'property.charge_code') ? property.property.charge_code : null;
  }

  openEditWorkorderDialog() {
    const config = new MatDialogConfig();
    const workorder = this.workorderData;
    const propertyChargeCode = this.getPropertyChargeCode(this.user.property_id, this.user.associated_properties);
    config.width = MODAL_VIEW_PORT_WIDTH.LARGE;
    config.maxHeight = MODAL_VIEW_PORT_HEIGHTS.MEDIUM;

    config.data = {
      workOrderType: this.workOrderType,
      workorder,
      propertyChargeCode,
      manageWorkorder: (data) => {
        this.editTaskTemplate(workorder._id, data, this.workOrderType, () => {
          this.workorderDialogComponent.close();
        });
      }
    };

    this.workorderDialogComponent = this.dialog.open(
      WorkorderDialogComponent,
      config
    );
  }

  openDeleteWorkOrderDialog() {
    this.openConfirmationDialog(
      this.translateService.instant('COMMON.CONFIRMATION'),
      this.translateService.instant('WORKORDERS.WORKORDER_DELETE_CONFIRMATION'),
      this.deleteWorkorder.bind(this)
    );
  }

  deleteWorkorder() {
    if ((this.workorderData.labors && this.workorderData.labors.length)
      || (this.workorderData.materials && this.workorderData.materials.length)) {
        return this.flashMessageService.displayMessage(
          this.translateService.instant('WORKORDERS.ERRORS.WORK_ORDER_DELETE')
        );
      }
    this.workorderService.deleteWorkorder(this.getWorkorderId()).subscribe(
      response => {
        this.flashMessageService.displayMessage(
          response.msg
        );

        this.router.navigate(
          this.buildRouteLink(
            [ROUTES.WORKORDERS]
          )
        );
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  editTaskTemplate(workorderId, data, workOrderType, successCallback = () => {}) {
    this.workorderService.updateWorkorder(workorderId, data, workOrderType)
      .subscribe(
        () => {
          this.afterSuccessfulAction('WORKORDERS.SUCCESSFULLY_UPDATED_WORKORDER');
          successCallback();
        },
        (res) => {
          this.httpValidationMessagesService.displayErrors(
            res.error, 'WORKORDERS.VALIDATION'
          );
        }
      );
  }

  deleteLaborDialog(labor: any) {
    this.openConfirmationDialog(
      this.translateService.instant('COMMON.CONFIRMATION'),
      this.translateService.instant('WORKORDER_DETAILS.LABORS.LABOR_DELETE_CONFIRMATION'),
      this.deleteWorkorderLabor.bind(this),
      [labor._id]
    );
  }

  deleteWorkorderLabor(laborId: string) {
    this.workorderService.deleteWorkorderLabor(this.getWorkorderId(), laborId).subscribe(
      response => {
        this.afterSuccessfulAction('WORKORDER_DETAILS.LABORS.SUCCESSFULLY_DELETED_LABOR');
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  deleteMaterialDialog(material: any) {
    this.openConfirmationDialog(
      this.translateService.instant('COMMON.CONFIRMATION'),
      this.translateService.instant('WORKORDER_DETAILS.MATERIALS.MATERIAL_DELETE_CONFIRMATION'),
      this.deleteWorkorderMaterial.bind(this),
      [material._id]
    );
  }

  deleteWorkorderMaterial(materialId: string) {
    this.workorderService.deleteWorkorderMaterial(this.getWorkorderId(), materialId).subscribe(
      response => {
        this.afterSuccessfulAction('WORKORDER_DETAILS.MATERIALS.SUCCESSFULLY_DELETED_MATERIAL');
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  afterSuccessfulAction(message, params = {}) {
    this.flashMessageService.displayMessage(
      this.translateService.instant(message, params)
    );

    this.getWorkorder();
  }

  goToTask(taskId) {
    this.router.navigate(
      buildRouteLink(
        [
          ROUTES.TASKS,
          ROUTES.TASK_DETAILS
        ],
        { taskId }
      )
    );
  }

  getAddToLedgerResident() {
    this.unitsService.getUnitMainResidents(this.getWorkorderId()).subscribe(
      response => {
        if (response.code !== 200 || !response.data.length) {
          this.flashMessageService.displayMessage(
            this.translateService.instant('UNITS.FAILED_TO_GET_MAIN_RESIDENTS')
          );
        }

        if (response.data.length === 1) {
          return this.addWorkorderToLedger(first(response.data)['_id']);
        }

        const config = new MatDialogConfig;
        config.width = MODAL_WIDTHS.MEDIUM;
        config.data = {
          resource: response.data,
          formTitle: this.translateService.instant('WORKORDERS.SELECT_RESIDENT'),
          inputLabel: this.translateService.instant('WORKORDERS.SELECT_MAIN_UNIT_RESIDENT'),
          action: (formValues) => {
            this.addWorkorderToLedger(formValues.selected);
            this.selectResourceDialogRef.close();
          }
        };

        this.selectResourceDialogRef = this.dialog.open(
          SelectResourceDialogComponent,
          config
        );
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  addWorkorderToLedger(residentId: string) {
    this.workorderService.addToLedger(
      {
        userId: this.user._id,
        userTypeId: this.user.user_type_id,
        propertyId: this.workorderData.property_id,
        serviceType: 'wo',
        residentId,
        serviceIds: [this.getWorkorderId()]
      }
    ).subscribe(
      response => {
        this.afterSuccessfulAction('WORKORDERS.SUCCESSFULLY_ADDED_TO_LEDGER');
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }

  openConfirmationDialog(
    title,
    message,
    onConfirm: Function,
    onConfirmArguments = []
  ) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = MODAL_WIDTHS.MEDIUM;
    dialogConfig.data = {
      title,
      message,
      confirm: () => {
        onConfirm(...onConfirmArguments);
        this.confirmationDialogRef.close();
      },
      decline: () => {
        this.confirmationDialogRef.close();
      }
    };

    this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
  }

  openMaterialDetails(materialId) {
    this.router.navigate(
      this.buildRouteLink(
        [
          ROUTES.WORKORDERS,
          ROUTES.MATERIAL_DETAILS
        ],
        { materialId }
      )
    );
  }

  openLaborDetails(laborId) {
    this.router.navigate(
      this.buildRouteLink(
        [
          ROUTES.WORKORDERS,
          ROUTES.LABORS,
          ROUTES.LABOR_DETAILS
        ],
        { laborId }
      )
    );
  }

  updateBillingStatus(isBilled: boolean) {
    this.workorderService.updateBillingStatus(
      this.getWorkorderId(),
      isBilled
    ).subscribe(
      response => {
        this.afterSuccessfulAction(
          isBilled
          ? 'WORKORDERS.SUCCESSFULLY_MARKED_BILLED'
          : 'WORKORDERS.SUCCESSFULLY_MARKED_UNBILLED'
        );
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error, 'WORKORDERS.VALIDATION'
        );
      }
    );
  }
}
