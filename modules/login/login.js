ko.validation.init({
    registerExtenders: true,
    messagesOnModified: true, // Show messages only after modification
    insertMessages: true,     // Automatically insert a <span> element for messages
    errorElementClass: 'input-validation-error', // CSS class for invalid input elements
    decorateElementOnModified: true
});

window.loginViewModel = function (params) {
    var self = this;

    self.label = ko.observable('Bizarro Login');
    self.showRegister = ko.observable(false);

    self.username = ko.observable('').extend({ required: true });
    self.password = ko.observable('').extend({ required: true });
    self.error = ko.observable();
    self.has_error = ko.computed(() => {
        return self.error() !== undefined;
    });

    self.fullname = ko.observable('').extend({ required: true });
    self.email = ko.observable('').extend({ required: true, email: true });
    self.username2 = ko.observable('').extend({ required: true });
    self.password2 = ko.observable('').extend({ required: true, minLength: 8 });

    self.Init = function () {
        console.log("Welcome to BookCircle Login Component");
    };

    self.CreateAccount = function () {
        self.showRegister(true);
    };

    self.SwitchToLogin = function () {
        self.showRegister(false);
    };

    self.ClickCreateAccount = async function () {
        var errors = ko.validation.group({
            fullname: self.fullname,
            username2: self.username2,
            email: self.email,
            password2: self.password2
        });

        if (errors().length > 0) {
            errors.showAllMessages();
            return;
        }

        $.blockUI({ message: null });

        try {
            const data = await window.api.register({
                email: self.email(),
                username: self.username2(),
                password: self.password2(),
                fullname: self.fullname()
            });

            console.log(data ? data.accessToken : 'Registered');
            alert('Registration Successful');
            $.unblockUI();

            self.SwitchToLogin();
        } catch (err) {
            self.error(err.message || 'Error occurred during registration');
            $.unblockUI();
        }
    };

    self.ClickSignIn = async function () {

        var errors = ko.validation.group({
            username: self.username,
            password: self.password
        });

        if (errors().length > 0) {
            errors.showAllMessages();
            return;
        }

        $.blockUI({ message: null });

        try {
            const data = await window.api.login(self.username(), self.password());
            console.log(data ? data.accessToken : '');
            $.unblockUI();

            if (data && data.accessToken) {
                localStorage.setItem('token', data.accessToken);
                app.currentUser(self.username());
                hasher.setHash('clubs');
            }
        } catch (err) {
            self.error(err.message || 'Error occurred during login');
            $.unblockUI();
        }
    };
    self.Init();
};
