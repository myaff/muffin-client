import { RateDetail } from "@/models/rates.model";
import { isBefore, isSameDay } from "date-fns";

export function getRateByDate(rates: RateDetail[], date: string | number | Date) {
  const ratesForDate = rates
    .filter(rate => {
      return isDateBeforeOrEqual(rate.dateFrom, date)
        && (!rate.dateTo || isDateBeforeOrEqual(date, rate.dateTo));
    })
    .sort(sortRates);
  return ratesForDate.at(-1) || null;
}

export function sortRates(a: RateDetail, b: RateDetail) {
  const today = new Date();
  const aDateFrom = new Date(a.dateFrom);
  const aDateTo = a.dateTo ? new Date(a.dateTo) : today;
  const bDateFrom = new Date(b.dateFrom);
  const bDateTo = b.dateTo ? new Date(b.dateTo) : today;
  if (isBefore(aDateTo, bDateTo)) return -1;
  else if (isBefore(bDateTo, aDateTo)) return +1;
  else return Number(aDateFrom) - Number(bDateFrom);
}

export function isDateBeforeOrEqual(date: string | number | Date, dateToCompare: string | number | Date) {
  const dateInst = date instanceof Date
    ? date
    : new Date(date);
  const dateToCompareInst = dateToCompare instanceof Date
    ? dateToCompare
    : new Date(dateToCompare);
  return isBefore(dateInst, dateToCompareInst)
      || isSameDay(dateInst, dateToCompareInst);
}