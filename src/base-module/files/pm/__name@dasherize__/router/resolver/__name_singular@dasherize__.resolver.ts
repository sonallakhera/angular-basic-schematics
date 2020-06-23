// library imports 
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

// helpers & services
import { <%= classify(name) %>Service } from '../../store/<%= dasherize(name) %>.service';

import { getAllParams } from './../../../../shared/helpers';

@Injectable()
export class <%= classify(name_singular) %>Resolver implements Resolve<any> {

  constructor(
    private <%= camelize(name) %>Service: <%= classify(name) %>Service
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<any> | Promise<any> | any {

    const params = getAllParams(route);

    return this.<%= camelize(name) %>Service.get<%= classify(name_singular) %>Details(params.<%= camelize(name_singular) %>Id);
  }
}
