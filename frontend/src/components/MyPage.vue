<template>
  <div class="mypage-container">
    <h1>마이 페이지</h1>
    <div v-if="reservations.length">
      <h2>예약현황</h2>
      <ul>
        <li v-for="(reservation, index) in reservations" :key="index">
          <div class="reservation-details">
            <p><strong>날짜:</strong> {{ formatDate(reservation.date) }}</p>
            <p><strong>시간:</strong> {{ reservation.time }}</p>
            <p><strong>자리 번호:</strong> {{ reservation.seat + 1 }}</p>
            <button @click="cancelReservation(reservation)">예약취소</button>
          </div>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>예약된 정보가 없습니다.</p>
    </div>
    <button @click="goToReservation" class="reservation-button">
      자리 예약
    </button>
    <button @click="deleteAccount" class="delete-button">회원 탈퇴</button>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  name: "MyPage",
  setup() {
    const reservations = ref([]);
    const router = useRouter();

    const fetchReservations = async () => {
      try {
        const response = await axios.get("/api/myReservations", {
          withCredentials: true,
        });
        const currentDateTime = new Date();
        reservations.value = response.data.reservations.filter(
          (reservation) => {
            const reservationDateTime = new Date(
              `${reservation.date}T${reservation.time}`
            );
            if (reservationDateTime < currentDateTime) {
              cancelPastReservation(reservation); // 과거 예약건 삭제
              return false;
            }
            return true;
          }
        );
      } catch (error) {
        console.error("My reservations error:", error);
        alert("예약 정보를 가져오는데 실패했습니다.");
      }
    };

    onMounted(fetchReservations);

    const goToReservation = () => {
      router.push("/reservations");
    };

    const cancelReservation = async (reservation) => {
      if (!confirm("정말로 이 예약을 취소하시겠습니까?")) {
        return;
      }
      try {
        await axios.post(
          "/api/cancelReservation",
          {
            date: reservation.date,
            time: reservation.time,
            seat: reservation.seat,
          },
          { withCredentials: true }
        );
        alert("예약이 취소되었습니다.");
        reservations.value = reservations.value.filter(
          (r) => r !== reservation
        );
      } catch (error) {
        console.error("Cancel reservation error:", error);
        alert("예약 취소에 실패했습니다.");
      }
    };

    const cancelPastReservation = async (reservation) => {
      try {
        await axios.post(
          "/api/cancelReservation",
          {
            date: reservation.date,
            time: reservation.time,
            seat: reservation.seat,
          },
          { withCredentials: true }
        );
        alert("시간이 지나서 예약 내역이 삭제되었습니다.");
        reservations.value = reservations.value.filter(
          (r) => r !== reservation
        );
      } catch (error) {
        console.error("Cancel reservation error:", error);
        alert("예약 취소에 실패했습니다.");
      }
    };

    const deleteAccount = async () => {
      try {
        await axios.post("/api/deleteAccount", {}, { withCredentials: true });
        alert("회원 탈퇴가 완료되었습니다.");
        router.push("/register");
      } catch (error) {
        console.error("Delete account error:", error);
        alert("회원 탈퇴에 실패했습니다.");
      }
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString("ko-KR", options);
    };

    return {
      reservations,
      goToReservation,
      cancelReservation,
      deleteAccount,
      formatDate,
    };
  },
};
</script>

<style scoped>
.mypage-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: "Roboto", sans-serif;
  background-color: #f0f0f0; /* 밝은 회색 배경 */
}

h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
}

h2 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #666;
  font-weight: 400;
}

ul {
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 400px;
}

li {
  background: #fff;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.reservation-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

button {
  padding: 10px 20px;
  margin-top: 10px;
  background-color: #6a1b9a; /* 헬스장 분위기를 위한 강렬한 색상 */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #4a148c;
}

.reservation-button {
  background-color: #6a1b9a;
}

.reservation-button:hover {
  background-color: #4a148c;
}

.delete-button {
  background-color: #ff4d4d; /* 강렬한 빨간색 */
  margin-top: 20px;
}

.delete-button:hover {
  background-color: #ff1a1a;
}
</style>
