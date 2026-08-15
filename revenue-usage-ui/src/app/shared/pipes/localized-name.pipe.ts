import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({ name: 'localizedName', standalone: true, pure: false })
export class LocalizedNamePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(value: { nameEn?: string; nameAr?: string } | null | undefined): string {
    if (!value) {
      return '';
    }

    const isArabic = this.language.currentLanguage() === 'ar';
    return (isArabic ? value.nameAr : value.nameEn) || value.nameAr || value.nameEn || '';
  }
}

@Pipe({ name: 'localizedField', standalone: true, pure: false })
export class LocalizedFieldPipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(entity: object | null | undefined, enKey: string, arKey: string): string {
    if (!entity) {
      return '';
    }

    const record = entity as Record<string, unknown>;
    const isArabic = this.language.currentLanguage() === 'ar';
    const primary = String(record[isArabic ? arKey : enKey] ?? '');
    const fallback = String(record[isArabic ? enKey : arKey] ?? '');
    return primary || fallback;
  }
}
