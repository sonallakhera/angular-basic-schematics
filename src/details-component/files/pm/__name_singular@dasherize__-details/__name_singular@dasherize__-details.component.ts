// library imports
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

// helper & services
import { User } from '../../../shared/store';
import { buildRouteLink, getAllParams } from 'src/app/shared/helpers';

import { FlashMessagesService } from '../../../shared/services/flash-messages.service';
import { HttpValidationMessagesService } from 'src/app/shared/services/http-validation-messages.service';
import { UsersService } from '../../../shared/store/users/users.service';
import { <%= classify(name) %>Service } from '../store/<%= dasherize(name) %>.service';
import { RiseUserDataService } from 'src/app/shared/services/rise-user-data.service';
import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';

// constants
import { ROLES, ROUTES, LINK_ROUTES } from '../../../shared/constants';
import { MODAL_WIDTHS, MODAL_VIEW_PORT_HEIGHTS, MODAL_VIEW_PORT_WIDTH } from 'rise-shared-module-frontend/src/constants/dialogs';

// components
import {
  ConfirmationDialogComponent
} from './../../../shared/components/dialogs/confirmation/confirmation-dialog.component';


@Component({
  selector: 'app-<%= dasherize(name_singular) %>-details',
  templateUrl: './<%= dasherize(name_singular) %>-details.component.html'
})
export class <%= classify(name_singular) %>DetailsComponent implements OnInit {

  confirmationDialogRef: MatDialogRef<ConfirmationDialogComponent>;

  routeParams = {
    <%= camelize(name_singular) %>Id: null
  };

  user: User;
  property: any;
  propertyAppType: any;
  timezone: string;
  
  <%= camelize(name_singular) %>Data: any = {};
  <%= camelize(name_singular) %>Comments = [];
  <%= camelize(name_singular) %>Logs = [];

  LINK_ROUTES = LINK_ROUTES;
  ROUTES = ROUTES;
  ROLES = ROLES;

  buildRouteLink = buildRouteLink;
  

  constructor(
    private router: Router,
    private assetUrlPipe: AssetUrlPipe,
    private activatedRoute: ActivatedRoute,
    private <%= camelize(name) %>Service: <%= classify(name) %>Service,
    private flashMessageService: FlashMessagesService,
    private httpValidationMessagesService: HttpValidationMessagesService,
    private usersService: UsersService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private riseUserDataService: RiseUserDataService,
  ) {
    this.riseUserDataService.riseUserData.subscribe(
      riseUserData => {
        this.timezone = riseUserData.timezone;
        this.propertyAppType = riseUserData.app_type;
        this.property = riseUserData.property;
      }
    );
  }

  ngOnInit() {
    this.setUserData();
    this.get<%= classify(name_singular) %>Details();
  }

  get<%= classify(name_singular) %>Details(): void {
    this.<%= camelize(name_singular) %>Data = this.activatedRoute.snapshot.data.<%= camelize(name_singular) %>;
  }

  get<%= classify(name_singular) %>Id(): any {
    return this.routeParams.<%= camelize(name_singular) %>Id;
  }

  setUserData() {
    this.user = this.activatedRoute.snapshot.data.user;
  }

  get<%= classify(name_singular) %>() {
    // add code to fetch <%= name.toLowerCase() %> data
  }

  get<%= classify(name_singular) %>Comments(): void {
    this.<%= camelize(name) %>Service.get<%= classify(name_singular) %>Comments(this.get<%= classify(name_singular) %>Id()).subscribe(
      response => {
        this.<%= camelize(name_singular) %>Comments = response;

        // modify data with assetUrl pipe to be transfered to shared module --
        this.<%= camelize(name_singular) %>Comments.map( comment =>
          (comment.images || []).map( commentImage =>
            commentImage.url = this.assetUrlPipe.transform(commentImage.url, true)
          )
        );
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error,
          this.translateService.instant('<%= underscore(name).toUpperCase() %>.DETAILS.COMMENTS.ERROR.FETCH_LIST')
        );
      }
    );
  }

  get<%= classify(name_singular) %>Logs(): void {
    this.<%= camelize(name) %>Service.get<%= classify(name_singular) %>Logs(this.get<%= classify(name_singular) %>Id()).subscribe(
      response => {
        this.<%= camelize(name_singular) %>Logs = response.data;
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error,
          this.translateService.instant('<%= underscore(name).toUpperCase() %>.DETAILS.LOGS.ERROR.FETCH_LIST')
        );
      }
    );
  }

  addComment(eventData: Event): void {
    this.<%= camelize(name) %>Service.add<%= classify(name_singular) %>Comment(this.get<%= classify(name_singular) %>Id(), eventData).subscribe(
      response => {
        this.get<%= classify(name_singular) %>Comments();
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error,
          this.translateService.instant('<%= underscore(name).toUpperCase() %>.DETAILS.COMMENTS.ERROR.ADD_NEW')
        );
      }
    );
  }

  // <%= name.toUpperCase() %> ACTION ---- 
  close<%= classify(name) %>(data) {
    this.<%= camelize(name) %>Service.close<%= classify(name_singular) %>(this.get<%= classify(name_singular) %>Id(), data).subscribe(
      () => {
        this.flashMessageService.displayMessage(
          this.translateService.instant(
            '<%= underscore(name).toUpperCase() %>.<%= name_singular.toUpperCase %>_ACTION_SUCCESS',
            { action: this.translateService.instant('COMMON.ACTION.CLOSED') }
          )
        );
        this.get<%= classify(name_singular) %>();
      },
      (res) => {
        this.httpValidationMessagesService.displayErrors(
          res.error, '<%= underscore(name).toUpperCase() %>.VALIDATION'
        );
      }
    );
  }

  // <%= name.toUpperCase() %> ACTION ---- 
  downloadPDF() {
    return this.<%= camelize(name) %>Service.exportDetails(this.get<%= classify(name_singular) %>Id()).subscribe();
  }

  // REDIRECTION METHOD ---- 
  goToEdit<%= classify(name_singular) %>() {
    this.router.navigate(
      buildRouteLink(
        [
          ROUTES.<%= underscore(name).toUpperCase() %>,
          ROUTES.EDIT_<%= underscore(name_singular).toUpperCase() %>
        ],
        { this.get<%= classify(name_singular) %>Id() }
      )
    );
  }

  openDelete<%= classify(name_singular) %>Dialog() {
    this.openConfirmationDialog(
      this.translateService.instant('COMMON.CONFIRMATION'),
      this.translateService.instant('<%= underscore(name).toUpperCase() %><%= underscore(name_singular).toUpperCase() %>_DELETE_CONFIRMATION'),
      this.delete<%= classify(name_singular) %>.bind(this)
    );
  }

  delete<%= classify(name_singular) %>() {
    this.<%= camelize(name) %>Service.delete<%= classify(name_singular) %>(this.get<%= classify(name_singular) %>Id()).subscribe(
      response => {
        this.flashMessageService.displayMessage(
          response.msg
        );

        this.router.navigate(
          this.buildRouteLink(
            [ROUTES.<%= underscore(name).toUpperCase() %>]
          )
        );
      },
      response => {
        this.httpValidationMessagesService.displayErrors(
          response.error, '<%= underscore(name).toUpperCase() %>.VALIDATION'
        );
      }
    );
  }

  afterSuccessfulAction(message, params = {}) {
    this.flashMessageService.displayMessage(
      this.translateService.instant(message, params)
    );

    this.get<%= classify(name_singular) %>();
  }

  // CONFIRMATION DIALOG ---- 
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
}
