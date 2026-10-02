import { PromoCode } from '../services/dbService';

export interface ApplyPromoResult {
  success: boolean;
  message: string;
  discountAmount: number;
  promoCode?: PromoCode;
}

export function validateAndApplyPromo(
  code: string,
  itemsTotal: number,
  availablePromos: PromoCode[]
): ApplyPromoResult {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return { success: false, message: 'Please enter a promo code.', discountAmount: 0 };
  }

  const found = availablePromos.find(
    (p) => p.code.toUpperCase() === cleanCode
  );

  if (!found) {
    return { success: false, message: 'Invalid promo code.', discountAmount: 0 };
  }

  if (!found.is_active) {
    return { success: false, message: 'This promo code is no longer active.', discountAmount: 0 };
  }

  if (found.expiry_date && new Date(found.expiry_date) < new Date()) {
    return { success: false, message: 'This promo code has expired.', discountAmount: 0 };
  }

  if (found.min_order_amount && itemsTotal < found.min_order_amount) {
    return {
      success: false,
      message: `Minimum order amount of ৳${found.min_order_amount} required for code ${found.code}.`,
      discountAmount: 0,
    };
  }

  let discount = 0;
  if (found.discount_type === 'percentage') {
    discount = Math.round((itemsTotal * found.discount_value) / 100);
  } else {
    discount = found.discount_value;
  }

  // Cap discount at itemsTotal
  discount = Math.min(discount, itemsTotal);

  return {
    success: true,
    message: `Promo code '${found.code}' applied! Saved ৳${discount}.`,
    discountAmount: discount,
    promoCode: found,
  };
}
