const API_HOST = "http://127.0.0.1:5000/api";

// drag and drop
function dragStart(event) {
  event.dataTransfer.setData("todo", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("todo");

  const dropTarget = event.target;

  let dropToDone = false;
  if (dropTarget.id == "done-item") {
    dropToDone = true;
  }

  if (dropTarget.classList.contains("card-container")) {
    checkStatus(data, dropToDone);
  }
}

//update status
function updateStatus(id, status) {
  const xhr = new XMLHttpRequest();
  const url = API_HOST + "/tasks/status/" + id;

  const data = JSON.stringify({
    status: !status,
  });

  console.log(JSON.stringify);
  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
  xhr.setRequestHeader(
    "Authorization",
    `Bearer ${localStorage.getItem("access_token")}`
  );

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      location.reload();
    }
  };

  xhr.send(data);
}

//check status
function checkStatus(id, dropToDone) {
  const xhr = new XMLHttpRequest();
  const url = API_HOST + "/tasks/" + id;
  console.log("Check status berjalan");

  xhr.open("GET", url, true);
  xhr.setRequestHeader(
    "Authorization",
    `Bearer ${localStorage.getItem("access_token")}`
  );
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.response);
      let nowStatus = response.data.status;

      if (nowStatus != dropToDone) {
        updateStatus(id, nowStatus);
      }
    }
  };
  return xhr.send();
}

// Get All Tasks
const todoItem = document.getElementById("todo-item");
const doneItem = document.getElementById("done-item");

window.onload = function () {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    window.location.href = "http://127.0.0.1:5000/auth/login";
  }

  const xhr = new XMLHttpRequest();
  const url = API_HOST + "/tasks";

  xhr.open("GET", url, true);
  xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const tasks = JSON.parse(this.response);

      tasks["data"].forEach((task) => {
        let card = document.createElement("div");
        let article = document.createElement("article");
        let titleWrapper = document.createElement("div");
        let h3 = document.createElement("h3");
        let buttonProject = document.createElement("button");
        let p = document.createElement("p");
        let btnWrapper = document.createElement("div");
        let btnEdit = document.createElement("button");
        let btnDelete = document.createElement("button");

        card.setAttribute("class", "card p-4 inner-container");
        card.setAttribute("draggable", "true");
        card.setAttribute("id", task.id);
        card.setAttribute("ondragstart", "dragStart(event)");

        titleWrapper.setAttribute("class", "d-flex flex-row");
        buttonProject.setAttribute("type", "button");
        buttonProject.setAttribute("data-bs-toggle", "modal");
        buttonProject.setAttribute("data-bs-target", "#myModalProject");
        buttonProject.setAttribute("class", "btn btn-info ms-auto mb-4");
        buttonProject.setAttribute("id", task.project + task.title + "-button");
        buttonProject.setAttribute("data-project", task.project);
        buttonProject.setAttribute("data-title", task.title);
        buttonProject.setAttribute("data-id", task.id);

        btnWrapper.setAttribute("class", "d-flex flex-row gap-2");

        btnEdit.setAttribute("class", "btn btn-primary");
        btnEdit.setAttribute("id", "btn-edit-" + task.id);
        btnEdit.setAttribute("data-bs-toggle", "modal");
        btnEdit.setAttribute("data-bs-target", "#myModalEdit");
        btnEdit.setAttribute("data-title", task.title);
        btnEdit.setAttribute("data-description", task.ription);
        btnEdit.setAttribute("data-project", task.project);
        btnEdit.setAttribute("data-id", task.id);

        btnEdit.setAttribute("type", "button");
        btnEdit.appendChild(document.createTextNode("Edit"));

        btnDelete.setAttribute("type", "button");
        btnDelete.setAttribute("class", "btn btn-danger btn-delete");
        btnDelete.setAttribute("data-id", task.id);
        btnDelete.setAttribute("data-bs-toggle", "modal");
        btnDelete.setAttribute("data-bs-target", "#myModalDelete");
        btnDelete.appendChild(document.createTextNode("Delete"));

        h3.appendChild(document.createTextNode(task.title));
        p.appendChild(document.createTextNode(task.description));
        buttonProject.appendChild(document.createTextNode(task.project));

        article.appendChild(titleWrapper);
        article.appendChild(p);
        article.appendChild(btnWrapper);

        titleWrapper.appendChild(h3);
        titleWrapper.appendChild(buttonProject);

        btnWrapper.appendChild(btnEdit);
        btnWrapper.appendChild(btnDelete);

        card.appendChild(article);

        todoItem.appendChild(card);

        if (task.status == true) {
          article.setAttribute("style", "text-decoration: line-through");
          doneItem.appendChild(card);
        } else {
          todoItem.appendChild(card);
        }
      });
    }
  };
  xhr.send();
};

// fungsi add
const addForm = document.getElementById("add-form");
addForm.addEventListener("submit", function (event) {
  event.preventDefault();
  let xhr = new XMLHttpRequest();
  let url = API_HOST + "/tasks";

  let title = document.getElementById("title").value;
  let description = document.getElementById("description").value;
  let dropdown = document.getElementById("projectDropdown");
  let project = dropdown.options[dropdown.selectedIndex].text;

  //konfigurasi toast
  const toastLiveExample = document.getElementById("liveToastAdd");
  const toastMsgAdd = document.getElementById("toast-body-add");
  const toast = new bootstrap.Toast(toastLiveExample);
  //validasti input
  if (title == "" || description == "") {
    toastMsgAdd.innerHTML =
      "Title and description fields must not be left blank.";
    toast.show();
  }
  let new_data = JSON.stringify({
    title: title,
    description: description,
    project: project,
  });

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
  xhr.setRequestHeader(
    "Authorization",
    `Bearer ${localStorage.getItem("access_token")}`
  );
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //close the modal after adding data
      const myModalAdd = bootstrap.Modal.getInstance("#myModalAdd");
      myModalAdd.hide();

      //reset form
      addForm.reset();
      //refresh page
      location.reload();
    } else {
      //konfigurasi toast berhasil
      const toastLive = document.getElementById("liveToast");
      const toastMsg = document.getElementById("toast-body");
      const toast = new bootstrap.Toast(toastLive);
      toastMsg.innerHTML = "Data berhasil";
      toast.show();
    }
  };
  xhr.send(new_data);
});

//  modal edit selection
const myModalEdit = document.getElementById("myModalEdit");
myModalEdit.addEventListener("show.bs.modal", function (event) {
  let dataId = event.relatedTarget.attributes["data-id"];

  let xhr = new XMLHttpRequest();
  let url = API_HOST + "/tasks/" + dataId.value;

  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
  xhr.setRequestHeader(
    "Authorization",
    `Bearer ${localStorage.getItem("access_token")}`
  );

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.response);
      let oldTitle = document.getElementById("edit-title");
      let oldDescription = document.getElementById("edit-description");
      oldTitle.value = data.data.title;
      oldDescription.value = data.data.description;
      project = data.data.project;
    }
  };
  xhr.send();

  let editForm = document.getElementById("edit-form");
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let xhr = new XMLHttpRequest();
    let url = API_HOST + "/tasks/" + dataId.value;

    let newTitle = document.getElementById("edit-title").value;
    let newDescription = document.getElementById("edit-description").value;
    // toast configuration
    const toastLiveExample = document.getElementById("liveToastEdit");
    const toastMsgEdit = document.getElementById("toast-body-edit");
    const toast = new bootstrap.Toast(toastLiveExample);

    if (newTitle == "" || newDescription == "") {
      toastMsgEdit.innerHTML =
        "Title and description fields must not be left blank.";
      toast.show();
    }

    let data = JSON.stringify({
      title: newTitle,
      description: newDescription,
      project: project,
    });
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${localStorage.getItem("access_token")}`
    );
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const myModalEdit = bootstrap.Modal.getInstance("#myModalEdit");
        myModalEdit.hide();
        editForm.reset();
        location.reload();
      }
    };
    xhr.send(data);
  });
});

// fungsi delete
const modalDelete = document.getElementById("myModalDelete");
modalDelete.addEventListener("show.bs.modal", function (event) {
  let dataId = event.relatedTarget.attributes["data-id"];
  let deleteForm = document.getElementById("delete-form");

  deleteForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let xhr = new XMLHttpRequest();
    let url = API_HOST + "/tasks/" + dataId.value;

    xhr.open("DELETE", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${localStorage.getItem("access_token")}`
    );

    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let response = JSON.parse(this.response);

        const myModalDelete = bootstrap.Modal.getInstance("#myModalDelete");
        myModalDelete.hide();
        document.getElementById(dataId.value).classList.add("d-none");
      }
    };
    xhr.send();
  });
});

//fungsi edit project
let myModalProject = document.getElementById("myModalProject");
myModalProject.addEventListener("show.bs.modal", function (event) {
  let dataId = event.relatedTarget.attributes["data-id"];

  let xhr = new XMLHttpRequest();
  let url = API_HOST + "/tasks/" + dataId.value;

  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
  xhr.setRequestHeader(
    "Authorization",
    `Bearer ${localStorage.getItem("access_token")}`
  );

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.response);
      let oldProject = document.getElementById("edit-project");
      let currentProject = document.getElementById("current-project");
      title = data.data.title;
      description = data.data.description;
      currentProject.value =
        event.relatedTarget.attributes["data-project"].value;
      oldProject.value = event.relatedTarget.attributes["data-project"].value;
    }
  };
  xhr.send();

  let editForm = document.getElementById("edit-form-2");
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let xhr = new XMLHttpRequest();
    let url = API_HOST + "/tasks/" + dataId.value;
    let editProjectSelect = document.getElementById("edit-project");
    let newProject = editProjectSelect.value;

    document.getElementById(
      dataId.value
    ).firstChild.firstChild.firstChild.nextSibling.innerHTML = newProject;
    console.log(newProject);

    let data = JSON.stringify({
      title: title,
      description: description,
      project: newProject,
    });

    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${localStorage.getItem("access_token")}`
    );
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const myModalEdit = bootstrap.Modal.getInstance("#myModalProject");
        myModalEdit.hide();

        editForm.reset();
        location.reload();
      }
    };
    console.log(data);
    xhr.send(data);
  });
});

//Live Jam

function myTime() {
  let jam = new Date();
  let p = document.getElementById("jam");
  p.innerHTML = jam.toLocaleTimeString([], {
    hour12: false,
  });
}
setInterval(myTime, 1000);

//logut
const logout = document.getElementById("logout");
logout.addEventListener("click", (e) => {
  e.preventDefault();
  const xhr = new XMLHttpRequest();
  const url = API_HOST + "/auth/logout";

  xhr.open("POST", url, true);
  xhr.setRequestHeader(
    "Authorization",
    `Bearer ${localStorage.getItem("access_token")}`
  );
  xhr.onreadystatechange = function () {
    if (this.status == 200) {
      localStorage.removeItem("access_token");
      window.location.href = "http://127.0.0.1:5000/auth/login";
    } else {
      alert("Something went wrong");
    }
  };

  xhr.send();
});
