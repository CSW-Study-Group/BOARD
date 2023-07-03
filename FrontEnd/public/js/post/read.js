'use strict';

const recommend_btn = document.getElementById('recommend_btn');
const recommend_count = document.getElementById('recommend_count');
const create_comment_btn = document.getElementById('create_comment_btn');
const comment_body = document.querySelector("[name='comment_body']");

const url_str = window.location.href;
const words = url_str.split('/');
const content_id = words[4].split('?')[0] || words[4];

window.onload = function checkAuthorization() { // Always execute this function when page loaded.
    fetch(`/board/${content_id}/auth`, {
        headers: {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('access_token')
        }
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.code === 200 && res.message === 'authorized') {
                $('div[name="method_div"]').append(owner);
            } else if (res.code === 401 && res.message === 'unauthorized') {
                $('div[name="method_div"]').append();
            } else if (res.code === 419) { // Access Token has expired.
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
                            window.location.reload();
                        }
                    })
            }
        })
        .catch((err) => {
            alert('An error occurred while processing your request. Please try again later.');
        });
}

window.addEventListener('load', function() {
    fetch(`/board/${content_id}/recommand`, {
        headers: {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('access_token')
        }
    })
        .then((res) => res.json())
        .then((res) => {
            if(res.code == 200) {
                if (res.message === "created") {
                    recommend_btn.className = "btn btn-danger"
                    recommend_btn.textContent = "추천취소"
                } else if(res.message === "deleted") {
                    recommend_btn.className = "btn btn-success"
                    recommend_btn.textContent = "추천하기"
                }
            }
        })
        .catch((err) => {
            alert('An error occurred while processing your request. Please try again later.');
        });
});

function delete_click() {
    if (confirm("Are you sure want to delete this post?")) {
        fetch(`/board/${content_id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('access_token')
            },
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.code === 200) {
                    alert("Delete post success.");
                    location.href = "/board";
                } else if (res.code === 419) {
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
                                window.location.reload();
                            }
                        })
                } else { // 401 or 500
                    alert(res.message);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    location.href = "/user/login";
                }
            })
            .catch((err) => {
                alert('An error occurred while processing your request. Please try again later.');
            });
    } else { alert("Delete post cancle."); }
}

function recommand_click() {
    if(!localStorage.getItem('access_token')) {
        alert('Please login first.');
        location.href = "/user/login";
    } else {
        fetch(`/board/${content_id}/recommand`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('access_token')
            }
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.code === 200 && res.message === "create") {
                    alert("Recommand success.");
                    location.herf = `/board/${content_id}<%= getPostQueryString() %>`
                    recommend_btn.className = "btn btn-danger"
                    recommend_btn.textContent = "추천취소"
                    recommend_count.textContent = res.data.recommand;
                } else if (res.code === 200 && res.message === "delete") {
                    alert("Recommand cancle success.");
                    location.herf = `/board/${content_id}<%= getPostQueryString() %>`
                    recommend_btn.className = "btn btn-success"
                    recommend_btn.textContent = "추천하기"
                    recommend_count.textContent = res.data.recommand;
                } else if (res.code === 419) {
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
                                window.location.reload();
                            }
                        })
                } else { // 401 or 500
                    alert(res.message);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    location.href = "/user/login";
                }
            })
            .catch((err) => {
                alert('An error occurred while processing your request. Please try again later.');
            });
    }
}

function create_comment_post() {
    if(!localStorage.getItem('access_token')) {
        alert('Please login first.');
        location.href = "/user/login";
    }
    if(!comment_body.value) return alert("Please input comment.");
    let new_comment = comment_body.value;

    fetch(`/board/${content_id}/comment`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('access_token')
        },
        body: JSON.stringify({ comment: new_comment })
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.code === 201) {
                alert("Create comment success.");
                location.herf = `/board/${content_id}`
                location.reload();
            } else if (res.code === 419) {
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
                            window.location.reload();
                        }
                    })
            } else { // 401 or 500
                alert(res.message);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                location.href = "/user/login";
            }
        })
        .catch((err) => {
            alert('An error occurred while processing your request. Please try again later.');
        });

}

// 댓글 더보기. 댓글 개수를 가져와서 불러올 페이지를 계산하여 추가 댓글을 가져온다. 댓글은 5개 단위이다.
function more_comment_post() {

    // class이름이 comment 인 요소들의 개수를 가져온다
    let comment_count = document.getElementsByClassName("comment").length;
    let comment_page = Math.ceil(comment_count / 5) + 1;

    fetch(`/board/${content_id}/comment/${comment_page}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('access_token')
        }
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.code === 200) {
                let comments = res.data;
                // comments.more이 false 면 클래스가 more인 요소 숨김
                if (!comments.more) {
                    // 클래스가 more인 요소를 가져온다
                    let more_btn = document.getElementsByClassName("more")[0];
                    more_btn.style.display = "none";
                }

                let comment_list = comments.rows;
                // 가져온 comments를 순회하며 댓글을 추가한다.
                comment_list.forEach((comment) => {
                    let comment_div = document.createElement("div");
                    let create_at = new Date(comment.created_at);
                    create_at.setHours(create_at.getHours() + 9);
                    comment_div.innerHTML = `
                    <div class="card comment">
                        <div>
                            <img src="${ comment.User.profile }" class="rounded-circle" alt="..." width=25 height=25>
                            <span class="name">${ comment.User.user_name }</span>
                            <button class="btn btn-secondary delete" type="button" onclick="delete_comment_post(${ comment.id })">✖</button>
                            <span class="date">
                                ${ create_at.toISOString().replace('T', ' ').substring(0, 19) }
                            </span>
                        </div>
                        <div class="body">${comment.comment}</div>
                    </div>`

                    // 클래스가 comment 인 마지막 요소 뒤에 추가한다
                    let comment_list = document.getElementsByClassName("comment");
                    comment_list[comment_list.length - 1].after(comment_div);

                });
            } else if (res.code === 401) {
                alert('If you want to see more comments, please login first.');
                location.href = "/user/login";
            }
        })
        .catch((err) => {
            alert('An error occurred while processing your request. Please try again later.');
        });
    }

function delete_comment_post(comment_id) {
    fetch(`/board/${content_id}/comment/${comment_id}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('access_token')
        }
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.code === 200) {
                alert("Delete comment success.");
                location.herf = `/board/${content_id}`
                location.reload();
            } else if (res.code === 419) {
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
                            window.location.reload();
                        }
                    })
            } else { // 401 or 500
                if(res.message === "unauthorized") {
                    alert("Only the author of the comment can delete it.");
                } else {
                    alert(res.message);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    location.href = "/user/login";
                }
            }
        })
        .catch((err) => {
            alert('An error occurred while processing your request. Please try again later.');
        });
}
