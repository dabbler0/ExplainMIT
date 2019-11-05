<template>
  <div>
    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar">
      {{ snackbarMessage }}
      <v-btn @click="snackbar = false" color="pink" text>
        CLOSE
      </v-btn>
    </v-snackbar>

    <!-- LOGIN / SIGNUP -->
    <login-popup 
      v-model="loginPopup" 
      :newAccount="false"
      @sign-in="payload => signIn(payload)"
      @create-account="payload => createAccount(payload)"
    />
           
    <!-- NAVBAR  -->
    <v-app-bar app color="white">
      <img src="favicon.ico">
      <v-toolbar-title class="headline font-weight-regular ml-2">
        ExplainMIT
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <template v-if="user && $route.path == '/'">
        <new-class-popup
          v-model="newClassPopup"
          @create-class="courseNumber => createClass(courseNumber)"
        />

        <v-btn @click="newClassPopup = true" dark color="grey">
          CREATE CLASS
        </v-btn>
          <!-- <v-btn icon>
            <v-icon color="grey darken-2">notifications</v-icon>
          </v-btn> -->
      </template>

      <template v-if="!isFetchingUser">
        
        <vuetify-menu 
          v-if="user"
          :user="user"
          @save="payload => updateUser(payload)"
          @sign-out="signOut()"
        >
          <template v-slot:default="{ on }"> 
            <v-btn 
              v-on="on"
              icon class="ml-4"
            >
              <v-icon large :color="user.color">
                account_circle
              </v-icon>
            </v-btn>
          </template>
        </vuetify-menu>

        <v-btn 
          v-else-if="!user"  
          @click="handleSignIn()" 
          class="grey--text text--darken-2"
          text
        >
          SIGN IN
        </v-btn>
      </template>

     
        <!-- <template v-slot:extension>

          <v-tabs
            v-if="showTabs"
            centered
            slider-color="yellow"
            background-color="transparent"
          >
    
            <v-tab
              v-for="i in 3"
              :key="i"
              :href="`#tab-${i}`"
            >
              Item {{ i }}
            </v-tab>
          </v-tabs>
        </template>
    -->

    </v-app-bar>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import db from '@/database.js'
import firebase from 'firebase/app'
import 'firebase/auth'
import NewClassPopup from '@/components/NewClassPopup.vue'
import LoginPopup from "@/components/LoginPopup.vue"
import VuetifyMenu from "@/components/VuetifyMenu.vue"

export default {
  components: {
    NewClassPopup,
    LoginPopup,
    VuetifyMenu
  },
  computed: {
    ...mapState(["user", "isFetchingUser"]),
    classID () {
      return this.$route.params.class_id
    },
     isGallery () {
      const path = this.$route.path
      const pathParts = path.split('/')
      return pathParts[2] == "gallery"
    }
  },
  data () {
    return {
      loginPopup: false,
      newClassPopup: false,
      showNavbar: true,
      prevClassID: '',
      workspaces: [],
      explanations: [],
      isExplanationPage: false,
      drawerOpen: false,
      loadingAnimation: true,
      snackbar: false,
      snackbarMessage: '',
      menu: false,
      showTabs: false
    }
  },
  methods: {
    async updateUser({ name, useDarkMode, color }) {
      const ref = db.collection("users").doc(this.user.uid)
      await ref.update({
        name,
        useDarkMode
      })
    },
    signIn({ email, password }) {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
          this.$store.dispatch('handleUserLogic', user)
          this.snackbarMessage = `Welcome to ExplainMIT!`
          this.snackbar = true 
          this.loginPopup = false 
        })
      .catch(error => {
          this.snackbarMessage = error.message
          this.snackbar = true 
        })
    },
    createAccount({ email, password }) {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
          this.snackbarMessage = `Welcome to ExplainMIT!`
          this.snackbar = true 
          this.loginPopup = false
        })
        .catch(error => {
          this.snackbarMessage = error.message
          this.snackbar = true 
        })
    },
    handleSignIn () {
      this.loginPopup = true
    },
    replaySilentAnimation () {
      this.$root.$emit('replay-silent-animation')
    },
    createClass (courseNumber) {
      const ref = db.collection('classes').doc(courseNumber)
      ref.set({ 
        courseNumber,
        description: "description",
        introVideoID: "4zV1vCQE3CDAuZC8vtEw", // always initialize picture to Sun, Moon and Lake
        paragraph: "paragraph",
        tabs: ["Concepts"]
      })
    },
    signOut () {
      firebase.auth().signOut()
    }
  }
};
</script>

