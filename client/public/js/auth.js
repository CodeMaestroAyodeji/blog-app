// Signup Form Submission
document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            Swal.fire('Success', 'Account created successfully! Please verify your email.', 'success')
                .then(() => window.location.href = "/login");
        } else {
            Swal.fire('Error', 'Failed to create account. Try again.', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'An unexpected error occurred. Please try again.', 'error');
    }
});

// Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            Swal.fire('Success', 'Logged in successfully!', 'success')
                .then(() => window.location.href = "/home");
        } else {
            Swal.fire('Error', 'Invalid username or password', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'An unexpected error occurred. Please try again.', 'error');
    }
});

// Password Reset Request Form
document.getElementById('resetPasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            Swal.fire('Success', 'A reset link has been sent to your email.', 'success');
        } else {
            Swal.fire('Error', 'Failed to send reset link. Try again.', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'An unexpected error occurred. Please try again.', 'error');
    }
});

// Password Reset Form Submission
document.getElementById("resetPasswordForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const token = document.getElementById("token").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
        const response = await fetch("/reset-password-form", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword })
        });

        if (response.ok) {
            Swal.fire('Success', 'Password has been reset successfully!', 'success')
                .then(() => window.location.href = "/login");
        } else {
            Swal.fire('Error', 'Failed to reset password. Try again.', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'An unexpected error occurred. Please try again.', 'error');
    }
});
