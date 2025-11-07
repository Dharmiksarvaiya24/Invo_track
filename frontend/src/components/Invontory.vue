<template>
  <div class="app-wrapper">
    <!-- Navigation Bar -->
    <Navbar />

    <!-- Main Content -->
    <div class="inventory-container">
      <div class="header">
       
        <button @click="showAddModal = true" class="btn-add">+ Add Item</button>
      </div>

      <!-- Search & Filter -->
      <div class="controls">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search items..."
            class="search-input"
          />
        </div>
        <select v-model="filterCategory" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <!-- Loading / Error / Empty / Table -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading inventory...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon"></div>
        <p>{{ error }}</p>
        <button @click="loadItems" class="btn-primary">Try Again</button>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No items found. Add your first item to get started.</p>
        <button @click="showAddModal = true" class="btn-primary">Add Item</button>
      </div>

      <div v-else class="table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item._id"
              :class="{ 'low-stock-row': item.quantity <= (item.lowStockThreshold || 5) }"
            >
              <td class="item-name">{{ item.itemName }}</td>
              <td>
                <span class="category-badge">{{ item.category || 'Uncategorized' }}</span>
              </td>
              <td class="price">₹{{ (item.itemPrice || 0).toFixed(2) }}</td>
              <td class="quantity">{{ item.quantity }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="item.quantity <= (item.lowStockThreshold || 5) ? 'status-low' : 'status-good'"
                >
                  {{ item.quantity <= (item.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock' }}
                </span>
              </td>
              <td class="actions">
                <button @click="editItem(item)" class="btn-icon edit" title="Edit">✏️</button>
                <button @click="deleteItem(item._id)" class="btn-icon delete" title="Delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <transition name="modal">
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ showEditModal ? 'Edit Item' : 'Add New Item' }}</h2>
            <button @click="closeModal" class="close-btn">×</button>
          </div>
          <form @submit.prevent="showEditModal ? updateItem() : addItem()" class="modal-form">
            <div class="form-group">
              <label>Item Name *</label>
              <input v-model="formData.itemName" type="text" required placeholder="Enter item name" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Price *</label>
                <input v-model.number="formData.itemPrice" type="number" step="0.01" required placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>Quantity *</label>
                <input v-model.number="formData.quantity" type="number" required placeholder="0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <input v-model="formData.category" type="text" placeholder="" />
              </div>
              <div class="form-group">
                <label>Low Stock Alert</label>
                <input v-model.number="formData.lowStockThreshold" type="number" placeholder="5" />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-primary">{{ showEditModal ? 'Update Item' : 'Add Item' }}</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '⚠' }}</span>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from './nav.vue'

const items = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const filterCategory = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingItemId = ref(null)

const formData = ref({
  itemName: '',
  itemPrice: 0,
  quantity: 0,
  category: '',
  lowStockThreshold: 5
})

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const apiBaseUrl = 'http://localhost:5001/api/inven'

const categories = computed(() => {
  const cats = items.value.map(item => item.category).filter(Boolean)
  return [...new Set(cats)]
})

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !filterCategory.value || item.category === filterCategory.value
    return matchesSearch && matchesCategory
  })
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => (toast.value.show = false), 3000)
}

const loadItems = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(apiBaseUrl)
    items.value = await response.json()
  } catch (err) {
    console.error('Failed to load items:', err)
    error.value = 'Failed to connect to server. backend is offline.'
    showToast('Failed to load items', 'error')
  } finally {
    loading.value = false
  }
}

const addItem = async () => {
  try {
    await fetch(apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    closeModal()
    loadItems()
    showToast('Item added successfully')
  } catch (err) {
    console.error('Failed to add item:', err)
    showToast('Failed to add item', 'error')
  }
}

const editItem = (item) => {
  formData.value = { ...item }
  editingItemId.value = item._id
  showEditModal.value = true
}

const updateItem = async () => {
  try {
    await fetch(`${apiBaseUrl}/${editingItemId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    closeModal()
    loadItems()
    showToast('Item updated successfully')
  } catch (err) {
    console.error('Failed to update item:', err)
    showToast('Failed to update item', 'error')
  }
}

const deleteItem = async (itemId) => {
  if (!confirm('Are you sure you want to delete this item?')) return
  try {
    await fetch(`${apiBaseUrl}/${itemId}`, { method: 'DELETE' })
    loadItems()
    showToast('Item deleted successfully')
  } catch (err) {
    console.error('Failed to delete item:', err)
    showToast('Failed to delete item', 'error')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  formData.value = {
    itemName: '',
    itemPrice: 0,
    quantity: 0,
    category: '',
    lowStockThreshold: 5
  }
  editingItemId.value = null
}

onMounted(() => {
  loadItems()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app-wrapper {
  min-height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #263238;
}


.inventory-container {
  padding: 2rem;
  margin-top: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  color: #1b5e20;
  margin: 0;
}

.btn-add {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #666;
}

.search-input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.filter-select {
  padding: 0.7rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: #4caf50;
}

/* Loading, Error, Empty States */
.loading,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state p,
.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

/* Table */
.table-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table thead {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  color: white;
}

.inventory-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.inventory-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.inventory-table tbody tr:hover {
  background: #fafafa;
}

.inventory-table td {
  padding: 1rem;
}

.low-stock-row {
  background: #fff8e1 !important;
}

.item-name {
  font-weight: 600;
  color: #1b5e20;
}

.category-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.price {
  font-weight: 700;
  color: #2e7d32;
}

.quantity {
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-good {
  background: #c8e6c9;
  color: #2e7d32;
}

.status-low {
  background: #ffe0b2;
  color: #e65100;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  transform: scale(1.15);
  background: #f5f5f5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.modal-header h2 {
  margin: 0;
  color: #1b5e20;
  font-size: 1.4rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #000;
}

.modal-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-primary {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-cancel {
  padding: 0.7rem 1.5rem;
  background: #e0e0e0;
  color: #666;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

/* Toast */
.toast {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-weight: 600;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toast.success {
  background: #c8e6c9;
  color: #2e7d32;
}

.toast.error {
  background: #ffcdd2;
  color: #d32f2f;
}

.toast-icon {
  font-size: 1.1rem;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}


@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-add {
    width: 100%;
  }

  .controls {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .inventory-table {
    font-size: 0.85rem;
  }

  .inventory-table th,
  .inventory-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
