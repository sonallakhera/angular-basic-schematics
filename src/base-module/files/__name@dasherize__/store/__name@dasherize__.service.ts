import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { map } from 'rxjs/operators';
import { format } from 'util';

import { appendParams } from './../../../shared/helpers';

import { isNil } from 'lodash';
import moment from 'moment';
import { FILES_TYPES } from 'rise-shared-module-frontend/src/constants/files';

const ENDPOINTS = {
  <%= name.toUpperCase() %>: '/<%= dasherize(name) %>',
};


@Injectable()
export class <%= classify(name) %>Service {

  constructor(private http: HttpClient) { }

  get<%= classify(name) %>: () => {
  }

  get<%= classify(name) %>Details: (<%= camelize(name) %>Id) => {

  }
}
