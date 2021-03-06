<template>
  <div>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <v-row align="center">
            <h3>
              Assign students to random groups
            </h3>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list>
            <v-list-item>
              <v-select v-if="mitClass"
                v-model="roomForRandom"
                :items="mitClass.roomTypes"
                label="Room Group"
                />  
              <v-select 
                v-model="groupSizeForRandom"
                :items="groupSizeList"
                label="Group Size"
              />
              <ButtonNew filled @click="moveStudentsToRooms()">
                <h2>
                  Go
                </h2>
              </ButtonNew>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <p>
      This is where the instructor can broadcast his blackboard to many students at once, ideal for lectures. 
      The instructor can press a button to evenly divide students into random groups in real-time blackboard rooms. 
    </p>
    <!-- <p>class document: {{ classDoc }}</p>
    <p>class participants: {{ participants }}</p> -->
    <RealtimeBlackboard :strokesRef="strokesRef"/>
  </div>
</template>

<script>
/**
 * The main table in our virtual TEAL classroom, where the instructor broadcasts material to many students
 * 
 * Correctness argument for why participants is correct (TODO: implement the following): 
 *   If the user leaves by going to a different page, the `destroy()` hook will call, which is handled. 
 *   If the user leaves by disconnecting, the firebase `disconnect hook` will clean up the user document
 */
import firebase from "firebase/app";
import "firebase/firestore";
import db from "@/database.js";
import { mapState } from "vuex"; 
import DatabaseHelpersMixin from "@/mixins/DatabaseHelpersMixin.js"; 
import RealtimeBlackboard from "@/components/RealtimeBlackboard.vue"; 
import ButtonNew from "@/components/ButtonNew.vue";

export default {
  mixins: [
    DatabaseHelpersMixin
  ],
  components: {
    RealtimeBlackboard,
    ButtonNew
  },
  data () {
    return {
      classRef: db.collection("classes").doc(this.$route.params.class_id),
      classDoc: {},
      strokesRef: db.collection(
        `classes/${this.$route.params.class_id}/blackboards/${this.$route.params.room_id}/strokes`
      ),
      removeClassDocListener: null,
      participants: [],
      tableAssignments: [],
      strokesArray: [],
      roomForRandom: "",
      groupSizeForRandom: 3,
      groupSizeList: []
    };
  },
  computed: {
    isStudent () {
      if (!this.user) return false; 
      else return this.user.type === "student";
    },
    isStaff () {
      if (!this.user) return false;
      else return this.user.type === "staff";
    },
    ...mapState([
      "user",
      "hasFetchedUser",
      "mitClass"
    ])
  },
  /*
    1. Distinguish between students and staff 
    2. Ensure when users are connected that they are added to the participants subcollection
    3. Implement the assignment button 
    4. Add the real-time blackboard, except make it read-only for students
  */
  watch: {
    user: {
      immediate: true,
      async handler () {
        if (!this.user) return;
        this.registerUserAndListenForRoomAssignments(); 
        this.setUserDisconnectHook();
        this.$_listenToDoc(this.classRef, this, "classDoc");
        this.$_listenToCollection(this.classRef.collection("participants"), this, "participants");
      }
    }
  },
  created () {
    for (let i = 1; i <= 20; i++) {
      this.groupSizeList.push(i);
    }
  },
  beforeDestroy () {
    this.classRef.collection("participants").doc(this.user.uid).delete()
  },
  methods: {
    // TODO: 
    //   connect to the blackboard
    //   activate event listeners if and only if the user is a staff member
    //   listen to the class doc for new group assignments
    registerUserAndListenForRoomAssignments () {
      if (this.isStaff) return; 
      // we use `.set()` rather than `.add()` because if a student uses multiple devices, we want her to only be assigned to 1 table
      this.classRef.collection("participants").doc(this.user.uid).set({
        uid: this.user.uid,
        email: this.user.email,
        // firstName: this.user.firstName,
        // lastName: this.user.lastName,
      }); 
      let onlyJustJoined = true; 
      this.removeClassDocListener = this.classRef.onSnapshot(doc => {
        /* roomAssignment := [{
          roomID: ""
          assignees: set([])
        }] */
        for (const roomAssignment of doc.data().tableAssignments) {
          if (roomAssignment.assignees.includes(this.user.uid)) {
            if (onlyJustJoined) {
              onlyJustJoined = false; 
              return; 
            } else {
              this.removeClassDocListener(); 
              this.$router.push(`/class/${this.$route.params.class_id}/room/${roomAssignment.roomID}`); 
              this.$root.$emit("show-snackbar", "You've been assigned to a random group. Have fun :)")
            }
          }
        }
      });
    },
    setUserDisconnectHook () {
      firebase.database().ref(".info/connected").on("value", async (snapshot) => {
        const isUserConnected = snapshot.val(); 
        if (isUserConnected === false) return;
        const firebaseRef = firebase.database().ref(`/class/${this.$route.params.class_id}/participants`);
        await firebaseRef.onDisconnect().set({
            uid: this.user.uid,
            email: this.user.email
        });
        firebaseRef.set({ // Firebase will not detect change if it's set to an empty object
          email: "", 
          uid: ""
        });
      })
    }, 
    async moveStudentsToRooms () {
      /**
       * Shuffles array in place. ES6 version
       * @param {Array} a array containing items.
       * @see https://stackoverflow.com/a/6274381
       */
      function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      }
      const promises = []; 
      const connectedStudents = []; 
      const tableAssignments = []; 
      promises.push(
        this.$_getCollection(this.classRef.collection("participants")).then(participants => {
          connectedStudents.push(...participants);
        })
      ); 
      promises.push(
        this.$_getCollection(this.classRef.collection("blackboards")).then(tealTables => {
          let i = 0; 
          for (const table of tealTables.filter(room => room.roomType === this.roomForRandom)) { //This is using a filter for now so it's not optimized (because it fetches all boards first) probs fine
            tableAssignments.push({
              roomID: table.id,
              assignees: []
            }); 
          }
        })
      );
      await Promise.all(promises); 
      shuffle(connectedStudents); 
      shuffle(tableAssignments);

      // `tableAssignments` has the structure of: [{ roomID: "123", "assignees": ["345", "abc"] }]
      let i = 0; 
      for (const student of connectedStudents) {
        if (tableAssignments[i].assignees.length >= this.groupSizeForRandom) {
          i = (i+1)%tableAssignments.length; //leftover students just get pushed onto a table
        }
        tableAssignments[i].assignees.push(student.uid); 
      }
      // update the class doc, so each connected user will detect the change and be redirected.
      await this.classRef.update({
        tableAssignments
      });
      // Here we used to batch delete all of the participants, but we dont need that anymore as particpants are deleted on destroy
    }
  }
}
</script>