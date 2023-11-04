'use strict';

const pw_change_btn = document.querySelector("#pw_btn");

pw_change_btn.addEventListener("click", checkPassword);

function checkPassword() {
    const confirm_password = document.getElementsByName("old_password")[0].value;

    if (!confirm_password) {
        return alert("Please input password.");
    } else if (confirm_password.length > 100) {
        return alert("Password must be shorter than 101 characters.");
    }

    const req = {
        confirm_password: confirm_password,
    };

    fetch("/user/verifyPassword", {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: localStorage.getItem('access_token')
        },
        body: JSON.stringify(req)
    }).then((res) => res.json())
        .then((res) => {
            if (res.code === 200) {
                //일회성 토큰저장
                localStorage.setItem("one_time_access_token", res.data);
                location.href = "/user/newPassword"
            } else {
                alert(res.message);
                location.reload();
            }
        })

}