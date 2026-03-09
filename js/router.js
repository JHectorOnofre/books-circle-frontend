
const Router = (() => {
  const _handlers = {};
  let _current = null;

  // Parse  #club/5  →  { route: 'club', params: { id: '5' } }

  // _nombreFunsión = para funciones que sólo se usan en el mismo script donde son declaradas (scope)
  function _parse(hash) {
    const raw = (hash || '').replace(/^#\/?/, '');
    const parts = raw.split('/');
    const route = parts[0] || 'login';
    const params = {};
    if (parts[1]) params.id = parts[1];
    return { route, params };
  }

  function _dispatch() {
    const { route, params } = _parse(window.location.hash);
    _current = { route, params };

    // Guard: redirect to login if not authenticated
    if (route !== 'login' && !Api.isAuthenticated()) {
      navigate('login');
      return;
    }

    const handler = _handlers[route] || _handlers['*'];
    if (handler) handler(params);
  }

  function on(route, handler) {
    _handlers[route] = handler;
  }

  function navigate(route, params = {}) {
    let hash = `#${route}`;
    if (params.id !== undefined) hash += `/${params.id}`;
    window.location.hash = hash;
  }

  function current() { return _current; }

  // Bootstrap
  window.addEventListener('hashchange', _dispatch); // para cambiar entre sitios, p. ej. url#clubs, entonces, manda a la func. _dispatch
  window.addEventListener('load',       _dispatch);

  return { on, navigate, current };
})();
