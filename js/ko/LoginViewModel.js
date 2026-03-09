
function LoginViewModel() {
  var self = this;

  
  self.isRegister = ko.observable(false);
  self.label      = ko.computed(() => self.isRegister() ? 'Create Account' : 'Sign In');

  self.username = ko.observable('').extend({ required: true });
  self.password = ko.observable('').extend({ required: true });

  self.fullname  = ko.observable('').extend({ required: { onlyIf: self.isRegister } });
  self.email     = ko.observable('').extend({ required: { onlyIf: self.isRegister }, email: { onlyIf: self.isRegister } });
  self.username2 = ko.observable('').extend({ required: { onlyIf: self.isRegister } });
  self.password2 = ko.observable('').extend({ required: { onlyIf: self.isRegister }, minLength: { params: 8, onlyIf: self.isRegister } });

  self.error   = ko.observable(null);
  self.loading = ko.observable(false);

  self.hasError = ko.computed(() => !!self.error());
}


LoginViewModel.prototype.showRegister = function () {
  this.error(null);
  this.isRegister(true);
};


LoginViewModel.prototype.showLogin = function () {
  this.error(null);
  this.isRegister(false);
};


LoginViewModel.prototype.signIn = async function () {
  var self = this;
  self.error(null);

  var errors = ko.validation.group({ username: self.username, password: self.password });
  if (errors().length > 0) { errors.showAllMessages(); return; }

  self.loading(true);
  try {
    await Api.login(self.username(), self.password());
    Router.navigate('clubs');
  } catch (e) {
    self.error(e.message);
  } finally {
    self.loading(false);
  }
};


LoginViewModel.prototype.createAccount = async function () {
  var self = this;
  self.error(null);

  var errors = ko.validation.group({
    fullname:  self.fullname,
    email:     self.email,
    username2: self.username2,
    password2: self.password2,
  });
  if (errors().length > 0) { errors.showAllMessages(); return; }

  self.loading(true);
  try {
    await Api.register({
      fullname: self.fullname(),
      email:    self.email(),
      username: self.username2(),
      password: self.password2(),
    });
    Router.navigate('clubs');
  } catch (e) {
    self.error(e.message);
  } finally {
    self.loading(false);
  }
};
