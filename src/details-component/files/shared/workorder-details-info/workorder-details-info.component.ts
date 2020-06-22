import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { isArray, first, isBoolean, has } from 'lodash';

import { WORKORDER_STATUS, WORKORDER_APPROVAL_STATUS } from '../../../constants/workorder';
import { MOMENT_DATETIME_FORMATS } from '../../../constants/dateFormats';
import { RISE_AVATAR, RISE_NGX_GALLERY } from '../../../constants/global';
import { getGalleryOptions, getGalleryImages } from '../../../helpers/ngx-gallery-options.helper';
import { TranslateService } from '@ngx-translate/core';
import { getUserTypeTranslateKey } from '../../../helpers/global.helper';
import { PROPERTY_TYPES, DEFAULT_PROPERTY_TYPE, DEFAULT_PROPERTY_TYPE_NODE_NAME } from './../../../constants/properties';

@Component({
  selector: 'rise-workorder-details-info',
  templateUrl: './workorder-details-info.component.html',
  styleUrls: [
    './../../../assets/styles/global.scss'
  ]
})
export class WorkorderDetailsInfoComponent implements OnInit {

  @Input() workorder: any = {};
  @Input() timezone: string;
  @Input() property: any;
  @Input() propertyAppType: any;

  @ViewChild('textTemplate') textTemplate: TemplateRef<any>;
  @ViewChild('userTemplate') userTemplate: TemplateRef<any>;
  @ViewChild('assignGroupTemplate') assignGroupTemplate: TemplateRef<any>;
  @ViewChild('affirmationTemplate') affirmationTemplate: TemplateRef<any>;
  @ViewChild('dateTimeTemplate') dateTimeTemplate: TemplateRef<any>;

  WORKORDER_STATUS = WORKORDER_STATUS;
  MOMENT_DATETIME_FORMATS = MOMENT_DATETIME_FORMATS;
  RISE_AVATAR = RISE_AVATAR;
  RISE_NGX_GALLERY = RISE_NGX_GALLERY;

  getGalleryImages = getGalleryImages;
  getGalleryOptions = getGalleryOptions;

  objectKeys = Object.keys;

  public workorderStatusButtons: any = {};
  public workorderApprovalStatusButtons: any = {};
  public workorderDetailsList: any = {};

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.initiateWorkorderStatuses();
    this.initiateWorkorderDetailsList();
  }

  getUserType(user: any): string {
    return getUserTypeTranslateKey(user.user_type_id, this.propertyAppType);
  }

  /**
   * method for constructing workorder status array for status chip
   */

  initiateWorkorderStatuses(): void {
    this.workorderStatusButtons = {
      [WORKORDER_STATUS.PENDING]: {
        label: this.translate.instant(`WORKORDERS.STATUSES.${WORKORDER_STATUS.PENDING}`),
        class: 'rb-cursor-defult header-status-btn btn wo-pending'
      },
      [WORKORDER_STATUS.TO_BE_STARTED]: {
        label: this.translate.instant(`WORKORDERS.STATUSES.${WORKORDER_STATUS.TO_BE_STARTED}`),
        class: 'rb-cursor-defult header-status-btn btn started'
      },
      [WORKORDER_STATUS.IN_PROGRESS]: {
        label: this.translate.instant(`WORKORDERS.STATUSES.${WORKORDER_STATUS.IN_PROGRESS}`),
        class: 'rb-cursor-defult header-status-btn btn wo-progress'
      },
      [WORKORDER_STATUS.COMPLETED]: {
        label: this.translate.instant(`WORKORDERS.STATUSES.${WORKORDER_STATUS.COMPLETED}`),
        class: 'rb-cursor-defult header-status-btn btn wo-completed'
      },
      [WORKORDER_STATUS.CLOSED]: {
        label: this.translate.instant(`WORKORDERS.STATUSES.${WORKORDER_STATUS.CLOSED}`),
        class: 'rb-cursor-defult header-status-btn btn wo-closed'
      },
    };

    this.workorderApprovalStatusButtons = {
      [WORKORDER_APPROVAL_STATUS.APPROVED]: {
        label: 'COMMON.APPROVED',
        class: 'rb-cursor-defult header-status-btn btn progress'
      },
      [WORKORDER_APPROVAL_STATUS.DECLINED]: {
        label: 'COMMON.DECLINED',
        class: 'rb-cursor-defult header-status-btn btn closed'
      },
    };
  }

  /**
   * method for constructing workorder details list array
   */

  initiateWorkorderDetailsList(): void {
    this.workorderDetailsList = {
      ['service_number']: {
        label: 'WORKORDERS.FIELDS.SERVICE_NUMBER'
      },
      ['workorder_category']: {
        label: 'WORKORDERS.FIELDS.CATEGORY',
        field: 'text_name'
      },
      ['charge_code']: {
        label: 'WORKORDERS.FIELDS.CHARGE_CODE',
        field: 'code'
      },
      ['location']: {
        label: 'WORKORDERS.FIELDS.LOCATION'
      },
      ['equipment']: {
        label: 'WORKORDERS.FIELDS.EQUIPMENT',
        field: 'name'
      },
      ['issue']: {
        label: 'WORKORDERS.ISSUE',
        field: 'name'
      },
      ['equipment_category']: {
        label: 'WORKORDERS.FIELDS.EQUIPMENT_CATEGORY',
        field: 'name'
      },
      ['estimate_needed']: {
        label: 'WORKORDERS.FIELDS.NEED_ESTIMATE',
        templateType: this.affirmationTemplate
      },
      ['have_pet']: {
        label: 'WORKORDERS.FIELDS.HAS_PET',
        templateType: this.affirmationTemplate,
        disable: this.propertyAppType !== DEFAULT_PROPERTY_TYPE_NODE_NAME
      },
      ['permission_to_enter']: {
        label: 'WORKORDERS.FIELDS.ALLOWED_TO_ENTER',
        templateType: this.affirmationTemplate
      },
      ['assigned_user']: {
        label: 'WORKORDERS.FIELDS.ASSIGNED_TO',
        templateType: this.userTemplate
      },
      ['assigned_group']: {
        label: 'WORKORDERS.FIELDS.ASSIGNED_TO',
        templateType: this.assignGroupTemplate
      },
      ['created']: {
        label: 'WORKORDERS.FIELDS.OPENED_DATE',
        templateType: this.dateTimeTemplate
      },
      ['yardi_workorder_id']: {
        label: 'WORKORDERS.FIELDS.YARDI_ID'
      },
      ['yardi_category']: {
        label: 'WORKORDERS.FIELDS.YARDI_CATEGORY'
      },
      ['author']: {
        label: 'WORKORDERS.FIELDS.OPENED_BY',
        templateType: this.userTemplate
      },
      ['Started_Date']: {
        label: 'WORKORDERS.START_DATE',
        templateType: this.dateTimeTemplate
      },
      ['started_by']: {
        label: 'WORKORDERS.FIELDS.STARTED_BY',
        templateType: this.userTemplate
      },
      ['Re_Opened_Date']: {
        label: 'WORKORDERS.FIELDS.REOPENED_DATE',
        templateType: this.dateTimeTemplate
      },
      ['reopened_by']: {
        label: 'WORKORDERS.FIELDS.REOPENED_BY',
        templateType: this.userTemplate
      },
      ['completed_date']: {
        label: 'WORKORDERS.FIELDS.COMPLETED_DATE',
        templateType: this.dateTimeTemplate
      },
      ['completed_by']: {
        label: 'WORKORDERS.FIELDS.COMPLETED_BY',
        templateType: this.userTemplate
      },
      ['service_close_date']: {
        label: 'WORKORDERS.FIELDS.CLOSED_DATE',
        templateType: this.dateTimeTemplate
      },
      ['closed_by']: {
        label: 'WORKORDERS.FIELDS.CLOSED_BY',
        templateType: this.userTemplate
      },
      ['rating']: {
        label: 'WORKORDERS.FIELDS.RATING'
      },
      ['entry_note']: {
        label: 'WORKORDERS.FIELDS.ENTRY_NOTES'
      },
      ['wo_decline_reason']: {
        label: 'WORKORDERS.FIELDS.DECLINE_REASON'
      },
    };
  }

  /**
   * method for getting user name
   * @param user
   */

  getUserName(user: any): string {
    if (!user) {
      return this.translate.instant('COMMON.USER_UNAVAILABLE');
    } else {
      return user && user.firstname + ' ' + user.lastname;
    }
  }

  /**
   * method for getting workorder heading
   */

  getWorkorderHeading(): string {
    let workorderHeading = ``;

    workorderHeading = this.workorder && this.workorder.service_category
      ? `${this.workorder.service_category.name}`
      : `${this.translate.instant('WORKORDERS.SINGULAR')}`;

    workorderHeading = this.workorder && this.workorder.unit
      ? `${workorderHeading} - ${this.getLabel()} - ${this.workorder.unit.unit_number}`
      : `${workorderHeading} - ${this.translate.instant('COMMON.UNIT_UNAVAILABLE')}`;

    return workorderHeading;
  }

  getLabel(): string {
    const unitText = `COMMON.UNIT_TEXT.${
      PROPERTY_TYPES[this.propertyAppType] || DEFAULT_PROPERTY_TYPE
    }`;
    return this.translate.instant(unitText);
  }

  /**
   * method for getting workorder notify user
   */

  getNotifyUser(): any {
    return isArray(this.workorder.notify_users) ? first(this.workorder.notify_users) : null;
  }

}
