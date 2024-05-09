// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from '../app.component';
import { TimeSliderComponent } from './time-slider.component';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    TimeSliderComponent // Declare TimeSliderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatSliderModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
