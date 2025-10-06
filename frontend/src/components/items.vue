<template>
  <div class="items-container">
    <!-- Items Display -->
    <div class="items-section">
      <!-- Loading State -->
      <div v-if="isLoadingItems" class="loading-state">
        <div class="spinner"></div>
        <p>Loading items...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="empty-state">
        <h3>No items yet</h3>
        <p>Add your first item from settings</p>
      </div>
      
      <!-- Items Grid -->
      <div v-else class="items-grid">
        <div
          v-for="item in items"
          :key="item._id"
          class="item-card"
        >
          <!-- Item Details -->
          <div class="item-details">
            <!-- Item name -->
            <h3 class="item-name">{{ item.itemName }}</h3>
            <div class="item-pricing">
              <span class="current-price">₹{{ formatPrice(item.itemPrice) }}</span>
            </div>
            
            <!-- Quantity Controls -->
            <div class="quantity-controls">
              <button class="quantity-btn" @click="decrementQuantity(item._id)" :disabled="getItemQuantity(item._id) === 0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span class="quantity-display">{{ getItemQuantity(item._id) }}</span>
              <button class="quantity-btn add-btn" @click="incrementQuantity(item._id, item)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Added Cart component that's always visible -->
    <Cart 
      :cart-items="cartItems" 
      @update-quantity="updateCartQuantity"
      @remove-item="removeFromCart"
      @clear-cart="clearCart"
    />

    <!-- Toast Notifications -->
    
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, inject, provide } from 'vue'
import Cart from './cart.vue'

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api/items'

const globalState = inject('globalState', null) || ref({
  items: [],
  cartItems: [],
  totalItems: 0,
  lastUpdate: Date.now()
})

// Provide global state to child components if not already provided
if (!inject('globalState', null)) {
  provide('globalState', globalState)
}

const items = ref(globalState.value.items || [])
const isLoadingItems = ref(false)
const itemQuantities = ref({})
const cartItems = ref([])
const referralEarnings = ref(0)

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// Toast utility
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Referral processing function

// Format price utility
const formatPrice = (price) => parseFloat(price).toFixed(2)

// Quantity management
const getItemQuantity = (itemId) => itemQuantities.value[itemId] || 0

const incrementQuantity = (itemId, item) => {
  if (!itemQuantities.value[itemId]) itemQuantities.value[itemId] = 0
  itemQuantities.value[itemId]++
  
  // Directly add single item to cart and sync immediately
  addToCartDirectly(item, 1)
  
  processReferral(item, 1)
}

const decrementQuantity = (itemId) => {
  if (itemQuantities.value[itemId] && itemQuantities.value[itemId] > 0) {
    itemQuantities.value[itemId]--
    
    const item = items.value.find(i => i._id === itemId)
    if (item) {
      removeFromCartDirectly(itemId, 1)
    }
  }
}

const addToCartDirectly = (item, quantity = 1) => {
  const existingItemIndex = cartItems.value.findIndex(cartItem => cartItem._id === item._id)
  
  if (existingItemIndex !== -1) {
    cartItems.value[existingItemIndex].quantity += quantity
  } else {
    cartItems.value.push({ ...item, quantity: quantity })
  }
  
  showToast(`${item.itemName} added to cart!`)
  
  cartItems.value = [...cartItems.value]
}

const removeFromCartDirectly = (itemId, quantity = 1) => {
  const itemIndex = cartItems.value.findIndex(item => item._id === itemId)
  
  if (itemIndex !== -1) {
    cartItems.value[itemIndex].quantity -= quantity
    
    if (cartItems.value[itemIndex].quantity <= 0) {
      cartItems.value.splice(itemIndex, 1)
      showToast('Item removed from cart')
    }
    
    cartItems.value = [...cartItems.value]
  }
}

const updateCartQuantity = (itemId, newQuantity) => {
  const itemIndex = cartItems.value.findIndex(item => item._id === itemId)
  if (itemIndex !== -1) {
    if (newQuantity <= 0) {
      cartItems.value.splice(itemIndex, 1)
      itemQuantities.value[itemId] = 0
    } else {
      cartItems.value[itemIndex].quantity = newQuantity
      itemQuantities.value[itemId] = newQuantity
    }
    
    cartItems.value = [...cartItems.value]
  }
}

const removeFromCart = (itemId) => {
  const itemIndex = cartItems.value.findIndex(item => item._id === itemId)
  if (itemIndex !== -1) {
    cartItems.value.splice(itemIndex, 1)
    itemQuantities.value[itemId] = 0
    showToast('Item removed from cart')
    
    cartItems.value = [...cartItems.value]
  }
}

const clearCart = () => {
  cartItems.value = []
  itemQuantities.value = {}
  showToast('Cart cleared')
}

const addToCart = (item, quantity = null) => {
  const qty = quantity || getItemQuantity(item._id)
  if (qty > 0) {
    addToCartDirectly(item, qty)
    processReferral(item, qty)
    
    // Reset quantity display after adding to cart
    if (!quantity) {
      itemQuantities.value[item._id] = 0
    }
  }
}

const fetchItems = async () => {
  isLoadingItems.value = true
  try {
    const response = await fetch(API_BASE_URL)
    if (!response.ok) throw new Error('Failed to fetch items')
    const data = await response.json()
    
    // Update both local and global state
    items.value = data
    globalState.value.items = data
    globalState.value.totalItems = data.length
    globalState.value.lastUpdate = Date.now()
    
    await nextTick()
  } catch (error) {
    console.error('Error fetching items:', error)
    showToast('Failed to load items', 'error')
  } finally {
    isLoadingItems.value = false
  }
}

const setupEventListeners = () => {
  // Listen for items updated from nav component
  window.addEventListener('itemsUpdated', (event) => {
    const { items: updatedItems } = event.detail
    items.value = updatedItems
    globalState.value.items = updatedItems
    globalState.value.totalItems = updatedItems.length
    globalState.value.lastUpdate = Date.now()
   
  })

  // Listen for new item added from nav component
  window.addEventListener('itemAdded', (event) => {
    const { allItems } = event.detail
    items.value = allItems
    globalState.value.items = allItems
    globalState.value.totalItems = allItems.length
    globalState.value.lastUpdate = Date.now()
    showToast('New item added', 'success')
  })

  // Listen for item deleted from nav component
  window.addEventListener('itemDeleted', (event) => {
    const { itemId, allItems } = event.detail
    items.value = allItems
    globalState.value.items = allItems
    globalState.value.totalItems = allItems.length
    globalState.value.lastUpdate = Date.now()
    
    // Remove deleted item from cart if it exists
    removeFromCart(itemId)
    showToast('Item deleted', 'success')
  })
}

watch(() => globalState.value.lastUpdate, () => {
  // Sync local items with global state when it changes
  if (globalState.value.items && globalState.value.items.length !== items.value.length) {
    items.value = [...globalState.value.items]
  }
})

onMounted(() => {
  fetchItems()
  setupEventListeners()
  
  // Sync with global state if it already has items
  if (globalState.value.items && globalState.value.items.length > 0) {
    items.value = [...globalState.value.items]
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.items-container {
  min-height: calc(100vh - 80px);
  background: transparent;
  padding: 2rem;
  margin-top: 0;
}

.items-section {
  min-height: 400px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(34, 197, 94, 0.3);
  border-top: 3px solid #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  width: 64px;
  height: 64px;
  stroke: rgba(34, 197, 94, 0.5);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-state p {
  font-size: 1rem;
  margin: 0 0 2rem 0;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.item-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 0 16px 0 60px;
}



.item-details {
  position: relative;
  z-index: 1;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8rem;
}

.item-pricing {
  margin-bottom: 1.5rem;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #22c55e;
}

/* Quantity Controls Styling */
.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.25);
  border-color: rgba(34, 197, 94, 0.5);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-btn.add-btn {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.5);
}

.quantity-btn.add-btn:hover {
  background: rgba(34, 197, 94, 0.4);
  border-color: rgba(34, 197, 94, 0.7);
  transform: scale(1.05);
}

.quantity-btn svg {
  width: 16px;
  height: 16px;
}

.quantity-display {
  font-size: 1.25rem;
  font-weight: 700;
  color: #22c55e;
  min-width: 2rem;
  text-align: center;
}

/* Toast Styles */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.toast.success {
  border-left: 4px solid #22c55e;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toast svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast.success svg {
  stroke: #22c55e;
}

.toast.error svg {
  stroke: #ef4444;
}

.toast span {
  font-weight: 500;
  color: #1f2937;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .items-container {
    padding: 1rem;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .item-card {
    padding: 1.5rem;
  }

  .item-name {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .item-card {
    padding: 1.25rem;
  }

  .item-name {
    font-size: 0.9rem;
  }
}
</style>
