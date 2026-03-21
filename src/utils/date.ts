import moment from 'moment/moment';
import { Logger } from '@nestjs/common';

type BaseType = Date | string;

enum ReportPeriodType {
  ALL = 'all',
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  PREV_DAY = 'previous_day',
  PREV_YEAR = 'previous_year',
  PREV_MONTH = 'previous_month',
  PREV_WEEK = 'previous_week',
}

export const createPerformanceTimer = (operation: string, logger: Logger) => {
  const startTime = Date.now();
  return {
    end: (additionalInfo?: string) => {
      const duration = Date.now() - startTime;
      logger.debug(
        `Performance[${operation}]: ${duration}ms ${additionalInfo || ''}`,
      );
      return duration;
    },
  };
};

const format = (date: BaseType) =>
  typeof date === 'string' ? new Date(date) : date;

export const resetHours = (date: BaseType) => {
  const toDate = moment(format(date));
  toDate.set('hour', 0);
  toDate.set('minute', 0);
  toDate.set('second', 0);
  toDate.set('millisecond', 0);

  return toDate.format('YYYY-MM-DD HH:mm:ss');
};

export const countdown = (after: number, to: any) => {
  const expired = new Date(to);
  const validToResend = moment(new Date(expired))
    .set('second', moment(expired).get('second') + after)
    .valueOf();
  if (validToResend >= new Date().valueOf())
    return Math.ceil((validToResend - new Date().valueOf()) / 1000);
  return 0;
};

const diffDays = (from: Date, to: Date) => {
  const diffMs = Math.abs(to.getTime() - from.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) - 1;
};

export const detectRangeType = (from: Date, to: Date): ReportPeriodType => {
  const days = diffDays(from, to);

  if (days <= 1) return ReportPeriodType.TODAY;

  if (days <= 7) return ReportPeriodType.WEEK;

  if (days <= 31) return ReportPeriodType.MONTH;

  if (days <= 365) return ReportPeriodType.YEAR;

  return ReportPeriodType.YEAR;
};
