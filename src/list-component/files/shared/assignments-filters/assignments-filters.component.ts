import { Component, Input, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { startWith, map, mergeMap } from 'rxjs/operators';
import { isString, values } from 'lodash';
import { PROPERTY_TYPES, DEFAULT_PROPERTY_TYPE } from '../../../constants/properties';
import { RiseUserData } from '../../../models/interfaces/rise-user-data.interface';

const ASSIGNMENT_STATUSES = {
  ACTIVATE: true,
  DEACTIVATE: false
};

const NO_VALUE_TYPE = {
  _id: '',
  name: '-'
};

@Component({
  selector: 'rise-assignments-filters',
  templateUrl: './assignments-filters.component.html',
  styleUrls: ['./assignments-filters.component.scss']
})
export class AssignmentsFiltersComponent {

  form: FormGroup;
  units: Observable<any>;
  assignmentCategories: Observable<any>;
  assignedToUsers: Observable<any>;
  assignmentStatuses = values(ASSIGNMENT_STATUSES);

  @Input() filters: any;
  @Input() riseUserData: RiseUserData;
  @Input() fetchUnits: (filters: {}) => Observable<any>;
  @Input() fetchAssignmentCategories: (filters: {}) => Observable<any>;
  @Input() workorderTypes: any[];


  @Output() submittedFilters = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      service_number: [this.serviceNumber],
      unit: [this.unit],
      assignment_categories: [this.assignmentCategory],
      expiration_date_range: [this.expirationDateRange],
      creation_date_range: [this.creationDateRange],
      assignment_status: [this.assignmentStatus, []]
    });

    const unitsControl = this.form.get('unit') as FormControl;
    this.units = unitsControl.valueChanges.pipe(
      startWith(''),
      mergeMap((value) => this.fetchUnits({
        unit_number: isString(value)
          ? value
          : (value ? value.unit_number : '')
      })),
      map((response) => {
        return response.results;
      })
    );

    const assignmetCategoriesControl = this.form.get('assignment_categories') as FormControl;
    this.assignmentCategories = assignmetCategoriesControl.valueChanges.pipe(
      startWith(''),
      mergeMap((value) => this.fetchAssignmentCategories({
        name: isString(value)
          ? value
          : (value ? value.name : '')
      })),
      map((response) => {
        return response.results;
      })
    );

  }

  get serviceNumber() {
    return this.filters ? this.filters.service_number : '';
  }

  get unit() {
    return this.filters ? this.filters.unit : null;
  }

  get assignmentCategory() {
    return this.filters ? this.filters.assignment_categories : null;
  }

  get creationDateRange() {
    return this.filters ? this.filters.creation_date_range : null;
  }

  get expirationDateRange() {
    return this.filters ? this.filters.expiration_date_range : null;
  }

  get assignmentStatus() {
    return this.filters ? this.filters.assignment_status : null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.workorderTypes && this.workorderTypes && this.workorderTypes.length) {
      this.workorderTypes.unshift(NO_VALUE_TYPE);
    }
  }

  resetForm() {
    this.form.reset();
    this.submittedFilters.emit(this.form.value);
  }

  submitForm() {
    this.submittedFilters.emit(this.form.value);
  }

  getLabel(label: string): string {
    const unitText = `COMMON.${label}.${
      PROPERTY_TYPES[this.riseUserData.app_type] || DEFAULT_PROPERTY_TYPE
      }`;
    return this.translate.instant(unitText);
  }

  displaySelectedUnit(unit?: any) {
    return unit ? unit.unit_number : '';
  }

  displaySelectedWorkorderType(workorderType?: any) {
    return workorderType ? workorderType.name : '';
  }

  displaySelectedAssignmentCategory(assignmentCategory?: any) {
    return assignmentCategory ? assignmentCategory.name : '';
  }

  displaySelectedUserName(user?: any) {
    return user ? user.user_fullname : '';
  }
}
