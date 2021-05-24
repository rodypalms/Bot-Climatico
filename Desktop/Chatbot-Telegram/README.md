# ChatBot Climático

## Chatbot do telegram que responde no chat, caso "ouça" algum nome de cidade, a resposta de uma busca no WeatherAPI, através de um método GET e possui uma API Externa para log dos dados enviados como objeto na mensagem do telegram.

🚧  Em Construção...  🚧

### Pré-Requisitos

Antes de começar, você vai precisar instalar dependências e executar algumas ações para obter acesso aos dados utilizados pelo bot , são elas:
| NODE.JS(https://nodejs.org/en/) | Express.JS | telegram-node-bot-api | Telegram Token | WeatherAPI Key

#### O NODE.JS você pode instalar pelo site especificado acima

#### O Express.JS você deverá executar os comandos no terminal: 

-cd (para ingressar através de um diretório especificado, até alcançar o diretório do projeto. ex: cd ./Desktop/MeuProjeto)
-Já no diretório do projeto, execute os comandos: - npm install express
                                                  - npm install node-telegram-bot-api

#### Agora iremos Buscar a Chave(Key) e Token necessários para colocar no nosso arquivo .env 

Através do app Telegram, busque por @BotFather, este é o gerenciador de bots da aplicação principal, que nos brindará um token para estabelecermos uma conexão API segura desde nossas aplicações com o Telegram. (Ele é bem explicativo, explicará todos os comandos em inglês)

Agora vamos até o "site www.weatherapi.com", cadastre-se e receba a API KEY

Com o Token e a Key(chave) "em mãos" coloque-os, respectivamente, no arquivo .env EM SUAS CORRESPONDÊNTES VARIÁVEIS "TOKEN_ENV" e "KEY_ENV"

### Rodando o Servidor

Abra seu terminal e digite os comandos:
* primeiro, vamos entrar no diretório do projeto
-cd (para ingressar num diretório especificado, até alcançar o diretório do projeto. ex: cd ./Desktop/MeuProjeto)
* agora abra mais dois terminais neste mesmo endereço e digite respectivamente, em cada um deles:
-1º ngrok http 3000

* depois disso, vá ao terminal que você digitou "ngrok http 3000" e pegue a chave do http, exemplo:"http://1234567891011.ngrok.io" (sem aspas) e coloque também no arquivo .env, desta vez na última variável a "APIEXT_ENV"

#### OBS: toda vez que executarmos a aplicação deveremos obter o endereço ngrok, pois o mesmo, por ser versão gratuita, sempre altera a chave.

-2º node bot.js
-3º node api.js

## Tecnologias Utilizadas: 

[NODE.JS](https://nodejs.org/en)
[Express.JS](https://expressjs.com)
[NGROK](https://ngrok.com)