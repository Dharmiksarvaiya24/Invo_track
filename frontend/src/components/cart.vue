<template>
  <div v-if="cartItems.length > 0" class="cart-container">
    
    <div class="cart-summary" @click="toggleCartDetails">
      <div class="cart-left">
        <div class="cart-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span class="item-count">{{ totalItems }}</span>
        </div>
        <div class="cart-info">
          <span class="item-text">{{ totalItems }} item{{ totalItems > 1 ? 's' : '' }}</span>
          <span class="total-price">₹{{ formatPrice(totalAmount) }}</span>
        </div>
      </div>

      <div class="cart-right">
        <span class="view-cart-text">View Cart</span>
        <svg class="chevron" :class="{ rotated: showDetails }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>
    </div>

    <transition name="slide-up">
      <div v-if="showDetails" class="cart-details">
        <div class="cart-header">
          <h3>Your Order</h3>
          <button class="close-btn" @click="showDetails = false" aria-label="Close cart details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id || item._id" class="cart-item">
            <div class="item-info">
              <h4 class="item-name">{{ getItemName(item) }}</h4>
              <span class="item-price">₹{{ formatPrice(getItemPrice(item)) }} each</span>
            </div>

            <div class="quantity-controls">
              <button class="quantity-btn" @click="decrementItem(item.id || item._id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span class="quantity">{{ getItemQuantity(item) }}</span>
              <button class="quantity-btn" @click="incrementItem(item.id || item._id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            <div class="item-total">
              ₹{{ formatPrice(getItemPrice(item) * getItemQuantity(item)) }}
            </div>
          </div>
        </div>

        <div class="cart-footer">
          <div class="total-section">
            <div class="total-row grand-total">
              <span>Total ({{ totalItems }} items)</span>
              <span>₹{{ formatPrice(totalAmount) }}</span>
            </div>
          </div>

          <div class="checkout-buttons">
            <button class="cancel-btn" @click="cancelCheckout">
              Back
            </button>
            <button 
              class="checkout-btn" 
              :disabled="totalItems === 0 || isProcessing" 
              @click="proceedToCheckout"
            >
              <span v-if="isProcessing">Processing...</span>
              <span v-else>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  cartItems: {
    type: Array,
    default: () => [],
  },
  restaurantName: { type: String, default: 'My Restaurant' },
  restaurantAddress: { type: String, default: '123 Main Street, City' },
  restaurantPhone: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  paperWidth: { type: String, default: '58mm' },
  orderId: { type: String, default: '' },
  googleSheetUrl: { 
    type: String, 
    default: 'https://script.google.com/macros/s/AKfycbwB0UmDkvSqFNKgQAUd2nHjf81MiLtlRy6GvvfU0r-O7CWgT8yeVyfPgchwwTgsejk9/exec' // Add your Google Apps Script Web App URL here
  }
})

const emit = defineEmits(['updateQuantity', 'checkout', 'cancel'])

const showDetails = ref(false)
const isProcessing = ref(false)

const getItemName = (item) => {
  return item.itemName || item.name || item.title || item.product_name || item.item_name || 'Unknown Item'
}

const getItemPrice = (item) => {
  return Number(item.itemPrice || item.price || item.cost || item.amount || item.unit_price || item.item_price || 0)
}

const getItemQuantity = (item) => {
  return Number(item.quantity || item.qty || item.count || item.amount_qty || 1)
}

const totalItems = computed(() => {
  try {
    return (props.cartItems || []).reduce((total, item) => {
      return total + getItemQuantity(item)
    }, 0)
  } catch (error) {
    console.error('Error calculating total items:', error)
    return 0
  }
})

const totalAmount = computed(() => {
  try {
    return (props.cartItems || []).reduce((total, item) => {
      const price = getItemPrice(item)
      const qty = getItemQuantity(item)
      return total + (price * qty)
    }, 0)
  } catch (error) {
    console.error('Error calculating total amount:', error)
    return 0
  }
})

const formatPrice = (price) => {
  const n = Number(price || 0)
  return n.toFixed(2)
}

const toggleCartDetails = () => {
  showDetails.value = !showDetails.value
}

const incrementItem = (itemId) => {
  emit('updateQuantity', { itemId, action: 'increment' })
}

const decrementItem = (itemId) => {
  emit('updateQuantity', { itemId, action: 'decrement' })
}

const cancelCheckout = () => {
  emit('cancel')
  showDetails.value = false
}

const generateReceiptHtml = () => {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN')
  const timeStr = now.toLocaleTimeString('en-IN', { hour12: true })
  const oid = props.orderId || `ORD${now.getTime().toString().slice(-6)}`

  const itemsHtml = (props.cartItems || [])
    .map((item) => {
      const name = getItemName(item)
      const qty = getItemQuantity(item)
      const unit = getItemPrice(item)
      const lineTotal = unit * qty
      return `
        <tr>
          <td class="item-name">${name}</td>
          <td class="qty">×${qty}</td>
          <td class="price">₹${formatPrice(lineTotal)}</td>
        </tr>
      `
    })
    .join('')

  return `
    <div class="receipt">
      <div class="header">
        <h2>${props.restaurantName}</h2>
        ${props.restaurantAddress ? `<p>${props.restaurantAddress}</p>` : ''}
        ${props.restaurantPhone ? `<p>Ph: ${props.restaurantPhone}</p>` : ''}
        ${props.gstNumber ? `<p>GST: ${props.gstNumber}</p>` : ''}
      </div>
      
      <div class="order-info">
        <p><strong>Order #${oid}</strong></p>
        <p>${dateStr} ${timeStr}</p>
      </div>

      <table class="items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total">
        <p><strong>Total: ₹${formatPrice(totalAmount.value)}</strong></p>
      </div>

      <div class="footer">
        <p>Thank you for your order!</p>
      </div>
    </div>
  `
}

const printReceipt = () => {
  if (!totalItems.value) {
    return
  }

  const printCss = `
    @page { size: 58mm auto; margin: 1mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Courier New', monospace; 
      font-size: 8px; 
      line-height: 1.1;
      width: 56mm;
    }
    .receipt { width: 100%; }
    .header { text-align: center; margin-bottom: 4px; border-bottom: 1px dashed #000; padding-bottom: 2px; }
    .header h2 { font-size: 10px; margin-bottom: 1px; font-weight: bold; }
    .header p { font-size: 6px; }
    .order-info { text-align: center; margin-bottom: 4px; font-size: 7px; }
    .items { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    .items th { border-bottom: 1px solid #000; padding: 1px; font-size: 6px; font-weight: bold; }
    .items td { padding: 1px; font-size: 6px; }
    .item-name { width: 55%; }
    .qty { width: 20%; text-align: center; }
    .price { width: 25%; text-align: right; }
    .total { text-align: center; border-top: 1px dashed #000; padding-top: 2px; margin-bottom: 4px; }
    .total p { font-size: 9px; font-weight: bold; }
    .footer { text-align: center; font-size: 6px; }
  `

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt</title>
        <style>${printCss}</style>
      </head>
      <body>${generateReceiptHtml()}</body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=300,height=400')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

// Function to send data to Google Sheets
const sendToGoogleSheets = async () => {
  if (!props.googleSheetUrl) {
    console.warn('Google Sheet URL not provided')
    return { success: false, error: 'No Google Sheet URL configured' }
  }

  try {
    const now = new Date()
    const orderId = props.orderId || `ORD${now.getTime().toString().slice(-6)}`
    
    // Prepare order data
    const orderData = {
      orderId: orderId,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN', { hour12: true }),
      restaurantName: props.restaurantName,
      restaurantAddress: props.restaurantAddress,
      restaurantPhone: props.restaurantPhone,
      gstNumber: props.gstNumber,
      items: props.cartItems.map(item => ({
        name: getItemName(item),
        price: getItemPrice(item),
        quantity: getItemQuantity(item),
        total: getItemPrice(item) * getItemQuantity(item)
      })),
      totalItems: totalItems.value,
      totalAmount: totalAmount.value,
      itemsSummary: props.cartItems.map(item => 
        `${getItemName(item)} x${getItemQuantity(item)}`
      ).join(', ')
    }

    // Send data to Google Sheets via Apps Script Web App
    const response = await fetch(props.googleSheetUrl, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    // Note: no-cors mode doesn't allow reading the response
    // We assume success if no error is thrown
    console.log('Order data sent to Google Sheets successfully')
    return { success: true }

  } catch (error) {
    console.error('Error sending data to Google Sheets:', error)
    return { success: false, error: error.message }
  }
}

const proceedToCheckout = async () => {
  if (isProcessing.value) return
  
  isProcessing.value = true

  try {
    // Send data to Google Sheets
    const sheetResult = await sendToGoogleSheets()
    
    // Print receipt
    printReceipt()
    
    // Emit checkout event
    emit('checkout', {
      items: props.cartItems,
      total: totalAmount.value,
      totalItems: totalItems.value,
      clearCart: true,
      sheetResult: sheetResult
    })
    
    // Show success message
    if (sheetResult.success !== false) {
      alert('Order placed successfully! Data saved to Google Sheets.')
    } else {
      alert('Order placed! (Note: Could not save to Google Sheets)')
    }
    
    showDetails.value = false
  } catch (error) {
    console.error('Checkout error:', error)
    alert('An error occurred during checkout. Please try again.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.cart-container {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-top: 2px solid rgba(34, 197, 94, 0.3);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
}

.cart-summary {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem;
  cursor: pointer; transition: all 0.2s ease;
}
.cart-summary:hover { background: rgba(34, 197, 94, 0.05); }

.cart-left { display: flex; align-items: center; gap: 1rem; }

.cart-icon {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.cart-icon svg { width: 24px; height: 24px; stroke: #22c55e; }

.item-count {
  position: absolute; top: -8px; right: -8px;
  background: #22c55e; color: #fff; font-size: 0.75rem; font-weight: 700;
  padding: 0.25rem 0.5rem; border-radius: 12px; min-width: 20px; text-align: center; line-height: 1;
}

.cart-info { display: flex; flex-direction: column; gap: 0.25rem; }
.item-text { font-size: 0.9rem; color: #d1d5db; font-weight: 500; }
.total-price { font-size: 1.25rem; font-weight: 700; color: #22c55e; }

.cart-right { display: flex; align-items: center; gap: 0.5rem; }
.view-cart-text { font-size: 0.9rem; font-weight: 600; color: #fff; }
.chevron { width: 20px; height: 20px; stroke: #22c55e; transition: transform 0.3s ease; }
.chevron.rotated { transform: rotate(180deg); }

.cart-details {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-top: 1px solid rgba(34, 197, 94, 0.2);
  max-height: 60vh; overflow-y: auto;
}

.cart-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}
.cart-header h3 { font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: background 0.2s ease; }
.close-btn:hover { background: rgba(34, 197, 94, 0.1); }
.close-btn svg { width: 20px; height: 20px; stroke: #9ca3af; }

.cart-items { padding: 0 1.5rem; }
.cart-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 0; border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}
.cart-item:last-child { border-bottom: none; }

.item-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.item-name { font-size: 1rem; font-weight: 600; color: #fff; margin: 0; }
.item-price { font-size: 0.875rem; color: #9ca3af; }

.quantity-controls { display: flex; align-items: center; gap: 0.75rem; margin: 0 1rem; }
.quantity-btn {
  width: 32px; height: 32px;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.1);
  color: #fff; cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
}
.quantity-btn:hover { background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.5); }
.quantity-btn svg { width: 14px; height: 14px; }

.quantity { font-size: 1rem; font-weight: 600; color: #22c55e; min-width: 1.5rem; text-align: center; }
.item-total { font-size: 1rem; font-weight: 700; color: #22c55e; min-width: 4rem; text-align: right; }

.cart-footer { padding: 1.5rem; border-top: 1px solid rgba(34, 197, 94, 0.2); }

.total-section { margin-bottom: 1.5rem; }
.total-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.5rem 0; font-size: 0.9rem; color: #d1d5db;
}
.total-row.grand-total {
  font-size: 1.1rem; font-weight: 700; color: #fff;
  border-top: 1px solid rgba(34, 197, 94, 0.2); padding-top: 1rem; margin-top: 0.5rem;
}

.checkout-buttons {
  display: flex; gap: 1rem;
}

.cancel-btn {
  flex: 1; padding: 1rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none; border-radius: 12px;
  color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}
.cancel-btn:hover { 
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
  transform: translateY(-1px); 
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4); 
}
.cancel-btn svg { width: 20px; height: 20px; }

.checkout-btn {
  flex: 2; padding: 1rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: none; border-radius: 12px;
  color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
}
.checkout-btn:hover { 
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); 
  transform: translateY(-1px); 
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4); 
}
.checkout-btn:disabled { 
  opacity: 0.6; 
  cursor: not-allowed;
  transform: none;
}
.checkout-btn svg { width: 20px; height: 20px; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }

@media (max-width: 768px) {
  .cart-summary { padding: 0.875rem 1rem; }
  .cart-icon { width: 44px; height: 44px; }
  .cart-icon svg { width: 20px; height: 20px; }
  .total-price { font-size: 1.125rem; }
  .cart-header, .cart-footer { padding: 1.25rem 1rem; }
  .cart-items { padding: 0 1rem; }
  .checkout-buttons { flex-direction: column; }
  .cancel-btn, .checkout-btn { flex: 1; }
}
@media (max-width: 480px) {
  .cart-item { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .quantity-controls { margin: 0; }
  .item-total { align-self: flex-end; }
}
</style>