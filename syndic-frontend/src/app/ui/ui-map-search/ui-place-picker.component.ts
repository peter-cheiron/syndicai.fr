import {
  Component,
  ElementRef,
  output,
  viewChild,
  input,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap } from '@angular/google-maps';
import { environment } from '#environments/environment.prod';

export interface PlaceSelection {
  name?: string;
  address?: string;
  placeId?: string;
  location: { lat: number; lng: number };
}

@Component({
  selector: 'ui-place-picker',
  standalone: true,
  imports: [CommonModule, GoogleMap],
  styles: [`
    :host { display: block; }
    .map { height: 360px; border-radius: 0.75rem; overflow: hidden; }
    .search { width: 100%; }
  `],
  templateUrl: "./ui-place-picker.component.html"
})
export class UiPlacePickerComponent {
  // Inputs
  placeholder = input<string>('Search for a place…');

  // Two-way-ish: initial/derived value
  value = signal<PlaceSelection | null>(null);

  // Output when user selects from autocomplete OR clicks map
  selected = output<PlaceSelection>();

  // Refs
  mapRef = viewChild.required<GoogleMap>('map');
  inputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  // map state
  center = signal<google.maps.LatLngLiteral>({ lat: 48.8566, lng: 2.3522 }); // Paris default
  zoom   = signal<number>(13);
  marker = signal<google.maps.LatLngLiteral | null>(null);

  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapId: environment.MAPS_ID
  };

  // JS API instances
  private autocomplete?: google.maps.places.Autocomplete;
  private geocoder?: google.maps.Geocoder;
  private advMarker?: google.maps.marker.AdvancedMarkerElement;

  constructor() {
    // reflect incoming value -> map/marker
    effect(() => {
      const val = this.value();
      if (val?.location) {
        this.center.set(val.location);
        this.marker.set(val.location);
        this.zoom.set(15);
        this.updateAdvancedMarker();
      }
    });

    // keep AdvancedMarker in sync with marker() signal
    effect(() => {
      this.updateAdvancedMarker();
    });
  }

  async ngAfterViewInit() {
    // Load libraries via importLibrary (modern style)
    await google.maps.importLibrary('places');
    await google.maps.importLibrary('marker');

    this.geocoder = new google.maps.Geocoder();

    // Attach Places Autocomplete to the input
    this.autocomplete = new google.maps.places.Autocomplete(
      this.inputRef().nativeElement,
      {
        fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        types: ['establishment', 'geocode'], // or []
      }
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete!.getPlace();
      if (!place || !place.geometry || !place.geometry.location) return;

      const loc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      // move map+marker
      this.center.set(loc);
      this.marker.set(loc);
      this.zoom.set(15);

      const selection: PlaceSelection = {
        name: place.name ?? undefined,
        address: place.formatted_address ?? undefined,
        placeId: place.place_id ?? undefined,
        location: loc,
      };

      this.value.set(selection);
      this.selected.emit(selection);
    });
  }

  async onMapClick(ev: google.maps.MapMouseEvent) {
    if (!ev.latLng) return;
    const loc = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };

    // Drop marker & center
    this.marker.set(loc);
    this.center.set(loc);

    // Reverse geocode for a friendly address (best effort)
    try {
      const res = await this.geocoder!.geocode({ location: loc });
      const addr = res.results?.[0];

      const selection: PlaceSelection = {
        name: addr?.address_components?.find(c => c.types.includes('point_of_interest'))?.long_name
              || addr?.formatted_address,
        address: addr?.formatted_address,
        placeId: addr?.place_id,
        location: loc
      };

      this.value.set(selection);
      this.selected.emit(selection);

      if (addr?.formatted_address) {
        this.inputRef().nativeElement.value = addr.formatted_address;
      }
    } catch {
      const selection: PlaceSelection = {
        name: undefined,
        address: undefined,
        placeId: undefined,
        location: loc
      };
      this.value.set(selection);
      this.selected.emit(selection);
    }
  }

  /** Create/update/remove the AdvancedMarker based on marker() & map state */
  private updateAdvancedMarker() {
    const map = this.mapRef()?.googleMap;
    if (!map) return;

    const pos = this.marker();
    if (!pos) {
      // remove if exists
      if (this.advMarker) {
        this.advMarker.map = null;
        this.advMarker = undefined;
      }
      return;
    }

    if (!this.advMarker) {
      this.advMarker = new google.maps.marker.AdvancedMarkerElement({
        position: pos,
        map
      });
    } else {
      this.advMarker.position = pos;
      if (!this.advMarker.map) this.advMarker.map = map;
    }
  }

}
