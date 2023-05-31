const user_name = document.querySelector("#username");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const register = document.querySelector("#button");

register.addEventListener("click", Register);

function Register() {
  const emailRegex = /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/; // 계정@도메인.최상위도메인

  const inputFormInit = () => {
    user_name.value = "";
    email.value = "";
    password.value = "";
  };

  if (!user_name.value) return alert("Please input username.");
  else if (user_name.value.length < 3 || user_name.value.length > 30) {
    inputFormInit();
    return alert("Username must be longer than 2 characters & shorter than 31 characters.");
  }

  if (!email.value) return alert("Please input email.");
  else if (!emailRegex.test(email.value)) {
    inputFormInit();
    return alert("Email must be in the correct format.");
  }
  else if (email.value.length > 30) {
    inputFormInit();
    return alert("Email must be shorter than 31 characters.");
  }

  if (!password.value) return alert("Please input password.");
  else if (password.value.length < 3 || password.value.length > 100) {
    inputFormInit();
    return alert("Password must be longer than 2 characters & shorter than 101 characters.");
  }

  const req = {
    user_name: user_name.value,
    email: email.value,
    password: password.value,
  };

  fetch("/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.code === 200) {
        location.href = "/user/login";
      } else return alert(res.message);
    });
}
