<template>
  <div class="reservation-container">
    <div class="header"></div>
    <div class="reservation-form">
      <div class="form-group">
        <label for="date">날짜</label>
        <select
          id="date"
          v-model="selectedDate"
          @change="updateAvailableSeats"
          class="select-box"
        >
          <option v-for="date in availableDates" :key="date" :value="date">
            {{ date }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="time">시간</label>
        <select
          id="time"
          v-model="selectedTime"
          @change="updateAvailableSeats"
          class="select-box"
        >
          <option v-for="time in filteredTimes" :key="time" :value="time">
            {{ formatTime(time) }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <p></p>
        <label class="seat-info">남은 자리 수 {{ availableSeats }}/24</label>
      </div>
    </div>
    <div class="seat-map">
      <div
        v-for="(seat, index) in seats.slice(0, 20)"
        :key="index"
        class="seat"
        :class="seatClass(seat)"
      >
        <input
          type="radio"
          :id="'seat-' + index"
          :value="index"
          v-model="selectedSeat"
          :disabled="seat.status === 'reserved'"
        />
        <label :for="'seat-' + index">{{ seat.name }}</label>
      </div>
    </div>
    <div class="last-row">
      <div
        v-for="index in [20, 21, 22, 23]"
        :key="index"
        class="seat"
        :class="seatClass(seats[index])"
      >
        <input
          type="radio"
          :id="'seat-' + index"
          :value="index"
          v-model="selectedSeat"
          :disabled="seats[index].status === 'reserved'"
        />
        <label :for="'seat-' + index">{{ seats[index].name }}</label>
      </div>
    </div>
    <div class="reservation-button-container">
      <button @click="reserveSeat" class="reserve-button">예약하기</button>
    </div>
    <ReservePopup
      :visible="isPopupVisible"
      :seatNumber="selectedSeatNumber"
      @close="isPopupVisible = false"
    />
    <button @click="logout" class="logout-button">로그아웃</button>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import ReservePopup from "./Popup.vue";

export default {
  name: "SeatReservation",
  components: {
    ReservePopup,
  },
  setup() {
    const selectedDate = ref("");
    const selectedTime = ref("");
    const selectedSeat = ref(null);
    const availableSeats = ref(24);
    const seats = ref(new Array(24).fill({ status: "available", name: "" }));
    const availableDates = ref([]);
    const isPopupVisible = ref(false);
    const selectedSeatNumber = ref(null);
    const router = useRouter();
    const times = ["09:20", "10:15", "19:00", "20:00"];

    onMounted(() => {
      generateAvailableDates();
      updateAvailableSeats();
    });

    const generateAvailableDates = () => {
      const daysOfWeek = ["월", "화", "수", "목", "금"];
      const today = new Date();
      let isTodayAfterFive = false;

      if (today.getHours() >= 21) {
        isTodayAfterFive = true;
      }

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        if (daysOfWeek.includes(getDayOfWeek(date))) {
          availableDates.value.push(formatDate(date));
        }
      }

      if (isTodayAfterFive) {
        const nextAvailableDate = availableDates.value.find(
          (date) => date !== formatDate(today)
        );
        selectedDate.value = nextAvailableDate || availableDates.value[0];
      } else {
        selectedDate.value = availableDates.value[0];
      }
      selectedTime.value = filteredTimes.value[0];
    };

    const getDayOfWeek = (date) => {
      return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    };

    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const dayOfWeek = getDayOfWeek(date);
      return `${yyyy}-${mm}-${dd} (${dayOfWeek})`;
    };

    const formatTime = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const period = hours < 12 ? "오전" : "오후";
      const formattedHours = hours % 12 || 12;
      return `${period} ${formattedHours}:${String(minutes).padStart(2, "0")}`;
    };

    const logout = async () => {
      try {
        await axios.post("/api/logout", {}, { withCredentials: true });
        alert("로그아웃 되었습니다.");
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        alert("로그아웃에 실패했습니다.");
      }
    };

    const updateAvailableSeats = async () => {
      try {
        const response = await axios.get(
          `/api/seats?date=${selectedDate.value}&time=${selectedTime.value}`,
          { withCredentials: true }
        );
        seats.value = response.data.seats.map((seat) => ({
          status: seat.status,
          name: seat.name,
        }));
        availableSeats.value = seats.value.filter(
          (seat) => seat.status === "available"
        ).length;
      } catch (error) {
        console.error("Seats status error:", error);
        alert("자리 상태를 가져오는 데 실패했습니다.");
      }
    };

    const reserveSeat = async () => {
      if (selectedSeat.value === null) {
        alert("자리를 선택해주세요.");
        return;
      }
      try {
        if (!confirm("이 자리로 예약 하시겠습니까?")) {
          return;
        }

        await axios.post(
          "/api/reserve",
          {
            date: selectedDate.value,
            time: selectedTime.value,
            seat: selectedSeat.value,
          },
          { withCredentials: true }
        );
        selectedSeatNumber.value = selectedSeat.value + 1;
        updateAvailableSeats();
        isPopupVisible.value = true;
        setTimeout(() => {
          router.push("/");
        }, 5000);
      } catch (error) {
        console.error("Reserve error:", error);
        alert("동일한 시간에 이미 예약이 있습니다.");
      }
    };

    const seatClass = (seat) => {
      if (seat.status === "reserved") {
        return "reserved-seat";
      } else if (selectedSeat.value === seat.index) {
        return "selected-seat";
      } else {
        return "";
      }
    };

    const filteredTimes = computed(() => {
      const now = new Date();
      const today = formatDate(now) === selectedDate.value;
      return times.filter((time) => {
        if (!today) return true;
        const [hours, minutes] = time.split(":").map(Number);
        const selectedDateTime = new Date();
        selectedDateTime.setHours(hours, minutes, 0, 0);
        return selectedDateTime > now;
      });
    });

    return {
      selectedDate,
      selectedTime,
      selectedSeat,
      availableSeats,
      seats,
      availableDates,
      isPopupVisible,
      selectedSeatNumber,
      filteredTimes,
      formatTime,
      logout,
      updateAvailableSeats,
      reserveSeat,
      seatClass,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.reservation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: "Roboto", sans-serif;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.logout-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #ff1a1a;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: auto;
}

.logout-button:hover {
  background-color: #e60000;
}

.reservation-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 800px;
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 10px;
}

.reservation-form .form-group {
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reservation-form label {
  margin-bottom: 5px;
  font-size: 18px;
  font-weight: bold;
}

.select-box {
  padding: 10px;
  font-size: 18px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.seat-info {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.seat-map {
  display: grid;
  grid-template-columns: repeat(5, 80px);
  grid-gap: 20px;
  margin-bottom: 20px;
}

.seat {
  position: relative;
  width: 80px;
  height: 80px;
}

.seat input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.seat label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #ccc;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  font-size: 14px;
  text-align: center;
}

.seat input[type="radio"]:checked + label {
  background-color: #00ff2a;
}

.reserved-seat label {
  background-color: #f0ad4e !important;
}

.selected-seat label {
  background-color: rgb(255, 255, 0) !important;
}

.last-row {
  display: grid;
  grid-template-columns: repeat(4, 80px);
  grid-gap: 20px;
  justify-content: center;
}

.reservation-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
}

.reserve-button {
  padding: 20px 40px;
  font-size: 20px;
  background-color: #6a1b9a;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reserve-button:hover {
  background-color: #4a148c;
}
</style>
