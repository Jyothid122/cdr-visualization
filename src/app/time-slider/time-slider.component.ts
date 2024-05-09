import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.scss']
})
export class TimeSliderComponent {
  sliderValue: number = 0;

  @Output() sliderChange: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  onSliderChange() {
    this.sliderChange.emit(this.sliderValue);
  }
  
}
