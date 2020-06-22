import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ChargeCodesService } from '../../store/chargecodes.service';
import { getAllParams } from './../../../../shared/helpers';

@Injectable()
export class ChargeCodeDetailsResolver implements Resolve<any> {

  constructor(
    private chargeCodesService: ChargeCodesService
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<any> | Promise<any> | any {

    const params = getAllParams(route);

    return this.chargeCodesService.getChargeCodeDetails(params.chargeCodeId);
  }
}
