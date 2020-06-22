// library imports
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';

// modules
import { SharedModule } from './../shared/shared.module';
import { PipesModule } from './../../pipes';

// components
import { <%= classify(name) %>TableComponent } from './<%= dasherize(name) %>-table/<%= dasherize(name) %>-table.component';
import { Add<%= classify(name) %>Component } from './add-<%= dasherize(name) %>/add-<%= dasherize(name) %>.component';
import { <%= classify(name) %>FiltersComponent } from './<%= dasherize(name) %>-filters/<%= dasherize(name) %>-filters.component';

const INTERNAL_COMPONENTS = [
  <%= classify(name) %>TableComponent,
  Add<%= classify(name) %>Component,
  <%= classify(name) %>FiltersComponent,
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PipesModule,
    TranslateModule
  ],
  declarations: [
    ...INTERNAL_COMPONENTS
  ],
  exports: [
    ...INTERNAL_COMPONENTS,
    PipesModule
  ],
  entryComponents: []
})
export class <%= classify(name) %>Module {

  constructor(
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  /**
   * Use in AppModule: new instance of SumService.
   */
  public static forRoot(): ModuleWithProviders<<%= classify(name) %>Module> {
    return {
      ngModule: <%= classify(name) %>Module
    };
  }

  /**
   * Use in features modules with lazy loading: new instance of SumService.
   */
  public static forChild(): ModuleWithProviders<<%= classify(name) %>Module> {
    return {
      ngModule: <%= classify(name) %>Module
    };
  }
}
