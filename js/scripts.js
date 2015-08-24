$(document).ready(function(){
  var $container = $('.container');
  var source   = $('#main-template').html();
  var template = Handlebars.compile(source);
  var dataObject = {
    moneroBlocks: {hashrateMh: "14.9", emission: "9033600"},
    bitcoin: {last: 227.62, buy: 227.49, sell: 227.62}
  };


  //search monero block explorer
  $('body').on('click', '#moneroExplorer', function(e){
     e.preventDefault(); 
     var query = $('#txid').val();
     searchMoneroBlocks(query);
  });

  function searchCallback(data) {
  console.log(data);
  var content = $('#results');
  data.results.forEach(function(element, index){
    var $newDiv = $('<div>');   
    var $newP = $('<p>');
    $newP.text(element.name);
    $newDiv.append($newP);
    content.append($newDiv);
  });
}


//calculator event handlers
  $('body').on('keyup', '#BTC-calc', function(e){
      e.preventDefault();
      var BTCprice = dataObject.bitcoin.last;
      var XMRprice = dataObject.poloniex.last;
      var BTCqty = $(this).val();

      var XMRcalc = BTCqty / XMRprice;
      var USDcalc = (BTCqty * BTCprice).toFixed(2);

      $('#XMR-calc').val(XMRcalc);
      $('#USD-calc').val(USDcalc);

  });

    $('body').on('keyup', '#XMR-calc', function(e){
      e.preventDefault();
      var BTCprice = dataObject.bitcoin.last;
      var XMRprice = dataObject.poloniex.last;
      var XMRqty = $(this).val();
  

      var BTCcalc = (XMRqty * XMRprice).toFixed(5);
      var USDcalc = (XMRqty * XMRprice * BTCprice).toFixed(2);

      $('#BTC-calc').val(BTCcalc);
      $('#USD-calc').val(USDcalc);

  })

      $('body').on('keyup', '#USD-calc', function(e){
      e.preventDefault();
      var USDqty = $(this).val();
    
      var BTCprice = dataObject.bitcoin.last;
      var XMRprice = dataObject.poloniex.last;

      var BTCcalc = USDqty / BTCprice;
      var XMRcalc = (USDqty / BTCprice) / XMRprice;

      $('#XMR-calc').val(XMRcalc);
      $('#BTC-calc').val(BTCcalc);

  })

  //trading variables
  var apiKey = '';
  var apiSecret = '';
  var d = new Date();
  var nonce = d.getTime();

  //query to send API
  var query = encodeURI('nonce=' + nonce + '&command=returnBalances');
 

  //encrypt and sign POST data for header
  var crypto = CryptoJS.HmacSHA512(query, apiSecret);
  var signature = CryptoJS.enc.Hex.stringify(crypto);




//store Monero blockchain info 
var moneroBlocks = function(response){
  dataObject.moneroBlocks = response;
  dataObject.moneroBlocks.emission = Math.round((response.total_emission)/1e12);
  dataObject.moneroBlocks.hashrateMh = (response.hashrate / 1000000).toFixed(1);
}

//store Bitcoin price info
var bitcoinData = function(response){
  dataObject.bitcoin = response.USD;
}

//retrieving BTC/XMR ticker info from Poloniex API
var poloniexBTCXMR = function(response){
    dataObject.poloniex = response.BTC_XMR;
    dataObject.poloniex.percent = ((response.BTC_XMR.percentChange)*100).toFixed(2);
    $('.poloniex').html(template(dataObject));
   
    $(".xmr").fadeIn(20).fadeOut(50).fadeIn(200);

  };

function getMoneroBlocks (){
    $.ajax({
    type: 'GET',
        url: 'http://moneroblocks.eu/api/get_stats/',
        crossDomain: true,
        dataType: 'json',
        success: moneroBlocks,
        error: function (xhr, status) {
            alert('Error: ' + status);
        }
    });
  }

var getPoloniexTicker = function (){

    $.ajax({
    type: 'GET',
        url: 'https://poloniex.com/public?command=returnTicker',
        crossDomain: true,
        dataType: 'json',
        success: poloniexBTCXMR,
        error: function (xhr, status) {
            alert('Error: ' + status);
        }
    });
  };


function getBitcoinPrice (){

    $.ajax({
    type: 'GET',
        url: 'https://blockchain.info/ticker',
        crossDomain: true,
        dataType: 'json',
      
        success: bitcoinData,
        error: function(xhr, status) {
            alert('Error: ' + status);
        }
    });
  };

function sendTrade(query, apiKey, signature){

    $.ajax({
        type: 'POST',
        url: 'https://poloniex.com/tradingApi',
        crossDomain: true,
        data: query,
        headers: {
          'Key': apiKey, 
          'Sign': signature,
        },
        dataType: 'jsonp',
        jsonp: 'json_callback',
        success: function(response){console.log("SUCCESS!" + response)},
        error: function (xhr, status) {
            alert('Error: ' + status);
        }
    });
  };

var searchMoneroBlocks = function(query){
    $.ajax({
    type: 'GET',
        url: 'http://moneroblocks.eu/api/get_transaction_data/' + query,
        crossDomain: true,
        dataType: 'json',
        success: function (response) {
            console.log(response);
        },
        error: function (xhr, status) {
            alert('Error: ' + status);
        }
    });
}
  
  getMoneroBlocks();
  getPoloniexTicker();
  getBitcoinPrice();
  // sendTrade(query, apiKey, signature);

  setInterval(function(){getPoloniexTicker(), getBitcoinPrice()}, 60000);  

});