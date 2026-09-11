# ChatImage

App Next.js + extensão Chrome para editar fotos no **ChatGPT Go** com atalhos (`/proshot`, `/identitylock`, …).

## Site publicado

https://gabriellsd.github.io/ChatImage/

## Setup local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Extensão (Chrome)

Para aplicar foto + prompt no ChatGPT em um clique:

1. `chrome://extensions` → modo desenvolvedor
2. Carregar pasta `extension/`
3. Login no ChatGPT no mesmo Chrome
4. No app: foto + efeitos → **Aplicar no ChatGPT**

No iPhone/Safari use **Enviar pro ChatGPT** (compartilhar) ou cole o prompt.

## Arquivos

- `src/` — app Next.js
- `extension/` — extensão Chrome/Edge
- `codigos-chatgpt-imagens.md` — lista de códigos
