<template>
  <div class="page">
    <!-- Header -->

    <div class="header">
      <h1 class="brand">InvoTrack</h1>
    </div>

    <!-- Hero -->
    <div class="hero">
      <h2 class="hero-title">Billing & Inventory Management</h2>
      <p class="hero-sub">Simple, powerful tools to manage your business</p>
      <button @click="goToDashboard" class="btn-animated">Get Started</button>
    </div>

    <!-- Features -->
    <div class="features">
      <div class="features-grid">
        <!-- Feature 1 -->
        <div class="feature-card">
          <div class="feature-badge">1</div>
          <h3 class="feature-title">Invoice Management</h3>
          <p class="feature-text">Create and track invoices easily with automated reminders</p>
        </div>

        <!-- Feature 2 -->
        <div class="feature-card">
          <div class="feature-badge">2</div>
          <h3 class="feature-title">Inventory Control</h3>
          <p class="feature-text">Monitor stock levels </p>
        </div>

        <!-- Feature 3 -->
        <div class="feature-card">
          <div class="feature-badge">3</div>
          <h3 class="feature-title">Analytics & Reports</h3>
          <p class="feature-text">Get insights with detailed reports and dashboards</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

const goToDashboard = () => {
  window.location.href = '/landing'
}

</script>

<style scoped>
/* Page */
.page {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  margin: 0;
  padding: 0;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 20px 40px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  display: flex;
  justify-content: flex-start; /* 👈 keeps content to the left */
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.brand {
  margin: 0;
  color: #10b981;
  font-size: 28px;
  text-align: left;
}

/* Button */
.btn-animated {
  padding: 14px 40px;
  background: #10b981;
  color: #ffffff;
  border: 2px solid #10b981;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  animation: pulse 2s infinite;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  display: inline-block;
  margin-top: 30px;
}

.btn-animated:hover {
  background: #0ea371;
}

.btn-animated:active {
  transform: translateY(1px);
}

/* Hero */
.hero {
  text-align: center;
  padding: 140px 40px 100px;
}

.hero-title {
  font-size: 48px;
  color: #111111;
  margin: 0 0 20px 0;
}

.hero-sub {
  font-size: 18px;
  color: #666666;
  margin: 0 0 40px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* Features */
.features {
  max-width: 1000px;
  margin: 0 auto;
  padding: 6px 40px 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
}

.feature-card {
  padding: 30px;
  background: #f5f5f5;
  border-radius: 8px;
}

.feature-badge {
  width: 40px;
  height: 40px;
  background: #10b981;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 15px;
}

.feature-title {
  color: #111111;
  margin: 0 0 10px 0;
}

.feature-text {
  color: #666666;
  margin: 0;
  line-height: 1.5;
}

/* Animation */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
  }
  50% {
    box-shadow: 0 0 25px rgba(16, 185, 129, 0.8);
  }
}

/* Responsive */
@media (max-width: 900px) {
  .hero {
    padding: 120px 24px 80px;
  }
  .features {
    padding: 48px 24px;
  }
  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
  .hero-title {
    font-size: 40px;
  }
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  .hero {
    padding: 100px 20px 64px;
  }
  .hero-title {
    font-size: 32px;
  }
  .btn-animated {
    padding: 12px 28px;
    font-size: 15px;
  }
}
</style>