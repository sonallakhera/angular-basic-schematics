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
  PACKAGES: '/api/packages',
  PACKAGE_DETAILS: '/api/packages/%s',
  PACKAGE_COMMENTS: '/api/packages/%s/comments',
  PACKAGE_ROOMS: '/api/packages_rooms',
  PACKAGE_ROOM_DETAILS: '/api/packages_rooms/%s',
  PACKAGE_EXPORT_FILE: '/api/packages/export/%s',
  PACKAGE_DETAILS_PDF: '/api/packages/%s/export/pdf'
};

const DEFAULT_PACKAGES_EXPORT_FILE_NAME = 'exported_packages';
const DEFAULT_PAGE = 1;

@Injectable()
export class PackagesService {

  constructor(private http: HttpClient) { }

  mapPackagesResult(response) {
    return {
      ...response,
      results: (response.results || [])
        .map((pckg) => ({
          _id: pckg._id,
          service_number: pckg.service_number,
          unit_number: get(pckg, 'unit.unit_number') || '',
          resident: get(pckg, 'resident'),
          author: get(pckg, 'author'),
          carrier: get(pckg, 'carrier') || '',
          package_room: get(pckg, 'package_room')
            ? get(pckg, 'package_room.name')
            : '',
          is_signed: get(pckg, 'is_signed'),
          arrival_time: pckg.created
        }))
    };
  }

  getPackagesFilters(filterData) {
    const filterStartDate = this.getMomentDate(filterData, 'startDate');
    const filterEndDate = this.getMomentDate(filterData, 'endDate');

    const filters = {
      service_number: filterData.service_number,
      search_term: filterData.search_term,
      property_id: filterData.property_id || null,
      units_id: filterData.unit ? [filterData.unit._id] : null,
      notify_id: filterData.notify_user ? [filterData.notify_user._id] : null,
      package_room_id: filterData.package_room ? [filterData.package_room._id] : null,
      startdate: filterStartDate ? filterStartDate.toISOString() : null,
      enddate: filterEndDate ? filterEndDate.toISOString() : null,
      is_signed: filterData.is_signed
    };

    Object.keys(filters).forEach((key) => {
      if (isEmpty(filters[key])) {
        delete filters[key];
      }
    });
    return filters;
  }

  getMomentDate(filterData: any, dateType: string) {
    return filterData.date_range && !isNil(filterData.date_range[dateType])
      ? moment(filterData.date_range[dateType])
      : null;
  }

  getPackages(filters, page, pageSize, sortField, sortDirection) {
    let params = new HttpParams();
    const preparedFilters = this.getPackagesFilters(filters);

    if (!isEmpty(preparedFilters)) {
      params = appendParams(params, 'filters', preparedFilters);
    }

    params = appendParams(params, 'sort_field', sortField);
    params = appendParams(params, 'sort_direction', sortDirection);

    params = appendParams(params, 'page', page);
    params = appendParams(params, 'per_page', pageSize);

    return this.http.get(ENDPOINTS.PACKAGES, {
      params
    }).pipe(
      map((value: { results: any[], count: number }) => {
        return this.mapPackagesResult(value);
      })
    );
  }

  mapPackageRoomsResult(response) {
    return {
      ...response,
      results: (response.results || [])
        .map((packageRoom) => ({
          _id: packageRoom._id,
          name: packageRoom.name || '',
        }))
    };
  }

  getPackageRooms(propertyId, page, pageSize) {
    let params = new HttpParams();

    params = appendParams(params, 'propertyId', propertyId);
    params = appendParams(params, 'page', page);
    params = appendParams(params, 'per_page', pageSize);

    return this.http.get(ENDPOINTS.PACKAGE_ROOMS, {
      params
    }).pipe(
      map((value: { results: any[], count: number }) => {
        return this.mapPackageRoomsResult(value);
      })
    );
  }

  getPackage(id: string) {
    return this.http.get<any>(format(ENDPOINTS.PACKAGE_DETAILS, id));
  }

  getPackageComments(id: string) {
    return this.http.get<any>(format(ENDPOINTS.PACKAGE_COMMENTS, id));
  }

  addPackageComment(id: string, params: any) {
    return this.http.post<any>(format(ENDPOINTS.PACKAGE_COMMENTS, id), params);
  }

  exportFile(
    fileType,
    filters,
    page,
    pageSize,
    sortField,
    sortDirection
  ) {
    let params = new HttpParams();
    const preparedFilters = this.getPackagesFilters(filters);

    if (!isEmpty(preparedFilters)) {
      params = appendParams(params, 'filters', preparedFilters);
    }

    params = appendParams(params, 'sort_field', sortField);
    params = appendParams(params, 'sort_direction', sortDirection);

    params = appendParams(params, 'page', page);
    params = appendParams(params, 'per_page', pageSize);

    return this.http.get(format(ENDPOINTS.PACKAGE_EXPORT_FILE, fileType.type), {
      responseType: 'blob',
      observe: 'response',
      params: params
    })
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const contentDispositionHeader = response.headers.get('Content-Disposition');
          const filename = contentDispositionHeader
                           ? contentDispositionHeader.split('"')[1]
                           : DEFAULT_PACKAGES_EXPORT_FILE_NAME;
          const blob = new Blob([response.body], { type: fileType.download_type });
          const downloadLink = document.createElement('a');

          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.click();
        })
      );
  }

  exportDetails(packageId) {

    return this.http.get(format(ENDPOINTS.PACKAGE_DETAILS_PDF, packageId), {
      responseType: 'blob',
      observe: 'response'
    })
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const contentDispositionHeader = response.headers.get('Content-Disposition');
          const filename = contentDispositionHeader
                           ? contentDispositionHeader.split('"')[1]
                           : DEFAULT_PACKAGES_EXPORT_FILE_NAME;
          const blob = new Blob([response.body], { type: FILES_TYPES.PDF.download_type });
          const downloadLink = document.createElement('a');

          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.click();
        })
      );
  }
}
