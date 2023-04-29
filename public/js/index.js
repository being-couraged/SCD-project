let username_inp = document.querySelector("form input[name='username']"),
password_inp = document.querySelector("form input[name='password']"),
remember_me_inp = document.querySelector("form input[name='remember-me']");


let old_username = localStorage.getItem("username");
if(old_username){
    remember_me_inp.checked=true;
    username_inp.value=old_username;
}



// document.querySelector("form button[type='submit']").addEventListener("click", (e) => {
//     if(!username_inp.value || !password_inp.value)
//         return;
     
//     if(remember_me_inp.checked){
//         localStorage.setItem("username", username_inp.value);
//     }else{
//         localStorage.setItem("username", "");
//     }

//     console.log("Login Success");
// });