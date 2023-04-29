const { ipcRenderer } = require("electron");

let first_name_inp = document.querySelector("form input[name='first-name']"),
last_name_inp = document.querySelector("form input[name='last-name']"),
cnic_inp = document.querySelector("form input[name='cnic']"),
username_inp = document.querySelector("form input[name='username']"),
new_password_inp = document.querySelector("form input[name='new-password']"),
confirm_password_inp = document.querySelector("form input[name='confirm-password']");


cnic_inp.addEventListener("input", (e) => {
    let old_text=cnic_inp.value;
    let new_text="";
    for(i of old_text){
        if(i>='0' && i<='9'){
            new_text+=i;
        }
    }
    cnic_inp.value=new_text;
});


document.querySelector("form button[type='submit']").addEventListener("click", (e) => {
    if(!first_name_inp.value || !last_name_inp.value || !cnic_inp.value || !username_inp.value || !new_password_inp.value || !confirm_password_inp.value)
        return;

    ipcRenderer.send("navigate", "/html/index.html", "navigate-error");
    ipcRenderer.on("navigate-error", (event, error) => {

    });
    //backend goes here...

});