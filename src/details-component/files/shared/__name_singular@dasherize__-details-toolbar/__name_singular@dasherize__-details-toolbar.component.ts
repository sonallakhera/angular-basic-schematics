import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  MatPaginator,
  MatDialogConfig,
  MatDialogRef,
  MatDialog
} from '@angular/material';
import { includes, has } from 'lodash';

import { } from '../../../constants/<%= dasherize(name) %>';
import { MODAL_WIDTHS } from '../../../constants/dialogs';

@Component({
  selector: 'rise-<%= dasherize(name_singular) %>-details-toolbar',
  templateUrl: './<%= dasherize(name_singular) %>-details-toolbar.component.html',
  styleUrls: [
    './../../../assets/styles/global.scss'
  ]
})
export class <%= classify(name_singular) %>DetailsToolbarComponent implements OnInit {

  @Input() <%= camelize(name_singular) %>: any = {};

  @Output() eventTriggered = new EventEmitter();

  public secondaryActions: any = [];

  public primaryActionButtons = [
    {
      buttonLabel: this.translate.instant('<%= underscore(name).toUpperCase %>.ACTIONS.OPEN'),
      action: () => { this.eventTriggered.emit(); },
      disabled: !this.canDo,
      color: 'primary'
    },
  ];

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.initializeActionsArray();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initializeActionsArray();
  }

  initializeActionsArray(): void {
    this.secondaryActions = [
      {
        buttonLabel: this.translate.instant('<%= underscore(name).toUpperCase %>.ACTIONS.EDIT'),
        action: () => { this.eventTriggered.emit(); },
        disabled: !this.canDo
      },
    ];
  }

  get canDo() {
    return true;
  }

  action<%= classify(name_singular) %>() {
    // for some additional code triggering event
    this.eventTriggered.emit();
  }
}
