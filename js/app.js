
const App = (() => {

  let _currentBinding = null;   // KO binding context – allows ko.cleanNode before re-bind
  const main = () => document.getElementById('spa-main');

  // ── Render helpers ─────────────────────────────────────────
  function renderView(name) {
    const tpl = document.querySelector(`template[data-view="${name}"]`);
    if (!tpl) { console.error(`View template not found: ${name}`); return null; }

    const el = main();

    // Clean previous KO bindings to avoid memory leaks
    if (_currentBinding) {
      ko.cleanNode(el);
      _currentBinding = null;
    }

    el.innerHTML = '';
    el.appendChild(document.importNode(tpl.content, true));

    // Restart animation
    el.classList.remove('animate-fade-up');
    void el.offsetWidth;
    el.classList.add('animate-fade-up');

    return el;
  }


  function bindViewModel(el, vm) {
    _currentBinding = vm; 
    ko.applyBindings(vm, el);
  }


  // ── Route Handlers ─────────────────────────────────────────

  // revisar autenticación 
  Router.on('login', () => {
    if (Api.isAuthenticated()) { Router.navigate('clubs'); return; }

    const el = renderView('login');
    const vm = new LoginViewModel();
    bindViewModel(el, vm);
  });

  
  Router.on('clubs', async () => {
    const el = renderView('clubs');
    const vm = new ClubsViewModel();
    bindViewModel(el, vm); // renderiza la vista de clubs, instancia el viewModel y hace un binding entre la vista y el viewmodel
    await vm.load();
  });


  // Fallback – catch-all
  Router.on('*', () => Router.navigate('login'));

})();
