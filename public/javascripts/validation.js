$("#formValidation").validate({
  rules: {
    firstname: {
      required: true,
      minlength: 3,
    },
    lastname: {
      required: true,
      minlength: 1,
    },
    Email: {
      required: true,
      email: true,
    },
    Password: {
      required: true,
      minlength: 6,
      maxlength: 15,
    },
    Phone: {
      number: true,
      minlength: 10,
      maxlength: 10,
    },
  },
  messages: {
    firstname: {
      required: "Please enter  name",
      minlength: "Requires minimum of 3 characters",
    },

    lastname: {
      required: "Please enter last name",
      minlength: "Requires minimum of 1 character",
    },

    email: {
      required: "Please enter the email",
      email: "Enter a valid email",
    },

    Password: {
      required: "Please enter a password",
      minlength: "Required 6 digits",
      maxlength: "Cannot be more than 10 digits",
    },

    Phone: {
      required: "Please enter the mobile number",
      minlength: "Required 10 digits",
      maxlength: "Cannot be more than 10 digits",
    },
  },

  submitHandler: function (form) {
    form.submit();
  },
});