var configServerUrl = "http://192.168.1.13/saciPresenteServidor";

function loginAction(){
  $("#login #followingBallsG").fadeIn();
  window.setTimeout(hideLogin, 2000);
}

function wsGetLista() {
  hideMenuSec();
  showMask();

  /* obtem os dados para execucao da requisicao */
  var dia = $(".input-date.day").text();
  var mes = $(".input-date.month").text();
  var ano = $(".input-date.year").text();

  var dataEvento = "" + ano + mes + dia;

  /* ativa a tela de loading */
//  showLoading();

  var dados = { wscallback: "wsResponseLista", lista: { data_evento: dataEvento } };

  /* executa a requisicao via ajax */
  $.ajax({
    url: configServerUrl + "/getLista.php",
    type: "POST",
    dataType: "jsonp",
    data: { dados: dados },
    success: wsResponseLista
  });
}

/**
 * wsResponseLogar
 * Funcao para tratar o retorno da funcao "wsLogar"
 * @param {json} response
 */
function wsResponseLista(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = "Nenhume lista cadastrada!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;
//    showDialog("Produto", msg, null, null, "Fechar", "hideDialog()");
//    showDialog("Autentica&ccedil;&atilde;o", msg, null, null, "Fechar", "goToPage('index.html')");
  }

  /* em caso de sucesso */
  else if (response.wsstatus == 1) {
    var listas = response.wsresult;

    var page = $("#content").find(".page.activePage:last");
    page.html("");

    $.each(listas, function(i, lista){
      // tratamento dos dados retornados
      var clienteCodigo = lista.cliente_codigo;
      var clienteName = lista.cliente_name;
      var tipoCodigo = lista.tipo;
      var tipoName = lista.tipo_name;
      var dataEvento = lista.data_evento;

      var anoEvento = dataEvento.substr(0, 4);
      var mesEvento = dataEvento.substr(4, 2);
      var diaEvento = dataEvento.substr(6, 2);

      dataEvento = diaEvento + "/" + mesEvento + "/" + anoEvento;

      // criacao dos objetos a serem inseridos na pagina
      var card = $("<div>");
      var title = $("<p>");
      var desc = $("<p>");

      title.addClass("title").text(clienteName);
      desc.addClass("desc").text(tipoName + " dia " + dataEvento);

      card.addClass("card").addClass("bradius");
      card.append(title);
      card.append(desc);

      page.append(card);
    });

    $(".card").click(function(){
      if($(this).hasClass("activeCard")){
        var buttonOrigem = $(this).attr("id");
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