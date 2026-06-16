export const BAMBEH_FEE_RATE = 0.01;

export function calculateWithFee(amount: number) {
  const fee = Math.round(amount * BAMBEH_FEE_RATE);
  const total = amount + fee;

  return {
    subtotal: amount,
    fee,
    total,
  };
}