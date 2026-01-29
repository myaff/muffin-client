import { Transaction, TransactionType } from "@/models/transaction.model";

export default function useFinanceHealthChart(txs: Pick<Transaction, 'bankAccount' | 'amount' | 'type' | 'categories'>[], currency: string, topN: number) {
  const filtered = currency
    ? txs.filter(t => t.bankAccount?.currency.id === currency)
    : txs;

  const incomeTx = filtered.filter(t => t.type === TransactionType.INCOME);
  const expenseTx = filtered.filter(t => t.type === TransactionType.EXPENSE);

  const totalIncome = incomeTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalExpense = expenseTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const net = totalIncome - totalExpense;

  // Считаем расходы по категориям. Сумму транзакции учитываем ЦЕЛИКОМ в каждой категории (без деления).
  const expenseByCat = expenseTx.reduce((acc, item) => {
    const amount = Number(item.amount) || 0;
    const cats = (item.categories ?? []).filter(c => c.expense);
    for (const c of cats) {
      acc.set(c.name, (acc.get(c.name) ?? 0) + amount);
    }
    return acc;
  }, new Map<string, number>());

  // top categories + Other
  const ranked = [...expenseByCat.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, topN);
  const rest = ranked.slice(topN);

  const labels = top.map(([name]) => name);
  const values = top.map(([, sum]) => sum);

  const otherSum = rest.reduce((s, [, sum]) => s + sum, 0);
  const hasOther = rest.length > 0;

  if (hasOther) {
    labels.push('Другие');
    values.push(otherSum);
  }

  // Цвета:
  //  - доход: зелёный
  //  - расход: красный
  //  - остаток: зелёный/красный (по знаку net)
  //  - категории: 5 оттенков красного + "Другие" самый бледный

  const colors = [
    'hsl(140 60% 40%)',
    'hsl(0 75% 45%)',
  ];
  colors.push(net >= 0 ? 'hsl(140 45% 42%)' : 'hsl(0 65% 48%)'); // net abs

  const catCount = labels.length + (hasOther ? 1 : 0);
  for (let i = 0; i < catCount; i++) {
    // 40..85 lightness: чем дальше, тем бледнее
    const light = 40 + Math.round((45 * i) / Math.max(1, catCount - 1));
    colors.push(`hsl(0 75% ${light}%)`);
  }

  const maxX = Math.max(
    totalIncome,
    totalExpense,
    0,
  );

  return {
    labels,
    values,
    colors,
    totals: {
      totalIncome,
      totalExpense,
      net,
    },
    maxX,
  };
}