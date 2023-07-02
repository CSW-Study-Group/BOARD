'use strict';

const pw_change_btn = document.querySelector("#pw_change_btn");

pw_change_btn.addEventListener("click", passwordPatch);

function passwordPatch() {
    const confirm_password = document.getElementsByName("old_password")[0].value;
    const new_password = document.getElementsByName("new_password")[0].value;
    const new_password_confirm = document.getElementsByName("new_password_confirm")[0].value;

    if (!(confirm_password && new_password && new_password_confirm)) {
        return alert("Please input password.");
    } else if (new_password !== new_password_confirm) {
        return alert("coffirm password does not match.");
    } else if (new_password.length < 3 || new_password.length > 100) {
        return alert("Password must be longer than 2 characters & shorter than 101 characters.");
    }

    const req = {
        confirm_password: confirm_password,
        new_password: new_password,
    };

    fetch("/user/profile/change_password", {
        method: 'PATCH',
        headers: {
            'content-type': 'application/json',
            authorization: localStorage.getItem('access_token')
        },
        body: JSON.stringify(req)
    }).then((res) => res.json())
        .then((res) => {
            if (res.code === 200) {
                console.log(res);
                location.href = "/"
            } else if (res.code === 422 || res.code === 400) {
                alert(res.message);
                location.reload();
            }
        })

}