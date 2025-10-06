<template>
  <div class="inventory-page">
    <!-- Navbar -->
    <Navbar />

    <!-- Page Content -->
    <div class="inventory-content">
      <!-- Title -->
      <h1 class="inventory-title">Inventory Management</h1>

      <!-- Coming Soon Section -->
      <div class="coming-soon">
        <div class="glassy-card">
          <h2 class="coming-text">
            <span 
              v-for="(letter, index) in comingSoonText"
              :key="index"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              {{ letter }}
            </span>
          </h2>
          <p class="subtext">This feature is under development 🚀</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from "../components/nav.vue";

const comingSoonText = "COMING SOON".split("");
</script>

<style scoped>
.inventory-page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #c7d2fe, #eef2ff, #f9fafb);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.inventory-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.inventory-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 2rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.glassy-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  padding: 3rem 4rem;
  box-shadow: 0 8px 30px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeIn 1s ease-in-out;
}

.coming-text {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #1e40af;
  display: inline-block;
  margin-bottom: 1rem;
}

.coming-text span {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.5s forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtext {
  color: #374151;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
