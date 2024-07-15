<template>
  <div class="register-container">
    <div class="register-box">
      <h1>잇츠짐</h1>
      <h2>회원가입</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="name">이름</label>
          <div class="input-container">
            <i class="fas fa-user"></i>
            <input v-model="name" id="name" placeholder="이름" required />
          </div>
        </div>
        <div class="form-group">
          <label for="phoneNumber">전화번호</label>
          <div class="input-container">
            <i class="fas fa-phone"></i>
            <input
              v-model="phoneNumber"
              id="phoneNumber"
              placeholder="전화번호"
              maxlength="11"
              required
              @input="handlePhoneNumberInput"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="confirmPhoneNumber">전화번호 확인</label>
          <div class="input-container">
            <i class="fas fa-phone"></i>
            <input
              v-model="confirmPhoneNumber"
              id="confirmPhoneNumber"
              placeholder="전화번호 확인"
              maxlength="11"
              required
              @input="handlePhoneNumberInput"
            />
          </div>
        </div>
        <button type="submit" class="register-button">회원가입</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  name: "UserRegister",
  setup() {
    const name = ref("");
    const phoneNumber = ref("");
    const confirmPhoneNumber = ref("");
    const router = useRouter();

    const handlePhoneNumberInput = (event) => {
      // 정규식을 이용하여 숫자만 허용하도록 처리
      let formattedPhoneNumber = event.target.value.replace(/\D/g, "");
      // 필요에 따라 전화번호를 특정 형식으로 포맷팅할 수도 있음
      if (event.target.id === "phoneNumber") {
        phoneNumber.value = formattedPhoneNumber;
      } else {
        confirmPhoneNumber.value = formattedPhoneNumber;
      }
    };

    const register = async () => {
      if (phoneNumber.value !== confirmPhoneNumber.value) {
        alert("전화번호가 일치하지 않습니다.");
        return;
      }

      try {
        const response = await axios.post("/api/register", {
          name: name.value,
          phoneNumber: phoneNumber.value,
        });
        alert(response.data.message);
        router.push("/"); // 회원가입 성공 후 로그인 페이지로 이동
      } catch (error) {
        console.error("Register error:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          alert(`${error.response.data.error}`);
        } else {
          alert("회원가입에 실패했습니다.");
        }
      }
    };

    return {
      name,
      phoneNumber,
      confirmPhoneNumber,
      register,
      handlePhoneNumberInput,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0; /* 밝은 회색 배경 */
  font-family: "Roboto", sans-serif;
}

.register-box {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 700;
}

h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #666;
  font-weight: 400;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.input-container {
  position: relative;
}

.input-container i {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: #aaa;
  pointer-events: none; /* 아이콘 클릭 방지 */
}

input {
  width: 100%;
  padding: 10px 10px 10px 40px; /* Adjusted padding to avoid overlap with icon */
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #f9f9f9;
  color: #333;
}

input::placeholder {
  color: #aaa;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

input[type="checkbox"] {
  margin-right: 5px;
}

.register-button {
  width: 100%;
  padding: 15px;
  background-color: #6a1b9a; /* 헬스장 분위기를 위한 강렬한 색상 */
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-button:hover {
  background-color: #4a148c;
}
</style>
