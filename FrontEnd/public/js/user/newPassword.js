'use strict';

const pw_change_btn = document.querySelector("#pw_change_btn");

pw_change_btn.addEventListener("click", newPassword);

function newPassword() {
    const new_password = document.getElementsByName("new_password")[0].value;
    const new_password_confirm = document.getElementsByName("new_password_confirm")[0].value;

    if (!(new_password && new_password_confirm)) {
        return alert("Please input password.");
    } else if (new_password !== new_password_confirm) {
        return alert("confirm password does not match.");
    } else if (new_password.length < 3 || new_password.length > 100) {
        return alert("Password must be longer than 2 characters & shorter than 101 characters.");
    }

    const req = {
        new_password: new_password,
    };

    fetch("/user/newPassword", {
        method: 'PATCH',
        headers: {
            'content-type': 'application/json',
            authorization: localStorage.getItem('one_time_access_token')
        },
        body: JSON.stringify(req)
    }).then((res) => res.json())
        .then((res) => {
            if (res.code === 200) {
                location.href = "/"
            } else if (res.code === 500) {
                alert(res.message);
                location.reload();
            } else { //403 or 404
                alert(res.message);
                alert("please try again.");
                location.href = "/"
            }
        })

}