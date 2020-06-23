import { Component, Input } from '@angular/core';

import { MOMENT_DATETIME_FORMATS } from '../../../constants/dateFormats';
import { RISE_AVATAR } from '../../../constants/global';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rise-<%= dasherize(name_singular) %>-details-logs',
  templateUrl: './<%= dasherize(name_singular) %>-details-logs.component.html',
  styleUrls: [
    './../../../assets/styles/global.scss'
  ]
})
export class <%= classify(name_singular) %>DetailsLogsComponent {

  @Input() <%= camelize(name_singular) %>: any = {};
  @Input() logsList: [];
  @Input() user: any;
  @Input() timezone: string;

  MOMENT_DATETIME_FORMATS = MOMENT_DATETIME_FORMATS;
  RISE_AVATAR = RISE_AVATAR;

  constructor(
    private translate: TranslateService,
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
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
}
