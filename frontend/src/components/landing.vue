<template>
  <div class="main-layout">
    <!-- Navbar -->
    <div class="navbar">
      <Nav />
    </div>

    <!-- Main content -->
    <div class="content">
      <Items />
    </div>

    <!-- Main content -->
    <div class="content">
      <cart />
    </div>
  </div>
</template>

<script setup>
// Import components
import Nav from './nav.vue'
import Items from './items.vue'
import cart from './cart.vue';
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f9fa;
}

.navbar {
  position: sticky; /* or fixed */
  top: 0;
  z-index: 10;
  background: white;
  height: 60px; /* set navbar height */
  display: flex;
  align-items: center;
}

.content {
  flex: 1;
  padding: 1rem;
  margin-top: 60px; /* push content below navbar */
}
</style>
