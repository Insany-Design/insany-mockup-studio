# Insany Mockup Studio

Editor online de mockups Insany com upload da imagem da tela, perspectiva, ajustes de cor e exportação na resolução nativa.

[Abrir o editor](https://insany-mockup-studio.insany-team-1573.chatgpt.site) — acesso privado com ChatGPT.

## Rodar localmente

Requisitos: Python 3 e navegador com WebGL. Não há dependências de build.

```sh
git clone git@github.com:gilberto-insany/insany-mockup-studio.git
cd insany-mockup-studio
python3 -m http.server 4173 --directory dist
```

Abra http://localhost:4173. Sirva a pasta por HTTP; abrir o HTML diretamente pelo sistema de arquivos não carrega o catálogo.

## Publicar na Vercel

Conecte o repositório `Insany-Design/insany-mockup-studio` e mantenha **Root Directory** na raiz do repositório. O `vercel.json` define **Framework Preset: Other**, pula a instalação e o build e publica somente a pasta `dist/`.

O editor já está pronto em `dist/index.html`, com JavaScript, estilos e ativos locais. Não há pacotes para instalar nem arquivos para compilar. Sem essa configuração, a Vercel pode publicar a raiz do repositório, onde não há `index.html`, e retornar 404 mesmo com o deploy concluído.

Depois de integrar a configuração, faça um novo deploy do commit atualizado. A configuração de publicação no ChatGPT Sites continua em `.openai/hosting.json`.

Referência: [configuração de projetos da Vercel](https://vercel.com/docs/project-configuration/vercel-json).

## Recursos

- 13 mockups com camadas nativas de 2304 × 3072 pixels.
- Upload PNG, JPEG ou WebP, com encaixe completo ou preenchimento, zoom e posição.
- Brilho, contraste, saturação e temperatura separados para tela e cena.
- Tonalização do metal com máscara de geometria e intensidade ajustável do reflexo do vidro.
- PNG sem perdas ou JPEG com qualidade 98%, sempre no tamanho nativo declarado no catálogo.

A prévia usa WebGL em 768 × 1024 pixels; a exportação executa o mesmo shader diretamente na resolução nativa. A prévia menor não é ampliada para gerar o arquivo final. O navegador avisa quando a arte enviada tem poucos pixels para a área de aplicação.

## Arquivos e privacidade

Upload e composição acontecem no navegador; o arquivo enviado não é transmitido ao servidor. Ajustes por modelo persistem no armazenamento local. As imagens enviadas duram apenas a sessão. Restaurar devolve a arte original e os ajustes padrão. Duplo clique em um slider restaura apenas aquele controle.

## Estrutura

```text
dist/
  index.html        Interface
  style.css         Estilos responsivos
  app.js            Controles, upload e exportação
  renderer.js       Composição WebGL e homografia
  assets/
    catalog.json    Modelos e coordenadas de projeção
    01/ … 14/       Base, tela, máscaras, vidro e oclusão
.openai/hosting.json Configuração da publicação existente em Sites
```

Os ativos derivam da coleção Insany Revision05. O modelo 07 não está incluído no catálogo final. Este repositório contém o editor e seus ativos; os arquivos de modelagem Blender são mantidos separadamente.

Os controles de cor atuam em pós-produção. O vidro é uma aproximação estática ajustável; alterações físicas de iluminação e geometria exigem novo render no Blender.

Código e ativos pertencem à Insany. Nenhuma licença pública de redistribuição é concedida por este repositório.
