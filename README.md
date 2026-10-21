<div align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="Logo CL" />

  # Clima

  Consulte as condições meteorológicas atuais de qualquer cidade em uma interface simples, responsiva e acessível.

  [![Deploy GitHub Pages](https://github.com/wliberatoc/clima/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/wliberatoc/clima/actions/workflows/deploy-pages.yml)

  [Acessar aplicação](https://wliberatoc.github.io/clima/)
</div>

## Sobre o projeto

Clima é uma aplicação web que transforma as consultas de geocodificação e previsão da [Open-Meteo](https://open-meteo.com/) em uma única pesquisa por cidade. Não exige cadastro, localização do dispositivo nem chave de API.

Ao pesquisar uma cidade, a aplicação apresenta:

- temperatura atual e sensação térmica;
- umidade relativa;
- probabilidade de precipitação;
- velocidade, graus e direção cardinal do vento;
- condição meteorológica em português;
- ícone correspondente ao tempo, como sol, nuvens, chuva ou tempestade;
- indicação de dia ou noite;
- nome, país e data local da cidade pesquisada.

## Funcionalidades

- Pesquisa por cidade, inclusive com país ou estado para reduzir ambiguidades.
- Validação do termo antes de realizar requisições.
- Estados visuais para início, carregamento, sucesso e resultado não encontrado.
- Cancelamento de buscas anteriores para evitar resultados fora de ordem.
- Tradução dos códigos meteorológicos WMO para português.
- Layout responsivo para dispositivos a partir de 320 px.
- Navegação por teclado, foco visível e comunicação por `aria-live`.
- Respeito à preferência de movimento reduzido do sistema.
- Ícones SVG leves e sem dependências externas.

## Tecnologias

- [Vite 8](https://vite.dev/)
- TypeScript 6
- HTML e CSS
- API `fetch` do navegador
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)
- Node.js Test Runner
- GitHub Actions e GitHub Pages

O projeto não utiliza framework de interface, backend próprio, banco de dados ou chave de API.

## Como executar localmente

### Requisitos

- Node.js 24
- npm

### Instalação

```bash
git clone https://github.com/wliberatoc/clima.git
cd clima
npm install
npm run dev
```

O Vite mostrará no terminal o endereço local da aplicação.

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm test` | Executa os testes automatizados locais. |
| `npm run test:live` | Testa a integração real com a Open-Meteo. Requer acesso à internet. |
| `npm run build` | Valida o TypeScript e gera a versão de produção em `dist/`. |
| `npm run preview` | Serve localmente o conteúdo gerado pelo build. |

## Estrutura principal

```text
clima/
├── .docs/                 # PRD e planejamento das tarefas
├── .github/workflows/     # CI/CD do GitHub Pages
├── public/                # Favicon e arquivos públicos
├── src/
│   ├── services/          # Integração com a Open-Meteo
│   ├── types/             # Contratos TypeScript
│   ├── ui/                # Interface, controle de busca e ícones
│   ├── utils/             # Validação, data, vento e códigos WMO
│   ├── main.ts            # Inicialização da aplicação
│   └── style.css          # Estilos globais e responsivos
└── tests/                 # Testes automatizados
```

## Testes

A suíte cobre, entre outros pontos:

- validação das entradas e respostas externas;
- tradução dos códigos WMO;
- conversão da direção do vento;
- formatação da data da localidade;
- concorrência e cancelamento de buscas;
- estados da interface;
- acessibilidade e contraste;
- responsividade e qualidade do código;
- integração opcional com a API real.

Execute os testes locais com:

```bash
npm test
```

## Deploy

O deploy é realizado automaticamente pelo workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml). A cada push na branch `main`, o GitHub Actions:

1. instala as dependências com `npm ci`;
2. executa os testes;
3. gera o build de produção;
4. envia o diretório `dist` como artefato;
5. publica a aplicação no GitHub Pages.

A configuração do Vite utiliza `/clima/` como caminho-base para que os arquivos estáticos funcionem corretamente no endereço do GitHub Pages.

## Documentação

- [PRD do produto](.docs/prd.md)
- [Plano de implementação](.docs/tasks.md)

## Licença

Este projeto ainda não possui uma licença definida.
