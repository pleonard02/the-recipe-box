const mongoose = require("mongoose"); 
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    username: {
        type: String, 
        required: [true, "Please enter a username."],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please enter a valid email."],
        unique: true,
        match: [/.+@.+\..+/, "Please provide a valid email address."],
    },
    password: {
        type: String,
        required: [true, "A password is required."],
        minlength: [8, "Please enter a password that is at least 8 characters long."],
        validate: {
            validator: function (value) {
                return !this.isModified("password") || /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(value);
            },
            message: "Passwords must contain lowercase and uppercase letters, a number, and a symbol.",
        },
    },
}, {
    timestamps: true,
})

userSchema.pre("save", async function () {
    if (this.isNew || this.isModified("password")) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
});

userSchema.methods.isCorrectPassword = function(password) {
    return bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);

module.exports = User;  