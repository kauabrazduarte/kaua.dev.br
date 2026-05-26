// Computes age from an ISO birth date. Works on both server and client so
// each revalidation (SSG every 6h) gets the current value without hardcoding.
export function getAge(birth: string, now: Date = new Date()): number {
  const b = new Date(birth);
  let age = now.getFullYear() - b.getFullYear();
  const beforeBirthday =
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (beforeBirthday) age--;
  return age;
}
