# Tarefas de implementação — Aplicação de Clima

Este arquivo transforma o [PRD](prd.md) em uma fila progressiva de implementação. O PRD é a fonte de verdade para requisitos, contratos, textos, regras visuais e critérios de aceite; este documento registra apenas a divisão e a ordem do trabalho.

## Regras de execução para agentes

1. Executar somente a primeira tarefa ainda marcada com `[ ]`.
2. Ler as seções do PRD indicadas na tarefa antes de alterar o código.
3. Preservar tudo o que foi implementado nas tarefas anteriores.
4. Não antecipar tarefas posteriores nem adicionar itens fora do escopo do PRD.
5. Executar o critério de aprovação da tarefa.
6. Marcar a tarefa com `[x]` somente após o critério ser integralmente atendido.
7. Se o critério não puder ser atendido, manter `[ ]` e registrar o impedimento.
8. Quando houver código compilável, executar `npm run build` antes de concluir.

## Fase 1 — Fundação

### [x] T01 — Limpar o projeto inicial do Vite

**Referência:** PRD 6.1 e CA-08.

**Escopo:** remover os exemplos do Vite, imports, imagens, contador e estilos alheios ao produto. Manter o `#app`, a configuração e somente recursos necessários.

**Critério de aprovação:** nenhum conteúdo demonstrativo do Vite aparece; não existem imports quebrados; e `npm run build` termina com código de saída zero.

### [x] T02 — Criar a estrutura de módulos

**Referência:** PRD 6.2.

**Escopo:** criar os módulos de serviço, tipos e utilitários previstos no PRD, sem implementar ainda a interface final.

**Critério de aprovação:** todos os módulos de 6.2 existem, podem ser importados pelo TypeScript e o build passa.

### [x] T03 — Definir tipos do domínio e das respostas externas

**Referência:** PRD 6.3 e 6.5.

**Escopo:** definir `LocationData`, `CurrentWeather`, `WeatherSearchResult` e os tipos mínimos das respostas brutas da Open-Meteo, sem usar `any`.

**Critério de aprovação:** os três contratos contêm todos os campos do PRD; `isDay` é booleano internamente; as respostas externas possuem tipos próprios; e o build passa.

## Fase 2 — Regras puras do domínio

### [x] T04 — Interpretar o código meteorológico

**Referência:** PRD RF-05 e CA-06.

**Escopo:** implementar uma função pura que traduza códigos WMO conforme o mapeamento do PRD e trate códigos desconhecidos.

**Critério de aprovação:** cada código de RF-05 retorna sua descrição em português; código não mapeado retorna `Condição desconhecida`; e o build passa.

### [x] T05 — Converter a direção do vento

**Referência:** PRD RF-06.

**Escopo:** implementar uma função pura que normalize graus e retorne um dos oito pontos cardeais definidos no PRD.

**Critério de aprovação:** 0°, 45°, 90°, 135°, 180°, 225°, 270° e 315° retornam respectivamente N, NE, L, SE, S, SO, O e NO; valores fora de 0–359 são normalizados; e o build passa.

### [x] T06 — Formatar a data local

**Referência:** PRD RF-04.

**Escopo:** implementar uma função que apresente `current.time` em português com dia da semana, dia e mês, respeitando a localidade pesquisada.

**Critério de aprovação:** uma data válida é formatada conforme RF-04; uma data inválida não quebra a aplicação; e o resultado não muda indevidamente conforme o fuso do dispositivo.

## Fase 3 — Integração com a Open-Meteo

### [x] T07 — Validar dados externos

**Referência:** PRD 5.4 e 6.5.

**Escopo:** criar verificações reutilizáveis para strings, números finitos, unidades e objetos da API. Valores numéricos iguais a zero devem ser aceitos.

**Critério de aprovação:** as validações rejeitam campos ausentes, vazios, `NaN` e tipos incorretos; aceitam todos os campos válidos, inclusive zero; e o build passa.

### [x] T08 — Implementar `findLocation`

**Referência:** PRD RF-01, RF-02, 5.4 e 6.4.

**Escopo:** implementar a geocodificação em `openMeteo.ts`, incluindo validação, URL segura, normalização e suporte a `AbortSignal`.

**Critério de aprovação:** cidade válida retorna `LocationData`; entrada inválida não gera requisição; resultado vazio, dados incompletos, erro HTTP, de rede ou JSON inválido retornam `null`; e a URL contém os parâmetros de RF-02.

### [x] T09 — Implementar `getCurrentWeather`

**Referência:** PRD RF-03, 5.4, 6.4 e 6.5.

**Escopo:** implementar a consulta do clima, combinar `current` com `current_units`, converter `is_day` e aceitar `AbortSignal`.

**Critério de aprovação:** resposta válida retorna `CurrentWeather` completo com unidades; zeros são preservados; parâmetros ou respostas incompletas retornam `null`; e a URL contém todas as variáveis de RF-03.

### [x] T10 — Implementar `searchWeather`

**Referência:** PRD 3, RF-07 e 6.4.

**Escopo:** coordenar geocodificação e clima como uma operação única e sequencial.

**Critério de aprovação:** o clima só é consultado após geocodificação válida; sucesso retorna `WeatherSearchResult`; falhas retornam `null`; cancelamentos são distinguíveis; e nenhum endpoint é acessado fora de `openMeteo.ts`.

## Fase 4 — Interface funcional

### [x] T11 — Criar a estrutura semântica e o formulário

**Referência:** PRD RF-01, 5.3 e 7.4.

**Escopo:** criar a página, o formulário com label, campo e botão, e uma região de resultado anunciável.

**Critério de aprovação:** o formulário funciona pelo botão e por `Enter`; o campo possui label; o botão é `submit`; a região usa `aria-live="polite"`; e os controles são alcançáveis por teclado.

### [x] T12 — Implementar o empty state

**Referência:** PRD RF-07 e 7.5.

**Escopo:** renderizar o estado inicial dentro do painel usando a orientação definida no PRD, sem dados fictícios.

**Critério de aprovação:** no carregamento inicial somente o formulário e o empty state aparecem; nenhum valor meteorológico, `undefined`, `null` ou `NaN` é exibido.

### [x] T13 — Validar a entrada do formulário

**Referência:** PRD RF-01, CA-04 e 5.3.

**Escopo:** validar o termo no envio, mostrar orientação próxima ao campo e aplicar os atributos acessíveis.

**Critério de aprovação:** valor vazio, espaços ou um caractere não chama `searchWeather`; o campo recebe `aria-invalid` e mensagem associada; um termo válido limpa o erro e inicia o fluxo.

### [x] T14 — Implementar o estado de carregamento

**Referência:** PRD RF-07, 7.5 e CA-01.

**Escopo:** apresentar um único loading durante as duas requisições, impedir envio duplicado e comunicar o estado.

**Critério de aprovação:** do envio à resolução aparece `Buscando clima…`; o botão permanece desabilitado; a região indica `aria-busy`; não há intervalo entre as requisições; e movimento reduzido é respeitado.

### [x] T15 — Renderizar o resultado completo

**Referência:** PRD RF-03 a RF-06, 7.2, 7.3, CA-01, CA-05 e CA-06.

**Escopo:** criar a renderização de sucesso com sidebar e quatro métricas, usando os utilitários já implementados e tratando dados externos como texto.

**Critério de aprovação:** um resultado válido exibe todos os campos e unidades exigidos, nome normalizado, data em português, descrição WMO, dia/noite e vento em graus mais ponto cardeal; nenhum valor técnico inválido aparece.

### [x] T16 — Implementar o estado de nenhum resultado

**Referência:** PRD RF-07, CA-02 e CA-03.

**Escopo:** apresentar a mensagem unificada para cidade inexistente, erro de rede ou dados inválidos, sem `alert()`.

**Critério de aprovação:** retorno `null` remove o resultado anterior, exibe exatamente a mensagem de RF-07, reabilita o formulário e deixa o foco em posição previsível.

### [x] T17 — Integrar o fluxo da interface

**Referência:** PRD 3, RF-07 e CA-01 a CA-04.

**Escopo:** conectar envio, validação, loading, serviço, sucesso e nenhum resultado em um controlador.

**Critério de aprovação:** cada envio válido percorre apenas `inicial → loading → sucesso` ou `inicial/resultado → loading → nenhum resultado`; estados não aparecem simultaneamente; e o formulário sempre é restaurado ao final.

### [x] T18 — Proteger buscas concorrentes

**Referência:** PRD 6.6.

**Escopo:** usar `AbortController` ou controle equivalente para que somente a busca mais recente altere a interface.

**Critério de aprovação:** ao iniciar duas buscas rapidamente, a primeira é cancelada ou ignorada, apenas a segunda atualiza a tela e o cancelamento não exibe mensagem de falha.

## Fase 5 — Apresentação visual

### [ ] T19 — Implementar a base visual

**Referência:** PRD 7.1 e 7.6.

**Escopo:** definir tokens CSS e aplicar fundo, largura, centralização, tipografia, cores, raios e sombra.

**Critério de aprovação:** a página tem fundo cinza-escuro; conteúdo centralizado até 800 px; painel branco e arredondado; contraste WCAG AA; e nenhum estilo demonstrativo do Vite.

### [ ] T20 — Estilizar busca e estados de feedback

**Referência:** PRD 7.4, 7.5 e 5.3.

**Escopo:** finalizar formulário, empty state, loading, validação e nenhum resultado, incluindo foco e estado desabilitado.

**Critério de aprovação:** controles têm ao menos 44 px; hover, `focus-visible` e disabled são perceptíveis; estados são reconhecíveis; e o painel não muda bruscamente de dimensão.

### [ ] T21 — Estilizar o resultado em desktop

**Referência:** PRD 7.1, 7.2 e 7.3.

**Escopo:** implementar painel em duas colunas, hierarquia da sidebar e grade 2 × 2 das métricas.

**Critério de aprovação:** em desktop, sidebar e área principal ficam lado a lado no mesmo painel; temperatura é o maior destaque; métricas formam grade 2 × 2; e o layout corresponde ao wireframe do PRD.

### [ ] T22 — Implementar responsividade

**Referência:** PRD 5.1, 7.1, 7.3 e CA-07.

**Escopo:** adaptar busca, sidebar e métricas para telas estreitas, mantendo legibilidade e toque.

**Critério de aprovação:** em 320 px, tablet e desktop não há rolagem horizontal, sobreposição ou corte; em telas estreitas a sidebar fica acima das métricas; e a grade passa para uma coluna quando necessário.

## Fase 6 — Validação da entrega

### [ ] T23 — Validar acessibilidade

**Referência:** PRD 5.3 e CA-07.

**Escopo:** revisar o fluxo com teclado e os requisitos de semântica, foco, anúncios, contraste e movimento reduzido.

**Critério de aprovação:** todo o fluxo funciona apenas com teclado; foco é visível; mensagens e loading são anunciáveis; ícones são acessíveis; informações não dependem só de cor; e não há falha evidente de contraste WCAG AA.

### [ ] T24 — Validar os cenários funcionais

**Referência:** PRD 9 e CA-01 a CA-07.

**Escopo:** executar todos os cenários de teste da seção 9 e corrigir divergências.

**Critério de aprovação:** todos os cenários da seção 9 foram executados e produzem o resultado de seu critério de aceite; nenhuma falha conhecida permanece aberta.

### [ ] T25 — Fazer a revisão técnica final

**Referência:** PRD CA-08.

**Escopo:** revisar build, organização, resíduos de desenvolvimento, segurança básica e aderência ao PRD.

**Critério de aprovação:** `npm run build` termina com código zero; não há imports ou exemplos sem uso, `any`, logs de depuração ou mensagens técnicas na UI; endpoints ficam somente no serviço; nenhum segredo foi incluído; e CA-01 a CA-08 estão atendidos.

## Marcos

| Marco | Tarefas | Entrega verificável |
|---|---|---|
| Fundação | T01–T06 | Projeto limpo, contratos e utilitários prontos |
| Integração | T07–T10 | Fluxo de dados isolado em um único serviço |
| Interface funcional | T11–T18 | Pesquisa e quatro estados funcionando |
| Interface visual | T19–T22 | Layout final responsivo |
| Produto aprovado | T23–T25 | Acessibilidade, cenários e build validados |
