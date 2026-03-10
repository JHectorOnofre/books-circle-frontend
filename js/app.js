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

    
    //obetenemos el logeo del local storage (una vez logueado), lo hacemos mediante self.currentUser y lo metemos en un .observable
    self.currentUser = ko.observable(localStorage.getItem('token') ? 'User' : '');


    // .loadComponete = Resgsitra el componente y obtiene el HTML y el JS mediante el $get
    self.loadComponent = function (name, path, params) {
        if (ko.components.isRegistered(name)) { // un component = conjunto entre una vista y un viewModel (para separar la app en módulos) | como React x VueJS
            self.currentComponent(name); 
            self.currentParams(params); 
        } else {
            $.blockUI({ message: null, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
            $.get('modules/' + path + '.html', function (html) { // a. primero carga el html
                $.getScript('modules/' + path + '.js', function () { // b. luego carga el Js
                    ko.components.register(name, {
                        template: html,
                        viewModel: window[name + 'ViewModel'] // "window" el objeto principal de JS
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

// Crossroads = routing configuration (por el cual se añaden las rutas, que pueden contener un parámetro), donde cargamos un componente 
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
    ko.applyBindings(app, document.getElementById('shell')); //applyBindings = combina vista con el viewModel (appViewModel)
});
