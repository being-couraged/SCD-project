const {ipcRenderer} = require("electron");

let number_inp = document.querySelector("form input[name='number']"),
password_inp = document.querySelector("form input[name='password']"),
remember_me_inp = document.querySelector("form input[name='remember-me']");




const show_toast = (message='', error=false) => {
    if(message){
        let toast_elem = document.querySelector(".toast");
        toast_elem.querySelector("p").innerHTML=message;
        if(error){
            toast_elem.classList.add("error");
        }else{
            toast_elem.classList.remove("error");
        }
        toast_elem.style.display="flex";
        setTimeout(() => {
            toast_elem.style.display="none";
        }, 5000);
    }
}
const show_loader = () => {
    let loader_elem=document.querySelector(".loader");
    loader_elem.style.display="flex";
}
const hide_loader = () => {
    let loader_elem=document.querySelector(".loader");
    loader_elem.style.display="none";
}





let old_number = localStorage.getItem("number");
if(old_number){
    remember_me_inp.checked=true;
    number_inp.value=old_number;
    password_inp.focus();
}


document.querySelector("form input[name='number']").addEventListener("input", (e) => {
    let old_val=e.target.value;
    let new_val = "";
    for(i of old_val){
        if(i>='0' && i<='9')
            new_val+=i;
    }
    e.target.value=new_val;
});


document.querySelector("form button[type='submit']").addEventListener("click", (e) => {
    if(!number_inp.value || !password_inp.value)
        return;
     
    if(remember_me_inp.checked){
        localStorage.setItem("number", number_inp.value);
    }else{
        localStorage.setItem("number", "");
    }

    show_loader();
    ipcRenderer.send("login", {number: number_inp.value, password: password_inp.value});
    ipcRenderer.once("login-result", (event, error) => {
        show_toast(error, true);
        hide_loader();
    });
});