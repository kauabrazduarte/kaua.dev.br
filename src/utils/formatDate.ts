export default function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleString("pt-BR", options);
}
