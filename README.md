# ChatImage

Site + extensão para editar fotos no **ChatGPT Go** com seus códigos (`/proshot`, `/identitylock`, …) **em um clique**.

## Por que precisa da extensão?

Sem API paga, o navegador/OpenAI **não deixam** um site anexar imagem no ChatGPT.  
A extensão é o jeito automático legítimo: ela age **dentro** do chatgpt.com.

## Setup rápido

### 1. Site

```bash
npm install
npm run dev
```

### 2. Extensão

Siga: [`extension/README.md`](extension/README.md)

### 3. Fluxo

1. Login no ChatGPT Go (mesmo Chrome)  
2. ChatImage → foto + efeitos → **Aplicar automático**  

## Arquivos

- `src/` — interface do site  
- `extension/` — extensão Chrome/Edge  
- `codigos-chatgpt-imagens.md` — lista de códigos  
