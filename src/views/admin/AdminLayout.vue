<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-brand">社恐测评 Console</div>
      <div class="admin-section">导航</div>
      <nav class="admin-nav">
        <router-link class="admin-link" :to="{ name: 'AdminDashboard' }">
          <span>数据总览</span>
        </router-link>
        <router-link class="admin-link" :to="{ name: 'AdminCodes' }">
          <span>激活码管理</span>
        </router-link>
      </nav>
    </aside>
    <section>
      <header class="admin-topbar">
        <h2 class="text-title">激活码后台</h2>
        <div class="admin-actions">
          <router-link class="btn" to="/">返回前台</router-link>
        </div>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </section>
  </div>
  
</template>

<script setup>
// 纯布局容器
</script>

<style scoped>
.admin-content { min-height: 50vh; }
</style>


