'use strict';

attend_btn.addEventListener("click", attendCheck);

function attendCheck() {
    fetch("/user/attendance", {
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