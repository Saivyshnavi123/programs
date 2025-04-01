// =========================
// SIMULATED USER AUTH API
// =========================

// Register New User
document.getElementById("registerForm")?.addEventListener("submit", function(event) {
    event.preventDefault();
    let username = document.getElementById("regUsername").value;
    let password = document.getElementById("regPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(user => user.username === username)) {
        alert("Username already exists!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! Please log in.");
    document.getElementById("registerForm").reset();
});

// Login & Redirect to Dashboard
document.getElementById("loginForm")?.addEventListener("submit", function(event) {
    event.preventDefault();
    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let validUser = users.find(user => user.username === username && user.password === password);

    if (validUser) {
        localStorage.setItem("loggedInUser", username);
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid login credentials");
    }
});

// Check Login Status for Dashboard
function checkLoginStatus() {
    let user = localStorage.getItem("loggedInUser");
    if (!user) {
        window.location.href = "login.html";
    } else {
        document.getElementById("username").textContent = user;
        displayApplications();
    }
}

// Logout User
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// ==========================
// SIMULATED APPLICATION API
// ==========================

// Submit Passport Application (Save to JSON & XML)
document.getElementById("applicationForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("name").value;
    let dob = document.getElementById("dob").value;
    let nationality = document.getElementById("nationality").value;
    let user = localStorage.getItem("loggedInUser");

    let applications = JSON.parse(localStorage.getItem("applications")) || [];
    let newApplication = { id: Date.now(), name, dob, nationality, user };
    applications.push(newApplication);
    localStorage.setItem("applications", JSON.stringify(applications));

    saveApplicationToXML(newApplication);
    displayApplications();
    document.getElementById("applicationForm").reset();
});

// Display User's Applications
function displayApplications() {
    let applications = JSON.parse(localStorage.getItem("applications")) || [];
    let user = localStorage.getItem("loggedInUser");
    let table = document.getElementById("applicationsTable");

    table.innerHTML = `<tr>
        <th>Name</th>
        <th>DOB</th>
        <th>Nationality</th>
        <th>Actions</th>
    </tr>`;

    applications.forEach((app, index) => {
        if (app.user === user) {
            let row = table.insertRow();
            row.innerHTML = `
                <td>${app.name}</td>
                <td>${app.dob}</td>
                <td>${app.nationality}</td>
                <td>
                    <button onclick="editApplication(${app.id})">Edit</button>
                    <button onclick="deleteApplication(${app.id})">Delete</button>
                </td>
            `;
        }
    });
}

// Delete Application
function deleteApplication(id) {
    let applications = JSON.parse(localStorage.getItem("applications")) || [];
    applications = applications.filter(app => app.id !== id);
    localStorage.setItem("applications", JSON.stringify(applications));

    deleteApplicationFromXML(id);
    displayApplications();
}

// Edit Application
function editApplication(id) {
    let applications = JSON.parse(localStorage.getItem("applications")) || [];
    let app = applications.find(app => app.id === id);

    if (app) {
        document.getElementById("name").value = app.name;
        document.getElementById("dob").value = app.dob;
        document.getElementById("nationality").value = app.nationality;

        deleteApplication(id); // Remove old entry before saving the updated one
    }
}

// Ensure JavaScript runs only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {

    // Open Contact Form Popup
    window.openContactForm = function () {
        document.getElementById("contactFormPopup").style.display = "flex";
    };

    // Close Contact Form Popup
    window.closeContactForm = function () {
        document.getElementById("contactFormPopup").style.display = "none";
    };

    // Close Thank You Popup
    window.closeThankYouPopup = function () {
        document.getElementById("thankYouPopup").style.display = "none";
    };

    // Handle Contact Form Submission
    document.getElementById("contactForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        // Hide Contact Form and Show Thank You Message
        document.getElementById("contactFormPopup").style.display = "none";
        document.getElementById("thankYouPopup").style.display = "flex";

        // Clear Form Fields
        document.getElementById("contactForm").reset();
    });

});


// ======================
// XML STORAGE FUNCTIONS
// ======================

// Save Application to XML in Local Storage
function saveApplicationToXML(application) {
    let xmlString = localStorage.getItem("applicationsXML");

    if (!xmlString) {
        xmlString = `<?xml version="1.0" encoding="UTF-8"?><applications></applications>`;
    }

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, "application/xml");

    let newApp = xmlDoc.createElement("application");

    let id = xmlDoc.createElement("id");
    id.textContent = application.id;
    newApp.appendChild(id);

    let name = xmlDoc.createElement("name");
    name.textContent = application.name;
    newApp.appendChild(name);

    let dob = xmlDoc.createElement("dob");
    dob.textContent = application.dob;
    newApp.appendChild(dob);

    let nationality = xmlDoc.createElement("nationality");
    nationality.textContent = application.nationality;
    newApp.appendChild(nationality);

    let user = xmlDoc.createElement("user");
    user.textContent = application.user;
    newApp.appendChild(user);

    xmlDoc.documentElement.appendChild(newApp);

    let serializer = new XMLSerializer();
    let newXMLString = serializer.serializeToString(xmlDoc);

    localStorage.setItem("applicationsXML", newXMLString);
}

// Load Applications from XML (Simulated)
function loadApplicationsFromXML() {
    let xmlString = localStorage.getItem("applicationsXML");

    if (!xmlString) {
        return [];
    }

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, "application/xml");
    let applications = xmlDoc.getElementsByTagName("application");

    let appList = [];
    for (let app of applications) {
        let id = app.getElementsByTagName("id")[0].textContent;
        let name = app.getElementsByTagName("name")[0].textContent;
        let dob = app.getElementsByTagName("dob")[0].textContent;
        let nationality = app.getElementsByTagName("nationality")[0].textContent;
        let user = app.getElementsByTagName("user")[0].textContent;

        appList.push({ id, name, dob, nationality, user });
    }

    return appList;
}

// Delete Application from XML Storage
function deleteApplicationFromXML(id) {
    let applications = loadApplicationsFromXML();
    applications = applications.filter(app => app.id !== id);

    let xmlString = `<?xml version="1.0" encoding="UTF-8"?><applications>`;

    applications.forEach(app => {
        xmlString += `
        <application>
            <id>${app.id}</id>
            <name>${app.name}</name>
            <dob>${app.dob}</dob>
            <nationality>${app.nationality}</nationality>
            <user>${app.user}</user>
        </application>`;
    });

    xmlString += `</applications>`;
    localStorage.setItem("applicationsXML", xmlString);
}

// ===================
// Initialize Dashboard
// ===================
displayApplications();



