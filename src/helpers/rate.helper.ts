import { RatePlanWithVersions, RateVersion } from "@/models/rates.model";
import { isBefore, isSameDay } from "date-fns";

type DateType = string | number | Date;

export function getRateVersionByDate(plan: RatePlanWithVersions, date: DateType) {
  return plan.versions.find(version => {
    return isDateBeforeOrEqual(version.startDate, date)
      && (!version.endDate || isDateBeforeOrEqual(date, version.endDate));
  }) ?? null;
}

export function sortRates(a: RateVersion, b: RateVersion) {
  const today = new Date();
  const aDateFrom = new Date(a.startDate);
  const aDateTo = a.endDate ? new Date(a.endDate) : today;
  const bDateFrom = new Date(b.startDate);
  const bDateTo = b.endDate ? new Date(b.endDate) : today;
  if (isBefore(aDateTo, bDateTo)) return -1;
  else if (isBefore(bDateTo, aDateTo)) return +1;
  else return Number(aDateFrom) - Number(bDateFrom);
}

export function isDateBeforeOrEqual(date: DateType, dateToCompare: DateType) {
  const dateInst = date instanceof Date
    ? date
    : new Date(date);
  const dateToCompareInst = dateToCompare instanceof Date
    ? dateToCompare
    : new Date(dateToCompare);
  return isBefore(dateInst, dateToCompareInst)
      || isSameDay(dateInst, dateToCompareInst);
}