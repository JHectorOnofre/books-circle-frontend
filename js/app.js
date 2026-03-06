// js/app.js
var AppViewModel = function () {
    var self = this;

    // The current component mapping for the shell
    self.currentComponent = ko.observable('loading-page');
    self.currentParams = ko.observable({});

    self.logout = function () {
        localStorage.removeItem('token');
        hasher.setHash('login');
    };

    self.currentUser = ko.observable(localStorage.getItem('token') ? 'User' : '');

    // A small utility to load a module HTML/JS dynamically
    self.loadComponent = function (name, path, params) {
        if (ko.components.isRegistered(name)) {
            self.currentComponent(name);
            self.currentParams(params);
        } else {
            $.blockUI({ message: null, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
            $.get('modules/' + path + '.html', function (html) {
                $.getScript('modules/' + path + '.js', function () {
                    ko.components.register(name, {
                        template: html,
                        viewModel: window[name + 'ViewModel']
                    });
                    self.currentComponent(name);
                    self.currentParams(params);
                    $.unblockUI();
                });
            }).fail(function () {
                console.error("Failed to load component " + name);
                $.unblockUI();
            });
        }
    };
};

var app = new AppViewModel();

// Crossroads routing configuration
crossroads.addRoute('login', function () {
    app.loadComponent('login', 'login/login', {});
});

crossroads.addRoute('clubs', function () {
    if (!localStorage.getItem('token')) return hasher.setHash('login');
    app.loadComponent('clubs', 'clubs/clubs', {});
});

crossroads.addRoute('clubs/{id}', function (id) {
    if (!localStorage.getItem('token')) return hasher.setHash('login');
    app.loadComponent('club-detail', 'clubs/detail/detail', { clubId: id });
});

crossroads.addRoute('', function () {
    if (localStorage.getItem('token')) {
        hasher.setHash('clubs');
    } else {
        hasher.setHash('login');
    }
});

crossroads.routed.add(console.log, console);

// Hasher configuration
function parseHash(newHash, oldHash) {
    crossroads.parse(newHash);
}
hasher.initialized.add(parseHash);
hasher.changed.add(parseHash);
hasher.init();

// Apply bindings to the root node
$(document).ready(function () {
    ko.applyBindings(app, document.getElementById('shell'));
});
