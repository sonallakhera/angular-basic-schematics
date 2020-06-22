import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  MatPaginator,
  MatDialogConfig,
  MatDialogRef,
  MatDialog
} from '@angular/material';
import { includes, has } from 'lodash';

import {
  WORKORDER_STATUS,
  LEDGER_ENABLED_SERVICE_CATEGORIES,
  WORKORDER_SERVICE_CATEGORIES
} from '../../../constants/workorder';
import { MODAL_WIDTHS } from '../../../constants/dialogs';

import { WorkordersCloseDialogComponent } from './../workorders-close-dialog/workorders-close-dialog.component';

@Component({
  selector: 'rise-workorder-details-toolbar',
  templateUrl: './workorder-details-toolbar.component.html',
  styleUrls: [
    './../../../assets/styles/global.scss'
  ]
})
export class WorkorderDetailsToolbarComponent implements OnInit {

  workOrderCloseDialog: MatDialogRef<WorkordersCloseDialogComponent>;

  @Input() workorder: any = {};

  @Output() addTaskTriggered = new EventEmitter();
  @Output() addLaborTriggered = new EventEmitter();
  @Output() addMaterialTriggered = new EventEmitter();
  @Output() assignUserTriggered = new EventEmitter();
  @Output() closeWorkorderTriggered = new EventEmitter();
  @Output() completeWorkorderTriggered = new EventEmitter();
  @Output() startWorkorderTriggered = new EventEmitter();
  @Output() approveWorkorderTriggered = new EventEmitter();
  @Output() declineWorkorderTriggered = new EventEmitter();
  @Output() downloadPdfTriggered = new EventEmitter();
  @Output() editWorkOrderTriggered = new EventEmitter();
  @Output() addToLedgerTriggered = new EventEmitter();
  @Output() updateBillingStatus = new EventEmitter();
  @Output() deleteWorkOrderTriggered = new EventEmitter();

  public actions: any = [];
  closeWorkOrderAction = {
    buttonLabel: 'COMMON.CLOSE',
    do: this.closeWorkorder.bind(this),
    color: 'warn'
  };
  completeWorkOrderAction = {
    buttonLabel: 'COMMON.COMPLETE',
    do: this.completeWorkOrder.bind(this),
    color: 'accent'
  };
  reopenWorkOrderAction = {
    buttonLabel: 'COMMON.REOPEN',
    do: this.startWorkorder.bind(this),
    color: 'accent'
  };
  public workorderActionButtons = {
    [WORKORDER_STATUS.PENDING]: [
      {
        buttonLabel: 'COMMON.APPROVE',
        color: 'accent',
        do: this.approveWorkorder.bind(this),
      },
      {
        buttonLabel: 'COMMON.DECLINE',
        do: this.declineWorkorder.bind(this),
        color: 'warn'
      }
    ],
    [WORKORDER_STATUS.TO_BE_STARTED]: [
      {
        buttonLabel: 'COMMON.ACCEPT',
        do: this.startWorkorder.bind(this),
        color: 'accent'
      }
    ],
    [WORKORDER_STATUS.IN_PROGRESS]: [],
    [WORKORDER_STATUS.COMPLETED]: [
      this.reopenWorkOrderAction,
      this.closeWorkOrderAction
    ],
    [WORKORDER_STATUS.CLOSED]: [
      this.reopenWorkOrderAction
    ]
  };

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.initializeActionsArray();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initializeActionsArray();
    this.workorderActionButtons[WORKORDER_STATUS.IN_PROGRESS] =
      (has(this.workorder, 'property.complete_workorder_enabled')
      && this.workorder.property.complete_workorder_enabled)
      ? [this.completeWorkOrderAction]
      : [this.closeWorkOrderAction];
  }

  initializeActionsArray(): void {
    const isWorkorderInProgress = this.isWorkorderInProgress;
    const isWorkorderInProgressOrCompleted = this.isWorkorderInProgressOrCompleted;

    this.actions = [
      {
        buttonLabel: this.translate.instant('WORKORDERS.TASKS.ADD_NEW'),
        action: () => { this.addTaskTriggered.emit(); },
        disabled: !isWorkorderInProgress || this.isPMWorkorder
      },
      {
        buttonLabel: this.translate.instant('WORKORDERS.MATERIALS.ADD_NEW'),
        action: () => { this.addMaterialTriggered.emit(); },
        disabled: !isWorkorderInProgressOrCompleted || this.isPMWorkorder
      },
      {
        buttonLabel: this.translate.instant('WORKORDERS.LABORS.ADD_NEW'),
        action: () => { this.addLaborTriggered.emit(); },
        disabled: !isWorkorderInProgressOrCompleted || this.isPMWorkorder
      },
      {
        buttonLabel: this.translate.instant('WORKORDERS.ACTIONS.ASSIGN'),
        action: () => { this.assignUserTriggered.emit(); },
        disabled: this.isPMWorkorder
      },
      {
        buttonLabel: this.translate.instant('WORKORDERS.ACTIONS.DOWNLOAD_AS_PDF'),
        action: () => { this.downloadPdfTriggered.emit(); },
        disabled: false
      },
      {
        buttonLabel: this.translate.instant('WORKORDERS.ACTIONS.EDIT'),
        action: () => { this.editWorkOrderTriggered.emit(); },
        disabled: this.isWorkorderClosed && this.isPMWorkorder
      },
      // {
      //   buttonLabel: this.translate.instant('WORKORDERS.ACTIONS.DELETE'),
      //   action: () => { this.deleteWorkOrderTriggered.emit(); },
      //   disabled: this.isWorkorderClosed
      // },
      ...(
        this.workorder.is_billed !== true
        ? [{
            buttonLabel: this.translate.instant('WORKORDERS.ACTIONS.MARK_BILLED'),
            action: () => { this.updateBillingStatus.emit(true); },
            disabled: this.isPMWorkorder
          }]
        : []
      ),
      ...(
        this.workorder.is_billed !== false
        ? [{
            buttonLabel: this.translate.instant('WORKORDERS.ACTIONS.MARK_UNBILLED'),
            action: () => { this.updateBillingStatus.emit(false); },
            disabled: this.isPMWorkorder
          }]
        : []
      ),
      ...(
        has(this.workorder, 'property.track_workorders_on_ledger') && this.workorder.property.track_workorders_on_ledger
        ? [
          {
            buttonLabel: this.translate.instant('WORKORDERS.ACTIONS.ADD_TO_LEDGER'),
            action: () => { this.addToLedgerTriggered.emit(); },
            disabled: !this.canAddToLeger
          }
        ]
        : []
      )
    ];
  }

  get isWorkorderInProgress() {
    return this.workorder.work_order_status === WORKORDER_STATUS.IN_PROGRESS;
  }

  get isWorkorderInProgressOrCompleted() {
    return includes(
      [WORKORDER_STATUS.IN_PROGRESS, WORKORDER_STATUS.COMPLETED],
      this.workorder.work_order_status
    );
  }

  get isWorkorderClosed() {
    return this.workorder.work_order_status === WORKORDER_STATUS.CLOSED;
  }

  get canAddToLeger() {
    return has(this.workorder, 'notify_id.length')
      && this.workorder.notify_id.length
      && this.isWorkorderClosed
      && includes(LEDGER_ENABLED_SERVICE_CATEGORIES, this.workorder.services_category_id)
      && !this.workorder.added_to_ledger
      && (this.workorder.amount_due > 0);
  }

  get isPMWorkorder() {
    return this.workorder.services_category_id === WORKORDER_SERVICE_CATEGORIES.PM_WORKORDER;
  }

  approveWorkorder() {
    this.approveWorkorderTriggered.emit();
  }

  declineWorkorder() {
    this.declineWorkorderTriggered.emit();
  }

  startWorkorder() {
    this.startWorkorderTriggered.emit();
  }

  completeWorkOrder() {
    this.completeWorkorderTriggered.emit();
  }

  closeWorkorder() {
    const config = new MatDialogConfig();
    config.data = {
      workOrder: this.workorder,
      closeWorkOrder: (data: any) => {
        this.closeWorkorderTriggered.emit(data);
        this.workOrderCloseDialog.close();
      }
    };
    config.width = MODAL_WIDTHS.MEDIUM;
    this.workOrderCloseDialog = this.dialog.open(WorkordersCloseDialogComponent, config);
  }
}
