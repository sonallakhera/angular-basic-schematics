// library
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import get from 'lodash/get';

// helpers
import { appendParams } from './../../../shared/helpers';

// constants
import { FILES_TYPES } from 'rise-shared-module-frontend/src/constants/files';

const ENDPOINTS = {
  <%= underscore(name).toUpperCase() %>: '/<%= dasherize(name) %>',
};

@Injectable()
export class <%= classify(name) %>Service {

  constructor(private http: HttpClient) { }

  get<%= classify(name) %>: () => {
  }

  get<%= classify(name_singular) %>Details: (<%= camelize(name_singular) %>Id) => {
  }
}
