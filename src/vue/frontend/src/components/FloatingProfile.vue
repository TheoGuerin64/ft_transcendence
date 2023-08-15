<script setup lang="ts">
import UserAvatar from './UserAvatar.vue'
</script>

<template>
  <div
    class="floating-profile dropdown"
    @mouseover="
      () => {
        $el.classList.add('is-active')
      }
    "
    @mouseleave="
      () => {
        $el.classList.remove('is-active')
      }
    "
  >
    <UserAvatar
      image="https://cdn.intra.42.fr/users/b3263c065f553ff1c779b9cd138cf943/medium_tguerin.jpg"
      :size="100"
    />
    <div class="dropdown-trigger mx-5">
      <h3>theo</h3>
      <h2>tguerin</h2>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a href="#" class="dropdown-item"> Dropdown item </a>
        <a class="dropdown-item"> Other dropdown item </a>
        <a href="#" class="dropdown-item is-active"> Active dropdown item </a>
        <a href="#" class="dropdown-item"> Other dropdown item </a>
        <hr class="dropdown-divider" />
        <a href="#" class="dropdown-item"> With a divider </a>
      </div>
    </div>
  </div>
</template>

<style>
.floating-profile {
  position: fixed !important;
  right: 3rem;
  top: 2rem;
  display: flex;
  align-items: center;
  background-color: #a0aec0;
  color: black;
}

.floating-profile:hover {
  background-color: #848a94;
}
</style>
