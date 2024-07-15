<template>
  <div class="admin-page-container">
    <h1>관리자 페이지</h1>
    <button @click="logout" class="logout-button">로그아웃</button>
    <div class="controls">
      <label for="date">날짜</label>
      <select id="date" v-model="selectedDate" @change="fetchReservations">
        <option v-for="date in availableDates" :key="date" :value="date">
          {{ date }}
        </option>
      </select>
      <button @click="refreshData" class="refresh-button">새로고침</button>
    </div>
    <div v-if="Object.keys(reservations).length" class="reservation-list">
      <h2>예약된 회원 목록</h2>
      <div v-for="(reservationList, time) in reservations" :key="time">
        <h3>{{ time }}</h3>
        <ul>
          <li v-for="(reservation, index) in reservationList" :key="index">
            이름: {{ reservation.name }} <br />
            전화번호:
            {{ reservation.phoneNumber }}
            <button
              @click="
                cancelReservation(
                  reservation.phoneNumber,
                  reservation.date,
                  reservation.time,
                  reservation.seat
                )
              "
            >
              예약 강제 취소
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <p>예약된 회원이 없습니다.</p>
    </div>
    <div class="member-list">
      <h2>회원 목록</h2>
      <ul>
        <li v-for="(member, index) in members" :key="index">
          이름: {{ member.name }} <br />
          전화번호: {{ member.phoneNumber }}
          <button @click="deleteUser(member.phoneNumber)">회원 삭제</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  name: "AdminPage",
  setup() {
    const selectedDate = ref("");
    const reservations = ref({});
    const availableDates = ref([]);
    const members = ref([]);

    onMounted(() => {
      generateAvailableDates();
      autoSelectDate();
      fetchMembers();
      fetchReservations();
    });

    const generateAvailableDates = () => {
      const daysOfWeek = ["월", "화", "수", "목", "금"];
      const today = new Date();

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        if (daysOfWeek.includes(getDayOfWeek(date))) {
          availableDates.value.push(formatDate(date));
        }
      }
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

    const autoSelectDate = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const firstAvailableDate = availableDates.value[0];

      if (currentHour >= 17) {
        const nextAvailableDate = availableDates.value.find(
          (date) => date !== firstAvailableDate
        );
        selectedDate.value = nextAvailableDate || firstAvailableDate;
      } else {
        selectedDate.value = firstAvailableDate;
      }
    };

    const fetchReservations = async () => {
      try {
        const response = await axios.get(
          `/api/admin/reservations?date=${selectedDate.value}`
        );
        reservations.value = response.data.reservations;
      } catch (error) {
        console.error("Fetch reservations error:", error);
        alert("예약 정보를 가져오는데 실패했습니다.");
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await axios.get("/api/admin/members");
        members.value = response.data.members;
      } catch (error) {
        console.error("Fetch members error:", error);
        alert("회원 목록을 가져오는데 실패했습니다.");
      }
    };

    const deleteUser = async (phoneNumber) => {
      if (!confirm("정말로 이 회원을 삭제하시겠습니까?")) {
        return;
      }
      try {
        await axios.delete("/api/admin/user", {
          data: { phoneNumber },
        });
        alert("회원이 삭제되었습니다.");
        fetchMembers();
      } catch (error) {
        console.error("Delete user error:", error);
        alert("회원 삭제에 실패했습니다.");
      }
    };

    const cancelReservation = async (phoneNumber, date, time, seat) => {
      if (!confirm("정말로 이 예약을 취소하시겠습니까?")) {
        return;
      }
      try {
        await axios.post("/api/admin/cancelReservation", {
          phoneNumber,
          date,
          time,
          seat,
        });
        alert("예약이 강제 취소되었습니다.");
        fetchReservations();
      } catch (error) {
        console.error("Cancel reservation error:", error);
        alert("예약 강제 취소에 실패했습니다.");
      }
    };

    const logout = async () => {
      try {
        await axios.post("/api/logout", {}, { withCredentials: true });
        alert("로그아웃 되었습니다.");
        location.href = "/";
      } catch (error) {
        console.error("Logout error:", error);
        alert("로그아웃에 실패했습니다.");
      }
    };

    const refreshData = () => {
      fetchMembers();
      fetchReservations();
    };

    return {
      selectedDate,
      reservations,
      availableDates,
      members,
      fetchReservations,
      fetchMembers,
      deleteUser,
      cancelReservation,
      logout,
      refreshData,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

.admin-page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: "Roboto", sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
}

.controls label {
  margin-right: 10px;
  font-size: 16px;
  font-weight: 500;
}

.controls select {
  margin-right: 20px;
  padding: 5px;
  font-size: 14px;
}

.refresh-button {
  padding: 5px 10px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.refresh-button:hover {
  background-color: #45a049;
}

.reservation-list,
.member-list {
  width: 100%;
  margin-right: 0px;
  max-width: 600px;
}

.reservation-list ul,
.member-list ul {
  list-style: none;
  padding: 0;
}

.reservation-list li,
.member-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f0f0;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.reservation-list button,
.member-list button {
  padding: 10px 10px;
  background-color: #ff4d4d;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reservation-list button:hover,
.member-list button:hover {
  background-color: #ff1a1a;
}
</style>
