'use strict';

const update_btn = document.querySelector("#update_btn");
const attend_btn = document.querySelector("#attend_btn");
const fieldset = document.querySelector('fieldset');
const form_show = document.getElementById('show');

update_btn.addEventListener("click", updateProfile);

function updateProfile() {
    const is_disabled = fieldset.getAttribute('disabled') !== null;

    const emailRegex = /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/; // 계정@도메인.최상위도메인

    const user_name = document.getElementsByName("username")[0].value;
    const email = document.getElementsByName("email")[0].value;

    if(!user_name) return alert("Please input username.");
    else if(user_name.length < 3 || user_name.length > 30) return alert("Username must be longer than 2 characters & shorter than 31 characters.");

    if(!email) return alert("Please input email.");
    else if(email.length > 30) return alert("Email must be shorter than 31 characters.");
    else if(!emailRegex.test(email)) return alert("Email must be in the correct format.");

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
                localStorage.setItem('profileData', JSON.stringify({ email: res.data.email, profile: res.data.profile, user_name: res.data.user_name }));

                img.src = res.data.profile;
                $('input[name=username]').val(res.data.user_name);
                $('input[name=email]').val(res.data.email);
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