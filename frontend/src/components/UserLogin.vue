<template>
  <div class="login-container">
    <div class="login-box">
      <h1>잇츠짐</h1>
      <h2>로그인</h2>
      <form @submit.prevent="login">
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
              type="tel"
            />
          </div>
        </div>
        <button type="submit" class="login-button">로그인</button>
      </form>
      <button @click="goToRegister" class="register-button">회원가입</button>
      <a
        href="https://github.com/Jeonghoonchoi74"
        target="_blank"
        class="github-link"
      >
        <img
          src="https://img.shields.io/badge/github-181717?style=flat&logo=github&logoColor=white"
          alt="GitHub"
          class="github-icon"
        />
      </a>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  name: "UserLogin",
  setup() {
    const name = ref("");
    const phoneNumber = ref("");
    const router = useRouter();

    const handlePhoneNumberInput = (event) => {
      let formattedPhoneNumber = event.target.value.replace(/\D/g, "");
      phoneNumber.value = formattedPhoneNumber;
    };

    const login = async () => {
      try {
        const response = await axios.post("/api/login", {
          name: name.value,
          phoneNumber: phoneNumber.value,
        });
        alert(response.data.message);
        router.push(response.data.redirect);
      } catch (error) {
        console.error("Login error:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          alert(error.response.data.error);
        } else {
          alert("로그인에 실패했습니다.");
        }
      }
    };

    const goToRegister = () => {
      router.push("/register");
    };

    return {
      name,
      phoneNumber,
      login,
      goToRegister,
      handlePhoneNumberInput,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
  font-family: "Roboto", sans-serif;
}

.login-box {
  position: relative;
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.github-link {
  position: absolute;
  bottom: 10px;
  left: 10px;
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
  pointer-events: none;
}

input {
  width: 100%;
  padding: 10px 10px 10px 40px;
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

.login-button {
  width: 100%;
  padding: 15px;
  background-color: #6a1b9a;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #4a148c;
}

.register-button {
  width: 100%;
  padding: 15px;
  margin-top: 10px;
  background-color: #28a745;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-button:hover {
  background-color: #218838;
}
</style>
