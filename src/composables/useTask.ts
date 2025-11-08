import { getRateByDate } from "@/helpers/rate.helper";
import { Task } from "@/models/tasks.model";
import { isAfter, startOfDay, isBefore, endOfDay } from "date-fns";

export default function useTask() {
  function getTaskRateByDate(date: Date, task: Task) {
    const rates = task.project.rates || [];
    const res = rates.filter(rate => {
      return isAfter(date, startOfDay(new Date(rate.dateFrom)))
        && (!rate.dateTo || (rate.dateTo && isBefore(date, endOfDay(new Date(rate.dateTo)))))
    });
    const resAlt = getRateByDate(rates, date);
    console.log(res, resAlt);
    return res.at(1);
  }

  return { getTaskRateByDate };
}