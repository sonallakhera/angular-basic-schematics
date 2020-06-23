// library imports
import { 
  Component,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, Observable } from 'rxjs';
import { startWith, map, mergeMap } from 'rxjs/operators';
import { isString, values } from 'lodash';

// constants
import { PROPERTY_TYPES, DEFAULT_PROPERTY_TYPE } from '../../../constants/properties';
import { <%= underscore(name_singular).toUpperCase() %>_STATUSES } from './../../../constants/<%= dasherize(name_singular) %>';

// interfaces
import { RiseUserData } from '../../../models/interfaces/rise-user-data.interface';

const NO_VALUE_TYPE = {
  _id: '',
  name: '-'
};

@Component({
  selector: 'rise-<%= dasherize(name_singular) %>-filters',
  templateUrl: './<%= dasherize(name_singular) %>-filters.component.html',
  styleUrls: ['./<%= dasherize(name_singular) %>-filters.component.scss']
})
export class <%= classify(name) %>FiltersComponent {

  form: FormGroup;
  units: Observable<any>;

  <%= camelize(name_singular) %>Statuses = values(<%= underscore(name_singular).toUpperCase() %>_STATUSES);

  @Input() filters: any;
  @Input() riseUserData: RiseUserData;
  @Input() fetchUnits: (filters: {}) => Observable<any>;

  @Output() submittedFilters = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      service_number: [this.serviceNumber],
      unit: [this.unit],
      creation_date_range: [this.creationDateRange],
      <%= underscore(name_singular) %>_status: [this.<%= camelize(name_singular) %>Status, []]
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
  }

  ngOnChanges(changes: SimpleChanges) {
    // code for some change detection work 
  }

  get serviceNumber() {
    return this.filters ? this.filters.service_number : '';
  }

  get unit() {
    return this.filters ? this.filters.unit : null;
  }

  get creationDateRange() {
    return this.filters ? this.filters.creation_date_range : null;
  }

  get <%= camelize(name_singular) %>Status() {
    return this.filters ? this.filters.<%= underscore(name_singular) %>_status : null;
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
}
