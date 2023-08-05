const email = document.querySelector("#email");
const button = document.querySelector("#button");

button.addEventListener("click", Resetpw);

function Resetpw() {
    if (!email.value) return alert("Please input email.");

    const req = {
        email: email.value,
    }

    fetch("/user/resetpw", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req)
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.code === 200) {
                location.href = "/";
            } else return alert(res.message);
        })
}