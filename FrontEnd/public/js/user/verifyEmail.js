const email = document.querySelector("#email");
const email_button = document.querySelector("#email_button");
const verifycode = document.querySelector("#verifycode");
const submit_button = document.querySelector("#submit_button");

email_button.addEventListener("click", sendEmail);
submit_button.addEventListener("click", checkCode);

const Timer = document.getElementById("timer"); //타이머
let time = 300000;
let min = 5;
let sec = 60;

Timer.value = 'left time: ' + min + ':' + '00';

function timer() {
    playtime = setInterval(() => {
        time = time - 1000;
        min = time / (60 * 1000);
        if (sec > 0) {
            sec = sec - 1;
            Timer.value = 'left time: ' + Math.floor(min) + ':' + sec;
        }
        if (sec === 0) {
            sec = 60;
            Timer.value = 'left time: ' + Math.floor(min) + ':' + '00';
        }
    }, 1000);
};


function sendEmail() {
    if (!email.value) return alert("Please input email.");

    const req = {
        email: email.value,
    }

    if (Timer.value !== '') {
        Timer.value = '';
        time = 300000;
        min = 5;
        sec = 60;
    }

    fetch("/user/sendEmail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req)
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.code === 200) {
                console.log('res good');
                email_button.innerText = "resend";
                document.getElementById("verify").style.display = "block";
                timer();
                setTimeout(() => {
                    clearInterval(playtime);
                    Timer.value = "code expired. please resend"
                }, 300000);
            } else return alert(res.message);
        })
};

function checkCode() {
    if (!verifycode.value) return alert("Please enter code.");

    const req = {
        email: email.value,
        verifycode: verifycode.value,
    }
    console.log(req);

    fetch("/user/verifyEmail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req)
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.code === 200) {
                //일회성 토큰저장
                localStorage.setItem("one_time_access_token", res.data);
                //리다이렉트
                location.href = "/user/newPassword";
            } else return alert(res.message);
        })
};
