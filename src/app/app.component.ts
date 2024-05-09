
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'angular-gmap-cdr-visualization';
  @ViewChild('mapContainer', { static: false }) gmap!: ElementRef;
  map!: google.maps.Map;
  bounds!: google.maps.LatLngBounds;
  filteredCDRs: any[] = [];
  minDate: Date = new Date(); // Set minimum date
  maxDate: Date = new Date();
  sliderAdjusted: boolean = false;

  cdrs: any[] = [
    {
      caller: 'Party A',
      recipient: 'Party B',
      startTime: new Date('2024-05-08T10:00:00'),
      endTime: new Date('2024-05-08T10:15:00'),
      duration: 900,
      callerLocation: { lat: 40.785091, lng: -73.968285 }, 
      recipientLocation: { lat: 40.758896, lng: -73.985130 } 
    }
   
  ];
  sliderValue: number =0;
  
  

  constructor() {
    this.maxDate.setDate(this.maxDate.getDate());
  }
  // Define marker styles for different areas
  markerStyles: { [area: string]: string } = {
    Uptown: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    Midtown: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    Downtown: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
  };

  // Coordinates for parties A, B, and C with their respective areas
  locations = [
    { name: 'Party A', lat: 40.785091, lng: -73.968285, area: 'Uptown', activity: 'Incoming Call' }, // Uptown
    { name: 'Party B', lat: 40.758896, lng: -73.985130, area: 'Midtown', activity: 'Outgoing Call' }, // Midtown
    { name: 'Party C', lat: 40.705565, lng: -74.005901, area: 'Downtown', activity: 'Missed Call' }   // Downtown
  ];

  ngAfterViewInit() {
    this.mapInitializer();
  }

  mapInitializer() {
    this.bounds = new google.maps.LatLngBounds();
    
    this.map = new google.maps.Map(this.gmap.nativeElement, {});

    // Loop through the locations and add markers for each party
    this.locations.forEach(location => {
      const position = new google.maps.LatLng(location.lat, location.lng);
      const marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: location.name,
        icon: this.markerStyles[location.area] || 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' // Default marker color
      });
      
      this.bounds.extend(position);
      
      const infoWindow = new google.maps.InfoWindow({
        content: `<strong>${location.name}</strong><br>Area: ${location.area}<br>Activity: ${location.activity}`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
    });

    this.drawRelationships();
    
    this.map.setCenter(this.bounds.getCenter());
    
    this.map.fitBounds(this.bounds);
  }

  drawRelationships() {
    console.log('Drawing relationships...');
  
    this.filteredCDRs.forEach(cdr => { 
      console.log('Drawing polyline for CDR:', cdr);
      const callerPosition = new google.maps.LatLng(cdr.callerLocation.lat, cdr.callerLocation.lng);
      const recipientPosition = new google.maps.LatLng(cdr.recipientLocation.lat, cdr.recipientLocation.lng);
  
      const polyline = new google.maps.Polyline({
        path: [callerPosition, recipientPosition],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 4
      });
  
      polyline.setMap(this.map);
    });
  }
  
  onDateRangeChange(selectedDateRange: Date[]) {
    const startDate = selectedDateRange[0];
    const endDate = selectedDateRange[1];

    this.filteredCDRs = this.cdrs.filter(cdr => {
      const cdrStartTime = new Date(cdr.startTime);
      return cdrStartTime >= startDate && cdrStartTime <= endDate;
    });

    this.updateMap();
  }
  updateMap() {
    this.clearMap();

    this.drawMarkers();
    if (this.sliderAdjusted) {
      this.drawRelationships();
    }
  }
  clearMap() {
    this.filteredCDRs.forEach(cdr => {
      if (cdr.marker) {
        cdr.marker.setMap(null); 
      }
    });
  }
    drawMarkers() {
      this.bounds = new google.maps.LatLngBounds();
    
      // Draw markers for filtered CDRs
      this.filteredCDRs.forEach(cdr => {
        const position = new google.maps.LatLng(cdr.callerLocation.lat, cdr.callerLocation.lng);
    
        // Create marker for caller location
        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: cdr.caller,
          icon: 'path/to/marker-icon.png' 
        });
    
        cdr.marker = marker;
    
        this.bounds.extend(position);
      });
    
      this.map.fitBounds(this.bounds);
    }  

    onSliderChange(value: number) {
      console.log('Slider value:', value);
    
      this.sliderAdjusted = true;
    
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - value);
      this.filteredCDRs = this.cdrs.filter(cdr => {
        const cdrStartTime = new Date(cdr.startTime);
        return cdrStartTime >= startDate;
      });
    
      console.log('Filtered CDRs:', this.filteredCDRs);
    
      // Update map display with filtered CDRs
      this.updateMap();  
      this.map.setZoom(15 - value / 10); 
      this.showCDRInfo();

    }
    
    showCDRInfo() {
      // Display information about filtered CDRs
      this.filteredCDRs.forEach(cdr => {
        console.log('Location:', cdr.callerLocation);
        console.log('Start Time:', cdr.startTime);
        console.log('End Time:', cdr.endTime);
      });
    
  }

  getLocationName(cdr: any): string {
    // Assuming location name is based on the caller's location
    return cdr.caller;
  }
  getReceiverName(cdr: any): string {
    // Assuming location name is based on the recipient's location
    return cdr.recipient;
  }
  
  getCdrDuration(cdr: any): number {
    // Calculate duration in seconds
    const durationInSeconds = Math.floor((cdr.endTime.getTime() - cdr.startTime.getTime()) / 1000);
    return durationInSeconds;
  }
}
