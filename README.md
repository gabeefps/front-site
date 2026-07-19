# Frontend Discovey

Este pacote contém somente arquivos públicos. `index.html` fica na raiz, páginas internas ficam em `pages/` e recursos ficam em `assets/`.

## Configuração da API

Edite `assets/js/config.js` antes de publicar:

```js
window.DISCOVEY_CONFIG = Object.freeze({
  apiBaseUrl: 'https://api.seudominio.com'
});
```

O frontend pode ser hospedado em serviços estáticos como Cloudflare Pages, Netlify, Vercel ou hospedagem convencional. A raiz de publicação deve ser esta pasta. Não coloque credenciais do MySQL neste pacote.

Para desenvolvimento local, sirva esta pasta em `http://127.0.0.1:5500` e mantenha a API em `http://127.0.0.1:3000`. Não misture `localhost` com `127.0.0.1`, pois isso impede o envio do cookie da sessão.
