<script setup lang="ts">
import { socket } from '@/socket'
import { useStore } from '@/store'
import { type Channel } from '@/components/Channel.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>

<script lang="ts">
export default {
  name: 'ManageMenu',
  props: {
    channel: {} as any
  },
  data() {
    return {
      store: useStore,
      password: '' as string,
      add: false as boolean,
      edit: false as boolean
    }
  },
  methods: {
    removeChannel(): void {
      const data = { name: this.channel.name }
      socket.emit('remove-channel', data)
    },
    addPassword(): void {
      const data = {
        name: this.channel.name,
        password: this.password
      }
      socket.emit('add-password', data)
      this.add = false
      this.password = ''
    },
    editPassword(): void {
      const data = {
        name: this.channel.name,
        password: this.password
      }
      socket.emit('edit-password', data)
      this.edit = false
      this.password = ''
    },
    removePassword(): void {
      const data = { name: this.channel.name }
      socket.emit('remove-password', data)
    }
  }
}
</script>

<template>
  <ul class="menu-list">
    <li>
      <a @click="add = !add">Add password</a>
      <div v-if="add" class="promptPassword">
        <form @submit="addPassword">
          <input class="is-small input" type="password" placeholder="********" v-model="password" />
        </form>
        <button class="is-small button is-success ml-2" @click="addPassword">
          <FontAwesomeIcon :icon="['fas', 'fingerprint']" size="lg" />
        </button>
      </div>
    </li>
    <li>
      <a @click="edit = !edit">Edit password</a>
      <div v-if="edit" class="promptPassword">
        <form @submit="editPassword">
          <input class="is-small input" type="password" v-model="password" />
        </form>
        <button class="is-small button is-success" @click="editPassword">
          <FontAwesomeIcon :icon="['fas', 'paper-plane']" />
        </button>
      </div>
    </li>
    <li><a @click="removePassword">Remove password</a></li>
    <li><a @click="removeChannel">Remove channel</a></li>
  </ul>
</template>

<style>
#promptPassword {
  display: flex;
  width: 30%;
}
</style>
