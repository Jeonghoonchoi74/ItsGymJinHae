<template>
  <div class="reservation-container">
    <div class="header">
      <button @click="goToMyPage" class="my-page">마이 페이지</button>
      <button @click="logout" class="logout-button">로그아웃</button>
    </div>
    <div class="reservation-form">
      <div class="form-group">
        <label for="date">날짜</label>
        <select id="date" v-model="selectedDate" @change="updateAvailableSeats">
          <option v-for="date in availableDates" :key="date" :value="date">
            {{ date }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="time">시간</label>
        <select id="time" v-model="selectedTime" @change="updateAvailableSeats">
          <option v-for="time in filteredTimes" :key="time" :value="time">
            {{ time }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <p></p>
        <label>남은 자리 수 {{ availableSeats }}/24</label>
      </div>
    </div>
    <div class="seat-map">
      <div
        v-for="(seat, index) in seats.slice(0, 20)"
        :key="index"
        class="seat"
        :class="seatClass(index)"
      >
        <input
          type="radio"
          :id="'seat-' + index"
          :value="index"
          v-model="selectedSeat"
          :disabled="seat === 'reserved'"
        />
        <label :for="'seat-' + index"></label>
      </div>
    </div>
    <div class="last-row">
      <div
        v-for="index in [20, 21, 22, 23]"
        :key="index"
        class="seat"
        :class="seatClass(index)"
      >
        <input
          type="radio"
          :id="'seat-' + index"
          :value="index"
          v-model="selectedSeat"
          :disabled="seats[index] === 'reserved'"
        />
        <label :for="'seat-' + index"></label>
      </div>
    </div>
    <div class="reservation-form">
      <button @click="reserveSeat">예약하기</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  name: "SeatReservation",
  setup() {
    const selectedDate = ref("");
    const selectedTime = ref("");
    const selectedSeat = ref(null);
    const availableSeats = ref(24);
    const seats = ref(new Array(24).fill("available"));
    const availableDates = ref([]);
    const router = useRouter();
    const times = ["10:00", "15:00", "17:00"];

    onMounted(() => {
      generateAvailableDates();
      updateAvailableSeats();
    });

    const generateAvailableDates = () => {
      const daysOfWeek = ["월", "화", "수", "목", "금"];
      const today = new Date();
      let isTodayAfterFive = false;

      if (today.getHours() >= 17) {
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
      selectedTime.value = filteredTimes.value[0]; // 디폴트 시간 설정
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

    const goToMyPage = () => {
      router.push("/mypage");
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
        seats.value = response.data.seats;
        availableSeats.value = seats.value.filter(
          (seat) => seat === "available"
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
        const reservationsResponse = await axios.get("/api/myReservations", {
          withCredentials: true,
        });
        if (!confirm("이 자리로 예약 하시겠습니까?")) {
          return;
        }
        if (reservationsResponse.data.reservations.length >= 5) {
          alert("최대 5번까지 예약할 수 있습니다.");
          return;
        }

        const response = await axios.post(
          "/api/reserve",
          {
            date: selectedDate.value,
            time: selectedTime.value,
            seat: selectedSeat.value,
          },
          { withCredentials: true }
        );
        alert(response.data.message);
        updateAvailableSeats();
      } catch (error) {
        console.error("Reserve error:", error);
        alert("예약에 실패했습니다.");
      }
    };

    const seatClass = (index) => {
      if (seats.value[index] === "reserved") {
        return "reserved-seat";
      } else if (selectedSeat.value === index) {
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
      filteredTimes,
      goToMyPage,
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
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
}

.header button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.my-page {
  background-color: #55f411;
  color: #000000;
}
.my-page:hover {
  background-color: #55f411;
}

.logout-button {
  background-color: #ff1a1a;
  color: #000000;
}

.logout-button:hover {
  background-color: #ff1a1a;
}

.reservation-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
}

.reservation-form .form-group {
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}

.reservation-form label {
  margin-bottom: 5px;
}

.reservation-form select {
  padding: 5px;
}

.reservation-form span {
  margin-top: 30px;
}

.reservation-form button {
  padding: 10px 20px;
  margin-top: 20%;
  background-color: #6a1b9a;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reservation-form button:hover {
  background-color: #4a148c;
}

.seat-map {
  display: grid;
  grid-template-columns: repeat(5, 40px);
  grid-gap: 10px;
  margin-bottom: 10px;
}

.seat {
  position: relative;
  width: 40px;
  height: 40px;
}

.seat input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.seat label {
  display: block;
  width: 100%;
  height: 100%;
  background-color: #ccc;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.seat input[type="radio"]:checked + label {
  background-color: #00ff2a;
}

.reserved-seat label {
  background-color: rgb(255, 0, 0) !important;
}

.selected-seat label {
  background-color: rgb(255, 255, 0) !important;
}

.last-row {
  display: grid;
  grid-template-columns: repeat(4, 40px);
  grid-gap: 10px;
  justify-content: center;
}
</style>
