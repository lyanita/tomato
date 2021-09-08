function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");
    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message==${type}`);
}

function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");
    const forgotPasswordForm = document.querySelector("#forgotPassword");
    const securityForm = document.querySelector('#security');
    const updatePasswordForm = document.querySelector('#updatePassword');

    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        forgotPasswordForm.classList.add("form--hidden");
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });

    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
        forgotPasswordForm.classList.add("form--hidden");
    });

    document.querySelector("#linkForgotPassword").addEventListener("click", e => {
        e.preventDefault();
        forgotPasswordForm.classList.remove("form--hidden");
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.add("form--hidden");
    });

    createAccountForm.addEventListener("submit", e => {
        e.preventDefault();
        var test = document.getElementsByClassName("form__input");
        console.log(test);
        var username = document.getElementById("signupUsername").value;
        var password = document.getElementById("form__password-create").value;
        var passwordConfirm = document.getElementById("form__password-confirm").value;
        var email = document.getElementById("form__email-create").value;
        var question = document.getElementById("form__question").value;
        var answer = document.getElementById("form__answer").value;
        var type = "User";
        if (password === passwordConfirm) {
            if (email.includes("@")) {
                var req = new XMLHttpRequest();
                req.open("POST", "https://tomato-dictionary.herokuapp.com/insert-login?username=" + encodeURIComponent(username) + "&password=" +
                    encodeURIComponent(password) + "&email=" + encodeURIComponent(email) + "&question=" + encodeURIComponent(question) +
                    "&answer=" + encodeURIComponent(answer) + "&type=" + type , true);
                req.addEventListener('load', function () {
                    if (req.readyState === 4) {
                        if (req.status >= 200 && req.status < 400) {
                            console.log(req);
                            result = req.response;
                            console.log(result);
                            if (result.includes("successfully")) {
                                createAccountForm.classList.add("form--hidden");
                                loginForm.classList.remove("form--hidden");
                                setFormMessage(loginForm, "success", "New user created. Please login to continue.");
                            } else {
                                setFormMessage(createAccountForm, "error", result);
                            }
                        } else {
                            console.log(req);
                            setFormMessage(createAccountForm, "error", "Invalid entries. Please try again.")
                        }
                    }
                });
                req.send(null);
            } else {
                setFormMessage(createAccountForm, "error", "Email is invalid. Please try again.")
            }
        } else {
            setFormMessage(createAccountForm, "error", "Password does not match. Please try again.")
        }
    });

    forgotPasswordForm.addEventListener("submit", e => {
        e.preventDefault();
        var username = document.getElementById("form__username-forgot").value;
        console.log(username);
        var req = new XMLHttpRequest();
        req.open("GET", "https://tomato-dictionary.herokuapp.com/forgot?username=" + username, true);
        req.addEventListener('load', function () {
            console.log("Test");
            if (req.status >= 200 && req.status < 400) {
                console.log(req);
                result = JSON.parse(req.response);
                console.log(result);
                console.log(result.rowCount);
                if (result.rowCount === 0) {
                    setFormMessage(forgotPasswordForm, "error", "Invalid username. Please try again.");
                } else {
                    forgotPasswordForm.classList.add("form--hidden");
                    securityForm.classList.remove("form--hidden");
                    var section = document.querySelector(".form__message--question");
                    console.log(section);
                    var row = result.rows[0];
                    console.log(row);
                    console.log(row.question);
                    console.log(row["question"]);
                    var question = row.question;
                    section.textContent = question;
                    console.log("Success");
                }
            }
        });
        req.send(null);
    });

    securityForm.addEventListener("submit", e => {
        e.preventDefault();
        var username = document.getElementById("form__username-forgot").value;
        var answer = document.getElementById("form__answer-forgot").value;
        console.log(username);
        console.log(answer);
        var req = new XMLHttpRequest();
        req.open("GET", "https://tomato-dictionary.herokuapp.com/security?username=" + username + "&answer=" + answer, true);
        req.addEventListener('load', function () {
            if (req.status >= 200 && req.status < 400) {
                console.log(req);
                result = JSON.parse(req.response);
                console.log(result);
                if (result.rowCount === 0) {
                    setFormMessage(securityForm, "error", "Incorrect answer. Please try again.");
                } else  {
                    securityForm.classList.add("form--hidden");
                    updatePasswordForm.classList.remove("form--hidden");
                }
            }
        });
        req.send(null);
    });

    updatePasswordForm.addEventListener("submit", e => {
       e.preventDefault();
       var username = document.getElementById("form__username-forgot").value;
       var confirm = document.getElementById("form__password-same").value;
       var password = document.getElementById("form__password-update").value;
       console.log(username);
       console.log(password);
       console.log(confirm);
       if (password === confirm) {
            var req = new XMLHttpRequest();
            req.open("POST", "https://tomato-dictionary.herokuapp.com/update?username=" + username + "&password=" + password, true);
            req.addEventListener('load', function () {
                if (req.status >= 200 && req.status < 400) {
                    console.log(req);
                    result = req.response;
                    console.log(result);
                    if (result.includes("successfully")) {
                        updatePasswordForm.classList.add("form--hidden");
                        loginForm.classList.remove("form--hidden");
                        setFormMessage(loginForm, "success", "Password updated successfully. Please login.")
                    } else {
                        setFormMessage(updatePasswordForm, "error", "Error with submission. Please try again.")
                    }
                }
            });
            req.send(null);
       } else {
           setFormMessage(updatePasswordForm, "error", "Passwords do not match. Please try again.")
       }
    });

    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        //Perform AJAX login
        var username = document.getElementById("form__username").value;
        var password = document.getElementById("form__password").value;
        console.log(username);
        var req = new XMLHttpRequest();
        req.open("GET", "https://tomato-dictionary.herokuapp.com/login?username=" + username + "&password=" + password, true);
        req.addEventListener('load', function () {
            if (req.status >= 200 && req.status < 400) {
                console.log(req);
                var result = req.response;
                console.log(result);
                if (result.includes("incorrect")) {
                    setFormMessage(loginForm, "error", "Invalid username/password combination.");
                } else {
                    var text = JSON.parse(result);
                    var type = text.rows[0].type;
                    if (type === 'User') {
                        sessionStorage.setItem('username', JSON.stringify(username));
                        window.location = './main.html';
                    } else {
                        sessionStorage.setItem('username', JSON.stringify(username));
                        window.location = './admin.html';
                    }
                }
            } else {
                console.log(req);
                setFormMessage(loginForm, "error", "Invalid username/password combination.");
            }
        });
        req.send(null);
    });

    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 3) {
                setInputError(inputElement, "Username must be at least 3 characters in length.");
            }
        });

        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);
        });
    });
});