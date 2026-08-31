import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly translate = inject(TranslateService);

  confirmDelete(): Promise<boolean> {
    const rtl = document.documentElement.dir === 'rtl';

    return Swal.fire({
      title: this.translate.instant('COMMON.CONFIRM_DELETE_TITLE'),
      text: this.translate.instant('COMMON.CONFIRM_DELETE'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fb539b',
      cancelButtonColor: '#004e92',
      confirmButtonText: this.translate.instant('COMMON.DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
      reverseButtons: rtl,
      focusCancel: true,
      customClass: {
        popup: 'ruts-swal',
        confirmButton: 'ruts-swal-confirm',
        cancelButton: 'ruts-swal-cancel',
      },
    }).then((result) => result.isConfirmed);
  }
}
