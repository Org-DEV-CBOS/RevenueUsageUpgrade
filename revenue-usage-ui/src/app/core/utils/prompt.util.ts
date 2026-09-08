import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { today } from './date.util';

const SWAL_CLASSES = {
  popup: 'ruts-swal',
  confirmButton: 'ruts-swal-confirm',
  cancelButton: 'ruts-swal-cancel',
};

/** Returns the entered text, or `null` when the user cancels. */
export async function promptForReason(
  title: string,
  label: string,
  translate: TranslateService,
): Promise<string | null> {
  const result = await Swal.fire({
    title,
    input: 'textarea',
    inputLabel: label,
    inputAttributes: { 'aria-label': label },
    showCancelButton: true,
    confirmButtonColor: '#004e92',
    cancelButtonColor: '#fb539b',
    confirmButtonText: translate.instant('COMMON.SAVE'),
    cancelButtonText: translate.instant('COMMON.CANCEL'),
    reverseButtons: document.documentElement.dir === 'rtl',
    inputValidator: (value) => (value?.trim() ? null : translate.instant('COMMON.REQUIRED')),
    customClass: SWAL_CLASSES,
  });

  return result.isConfirmed ? String(result.value).trim() : null;
}

export interface TransferConfirmationDetails {
  referenceNo: string;
  statementDate: string;
}

/**
 * A transfer can be created without a reference number or statement date, but both are
 * required to confirm it, so this collects whichever is still missing.
 * Returns null when the user cancels.
 */
export async function promptForTransferConfirmation(
  current: { referenceNo?: string | null; statementDate?: string | null },
  translate: TranslateService,
): Promise<TransferConfirmationDetails | null> {
  // Everything interpolated below is escaped: values come back from the API and
  // labels come from translation files, neither of which should be trusted as markup.
  const referenceLabel = escapeHtml(translate.instant('TRANSFERS.REFERENCE'));
  const statementLabel = escapeHtml(translate.instant('TRANSFERS.STATEMENT_DATE'));
  const existingReference = escapeHtml(current.referenceNo ?? '');
  const existingStatement = escapeHtml((current.statementDate ?? '').slice(0, 10));

  const result = await Swal.fire<TransferConfirmationDetails>({
    title: translate.instant('TRANSFERS.CONFIRM'),
    // SweetAlert2 ignores `text` when `html` is set, so the prompt lives in the markup.
    html: `
      <p class="swal-prompt">${escapeHtml(translate.instant('TRANSFERS.CONFIRM_DETAILS_PROMPT'))}</p>
      <label class="swal-field">
        <span>${referenceLabel}</span>
        <input id="swal-reference" class="swal2-input" maxlength="100" value="${existingReference}" />
      </label>
      <label class="swal-field">
        <span>${statementLabel}</span>
        <input id="swal-statement" class="swal2-input" type="date" max="${today()}" value="${existingStatement}" />
      </label>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: '#004e92',
    cancelButtonColor: '#fb539b',
    confirmButtonText: translate.instant('TRANSFERS.CONFIRM'),
    cancelButtonText: translate.instant('COMMON.CANCEL'),
    reverseButtons: document.documentElement.dir === 'rtl',
    customClass: SWAL_CLASSES,
    preConfirm: () => {
      const referenceNo =
        (document.getElementById('swal-reference') as HTMLInputElement).value.trim();
      const statementDate = (document.getElementById('swal-statement') as HTMLInputElement).value;

      if (!referenceNo || !statementDate) {
        Swal.showValidationMessage(translate.instant('COMMON.REQUIRED'));
        return undefined;
      }

      return { referenceNo, statementDate };
    },
  });

  return result.isConfirmed && result.value ? result.value : null;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character,
  );
}
