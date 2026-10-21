# PRD — Aplicação de Clima

## 1. Visão geral

A Aplicação de Clima é uma página web que permite pesquisar uma cidade e consultar as condições meteorológicas atuais dessa localidade. A experiência deve transformar duas consultas técnicas — geocodificação e clima — em uma única busca simples para o usuário.

O produto será desenvolvido com Vite, TypeScript e APIs nativas do navegador, sem framework de interface. Os dados serão fornecidos pela Open-Meteo.

## 2. Objetivo do produto

Permitir que uma pessoa descubra, de forma rápida e legível, as principais condições meteorológicas atuais de uma cidade:

- temperatura;
- sensação térmica;
- umidade relativa;
- probabilidade de precipitação;
- velocidade e direção do vento;
- condição do tempo;
- indicação de dia ou noite.

### 2.1. Objetivos de experiência

- Oferecer uma busca única, embora a obtenção dos dados dependa de duas requisições.
- Comunicar claramente os estados inicial, carregando, sucesso e nenhum resultado.
- Exibir valores com suas unidades, sem exigir conhecimento meteorológico do usuário.
- Manter a interface funcional em desktop e telas menores.

### 2.2. Fora do escopo

- Previsão para horas ou dias futuros.
- Histórico climático.
- Geolocalização automática do dispositivo.
- Favoritos, histórico de pesquisas ou persistência local.
- Seleção entre várias cidades com o mesmo nome.
- Troca manual de unidades.
- Autenticação ou perfis de usuário.
- Backend próprio, banco de dados ou cache persistente.

## 3. Público e caso de uso principal

O público é qualquer pessoa que queira consultar as condições atuais de uma cidade sem configurar unidades, localização ou conta.

Fluxo principal:

1. O usuário acessa a aplicação e encontra o campo de pesquisa em destaque.
2. Digita o nome de uma cidade e inicia a busca.
3. A aplicação valida o texto e entra no estado de carregamento.
4. A aplicação resolve a cidade em latitude, longitude e fuso horário.
5. Com essas informações, consulta as condições meteorológicas atuais.
6. Se as duas etapas forem bem-sucedidas, exibe o resultado completo.
7. Se qualquer etapa não produzir dados utilizáveis, exibe o estado de nenhum resultado.

## 4. Requisitos funcionais

### RF-01 — Pesquisa por cidade

- A interface deve possuir um campo de texto para o nome da cidade.
- A pesquisa deve poder ser iniciada pelo envio do formulário, tanto pela tecla `Enter` quanto por um botão visível.
- Espaços no início e no fim devem ser removidos antes da validação.
- O valor deve ser enviado à API com codificação segura de URL.
- Campo vazio ou composto apenas por espaços não deve gerar requisição.
- Termos de um caractere não devem gerar requisição, pois a API de geocodificação não retorna resultados para eles.
- O usuário pode informar apenas a cidade ou adicionar país/estado após uma vírgula para reduzir ambiguidades, por exemplo: `Paris, França`.

### RF-02 — Geocodificação

A aplicação deve consultar:

```text
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={NOME_DA_CIDADE}
  &count=1
  &language=pt
  &format=json
```

Do primeiro resultado, deve utilizar:

- `name`;
- `latitude`;
- `longitude`;
- `country_code`;
- `timezone`.

Como `count=1`, a versão inicial assume automaticamente o primeiro e único resultado devolvido pela API. A seleção entre cidades homônimas fica fora do escopo.

### RF-03 — Consulta das condições atuais

Após uma geocodificação válida, a aplicação deve consultar:

```text
GET https://api.open-meteo.com/v1/forecast
  ?latitude={LATITUDE}
  &longitude={LONGITUDE}
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation_probability,weather_code
  &timezone={TIMEZONE}
```

A resposta deve conter e a aplicação deve consumir:

- `current.temperature_2m`;
- `current.relative_humidity_2m`;
- `current.apparent_temperature`;
- `current.is_day`;
- `current.wind_speed_10m`;
- `current.wind_direction_10m`;
- `current.precipitation_probability`;
- `current.weather_code`;
- as unidades correspondentes em `current_units`;
- `current.time` para representar a data/hora local dos dados.

O parâmetro `timezone` deve ser o valor retornado pela geocodificação. Assim, data e hora correspondem à localidade pesquisada, não ao dispositivo do usuário.

### RF-04 — Apresentação da localidade e data

- Exibir o nome normalizado devolvido pela API, não apenas o texto digitado.
- Exibir o código do país ao lado do nome da cidade.
- Exibir o dia atual da localidade em português, derivado de `current.time` e do fuso retornado.
- A apresentação recomendada é dia da semana, dia e mês, sem necessidade de exibir segundos.

### RF-05 — Condição meteorológica

- Traduzir o `weather_code` para uma descrição em português.
- Usar `is_day` para indicar visualmente se a condição é diurna ou noturna.
- Não exibir o código numérico isolado como informação principal; a descrição humana é obrigatória.
- Um código desconhecido deve resultar em `Condição desconhecida`, sem quebrar a interface.

Mapeamento mínimo:

| Código | Descrição em português |
|---:|---|
| 0 | Céu limpo |
| 1 | Predominantemente limpo |
| 2 | Parcialmente nublado |
| 3 | Nublado |
| 45 | Nevoeiro |
| 48 | Nevoeiro com geada |
| 51 | Garoa leve |
| 53 | Garoa moderada |
| 55 | Garoa intensa |
| 56 | Garoa congelante leve |
| 57 | Garoa congelante intensa |
| 61 | Chuva leve |
| 63 | Chuva moderada |
| 65 | Chuva forte |
| 66 | Chuva congelante leve |
| 67 | Chuva congelante forte |
| 71 | Neve leve |
| 73 | Neve moderada |
| 75 | Neve forte |
| 77 | Grãos de neve |
| 80 | Pancadas de chuva leves |
| 81 | Pancadas de chuva moderadas |
| 82 | Pancadas de chuva violentas |
| 85 | Pancadas de neve leves |
| 86 | Pancadas de neve fortes |
| 95 | Trovoada |
| 96 | Trovoada com granizo leve |
| 97 | Trovoada forte |
| 99 | Trovoada com granizo forte |

### RF-06 — Direção do vento

- Exibir o valor em graus com a unidade fornecida pela API.
- Complementar o valor com um ponto cardeal derivado dos graus: N, NE, L, SE, S, SO, O ou NO.
- Normalizar valores para o intervalo de 0° a 359° antes da conversão.

### RF-07 — Estados da interface

A aplicação deve tratar quatro estados mutuamente exclusivos:

1. **Inicial/empty state:** nenhum local foi consultado. Exibir uma orientação curta, como `Pesquise uma cidade para ver o clima atual`.
2. **Carregando:** uma das duas requisições está em andamento. Manter um único estado de loading durante todo o fluxo e indicar `Buscando clima…`.
3. **Sucesso:** os dados válidos da localização e do clima estão disponíveis.
4. **Nenhum resultado:** a localização não existe, a resposta está incompleta ou qualquer uma das requisições falhou. Exibir `Não foi possível encontrar o clima dessa cidade. Verifique o nome e tente novamente.`

Regras adicionais:

- Uma nova busca deve substituir o resultado anterior apenas quando for concluída com sucesso.
- Durante o carregamento, o formulário deve impedir envios duplicados e o botão deve ficar desabilitado.
- Ao concluir com falha, não devem permanecer dados antigos na área de resultado.
- A mensagem de falha deve ser apresentada na própria interface, sem `alert()` do navegador.
- O foco deve permanecer em uma posição previsível; após falha, o campo pode receber foco novamente.

## 5. Requisitos de sistema e qualidade

### 5.1. Compatibilidade

- Aplicação web client-side executada em navegadores modernos com suporte a ES2023, módulos ES e `fetch`.
- Layout responsivo a partir de 320 px de largura.
- Sem dependência de servidor de aplicação para a versão inicial.

### 5.2. Desempenho

- As duas requisições devem ocorrer em sequência, pois a segunda depende das coordenadas e do fuso obtidos na primeira.
- Não devem ser feitas requisições meteorológicas quando a geocodificação falhar ou não retornar resultado válido.
- A página deve evitar mudanças bruscas de layout entre estados.
- Imagens e ícones, se usados, devem ser leves e não bloquear a consulta.

### 5.3. Acessibilidade

- Associar um `label` ao campo de busca, mesmo que ele seja visualmente oculto.
- Usar um formulário semântico e botão do tipo `submit`.
- Manter contraste mínimo WCAG AA entre texto e fundo.
- Exibir foco visível para navegação por teclado.
- Comunicar loading e resultado por uma região com `aria-live="polite"`.
- Marcar ícones decorativos com `aria-hidden="true"`; ícones informativos precisam de nome acessível.
- Não depender somente de cor ou ilustração para comunicar dia/noite, sucesso ou falha.
- Respeitar `prefers-reduced-motion` em animações de loading ou transições.

### 5.4. Confiabilidade e segurança

- Validar os parâmetros antes de chamar cada função de integração.
- Tratar como ausência de resultado: erro HTTP, erro de rede, JSON inválido, `results` vazio ou campos obrigatórios ausentes.
- Usar `encodeURIComponent` ou `URLSearchParams` na construção das consultas.
- Renderizar valores externos como texto, sem interpolá-los em HTML não sanitizado.
- Não incluir chave de API, pois os endpoints públicos definidos não a exigem.
- Não coletar nem persistir o termo pesquisado ou dados do usuário.

## 6. Arquitetura técnica

### 6.1. Stack

- Vite 8;
- TypeScript 6 conforme o `tsconfig.json` atual do projeto;
- HTML e CSS;
- API `fetch` do navegador;
- sem framework de UI e sem biblioteca obrigatória de estado.

#### Preferências de TypeScript

- Usar declarações `type` em vez de `interface` na criação de tipos do projeto.

### 6.2. Organização sugerida

```text
src/
├── main.ts                 # inicialização e coordenação da interface
├── style.css               # estilos globais e responsivos
├── services/
│   └── openMeteo.ts        # todas as chamadas à Open-Meteo
├── types/
│   └── weather.ts          # contratos usados pela aplicação
└── utils/
    ├── weatherCode.ts      # tradução dos códigos WMO
    ├── windDirection.ts    # graus para ponto cardeal
    └── formatDate.ts       # formatação no fuso da localidade
```

O nome exato das pastas pode variar, mas a integração da Open-Meteo deve permanecer isolada da manipulação do DOM.

### 6.3. Contratos internos

```ts
type LocationData = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

type CurrentWeather = {
  time: string
  temperature: number
  temperatureUnit: string
  relativeHumidity: number
  relativeHumidityUnit: string
  apparentTemperature: number
  apparentTemperatureUnit: string
  isDay: boolean
  windSpeed: number
  windSpeedUnit: string
  windDirection: number
  windDirectionUnit: string
  precipitationProbability: number
  precipitationProbabilityUnit: string
  weatherCode: number
}

type WeatherSearchResult = {
  location: LocationData
  weather: CurrentWeather
}
```

### 6.4. Serviço Open-Meteo

O arquivo de integração deve expor funções equivalentes a:

```ts
findLocation(city: string): Promise<LocationData | null>
getCurrentWeather(location: LocationData): Promise<CurrentWeather | null>
searchWeather(city: string): Promise<WeatherSearchResult | null>
```

Responsabilidades:

- `findLocation` valida o termo, executa a geocodificação e normaliza o primeiro resultado.
- `getCurrentWeather` valida latitude, longitude e timezone, consulta o clima e combina `current` com `current_units`.
- `searchWeather` coordena as duas chamadas e devolve um único resultado para a camada de interface.
- Todas retornam `null` quando os parâmetros ou dados obrigatórios estiverem ausentes, conforme a regra de negócio.
- Erros de transporte ou parsing devem ser capturados na fronteira do serviço; a UI não deve depender do formato bruto de erro da API.

### 6.5. Validação dos dados

Não basta testar a existência dos objetos. Antes de considerar a consulta bem-sucedida:

- strings obrigatórias devem ser não vazias;
- latitude e longitude devem ser números finitos;
- `is_day` deve ser convertido de `0 | 1` para `boolean`;
- medições e `weather_code` devem ser números finitos;
- as unidades usadas na tela devem existir em `current_units`.

Valores numéricos iguais a zero são válidos e não podem ser confundidos com ausência de dados.

### 6.6. Controle de concorrência

Embora o botão fique desabilitado durante o loading, a implementação deve evitar que uma resposta antiga sobrescreva uma busca mais recente. A abordagem recomendada é manter um `AbortController` para cancelar o fluxo anterior antes de iniciar outro.

## 7. Instruções visuais

### 7.1. Estrutura da página

- O fundo da página inteira deve ser cinza-escuro.
- O conteúdo deve ficar centralizado horizontalmente, com largura máxima de 800 px e respiro lateral mínimo de 16 px em telas pequenas.
- A área superior contém apenas o formulário de busca e não possui fundo próprio.
- Abaixo da busca, sidebar e conteúdo principal formam um único painel branco com cantos arredondados.
- Em desktop, o painel deve usar duas colunas: sidebar à esquerda e conteúdo principal à direita.
- Em telas estreitas, as áreas devem ser empilhadas, com a sidebar acima da grade de detalhes.

Wireframe de referência:

```text
┌──────────────────────────────────────────────────────────┐
│              [ Pesquise uma cidade... ] [Buscar]         │
│                                                          │
│  ┌──────────────────┬─────────────────────────────────┐   │
│  │ 23,9 °C          │ Umidade        Sensação térmica │   │
│  │ Rio de Janeiro BR│ 67%            26,2 °C          │   │
│  │ Quarta, 21 out.  │                                 │   │
│  │ Dia              │ Precipitação   Vento            │   │
│  │ Nublado          │ 73%            10,3 km/h · SE   │   │
│  └──────────────────┴─────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 7.2. Sidebar

- Deve ter maior ênfase visual que os demais dados.
- A temperatura atual é o elemento tipográfico de maior tamanho.
- Logo abaixo, exibir `Cidade, PAÍS`.
- Em seguida, data local, indicação `Dia` ou `Noite` e descrição do `weather_code`.
- A condição do tempo pode ser acompanhada de um ícone coerente, mas o texto é obrigatório.
- A indicação dia/noite pode influenciar uma ilustração ou cor de destaque sem alterar o fundo branco exigido para o painel.

### 7.3. Área principal

Organizar quatro métricas em cards ou células consistentes:

- Umidade relativa;
- Sensação térmica;
- Probabilidade de precipitação;
- Vento, combinando velocidade e direção.

Cada métrica deve ter:

- rótulo curto;
- valor em destaque;
- unidade ao lado do valor;
- ícone opcional e decorativo;
- alinhamento e espaçamento consistentes.

No desktop, usar preferencialmente uma grade 2 × 2. No mobile, usar uma coluna quando não houver largura suficiente para leitura confortável.

### 7.4. Busca

- Campo e botão devem formar um conjunto visual único ou claramente relacionado.
- O placeholder pode ser `Digite o nome da cidade`.
- O botão deve ter o texto `Buscar` e estado desabilitado perceptível.
- O controle precisa ser grande o suficiente para toque, com altura mínima recomendada de 44 px.

### 7.5. Estados visuais

- **Empty state:** ocupar o painel branco e centralizar mensagem e ícone meteorológico neutro.
- **Loading:** preservar as dimensões do painel; usar spinner discreto ou skeleton junto da mensagem de carregamento.
- **Nenhum resultado:** usar mensagem objetiva e ícone neutro; não empregar aparência de erro crítico.
- **Sucesso:** apresentar todos os dados ao mesmo tempo; valores ausentes nunca devem aparecer como `undefined`, `null` ou `NaN`.

### 7.6. Direção de estilo

- Linguagem visual limpa, contemporânea e de baixo ruído.
- Fundo externo em cinza-escuro; painel branco; textos principais em cinza quase preto.
- Usar uma cor de destaque fria, como azul, para o botão, foco e detalhes meteorológicos.
- Cantos do painel e cards devem compartilhar a mesma família de raios.
- Sombras devem ser discretas e usadas apenas para separar o painel do fundo.
- Evitar gradientes excessivos, efeitos de vidro e animações ornamentais.
- Usar fonte de sistema legível; não há necessidade de carregar fonte externa.

## 8. Critérios de aceite

### CA-01 — Busca bem-sucedida

**Dado** um nome de cidade válido  
**Quando** o usuário enviar o formulário  
**Então** a aplicação deve mostrar um único loading, executar geocodificação e clima em sequência e apresentar todas as informações obrigatórias com unidades.

### CA-02 — Cidade inexistente

**Dado** um termo sem resultado de geocodificação  
**Quando** a busca terminar  
**Então** a aplicação não deve chamar o endpoint de clima e deve mostrar o estado de nenhum resultado.

### CA-03 — Clima indisponível

**Dado** que a cidade foi encontrada  
**Quando** a consulta meteorológica falhar ou retornar dados incompletos  
**Então** a aplicação deve mostrar o mesmo estado de nenhum resultado e remover qualquer resultado anterior.

### CA-04 — Entrada inválida

**Dado** um campo vazio, apenas com espaços ou com um único caractere  
**Quando** o formulário for enviado  
**Então** nenhuma requisição deve ser realizada e o campo deve indicar que uma cidade válida é necessária.

### CA-05 — Unidades e zeros

**Dado** que qualquer medição válida seja zero  
**Quando** o resultado for renderizado  
**Então** o valor `0` deve ser exibido com a unidade correspondente e não tratado como ausente.

### CA-06 — Código meteorológico

**Dado** um código WMO conhecido  
**Quando** o resultado for exibido  
**Então** a descrição correta em português deve aparecer; códigos desconhecidos devem exibir `Condição desconhecida`.

### CA-07 — Responsividade e acesso por teclado

**Dado** um viewport a partir de 320 px ou navegação apenas por teclado  
**Quando** o usuário operar a busca e ler o resultado  
**Então** não deve haver rolagem horizontal, conteúdo cortado ou perda de foco visível.

### CA-08 — Qualidade de implementação

- `npm run build` deve concluir sem erros de TypeScript ou Vite.
- As funções de integração devem estar isoladas em um módulo da Open-Meteo.
- Não devem existir acessos diretos aos endpoints fora desse módulo.
- Os estados inicial, loading, sucesso e nenhum resultado devem ser verificáveis manualmente.

## 9. Testes recomendados

- Cidade brasileira com acento: `São Paulo`.
- Cidade internacional: `Lisboa`.
- Termo qualificado: `Paris, França`.
- Cidade inexistente.
- Campo vazio, espaços e um único caractere.
- Resposta de geocodificação sem `results`.
- Resposta meteorológica sem uma unidade obrigatória.
- Falha de rede em cada uma das duas requisições.
- Valores iguais a zero para temperatura, vento ou precipitação.
- Código WMO não mapeado.
- Duas buscas iniciadas rapidamente, validando que a resposta antiga não substitui a nova.
- Navegação por teclado e leitura do status por tecnologia assistiva.
- Layout em 320 px, tablet e desktop.

## 10. Referências técnicas

- [Documentação da Geocoding API da Open-Meteo](https://open-meteo.com/en/docs/geocoding-api)
- [Documentação da Weather Forecast API da Open-Meteo](https://open-meteo.com/en/docs)

