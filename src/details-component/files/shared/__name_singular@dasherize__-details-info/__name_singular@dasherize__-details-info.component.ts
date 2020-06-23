// library imports
import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { isArray, first, isBoolean, has } from 'lodash';
import { TranslateService } from '@ngx-translate/core';

// helpers & services
import { getGalleryOptions, getGalleryImages } from '../../../helpers/ngx-gallery-options.helper';
import { getUserTypeTranslateKey } from '../../../helpers/global.helper';

// constants
import { <%= underscore(name_singular).toUpperCase() %>_STATUS } from './../../../constants/<%= dasherize(name) %>'
import { MOMENT_DATETIME_FORMATS } from '../../../constants/dateFormats';
import { RISE_AVATAR, RISE_NGX_GALLERY } from '../../../constants/global';
import { PROPERTY_TYPES, DEFAULT_PROPERTY_TYPE, DEFAULT_PROPERTY_TYPE_NODE_NAME } from './../../../constants/properties';

@Component({
  selector: 'rise-<%= dasherize(name_singular) %>-details-info',
  templateUrl: './<%= dasherize(name_singular) %>-details-info.component.html',
  styleUrls: [
    './../../../assets/styles/global.scss'
  ]
})
export class <%= classify(name_singular) %>DetailsInfoComponent implements OnInit {

  @Input() <%= camelize(name_singular) %>: any = {};
  @Input() timezone: string;
  @Input() property: any;
  @Input() propertyAppType: any;

  @ViewChild('textTemplate') textTemplate: TemplateRef<any>;
  @ViewChild('userTemplate') userTemplate: TemplateRef<any>;
  @ViewChild('assignGroupTemplate') assignGroupTemplate: TemplateRef<any>;
  @ViewChild('affirmationTemplate') affirmationTemplate: TemplateRef<any>;
  @ViewChild('dateTimeTemplate') dateTimeTemplate: TemplateRef<any>;

  <%= underscore(name_singular).toUpperCase() %>_STATUS = <%= underscore(name_singular).toUpperCase() %>_STATUS;
  MOMENT_DATETIME_FORMATS = MOMENT_DATETIME_FORMATS;
  RISE_AVATAR = RISE_AVATAR;
  RISE_NGX_GALLERY = RISE_NGX_GALLERY;

  getGalleryImages = getGalleryImages;
  getGalleryOptions = getGalleryOptions;

  objectKeys = Object.keys;

  public <%= camelize(name_singular) %>StatusButtons: any = {};
  public <%= camelize(name_singular) %>DetailsList: any = {};

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.initiate<%= classify(name_singular) %>Statuses();
    this.initiate<%= classify(name_singular) %>DetailsList();
  }

  getUserType(user: any): string {
    return getUserTypeTranslateKey(user.user_type_id, this.propertyAppType);
  }

  /**
   * method for constructing <%= name_singular %> status array for status chip
   */

  initiate<%= classify(name_singular) %>Statuses(): void {
    this.<%= camelize(name_singular) %>StatusButtons = {
      [<%= underscore(name_singular).toUpperCase() %>_STATUS.PENDING]: {
        label: this.translate.instant(`<%= underscore(name).toUpperCase() %>.STATUSES.${<%= underscore(name_singular).toUpperCase() %>_STATUS.PENDING}`),
        class: 'rb-cursor-defult header-status-btn btn wo-pending'
      },
    };
  }

  /**
   * method for constructing <%= name_singular %> details list array
   */

  initiate<%= classify(name_singular) %>DetailsList(): void {
    this.<%= camelize(name_singular) %>DetailsList = {
      ['service_number']: {
        label: '<%= underscore(name).toUpperCase() %>.FIELDS.SERVICE_NUMBER'
      },
      ['author']: {
        label: '<%= underscore(name).toUpperCase() %>.FIELDS.CREATED_BY',
        templateType: this.userTemplate
      },
      ['TEXTCOLUMN']: {
        label: '<%= underscore(name).toUpperCase() %>.FIELDS.TEXTCOLUMN',
        field: 'text_name'
      },
      ['YESNOCOLUMN']: {
        label: '<%= underscore(name).toUpperCase() %>.FIELDS.YESNOCOLUMN',
        templateType: this.affirmationTemplate,
        disable: this.propertyAppType !== DEFAULT_PROPERTY_TYPE_NODE_NAME
      },
      ['created']: {
        label: '<%= underscore(name).toUpperCase() %>.FIELDS.CREATED_ON',
        templateType: this.dateTimeTemplate
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
   * method for getting <%= name_singular %> heading
   */

  get<%= classify(name_singular) %>Heading(): string {
    let <%= camelize(name_singular) %>Heading = ``;
    return <%= camelize(name_singular) %>Heading;
  }

  getLabel(): string {
    const unitText = `COMMON.UNIT_TEXT.${
      PROPERTY_TYPES[this.propertyAppType] || DEFAULT_PROPERTY_TYPE
    }`;
    return this.translate.instant(unitText);
  }

}
