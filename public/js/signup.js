const { ipcRenderer } = require("electron");

let first_name_inp = document.querySelector("form input[name='first-name']"),
last_name_inp = document.querySelector("form input[name='last-name']"),
email_inp = document.querySelector("form input[name='email']"),
number_inp = document.querySelector("form input[name='number']"),
new_password_inp = document.querySelector("form input[name='new-password']"),
confirm_password_inp = document.querySelector("form input[name='confirm-password']");





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
    if(!first_name_inp.value || !last_name_inp.value || !email_inp.value || !number_inp.value || !new_password_inp.value || !confirm_password_inp.value)
        return;

    if(new_password_inp.value!==confirm_password_inp.value){
        show_toast("New and confirm password not matched", true);
        return;
    }

    show_loader();

    let obj = {
        first_name: first_name_inp.value,
        last_name: last_name_inp.value,
        email: email_inp.value,
        number: number_inp.value,
        password: new_password_inp.value,
        status: "offline",
        dp: "",
        rooms: ""
    };

    ipcRenderer.send("signup", obj);
    ipcRenderer.once("signup-result", (event, error) => {
        show_toast(error, true);
        if(error.includes("Number"))
            number_inp.focus();
        hide_loader();
    });
});