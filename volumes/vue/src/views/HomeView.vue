<script lang="ts">
import { User } from '../types'
import { Socket } from 'socket.io-client'
import axios from 'axios'
import FormData from 'form-data'
export default {
  mounted() {
  },

  props: {
    socket: {
      type: Socket,
      required: true
    },
    user: {
      type: User,
      default: null
    }
  },
  methods: {
    uploadAvatar(): void {
      const inputFileRef = this.$refs.inputFile! as HTMLInputElement
      if (inputFileRef.files?.length == 0)
        return ;
      //const reader = new FileReader()
      //reader.addEventListener("load", () => {
        //const file = reader.result
        const config = {
            file: inputFileRef.files![0]
        }
        console.log(inputFileRef.files![0])
        axios.post("http://localhost:3000/uploadAvatar", config)
        .then(() => {
            //this.$emit('updateAvatar', file)
		    })
      //})
      //reader.readAsDataURL(inputFileRef.files![0])
      }
    }
  }

</script>

<template>
  <h1>Home</h1>

  <div v-if="user">
    <img :src="user.avatar" width="600" height="500" />
      <input type="file" accept="image/*" ref="inputFile">
      <button @click="uploadAvatar">upload</button>
      <form method="post" action="http://localhost:3000/uploadAvatar">
        <input type="file" accept="image/*" name="file">
        <input type="submit" />
      </form>
  </div>
</template>
