const sgmail = require("@sendgrid/mail");
const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgmail.setApiKey(sendgridAPIKey);

// sgmail.send({
//     to: "fatemae110@gmail.com",
//     from: "fatemae110@gmail.com",
//     subject: "This is my first creation.",
//     text: "I hope this email is received to you."
// })

const welcomeEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: "fatemae110@gmail.com",
        subject: "Welcome to the App",
        text: `Welcome ${name}, Let me know how you like it.`
    })
};

const cancellationEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: "fatemae110@gmail.com",
        subject: "We will miss you.",
        text: `Goodby ${name}, Is there anything we could have done to have kept you onboard.`
    })
}

module.exports = {
    welcomeEmail,
    cancellationEmail
}