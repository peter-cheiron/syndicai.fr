
import {
  Component, signal, computed, effect, input, model, output,
  viewChild, ElementRef, inject, PLATFORM_ID, HostListener
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { UiService } from '#services/ui.service';

type PlaceValue = { placeId: string; address: string; displayName: string };

@Component({
  selector: 'ui-google-map',
  standalone: true,
  imports: [FormsModule],
  styleUrl: "./ui-google-map.component.scss",
  templateUrl: './ui-google-map.component.html',
  host: { 'ngSkipHydration': 'true' } // this widget is browser-only
})
export class UiGoogleMapComponent {
  // Inputs / outputs (unchanged)
  value = model.required<PlaceValue>();
  label = input<string>('');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  required = input<string>('');
  bLocateMe = input<boolean>(false);
  /** Optional: if Maps base script isn’t already on the page, provide your key here and we’ll load it */
  apiKey = input<string | null>(null);

  change = output<PlaceValue>(); // emits on selection

  // State
  readonly id = inject(UiService).getId();
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  open = signal(false);
  focused = signal(false);
  query = signal('');
  suggestions = signal<google.maps.places.AutocompleteSuggestion[]>([]);
  suggestionsList = computed(() =>
    this.suggestions().map(s => ({
      suggestion: s,
      text: s.placePrediction.text.toString(),
    }))
  );

  // refs (for outside-click)
  root = viewChild<ElementRef<HTMLElement>>('root');
  inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  // Google state
  private sessionToken: google.maps.places.AutocompleteSessionToken | null = null;
  private autocompleteSuggestion: google.maps.PlacesLibrary['AutocompleteSuggestion'] | null = null;
  private geocoder: google.maps.Geocoder | null = null;

  // query sequencing / selection flag
  private searchSeq = 0;
  private selecting = false;

  constructor() {
    // search when focused + ≥2 chars; ignore stale returns
    effect(() => {
      const q = this.query().trim();
      if (!this.isBrowser || !this.focused() || q.length < 2 || this.selecting) {
        this.suggestions.set([]);
        this.open.set(false);
        return;
      }
      const seq = ++this.searchSeq;
      this.search(q).then(list => {
        if (seq !== this.searchSeq || !this.focused()) return;
        this.suggestions.set(list);
        this.open.set(list.length > 0);
      }).catch(() => { /* ignore */ });
    });

    // keep input text in sync when not editing
    effect(() => {
      const v = this.value();
      if (!this.focused() && v?.address && v.address !== this.query()) {
        this.query.set(v.address);
      }
    });
  }

  // -------- UI handlers --------
  onFocus() {
    if (!this.isBrowser || this.disabled()) return;
    if (!this.focused()) {
      this.query.set(this.value()?.address || '');
      this.focused.set(true);
    }
    if (this.suggestions().length) this.open.set(true);
  }

  onBlur() {
    // we'll close via outside-click; keep blur cheap
  }

  onEnter() {
    // pick the first suggestion if any
    const first = this.suggestions()[0];
    if (first) this.select(first);
  }

  setClose() { this.open.set(false); this.focused.set(false); }
  setOpen()  { if (this.suggestions().length) this.open.set(true); }

  // close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.open()) return;
    const rootEl = this.root()?.nativeElement;
    if (!rootEl) return;
    if (!rootEl.contains(ev.target as Node)) this.setClose();
  }

  // -------- Google helpers --------
  private async ensureMapsBase(): Promise<void> {
    if (!this.isBrowser) return;
    const g = (globalThis as any).google;
    if (g?.maps?.importLibrary) return; // already loaded
    const key = this.apiKey();
    if (!key) throw new Error('Google Maps JS not loaded and no apiKey provided.');
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=places,geocoding`;
      s.async = true; s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Google Maps JS'));
      document.head.appendChild(s);
    });
  }

  private async ensurePlacesLoaded() {
    await this.ensureMapsBase();
    if (!this.sessionToken || !this.autocompleteSuggestion) {
      const { AutocompleteSessionToken, AutocompleteSuggestion } =
        (await (google.maps as any).importLibrary('places')) as google.maps.PlacesLibrary;
      this.sessionToken = new AutocompleteSessionToken();
      this.autocompleteSuggestion = AutocompleteSuggestion;
    }
  }

  private async ensureGeocoder() {
    await this.ensureMapsBase();
    if (!this.geocoder) {
      const { Geocoder } =
        (await (google.maps as any).importLibrary('geocoding')) as google.maps.GeocodingLibrary;
      this.geocoder = new Geocoder();
    }
  }

  // -------- Search / select --------
  async search(q: string): Promise<google.maps.places.AutocompleteSuggestion[]> {
    if (!this.isBrowser || !q) return [];
    await this.ensurePlacesLoaded();
    const res = await this.autocompleteSuggestion!.fetchAutocompleteSuggestions({
      input: q,
      language: 'fr-FR',
      region: 'fr',
      sessionToken: this.sessionToken!,
    });
    return res.suggestions ?? [];
  }

  async select(suggestion: google.maps.places.AutocompleteSuggestion) {
    if (!this.isBrowser) return;
    try {
      this.selecting = true;
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName','formattedAddress','addressComponents'] });

      const address = place.formattedAddress;
      const displayName = place.displayName;
      const placeId = place.id;

      // close first (prevents re-open)
      this.setClose();
      this.suggestions.set([]);

      const v: PlaceValue = { placeId, address, displayName };
      this.value.set(v);
      this.query.set(address);
      this.change.emit(v);
    } finally {
      this.selecting = false;
    }
  }

  // -------- Locate me --------
  locating = false;

  private getPosition(): Promise<google.maps.LatLngLiteral> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser || !('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => {
          const msg =
            err.code === err.PERMISSION_DENIED ? 'Location permission denied.' :
            err.code === err.POSITION_UNAVAILABLE ? 'Location unavailable.' :
            err.code === err.TIMEOUT ? 'Location request timed out.' :
            'Could not determine your location.';
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  async locateAndFill() {
    if (!this.isBrowser) return;
    try {
      this.locating = true;
      const coords = await this.getPosition();
      await this.ensureGeocoder();

      const { results } = await this.geocoder!.geocode({ location: coords });
      const best = results?.[0];
      if (!best) throw new Error('No address found for your location.');
      const address = best.formatted_address;
      const placeId = best.place_id || 'reverse-geocode';
      const displayName = address;

      const v: PlaceValue = { placeId, address, displayName };
      this.value.set(v);
      this.query.set(address);
      this.setClose();
      this.change.emit(v);
    } catch (e) {
      // optionally toast
      console.warn((e as any)?.message ?? e);
    } finally {
      this.locating = false;
    }
  }
}