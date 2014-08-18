var configServerUrl = "http://192.168.1.25/saciPresenteServidor";

function loginAction(){
  wsGetTipoDeLista();
  $("#login #followingBallsG").fadeIn();
  window.setTimeout(hideLogin, 2000);
}

/**
 * wsGetTipoDeLista
 *
 * Funcao obter os tipos de listas de presentes via ajax
 *
 * @param {json} response
 */
function wsGetTipoDeLista() {

  // cria bloco de dados a serem enviados na requisicao
  var dados = { wscallback: "wsResponseTipoDeLista" };

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getTipoDeLista.php",
    type: "POST",
    dataType: "jsonp",
    data: { dados: dados }
  });
}

/**
 * wsResponseTipoDeLista
 *
 * Funcao para tratar o retorno da requisicao "wsGetTipoDeLista"
 *
 * @param {json} response
 */
function wsResponseTipoDeLista(response) {
  // faz o parser do json
  response = JSON.parse(response);

  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Nenhum tipo de lista cadastrado!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;
//    showDialog("Produto", msg, null, null, "Fechar", "hideDialog()");
//    showDialog("Autentica&ccedil;&atilde;o", msg, null, null, "Fechar", "goToPage('index.html')");
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var tiposListas = response.wsresult;

    // limpa a pagina a ser preenchida com os dados
    var page = $("#content").find(".page.activePage:last");
    page.html("");

    localStorage.setItem("tiposListas", JSON.stringify(tiposListas));
  }
}

/**
 * wsGetLista
 *
 * Funcao obter as listas de presentes via ajax
 *
 * @param {json} response
 */
function wsGetLista() {
  hideMenuSec();
  showMask();

  // obtem os dados para execucao da requisicao
  var dia = $(".input-date.day").text();
  var mes = $(".input-date.month").text();
  var ano = $(".input-date.year").text();
  var tipoListaCodigo = $(".input-select.tipoLista").attr("title");

  // preparacao dos dados
  var dataEvento = "" + ano + mes + dia;

  var lista = {
    data_evento:  parseInt(dataEvento) > 0 ? dataEvento : "",
    tipo:         tipoListaCodigo.length > 0 ? tipoListaCodigo : ""
  };

  // cria bloco de dados a serem enviados na requisicao
  var dados = { wscallback: "wsResponseLista", lista: lista };

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getLista.php",
    type: "POST",
    dataType: "jsonp",
    data: { dados: dados }
  });
}

/**
 * wsResponseLista
 *
 * Funcao para tratar o retorno da requisicao "wsGetLista"
 *
 * @param {json} response
 */
function wsResponseLista(response) {
  // faz o parser do json
  response = JSON.parse(response);

  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Nenhuma lista encontrada!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    // limpa a pagina a ser preenchida com os dados
    var page = $("#content").find(".page.activePage:last").attr("id");

    $("#" + page).find(".content-response").hide();
    $("#" + page).find(".mark-agua").show();

    hideMask();
//    showDialog("Lista", msg, "Cancelar", "hideDialog()", "Ok", "hideDialog()");
    showDialog("Lista", msg, "Fechar", "hideDialog()");
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var listas = response.wsresult;

    // limpa a pagina a ser preenchida com os dados
    var page = $("#content").find(".page.activePage:last");
    var pageId = "#" + page.attr("id");
    var marcaDagua = $(pageId).find(".mark-agua");
    var contentResponse = $(pageId).find(".content-response");

    marcaDagua.hide();
    contentResponse.html("").scrollTop(0).show();

    $.each(listas, function(i, lista){
      // tratamento dos dados retornados
      var clienteCodigo = lista.cliente_codigo;
      var clienteNome = lista.cliente_nome;
      var tipoCodigo = lista.tipo;
      var tipoNome = lista.tipo_nome;
      var dataEvento = lista.data_evento;

      var anoEvento = dataEvento.substr(0, 4);
      var mesEvento = dataEvento.substr(4, 2);
      var diaEvento = dataEvento.substr(6, 2);

      dataEvento = diaEvento + "/" + mesEvento + "/" + anoEvento;

      // criacao dos objetos a serem inseridos na pagina
      var card = $("<div>");
      var title = $("<p>");
      var desc = $("<p>");

      // seta as informacoes
      title.addClass("title").text(clienteNome);
      desc.addClass("desc").text(tipoNome + " dia " + dataEvento);

      // finaliza o bloco de informacoes
      card.addClass("card").addClass("bradius");
      card.append(title);
      card.append(desc);

      // insere o bloco na pagina
      contentResponse.append(card);
    });

    // ativa as acoes de cliques nos blocos inseridos
    $(".card").removeClass("activeCard");
    $(".card").click(function(){
      if($(this).hasClass("activeCard")){
        loadPage("configuracoes");
      }
      else{
        $(".card").removeClass("activeCard");
        $(this).addClass("activeCard");
      }
    });

    hideMask();
  }
}

/**
 * wsGetCliente
 *
 * Funcao obter os clientes via ajax
 *
 * @param {json} response
 */
function wsGetCliente() {
  hideMenuSec();
  showMask();

  // obtem os dados para execucao da requisicao
  var dia = $(".input-date.day").text();

  var cliente = {
    nome_cliente: "adalucia"
  };

  // cria bloco de dados a serem enviados na requisicao
  var dados = { wscallback: "wsResponseCliente", cliente: cliente };

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getCliente.php",
    type: "POST",
    dataType: "jsonp",
    data: { dados: dados }
  });
}

/**
 * wsResponseCliente
 *
 * Funcao para tratar o retorno da requisicao "wsGetCliente"
 *
 * @param {json} response
 */
function wsResponseCliente(response) {
  // faz o parser do json
  response = JSON.parse(response);

  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Nenhum cliente encontrado!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    // limpa a pagina a ser preenchida com os dados
    var page = $("#content").find(".page.activePage:last").attr("id");

    $("#" + page).find(".content-response").hide();
    $("#" + page).find(".mark-agua").show();

    hideMask();
//    showDialog("Lista", msg, "Cancelar", "hideDialog()", "Ok", "hideDialog()");
    showDialog("Cliente", msg, "Fechar", "hideDialog()");
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var clientes = response.wsresult;

    // limpa a pagina a ser preenchida com os dados
    var page = $("#content").find(".page.activePage:last");
    var pageId = "#" + page.attr("id");
    var marcaDagua = $(pageId).find(".mark-agua");
    var contentResponse = $(pageId).find(".content-response");

    marcaDagua.hide();
    contentResponse.html("").scrollTop(0).show();

    $.each(clientes, function(i, cliente){
      // tratamento dos dados retornados
      var clienteCodigo = cliente.cliente_codigo;
      var clienteName = cliente.cliente_nome;

//      // criacao dos objetos a serem inseridos na pagina
//      var card = $("<div>");
//      var title = $("<p>");
//      var desc = $("<p>");
//
//      // seta as informacoes
//      title.addClass("title").text(clienteName);
//      desc.addClass("desc").text(tipoName + " dia " + dataEvento);
//
//      // finaliza o bloco de informacoes
//      card.addClass("card").addClass("bradius");
//      card.append(title);
//      card.append(desc);
//
      // insere o bloco na pagina
//      contentResponse.append(card);
      contentResponse.append("<p>" + clienteCodigo + " - " + clienteName + "</p>");
    });

    // ativa as acoes de cliques nos blocos inseridos
//    $(".card").removeClass("activeCard");
//    $(".card").click(function(){
//      if($(this).hasClass("activeCard")){
//        loadPage("configuracoes");
//      }
//      else{
//        $(".card").removeClass("activeCard");
//        $(this).addClass("activeCard");
//      }
//    });

    hideMask();
  }
}