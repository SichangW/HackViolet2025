function validatePassword(pwd) {
    // use regex to determine password strength
    const minLength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (minLength.test(pwd)) {
        console.log("Password is strong!");
        return true;
    } else {
        alert("Password is weak. It must meet the following requirements: 1. At least 8 characters long.\n 2. At least one lowercase letter.\n 3. At least one uppercase letter.\n 4. At least one number.\n 5. At least one special character (@$!%*?&).");
        return false;
    }
}

function login() {
    console.log("function executed");
    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;
    console.log("step 2");
    if ((username == "Test1") && (password == "Test._1234")){
        console.log("success");
        window.location.href = "main.html";
    }
    else{
        alert("Incorrect credentials.")
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const loginButton = document.getElementById("login");

    loginButton.addEventListener("click", function() {
        login(); // Call the login function when the button is clicked
    });
});