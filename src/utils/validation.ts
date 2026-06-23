export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();

}
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);

}
export const validatePhone = (phone: string): boolean => {
  const regex = /^[0-9]{9,15}$/;
  return regex.test(phone.replace(/\s/g, ""));

}
export const validatePrice = (price: number): boolean => {
  return price > 0 && price < 999999999999;
};
