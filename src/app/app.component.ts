// app.component.ts

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
      callerLocation: { lat: 40.785091, lng: -73.968285 }, // Party A's location (Uptown)
      recipientLocation: { lat: 40.758896, lng: -73.985130 } // Party B's location (Midtown)
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
      
      // Add an info window to show the name, area, and activity of the party when the marker is clicked
      const infoWindow = new google.maps.InfoWindow({
        content: `<strong>${location.name}</strong><br>Area: ${location.area}<br>Activity: ${location.activity}`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
    });

    // Draw polylines to represent relationships between parties based on CDR data
    this.drawRelationships();
    
    // Center map at the midpoint of all marker positions
    this.map.setCenter(this.bounds.getCenter());
    
    // Adjust zoom level to ensure all markers are visible
    this.map.fitBounds(this.bounds);
  }

  drawRelationships() {
    console.log('Drawing relationships...');
  
    this.filteredCDRs.forEach(cdr => { // Iterate over filtered CDRs
      console.log('Drawing polyline for CDR:', cdr);
      const callerPosition = new google.maps.LatLng(cdr.callerLocation.lat, cdr.callerLocation.lng);
      const recipientPosition = new google.maps.LatLng(cdr.recipientLocation.lat, cdr.recipientLocation.lng);
  
      // Create polyline between caller and recipient with red color
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
    // Retrieve selected start and end dates
    const startDate = selectedDateRange[0];
    const endDate = selectedDateRange[1];

    // Filter CDRs based on the selected time range
    this.filteredCDRs = this.cdrs.filter(cdr => {
      const cdrStartTime = new Date(cdr.startTime);
      return cdrStartTime >= startDate && cdrStartTime <= endDate;
    });

    // Update map display with filtered CDRs
    this.updateMap();
  }
  updateMap() {
    // Clear existing markers and polylines from the map
    this.clearMap();

    // Redraw markers and polylines for filtered CDRs
    this.drawMarkers();
    if (this.sliderAdjusted) {
      this.drawRelationships();
    }
  }
  clearMap() {
    // Clear existing markers
    this.filteredCDRs.forEach(cdr => {
      if (cdr.marker) {
        cdr.marker.setMap(null); // Remove marker from the map
      }
    });
  }
    drawMarkers() {
      // Initialize bounds for fitting markers on the map
      this.bounds = new google.maps.LatLngBounds();
    
      // Draw markers for filtered CDRs
      this.filteredCDRs.forEach(cdr => {
        const position = new google.maps.LatLng(cdr.callerLocation.lat, cdr.callerLocation.lng);
    
        // Create marker for caller location
        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: cdr.caller,
          icon: 'path/to/marker-icon.png' // Customize marker icon as needed
        });
    
        // Store marker reference in CDR object
        cdr.marker = marker;
    
        // Extend bounds to include marker position
        this.bounds.extend(position);
      });
    
      // Fit map bounds to show all markers
      this.map.fitBounds(this.bounds);
    }  

    onSliderChange(value: number) {
      // Handle slider change here
      console.log('Slider value:', value);
    
      // Set sliderAdjusted to true
      this.sliderAdjusted = true;
    
      // Filter CDRs based on the selected time range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - value);
      this.filteredCDRs = this.cdrs.filter(cdr => {
        const cdrStartTime = new Date(cdr.startTime);
        return cdrStartTime >= startDate;
      });
    
      console.log('Filtered CDRs:', this.filteredCDRs); // Log filtered CDRs
    
      // Update map display with filtered CDRs
      this.updateMap();  
      this.map.setZoom(15 - value / 10); // Example: Adjust zoom level based on slider value
      this.showCDRInfo();

    }
    
    showCDRInfo() {
      // Display information about filtered CDRs
      this.filteredCDRs.forEach(cdr => {
        console.log('Location:', cdr.callerLocation);
        console.log('Start Time:', cdr.startTime);
        console.log('End Time:', cdr.endTime);
        // You can display this information in the UI as well if needed
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
