import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { <%= classify(name) %>Service } from '../../store/<%= dasherize(name) %>.service';
import { getAllParams } from './../../../../shared/helpers';

@Injectable()
export class <%= classify(name) %>Resolver implements Resolve<any> {

  constructor(
    private <%= camelize(name) %>Service: <%= classify(name) %>Service
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<any> | Promise<any> | any {

    const params = getAllParams(route);

    return this.<%= camelize(name) %>Service.get<%= classify(name) %>Details(params.<%= camelize(name) %>Id);
  }
}
