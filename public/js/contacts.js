const { ipcRenderer } = require("electron");
let profile=null;
let all_users=[];







const seperate_data = (data) => {
    all_users=[];
    for(i of Object.keys(data)){
        if(data[i].number === profile.number)
            continue;
        all_users.push(data[i]);
    }
    update_profile();
    populate_users();
}
const logout = () => {
    show_loader();
    ipcRenderer.send("logout", true);
    ipcRenderer.on("logout-result", (event, res) => {
        hide_loader();
        show_toast(res, true);
    });
}
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
const update_profile = () => {
    let profile_elem = document.querySelector(".profile .left");
    profile_elem.innerHTML=`<img src="../res/user.png" alt="...">
                            <p class="name">${profile.first_name+" "+profile.last_name}</p>`;
}
const open_contact = (number) => {
    show_loader();
    let reciever_profile=null;
    for(i of all_users){
        if(i.number===number){
            reciever_profile=i;
            break;
        }
    }
    if(reciever_profile){
        localStorage.setItem("reciever_profile", JSON.stringify(reciever_profile));
        window.location.replace("../html/chat-page.html");
    }
}
const show_dialog = (dialog_class) => {
    let dialog = document.querySelector(`.dialog .${dialog_class}`);
    dialog.querySelectorAll("input").forEach((elem) => {
        elem.value="";
    });
    dialog.style.display="flex";
    dialog.parentElement.style.display="flex";
}
const hide_dialog = (dialog) => {
    dialog.style.display="none";
    dialog.parentElement.style.display="none";
}
const delete_profile = () => {
    show_loader();
    ipcRenderer.send("delete", `users/${profile.number}`, "profile-deleted");
    ipcRenderer.on("profile-deleted", (event, res) => {
        if(res){
            window.location.replace("../html/index.html");
        }else{
            hide_loader();
            show_toast("Cannot delete profile. Try Again", true);
        }
    });
}
const update_profile_elem = (elem) => {
    show_loader()
    let data = elem.querySelector("input").value,
    data_name = elem.querySelector("input").name;
    let data_name_cpy=data_name;
    data_name="";
    for(i of data_name_cpy){
        if(i==='-'){
            data_name+="_";
        }else{
            data_name+=i;
        }
    }
    ipcRenderer.send("insert", `users/${profile.number}/${data_name}/`, data, "profile-updated-status");
    ipcRenderer.on("profile-updated-status", (event, res) => {
        if(res){
            elem.classList.toggle("edit");
            elem.querySelector("div h2, div p").innerHTML=data;
            hide_loader();
            show_toast("Profile Updated Successfully");
        }else{
            hide_loader();
            show_toast("Profile Cannot Updated", true);
        }
    });
}
const update_password = (dialog) => {
    show_loader();
    let new_password = dialog.querySelector("input[name='new-password']").value,
    confirm_password = dialog.querySelector("input[name='confirm-password']").value;

    if(new_password!==confirm_password){
        hide_loader();
        show_toast("New and Confirm password not matched", true);
        return;
    }

    ipcRenderer.send("insert", `users/${profile.number}/password`, new_password, "pasword-updated-info");
    ipcRenderer.on("pasword-updated-info", (event, res) => {
        if(res){
            hide_loader();
            show_toast("Password Updated Successfully");
            hide_dialog(dialog);
        }else{
            hide_loader();
            show_toast("Password cannot updated. Please try again.", true);
        }
    }); 

}
const preview_image = (elem) => {
    show_loader();
    let image_elem = elem.querySelector("img"),
    file = elem.querySelector("input[name='dp-image']").files[0];
    file_ext = file.name.split(".").pop();
    let default_extensions = ["png", "jpg", "jpeg"];
    let matched=false;
    for(i of default_extensions){
        if(i.toLowerCase()===file_ext.toLowerCase()){
            matched=true;
            break;
        }
    }
    if(!matched){
        hide_loader();
        show_toast("Please Upload Image (PNG, JPG or JPEG) only", true);
        return;
    }
    image_elem.src=window.URL.createObjectURL(file);
    let name = "/"+Date.now();
    ipcRenderer.send("upload-image", name, `users/${profile.number}/dp`, file.path, "image_uploaded_info");
    ipcRenderer.on("image_uploaded_info", (event, res) => {
        if(typeof(res) === typeof(true)){
            hide_loader();
            if(res)
                show_toast("Uploaded Successfully");
            else
                show_toast("Cannot Uploaded. Try Again", true);
        }else{
            console.log(res);
        }
    });
}

const populate_users = () => {
    let contacts_elem = document.querySelector(".contacts");
    contacts_elem.innerHTML="";
    for(i of all_users){
        contacts_elem.innerHTML+=`<a href="#" class="contact" onclick="open_contact('${i.number}');">
            <div class="left">
                <img src="../res/user.png" alt="...">
                <div>
                    <p>${i.first_name+" "+i.last_name}</p>
                    <p class="last-message">${i.number}</p>
                </div>
            </div>
            <!-- <span class="counter">3</span> -->
        </a>`;
    }
}







show_loader();
ipcRenderer.send("fetch", "users/", "first-fetch-result");
ipcRenderer.on("first-fetch-result", (event, isError, _profile, data) => {
    if(isError){
        hide_loader();
        show_toast("Network Error", true);
    }else{
        profile=_profile;
        if(data){
            seperate_data(data);
        }
        hide_loader();
    }
});








document.querySelector(".profile .left").addEventListener("click", (e) => {
    document.querySelector(".profile-dialog .img img").src="../res/user.png";
    
    let firstname_containers = document.querySelector(".profile-dialog .first-name div");
    firstname_containers.querySelector("h2").innerHTML=profile.first_name;
    firstname_containers.querySelector("input").value=profile.first_name;

    let lastname_containers = document.querySelector(".profile-dialog .last-name div");
    lastname_containers.querySelector("h2").innerHTML=profile.last_name;
    lastname_containers.querySelector("input").value=profile.last_name;

    let number_containers = document.querySelector(".profile-dialog .number div");
    number_containers.querySelector("p").innerHTML=profile.number;
    show_dialog("profile-dialog");
});









ipcRenderer.on("live-change-detected", (event, _profile, data) => {
    if(data && data['users']){
        profile=_profile;
        if(profile.status==="offline"){
            window.location.replace("../html/index.html");
        }
        update_profile();
        seperate_data(data['users']);
    }else{
        window.location.replace("../html/index.html");
    }
});