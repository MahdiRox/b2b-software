// src/utils/formatters.ts

export const formatDZD = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0,00 DA";
  }
  return (
    new Intl.NumberFormat("fr-DZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " DA"
  );
};

export const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "-";
  return new Intl.DateTimeFormat("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;
  const separator = ",";
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    "\n" +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? "" : String(row[k]);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
