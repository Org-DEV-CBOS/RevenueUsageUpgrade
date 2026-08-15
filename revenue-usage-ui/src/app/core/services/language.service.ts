import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly storageKey = 'ruts_language';

  init(): void {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setFallbackLang('en');

    const saved = (localStorage.getItem(this.storageKey) as AppLanguage | null) ?? 'en';
    this.setLanguage(saved);
  }

  setLanguage(lang: AppLanguage): void {
    this.translate.use(lang);
    localStorage.setItem(this.storageKey, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage(): void {
    const next: AppLanguage = this.currentLanguage() === 'ar' ? 'en' : 'ar';
    this.setLanguage(next);
  }

  currentLanguage(): AppLanguage {
    return (this.translate.getCurrentLang() as AppLanguage) || 'en';
  }
}
