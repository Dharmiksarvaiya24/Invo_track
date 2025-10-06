<template>
  <div>
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Logo and Brand -->
        <div class="navbar-brand">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RdjPwdcxnD3A6uSfSXlOYItwaY7Hed.png"
            alt="Junco Logo"
            class="logo"
          />
          <span class="brand-text">Junco Billing</span>
        </div>

        <!-- Settings Button -->
        <div class="settings-container">
          <!-- uses existing showSettingsButton -->
          <button
            v-if="showSettingsButton"
            class="settings-button"
            @click="toggleSettings"
            :class="{ active: showSettings }"
          >
            Settings
          </button>

          <!-- Back button shows on inventory route -->
          <button
            v-if="showBackButton"
            @click="goBack"
            class="back-btn"
          >
            Back
          </button>

          <!-- Settings Overlay -->
          <transition name="overlay">
            <div v-if="showSettings && showSettingsButton" class="settings-overlay">
              <div class="overlay-content">
                <button class="overlay-option" @click="handleAddItem">
                  <svg
                    class="option-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Item
                </button>

                <button
                  class="overlay-option delete-option"
                  @click="handleDeleteMode"
                >
                  <svg
                    class="option-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path
                      d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Delete Items
                </button>

                <div class="option-divider"></div>

                <button class="overlay-option" @click="handleViewInventory">
                  <svg
                    class="option-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M3 3h18v18H3zM9 9h6v6H9z"></path>
                  </svg>
                  View Inventory
                </button>

                <div class="option-divider"></div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Settings Backdrop -->
        <div v-if="showSettings && showSettingsButton" class="backdrop" @click="closeSettings"></div>
      </div>
    </nav>

    <!-- Delete Items Overlay -->
    <transition name="modal">
      <div
        v-if="showDeleteOverlay"
        class="modal-backdrop"
        @click="closeDeleteOverlay"
      >
        <div class="modal-container delete-items-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title delete-title">Delete Items</h2>
            <button class="close-button" @click="closeDeleteOverlay">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="delete-items-content">
            <div v-if="isLoadingItems" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading items...</p>
            </div>

            <div v-else-if="items.length === 0" class="empty-state">
              <p>No items found</p>
            </div>

            <div v-else class="items-grid">
              <div
                v-for="item in items"
                :key="item._id"
                class="delete-item-card"
              >
                <div class="item-info">
                  <h3 class="item-name">{{ item.itemName }}</h3>
                  <p class="item-price">₹{{ item.itemPrice }}</p>
                </div>

                <button
                  class="delete-item-btn"
                  @click="confirmDeleteItem(item._id, item.itemName)"
                  :disabled="isDeletingItem"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path
                      d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Add Item Form Modal -->
    <transition name="modal">
      <div
        v-if="showAddItemForm"
        class="modal-backdrop"
        @click="closeAddItemForm"
      >
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">
              {{ editingItem ? "Edit Item" : "Add New Item" }}
            </h2>
            <button class="close-button" @click="closeAddItemForm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleFormSubmit" class="modal-form">
            <div class="form-group">
              <label for="itemName" class="form-label">Item Name</label>
              <input
                id="itemName"
                v-model="formData.itemName"
                type="text"
                class="form-input"
                placeholder="Enter item name"
                required
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-group">
              <label for="itemPrice" class="form-label">Price</label>
              <div class="price-input-container">
                <span class="currency-symbol">₹</span>
                <input
                  id="itemPrice"
                  v-model="formData.itemPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input price-input"
                  placeholder="0.00"
                  required
                  :disabled="isSubmitting"
                />
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="cancel-button"
                @click="closeAddItemForm"
                :disabled="isSubmitting"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="confirm-button"
                :disabled="!isFormValid || isSubmitting"
              >
                {{
                  isSubmitting
                    ? (editingItem ? "Updating..." : "Adding...")
                    : (editingItem ? "Update" : "Add Item")
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal">
      <div
        v-if="showDeleteConfirm"
        class="modal-backdrop"
        @click="closeDeleteConfirm"
      >
        <div class="modal-container delete-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title delete-title">Confirm Delete</h2>
            <button class="close-button" @click="closeDeleteConfirm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="delete-content">
            <div class="warning-icon"></div>
            <p class="delete-message">
              Are you sure you want to delete
              "<strong>{{ itemToDelete.name }}</strong>"?
            </p>
            <p class="delete-warning">This action cannot be undone.</p>

            <div class="delete-actions">
              <button
                class="cancel-delete-btn"
                @click="closeDeleteConfirm"
                :disabled="isDeletingItem"
              >
                Cancel
              </button>
              <button
                class="confirm-delete-btn"
                @click="executeDelete"
                :disabled="isDeletingItem"
              >
                {{ isDeletingItem ? "Deleting..." : "Delete" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <div class="toast-content">
          <svg
            v-if="toast.type === 'success'"
            class="toast-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          <svg
            v-else
            class="toast-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, provide, inject } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// api url
const API_BASE_URL = "http://localhost:5000/api/items";

const injectedGlobalState = inject("globalState", null);
const globalState = ref({
  items: [],
  cartItems: [],
  totalItems: 0,
  lastUpdate: Date.now(),
});
if (injectedGlobalState) {
  globalState.value = injectedGlobalState.value;
}
provide("globalState", globalState);

// Reactive state
const showSettings = ref(false);
const showAddItemForm = ref(false);
const showDeleteConfirm = ref(false);
const showDeleteOverlay = ref(false);
const editingItem = ref(null);
const isSubmitting = ref(false);
const isDeletingItem = ref(false);
const isLoadingItems = ref(false);
const items = ref([]);

const formData = ref({
  itemName: "",
  itemPrice: "",
});

const itemToDelete = ref({
  id: null,
  name: "",
});

const toast = ref({
  show: false,
  message: "",
  type: "success",
});

// Computed properties
const isFormValid = computed(() => {
  return (
    formData.value.itemName.trim() &&
    formData.value.itemPrice &&
    parseFloat(formData.value.itemPrice) > 0
  );
});

// ✅ Back button visible when route includes "/inventory"
const showBackButton = computed(() => route.path.includes("/invontory"));

// ✅ Settings button hidden on inventory route
const showSettingsButton = computed(() => !route.path.includes("/invontory"));

// Toast functionality
const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// API functions (unchanged)
const fetchItems = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch items");
    const data = await response.json();
    items.value = data;
    globalState.value.items = data;
    globalState.value.totalItems = data.length;
    globalState.value.lastUpdate = Date.now();
    window.dispatchEvent(
      new CustomEvent("itemsUpdated", { detail: { items: data, timestamp: Date.now() } })
    );
    return data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

const addItem = async (itemData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add item");
    }
    const newItem = await response.json();
    items.value.push(newItem);
    globalState.value.items.push(newItem);
    globalState.value.totalItems = items.value.length;
    globalState.value.lastUpdate = Date.now();
    window.dispatchEvent(
      new CustomEvent("itemAdded", {
        detail: { item: newItem, allItems: items.value, timestamp: Date.now() },
      })
    );
    await nextTick(() => {
      items.value = [...items.value];
    });
    return newItem;
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
};

const deleteItem = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${itemId}`, { method: "DELETE" });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete item");
    }
    items.value = items.value.filter((item) => item._id !== itemId);
    globalState.value.items = globalState.value.items.filter((item) => item._id !== itemId);
    globalState.value.totalItems = items.value.length;
    globalState.value.lastUpdate = Date.now();
    window.dispatchEvent(
      new CustomEvent("itemDeleted", {
        detail: { itemId, allItems: items.value, timestamp: Date.now() },
      })
    );
    await nextTick(() => {
      items.value = [...items.value];
    });
    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

// Load items for delete overlay
const loadItemsForDelete = async () => {
  isLoadingItems.value = true;
  try {
    const data = await fetchItems();
    items.value = data;
  } catch (error) {
    showToast("Failed to load items", "error");
  } finally {
    isLoadingItems.value = false;
  }
};

// Event handlers
const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};
const closeSettings = () => {
  showSettings.value = false;
};
const closeAddItemForm = () => {
  showAddItemForm.value = false;
  editingItem.value = null;
  formData.value = { itemName: "", itemPrice: "" };
};
const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  itemToDelete.value = { id: null, name: "" };
};
const closeDeleteOverlay = () => {
  showDeleteOverlay.value = false;
};
const handleAddItem = () => {
  closeSettings();
  showAddItemForm.value = true;
};
const handleViewInventory = () => {
  closeSettings();
  router.push("/invontory"); 
};
const handleDeleteMode = async () => {
  closeSettings();
  showDeleteOverlay.value = true;
  await loadItemsForDelete();
};
const handleFormSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const itemData = {
      itemName: formData.value.itemName.trim(),
      itemPrice: parseFloat(formData.value.itemPrice),
    };
    if (editingItem.value) {
      showToast("Item updated successfully!");
    } else {
      await addItem(itemData);
      showToast("Item added successfully!");
      await nextTick();
    }
    closeAddItemForm();
  } catch (error) {
    showToast(error.message || "Operation failed", "error");
  } finally {
    isSubmitting.value = false;
  }
};
const confirmDeleteItem = (itemId, itemName) => {
  itemToDelete.value = { id: itemId, name: itemName };
  showDeleteConfirm.value = true;
};
const executeDelete = async () => {
  if (!itemToDelete.value.id || isDeletingItem.value) return;
  isDeletingItem.value = true;
  try {
    await deleteItem(itemToDelete.value.id);
    showToast("Item deleted successfully!");
    closeDeleteConfirm();
    await nextTick();
  } catch (error) {
    showToast(error.message || "Failed to delete item", "error");
  } finally {
    isDeletingItem.value = false;
  }
};

// Hooks
let refreshInterval = null;
onMounted(() => {
  window.addEventListener("externalItemUpdate", (event) => {
    const { items: updatedItems } = event.detail;
    items.value = updatedItems;
    globalState.value.items = updatedItems;
    globalState.value.totalItems = updatedItems.length;
    globalState.value.lastUpdate = Date.now();
  });
  refreshInterval = setInterval(async () => {
    try {
      await fetchItems();
    } catch (error) {
      console.error("Auto-refresh failed:", error);
    }
  }, 30000);
});
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
});

// Navigation
const goBack = () => {
  router.back();
};
</script>


<style scoped>
.navbar {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-bottom: 3px solid #4ade80;
  box-shadow: 0 4px 20px rgba(74, 222, 128, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  margin: 0;
  padding: 0;
}
.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90px;
}
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.logo {
  height: 55px;
  width: 55px;
  object-fit: contain;
  border-radius: 50%;
  background: rgba(74, 222, 128, 0.1);
  padding: 2px;
}
.brand-text {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(74, 222, 128, 0.3);
}
.settings-container {
  position: relative;
}
.settings-button {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: #1a1a1a;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(74, 222, 128, 0.2);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.025em;
}
.settings-button.active {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(74, 222, 128, 0.4);
}
.settings-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(74, 222, 128, 0.4);
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}
.settings-overlay {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #4ade80;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(74, 222, 128, 0.2);
  z-index: 1001;
  min-width: 220px;
  overflow: hidden;
}
.overlay-content {
  padding: 0.5rem;
}
.overlay-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  letter-spacing: 0.01em;
}
.overlay-option:hover {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
  transform: translateX(4px);
}
.delete-option:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.option-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.option-divider {
  height: 1px;
  background: rgba(74, 222, 128, 0.2);
  margin: 0.5rem 0;
}
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}
.delete-items-modal {
  max-width: 600px;
  max-height: 80vh;
}
.delete-items-content {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #ffffff;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(74, 222, 128, 0.3);
  border-top: 3px solid #4ade80;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}
.empty-icon {
  width: 48px;
  height: 48px;
  stroke: rgba(255, 255, 255, 0.5);
}
.items-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}
.delete-item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 12px;
  transition: all 0.2s ease;
}
.delete-item-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(74, 222, 128, 0.3);
}
.item-info {
  flex: 1;
}
.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}
.item-price {
  font-size: 0.9rem;
  color: #4ade80;
  margin: 0;
  font-weight: 500;
}
.delete-item-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-item-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.05);
}
.delete-item-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.delete-item-btn svg {
  width: 18px;
  height: 18px;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}
.modal-container {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #4ade80;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(74, 222, 128, 0.3);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}
.delete-modal {
  max-width: 400px;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(74, 222, 128, 0.2);
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}
.delete-title {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.close-button {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.close-button:hover {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}
.close-button svg {
  width: 20px;
  height: 20px;
}
.modal-form {
  padding: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}
.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(74, 222, 128, 0.3);
  border-radius: 10px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: #4ade80;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
}
.price-input-container {
  position: relative;
  display: flex;
  align-items: center;
}
.currency-symbol {
  position: absolute;
  left: 1rem;
  color: #4ade80;
  font-weight: 600;
  z-index: 1;
}
.price-input {
  padding-left: 2.5rem;
}
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.cancel-button {
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.cancel-button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}
.confirm-button {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border: none;
  color: #1a1a1a;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.confirm-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  transform: translateY(-1px);
}
.confirm-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.delete-content {
  padding: 2rem;
  text-align: center;
}
.warning-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.warning-icon svg {
  width: 48px;
  height: 48px;
  stroke: #ef4444;
}
.delete-message {
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}
.delete-warning {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}
.delete-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.cancel-delete-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.cancel-delete-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}
.confirm-delete-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  color: #ffffff;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.confirm-delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
}
.confirm-delete-btn:disabled,
.cancel-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.toast {
  position: fixed;
  top: 120px;
  right: 2rem;
  z-index: 3000;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
}
.toast.success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
}
.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
}
.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.overlay-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
.overlay-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }
  .brand-text {
    font-size: 1.5rem;
  }
  .logo {
    height: 45px;
    width: 45px;
  }
  .modal-backdrop {
    padding: 0.5rem;
  }
  .delete-items-modal {
    max-width: 95vw;
  }
  .toast {
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
.back-btn {
 background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: #1a1a1a;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(74, 222, 128, 0.2);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.025em;
}
.back-btn:hover {
 transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(74, 222, 128, 0.4);
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}
</style>
