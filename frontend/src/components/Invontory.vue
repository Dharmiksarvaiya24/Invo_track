<template>
  <div class="inventory-page">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <div class="inventory-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card green-card">
          <div class="stat-icon">🏪</div>
          <div class="stat-info">
            <p class="stat-label">Total Stores</p>
            <h3 class="stat-value">0</h3>
          </div>
        </div>

        <div class="stat-card green-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <p class="stat-label">Products</p>
            <h3 class="stat-value">0</h3>
          </div>
        </div>

        <div class="stat-card green-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <p class="stat-label">Categories</p>
            <h3 class="stat-value">0</h3>
          </div>
        </div>

        <div class="stat-card green-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <p class="stat-label">Low Stock</p>
            <h3 class="stat-value">0</h3>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h2 class="empty-title">No Stores Added Yet</h2>
        <p class="empty-text">
          Get started by adding your first store to manage inventory effectively.
        </p>
        <button @click="handleAddStore" class="primary-btn green-btn">
          <span class="btn-icon">+</span>
          Add Store
        </button>
      </div>
    </div>

    <!-- Add Store Modal -->
    <transition name="modal">
      <div v-if="showAddStoreModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header gradient-header">
            <h2>Add New Store</h2>
            <button @click="closeModal" class="close-btn">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Store Name</label>
              <input type="text" v-model="newStore.name" placeholder="Enter store name" class="form-input"/>
            </div>

            <div class="form-group">
              <label>Location</label>
              <input type="text" v-model="newStore.location" placeholder="Enter store location" class="form-input"/>
            </div>

            <div class="form-group">
              <label>Manager</label>
              <input type="text" v-model="newStore.manager" placeholder="Enter manager name" class="form-input"/>
            </div>

            <div class="form-group">
              <label>Contact Number</label>
              <input type="tel" v-model="newStore.contact" placeholder="Enter contact number" class="form-input"/>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="secondary-btn">Cancel</button>
            <button @click="saveStore" class="primary-btn green-btn">Add Store</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from "../components/nav.vue";

const showAddStoreModal = ref(false);
const newStore = ref({ name: '', location: '', manager: '', contact: '' });

const handleAddStore = () => {
  showAddStoreModal.value = true;
};

const closeModal = () => {
  showAddStoreModal.value = false;
  newStore.value = { name: '', location: '', manager: '', contact: '' };
};

const saveStore = () => {
  console.log('Saving store:', newStore.value);
  closeModal();
};
</script>

<style scoped>
.inventory-page {
  min-height: 100vh;
  background: #f3f6f4;
  display: flex;
  flex-direction: column;
}

/* Main content padding with space for navbar */
.inventory-content {
  flex: 1;
  padding: 10rem 2rem 2rem; /* Top padding enhanced */
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}



.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.stat-info .stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-info .stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  margin-bottom: 3rem;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-text {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.primary-btn.green-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 6px 20px rgba(16,185,129,0.3);
  transition: all 0.3s ease;
}

.primary-btn.green-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16,185,129,0.5);
}

/* Modal Redesign */
.modal-overlay {
  position: fixed;
  top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  padding: 2.5rem;
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  color: #111827;
  font-size: 1.6rem;
  font-weight: 600;
}

.gradient-header {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 16px 16px 0 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.modal-body .form-group {
  margin-bottom: 1.75rem;
}

.modal-body label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.modal-body input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.modal-body input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 8px rgba(16,185,129,0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.secondary-btn:hover {
  background: #e5e7eb;
}

/* Modal animation */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .inventory-content { padding-top: 5rem; }
}
</style>
