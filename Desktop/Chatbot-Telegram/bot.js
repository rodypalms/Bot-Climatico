'use strict'

const http = require('http')
const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv/config');


// Tokens do Telegram e do WeatherAPI
const token_bot = process.env.TOKEN_ENV;
const token_weather = process.env.KEY_ENV;

// URL da api externa para o webook
const url_api_externa = process.env.APIEXT_ENV;

// Instanciar o bot
const bot = new TelegramBot(token_bot, { polling: true });

// Listener de mensagens do Telegram.
bot.on('message', (msg) => {
  let chatId = msg.chat.id;
  let pessoa = msg.chat.first_name
  let query = msg.text
  let weatherAPI = 'http://api.weatherapi.com/v1/current.json?key='+token_weather+'&q=' + query + '&aqi=no'

  // Caso a msg inicial for /start
  if (query == '/start'){
    let textoFinal = `Olá ${pessoa}! Seja bem vindo ao seu bot de pesquisa do clima da sua cidade. Me envie o nome da cidade que procura, exemplo "São Paulo" (sem as aspas), que eu busco para você. ;)`
    bot.sendMessage(chatId, textoFinal)
    return false;
  }

  // Buscar clima no WeatherAPI
  http.get(weatherAPI, (resp) => {
    let data = '';
    
    // Dados http chegando
    resp.on('data', (chunk) => {
      data += chunk;
    });
    
    // Toda a RESPOSTA do WeatherAPI foi recebida, entregue os dados:
    resp.on('end', () => { // se os dados correspondem a um resultado
        let weatherObj = JSON.parse(data) // Req http transformada em objeto

        // Verifica se existe a cidade na query pesquisada
        if (!weatherObj.current){
          bot.sendMessage(chatId, `Ops! Não encotramos "${query}" como uma cidade valida. Tente digitar somente o nome da cidade que procura. Por exemplo "Volta Redonda" (sem as aspas)`)
          return false;
        }

        let cidade = weatherObj.location.name
        let estado = weatherObj.location.region
        let pais = weatherObj.location.country
        let temperatura = weatherObj.current.temp_c
        let sensacaoTermica = weatherObj.current.feelslike_c

        // Corte na string, removendo a data e transformando a hora em Int para comparar,
        // através de condicionais, retornando a saudação do período do dia na hora local
        let horaLocal = weatherObj.location.localtime.slice(10)

        // Normalizar o retorno do WeatherAPI da ultima atualização,
        // retirando a data(ddMMyy) da propriedade e substituindo por "HOJE",
        // caso a atualização tenha sido no mesmo dia, junto com a hora local.
        let ultimaAtt = normalizarUltimaAtualizacao(weatherObj.current.last_updated)
        
        // Criar texto de saudação a partir da hora atual do local buscado
        let saudacao = criarSaudacao(horaLocal); 

        // Criar o texto sobre hoje atraves do condition (na api vem em ingles)
        let sobreHoje = traduzirCondition(weatherObj.current.condition.text, 'pt-br')

        // Frisar a informação de modo a alertar que rajadas estão fortes
        // baseado em um condicional ternário de: se o vento é maior/igual a 12km/h
        let vento = `${weatherObj.current.wind_kph}km/h`
        let ventoRajada = weatherObj.current.gust_kph 
        ventoRajada >= 12 ? ventoRajada = `e, prepare-se, pois Rajadas de vento podem alcançar ${ventoRajada}km/h !!` : ventoRajada = `Com rajadas de ${ventoRajada}km/h`

        // Tradução da direção cardeal do vento de En para Pt
        let ventoDirecao = traduzirWindDirection(weatherObj.current.wind_dir, 'pt-br');

        let textoFinal = `Olá, ${pessoa}, já é *${saudacao}* em ${cidade}, ${estado} (${pais}).
O que temos para hoje é *${sobreHoje}*, com temperatura de ${temperatura}Cº e sensação térmica de ${sensacaoTermica}Cº, teremos ventos, em média, de ${vento} vindos do ${ventoDirecao}, ${ventoRajada}.
                
A hora local de ${cidade} é ${horaLocal}
Última atualização: ${ultimaAtt} (horário local)
        
Deseja saber mais sobre outra cidade? Só me enviar o nome. ;)`

        bot.sendMessage(chatId, textoFinal)

        console.log(`${msg}
_____________________________________________________________________`);
      }).on("error", (err) => {
        console.log('Error: ' + err.message)
      })
    } // fim do else
  ); // fim da requisição http


  // Criação de um webhook interno, já que o ngrok não aceita https no plano gratuito
  // e o telegram apenas aceita métodos POST em HTTPS
  let post_data = JSON.stringify(msg);

  // Parametros para o POST
  var post_options = {
    host: url_api_externa,
    port: '80',
    path: '/apiRecebeWebhookBot',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json', // json
    }
  };

  // Enviar dados recebidos do Telegram para a API
  var post_req = http.request(post_options);
  post_req.write(post_data);
  post_req.end();

}); // fim do listener do chatbot

function traduzirCondition(condition, language) {
  let sobreHoje;

  switch (condition) {
    case 'Sunny': sobreHoje = 'um tempo Ensolarado'
      break
    case 'Clear': sobreHoje = 'um tempo Limpo'
      break
    case 'Light snow': sobreHoje = 'um tempo Nevando Levemente'
      break
    case 'Partly cloudy': sobreHoje = 'um tempo Parcialmente Nublado'
      break
    case 'Light rain': sobreHoje = 'um tempo com Chuva Leve'
      break
    case 'Overcast': sobreHoje = 'um tempo Nublado'
      break
    case 'Mist': sobreHoje = 'um tempo com Névoa'
      break
    case 'Patchy rain possible': sobreHoje = 'uma possibilidade de Chuvas Esparças'
      break
    case 'Moderate rain': sobreHoje = 'um tempo com Chuva Moderada'
      break
    default: sobreHoje = condition
  }

  return sobreHoje;
}

function normalizarUltimaAtualizacao(ultimaAtt){
  let hoje = new Date().getDate() // pegando o dia do mês de hoje para comparar com a atualização

  if(ultimaAtt.slice(8, 10) == hoje) {
    ultimaAtt = `Hoje às ${ultimaAtt.slice(11)}`} // Se ultimo update for no mesmo dia, será substituída a data por "Hoje" + Horário do Update
    else{ ultimaAtt = `${ultimaAtt.slice(11)}`
  }  

  return ultimaAtt;
}

function criarSaudacao(horaLocal){
  let saudacao;

  if (parseInt(horaLocal) < 12) { // Saudação periódica do dia (bom dia/boa tarde/boa noite)
    saudacao = 'Bom dia'
  } else if (parseInt(horaLocal) < 18) {
    saudacao = 'Boa tarde'
  } else {
    saudacao = 'Boa noite'
  } 
  return saudacao;
}

function traduzirWindDirection(wind_dir,language){
  let ventoDirecao;

  switch (wind_dir) {
    case 'N': ventoDirecao = 'Norte'
      break
    case 'NNE': ventoDirecao = 'Norte-Nordeste'
      break
    case 'NE': ventoDirecao = 'Nordeste'
      break
    case 'ENE': ventoDirecao = 'Leste-Nordeste'
      break
    case 'E': ventoDirecao = 'Leste'
      break
    case 'ESE': ventoDirecao = 'Leste-Sudeste'
      break
    case 'SE': ventoDirecao = 'Sudeste'
      break
    case 'SSE': ventoDirecao = 'Sul-Sudeste'
      break
    case 'S': ventoDirecao = 'Sul'
      break
    case 'SSW': ventoDirecao = 'Sul-Sudoeste'
      break
    case 'SW': ventoDirecao = 'Sudoeste'
      break
    case 'WSW': ventoDirecao = 'Oeste-Sudoeste'
      break
    case 'W': ventoDirecao = 'Oeste'
      break
    case 'WNW': ventoDirecao = 'Oeste Noroeste'
      break
    case 'NW': ventoDirecao = 'Noroeste'
      break
    case 'NNW': ventoDirecao = 'Norte-Noroeste'
      break
    default: ventoDirecao = 'parece que nosso anemoscópio ficou doido xS'
  }
  
  return ventoDirecao;
}