export type AppErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'REPORT_NOT_FOUND'
  | 'DISPUTE_NOT_FOUND'
  | 'PARSE_FAILED'
  | 'SUGGEST_FAILED'
  | 'GEN_LETTER_FAILED'
  | 'REMINDERS_FAILED';

export interface AppError {
  code: AppErrorCode;
  message: string;
}

export const errorMessages: Record<AppErrorCode, string> = {
  INVALID_INPUT: 'Please check the form for errors.',
  UNAUTHORIZED: 'You need to sign in to continue.',
  NOT_FOUND: 'Requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  REPORT_NOT_FOUND: 'Credit report could not be found.',
  DISPUTE_NOT_FOUND: 'Dispute could not be found.',
  PARSE_FAILED: 'Failed to parse credit report.',
  SUGGEST_FAILED: 'Could not generate dispute suggestions.',
  GEN_LETTER_FAILED: 'Failed to generate dispute letter.',
  REMINDERS_FAILED: 'Failed to send due reminders.',
};

export function toToast(error: AppError): string {
  return errorMessages[error.code] || 'Unexpected error';
}
