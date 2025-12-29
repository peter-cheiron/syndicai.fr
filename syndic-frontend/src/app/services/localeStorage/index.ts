import { effect, Injectable, signal } from '@angular/core';

interface LocalPreference {
  lang: string | null;
}
@Injectable({
  providedIn: 'root',
})
export class LocaleStorageService {
  
  lang = signal<string | null>(null);
  private itemKey = 'syndicai';//TODO note this is usedmv
  private storage = signal<LocalPreference>({ lang: null });

  constructor() {
    try {
      const data = JSON.parse(
        window.localStorage.getItem(this.itemKey)
      ) as LocalPreference;

      this.storage.set(data);
      this.lang.set(data.lang);
    } catch {
      this.reset();
    }

    effect(() => {
      try {
        window.localStorage.setItem(
          this.itemKey,
          JSON.stringify({ ...this.storage(), lang: this.lang() })
        );
      } catch {
        this.reset();
      }
    });
  }

  reset() {
    window.localStorage.setItem(this.itemKey, '{}');
  }
}
