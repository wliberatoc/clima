# Projeto: Clima 

Este rojeto vai pegar a cidade e baseado nisso, consultar o clima daquela região, exibindo as principais informações de clima, temperatura, humidade e etc

###Aspectos Técnicos

O projeto vai ser feito em Vite + Vanilla + TS


### Informações da API que será usada no projeto:
Ele vai usar a API OpenMeteo, com os seguintes endpoints:

#### Para pegar a latitude, longitude e timezone, baseado no nome da cidade:
https//:geocoding-api.open-meteo.com/v1/search?name{NOME_DA_CIDADE}&count=1&language=pt&froamt=json

{NOME_DA_CIDADE} = Nome da cidade que o usuário digitou

Exemplo de resposta:
{
  "results": [
    {
      "id": 3451190,
      "name": "Rio de Janeiro",
      "latitude": -22.90642,
      "longitude": -43.18223,
      "elevation": 12,
      "feature_code": "PPLA",
      "country_code": "BR",
      "admin1_id": 3451189,
      "admin2_id": 6322060,
      "timezone": "America/Sao_Paulo",
      "population": 6747815,
      "country_id": 3469034,
      "country": "Brasil",
      "admin1": "Rio de Janeiro",
      "admin2": "Rio de Janeiro"
    }
  ],
  "generationtime_ms": 1.0522604
}

Informações que PRECISAMOS:
- name
- latitude
- longitude
- country_code
- timezone

#### Para pegar as informações de clima:
https//:api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code&timezone={TIMEZONE}

{LATITUDE} = Latitude
{LONGITUDE} = Longitude
{TIMEZONE} = Timezone

Exemplo de resposta:


####Informação inportante:
Teremos um arquivo com as funções do OpenMeteo, para que o projeto não faça requisção direta a API mas sim use as funções desse arquivo.

Fluxo de pesquisa para receber o nome da cidade e pegar as informações de clima:
- O usuário digita o nome da cidade 
- O projeto pega o nome e usa o OpenMeteo para pegar a latitude, longitude e timezone, o projeto usas essas iformações para fazer a requisição e pegar as informações do cliema dessa localização.
- Caso não ache as informações da cidade, se compotar como se não tivesse achado nada. 
- Caso ache as informações da cidade mas não as de clima, se compotar como se não tivesse achado nada.

A busca envolve as 2 requisições (buscar latitude/longitude/timezone + buscar clima), mas para o usuário é uma só, com loading.

As funções do OpenMeteo deevm verificar se os parâmetros vieram, caso contrário, age como se não tivesse vindo.