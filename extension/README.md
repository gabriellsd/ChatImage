# Extensão ChatImage (automático no ChatGPT Go)

O site sozinho **não consegue** anexar foto no ChatGPT (bloqueio do navegador + OpenAI).  
Esta extensão roda **dentro** do chatgpt.com e faz o envio automático.

## Instalar (Chrome / Edge)

1. Abra `chrome://extensions` (ou `edge://extensions`)
2. Ative **Modo do desenvolvedor**
3. Clique **Carregar sem compactação**
4. Selecione a pasta:

```
C:\Users\Gabriel\Desktop\ChatImage\extension
```

5. Deixe a extensão **ativada**
6. Abra o ChatGPT e faça login na conta Go
7. Abra o ChatImage (`npm run dev`) e **recarregue** a página
8. O banner deve ficar verde: **Extensão conectada**

## Usar

1. Login no ChatGPT neste mesmo navegador  
2. No ChatImage: foto + efeitos  
3. **Aplicar automático**  
4. A extensão abre/foca o ChatGPT, anexa a foto, cola o prompt e envia  

## Se falhar

- Confirme que está logado no ChatGPT  
- Deixe a tela **Create image** visível  
- Em `chrome://extensions`, clique em **Atualizar** na extensão  
- Recarregue o ChatImage e o chatgpt.com  

O layout do ChatGPT muda com frequência — se os seletores quebrarem, avise para ajustarmos o `content.js`.
