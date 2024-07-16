<template>
  <div class="popup-overlay" v-if="visible">
    <div class="popup-content">
      <h2>예약되었습니다.</h2>
      <p>좌석번호</p>
      <div class="seat-number">{{ seatNumber }}</div>
      <button @click="closePopup">확인</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ReservePopup",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    seatNumber: {
      type: Number,
      default: null,
    },
  },
  methods: {
    closePopup() {
      this.$emit("close");
      //back to main page
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  animation: popup-show 0.3s ease;
}

.seat-number {
  font-size: 2em;
  font-weight: bold;
  margin: 20px 0;
}

button {
  padding: 10px 20px;
  font-size: 1em;
  border: none;
  background-color: #6a1b9a;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #4a148c;
}

@keyframes popup-show {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
