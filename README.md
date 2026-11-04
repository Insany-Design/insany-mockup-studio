# Insany Mockup Studio

Editor estático sem dependências de build. Inicie `python3 -m http.server 4173 --directory dist` e abra http://localhost:4173.

13 mockups nativos 2304×3072. A prévia usa WebGL a 768×1024; a exportação usa o mesmo shader no tamanho declarado no catálogo. Canvas menor nunca é ampliado para exportar. PNG sem perdas ou JPEG qualidade 0,98.

Upload e composição acontecem no navegador; o arquivo enviado não é transmitido. Ajustes por modelo persistem localmente; arquivos enviados duram apenas a sessão. Restaurar devolve a arte original e os ajustes padrão. Duplo clique num slider restaura só aquele controle.

O corpo recebe uma tonalização via máscara de geometria. Brilho, contraste, saturação e temperatura são ajustes de pós-produção separados para tela/cena. Vidro é uma aproximação estática ajustável; não há relighting físico nem nova geometria no navegador.

Ativos derivados da coleção Insany Revision05. Fontes Blender preservadas. Modelo 07 não incluído por existir apenas prévia aprovada para separação do lote final. Fontes e QA estão registrados no task-spec e na pasta qa do projeto pai.
