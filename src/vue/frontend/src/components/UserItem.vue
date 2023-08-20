<script setup lang="ts">
import UserAvatar from './UserAvatar.vue'
</script>

<script lang="ts">
/**
 * UserItem component (shows a single user)
 * @prop user - User public object [required]
 */
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  }
}
</script>

<template>
  <a class="user-item m-2" :href="`/profile/public/${user.login}`">
    <span class="is-size-6">{{ user.name }}</span>
    <span class="is-size-7">{{ user.login }}</span>
    <UserAvatar :image="user.avatar" />
  </a>
</template>

<style>
.user-item {
  display: flex;
  width: 128px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: black;
  border-radius: 10px;
  background-color: #f5f5f5;
}

.user-item:hover {
  background-color: #e5e5e5;
  color: black;
}

.user-item > span {
  width: 120px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
