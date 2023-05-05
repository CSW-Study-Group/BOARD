'use strict';

const update_btn = document.querySelector("#update_btn");
const attend_btn = document.querySelector("#attend_btn");
const fieldset = document.querySelector('fieldset');
const form_show = document.getElementById('show');

update_btn.addEventListener("click", updateProfile);
attend_btn.addEventListener("click", attendCheck);

function updateProfile() {
    const is_disabled = fieldset.getAttribute('disabled') !== null;

    const user_name = document.getElementsByName("username")[0].value;
    const email = document.getElementsByName("email")[0].value;

    if(!user_name) return alert("Please input username.");
    if(!email) return alert("Please input email.");

    if(is_disabled === true) {
        form_show.style.display = "block";
        update_btn.innerText = "편집 완료";
        fieldset.disabled = false;
    } else {
        let form_data = new FormData();

        form_data.append("image", document.getElementsByName("input")[0].files[0]);
        form_data.append('user_name', user_name);
        form_data.append('email', email);

        fetch("/user/profile", {
            method: "PATCH",
            headers:{
                'authorization': localStorage.getItem('access_token')
            },
            body: form_data
        })
        .then((res) => res.json())
        .then((res) => {
            if(res.code === 200) {
                alert(res.message);
                img.src = res.data.profile;
                $('input[name=username]').val(res.data.user_name);
                $('input[name=email]').val(res.data.email);
            } else if (res.code === 400) {
                alert(res.message);
                location.reload();
            } else {
                alert(res.message);
                location.reload();
            }
        })

        form_show.style.display = "none";
        update_btn.innerText = "프로필 편집";
        fieldset.disabled = true;
    }
}

function attendCheck() {
    fetch("/user/attend", {
        method: "POST",
        headers:{
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('access_token')
        },
    })
    .then((res) => res.json())
    .then((res) => {
        if(res.code === 200) {
            location.href = "/";
        } else if(res.code === 419){ // Access Token has expired.
            fetch("/user/token/refresh", {
                    headers: { 'authorization': localStorage.getItem('refresh_token') }
                })
                .then((res) => res.json())
                .then((res) => {
                    if(res.code === 419) {
                        alert(res.message);
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = "/user/login";
                    } else {
                        alert(res.message);
                        localStorage.setItem('access_token', res.access_token);
                    }
                })
        } else { // 401 or 500
            alert(res.message);
            location.href = "/";
        }
    })
    .catch((err) => {
        alert('An error occurred while processing your request. Please try again later.');
    });
}