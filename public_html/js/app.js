/*
 Document   : apps
 Created on : 24/06/2014, 17:00:09
 Author     : Felipe Jorge - felipejorgeas@gmail.com
 Description:
 Prototipo de transicao de telas com animacao zoom in zoom out basica
 */

var pageBack = [];
var waitLoadPage = 0;
var waitLoadPageInterval;

var configServerUrl = "http://192.168.1.25/saciPresenteServidor";

function onBackKeyMenu(e) {
  //e.preventDefault();
}

function onBackKeyDown(e) {
  //e.preventDefault();
}

function getTranslateX(el) {
  var translateX = el.css("transform");
  translateX = translateX.split("(")[1];
  translateX = translateX.split(")")[0];
  translateX = translateX.split(", ")[4];

  return parseInt(translateX);
}

function showMenu() {
  var menu = $('#menu');
  menu.removeClass("inactiveMenu").addClass("activeMenu").scrollTop(0);
}

function hideMenu() {
  var menu = $('#menu');
  menu.removeClass("activeMenu").addClass("inactiveMenu");
  window.setTimeout(function() {
    menu.removeClass("inactiveMenu");
  }, 200);
}

function menuSec() {
  var menu = $("#navigator");
  var menuLeft = getTranslateX(menu);
  var newMenuLeft = 0;

  if (menuLeft == 0)
    newMenuLeft = -330;

  menu.addClass("animate").css({
    "-moz-transform": "translateX(" + newMenuLeft + "px)",
    "-webkit-transform": "translateX(" + newMenuLeft + "px)",
    "transform": "translateX(" + newMenuLeft + "px)",
  });

  window.setTimeout(function() {
    menu.removeClass("animate");
  }, 300);

  if (newMenuLeft == 0)
    showDrawer();
  else
    hideDrawer();
}

function hideMenuSec() {
  var menu = $("#navigator");
  var newMenuLeft = -330;

  menu.addClass("animate").css({
    "-moz-transform": "translateX(" + newMenuLeft + "px)",
    "-webkit-transform": "translateX(" + newMenuLeft + "px)",
    "transform": "translateX(" + newMenuLeft + "px)",
  });

  window.setTimeout(function() {
    menu.removeClass("animate");
  }, 300);

  hideDrawer();
}

function showDrawer() {
  // manipuladores dos itens do header
  var header = $("#header");
  var action = header.find("#action");
  var icons = action.find("#icons");
  var drawer = icons.find("#ico-drawer");
  var back = icons.find("#ico-back");
  var title = action.find("#title");
  var desc1 = title.find("#desc-1");
  var desc2 = title.find("#desc-2");

  if (!drawer.hasClass("drawer-mini")) {
    // definindo os novos valores dos itens
    drawer.show().addClass("drawer-mini");

    back.hide();
    //title.find(".logo").hide();
    //desc1.html("Menu").show();
    desc2.hide();

    showMaskShadow();
  }
}

function hideDrawer() {

  var page = $("#content").find(".page.activePage:last").attr("id");

  // manipuladores dos itens do header
  var header = $("#header");
  var action = header.find("#action");
  var icons = action.find("#icons");
  var drawer = icons.find("#ico-drawer");
  var back = icons.find("#ico-back");

  // definindo os novos valores dos itens
  drawer.removeClass("drawer-mini");
  back.hide();

  loadHeader(page);

  hideMaskShadow();
}

function showSearch() {
  // manipuladores dos itens do header
  var header = $("#header");
  var action = header.find("#action");
  var icons = action.find("#icons");
  var drawer = icons.find("#ico-drawer");
  var back = icons.find("#ico-back");
//  var logo = action.find("#ico-logo");
  var title = action.find("#title");
  var descs = title.find(".desc");

  /**
   * itens right
   */
  var search = header.find("#search");
  var searchInput = search.find("input[name=search]");
  var actionsAux = header.find("#actions-aux");
  var actions = actionsAux.find(".actions");
  var exibMenu = header.find("#exibMenu");

  descs.hide();
  actions.hide();
  exibMenu.hide();

  search.show().find(".actions").show();
  searchInput.val("").focus();
}

function hideSearch() {

  var page = $("#content").find(".page.activePage:last").attr("id");

  // manipuladores dos itens do header
  var header = $("#header");
  var action = header.find("#action");
  var icons = action.find("#icons");
  var drawer = icons.find("#ico-drawer");
  var back = icons.find("#ico-back");
//  var logo = action.find("#ico-logo");
  var title = action.find("#title");
  var descs = title.find(".desc");

  /**
   * itens right
   */
  var search = header.find("#search");
  var searchField = search.find("input");
  var actionsAux = header.find("#actions-aux");
  var actions = actionsAux.find(".actions");
  var exibMenu = header.find("#exibMenu");

  descs.show();

  search.hide();
  loadHeader(page);
}

function loadPage(page, backButton, noPushPage) {

  if (backButton && $("#search").is(":visible")) {
    hideSearch();
  }

  else {

    if (waitLoadPage == 0) {
      clearInterval(waitLoadPageInterval);
      waitLoadPageInterval = window.setInterval(function() {
        verifyOnline(page, backButton);
        waitLoadPage = 1;
      }, 1000);
    }

    if (!noPushPage) {
      var existsPageActive = $("#content").find(".page").hasClass("activePage");
      var pageActive = existsPageActive ? $("#content").find(".page.activePage") : false;

      if (backButton)
        page = pageBack.pop().page;
      else
        pageBack.push({
          page: !pageActive ? "index" : pageActive.attr("id")
        });
    }

    var element = $("#" + page);
    var content = "pages/" + page + ".html";

    $("#content").find(".page").removeClass("activePage").addClass("inactivePage");

    window.setTimeout(function() {
      if (!backButton) {
        $.ajax({
          url: content,
          type: "POST",
          dataType: "html",
          data: {},
          success: function(response) {
            loadHeader(page);
            element.html(response);
            element.removeClass("inactivePage").addClass("activePage");
          }
        });
      }

      else {
        hideMask();
        loadHeader(page);
        element.removeClass("inactivePage").addClass("activePage");
      }

      if (!backButton) {
        element.scrollTop(0);
      }
    }, 200);
  }
}

function hidePopup() {
  $(".popup").hide();
}

function showMaskFull() {
  $("#mask-full").show();
}

function hideMaskFull() {
  $("#mask-full").hide();
}

function showMaskShadow() {
  $("#mask-shadow").fadeIn();
}

function hideMaskShadow() {
  $("#mask-shadow").fadeOut();
}

function showMask() {
  $("#mask").fadeIn();
}

function hideMask() {
  waitLoadPage = 0;
  clearInterval(waitLoadPageInterval);
  $("#mask").fadeOut();
}

function verifyOnline(page, backButton) {
  if (waitLoadPage == 1) {
    showMask();
    loadPage(page, backButton, true);
  }
}

function generateLink(options) {
  var link = $("<a>");

  if (options.id.length > 0)
    link.attr("id", options.id);

  if (options.class.length > 0)
    link.attr("class", options.class);

  if (options.href.length > 0)
    link.attr("href", options.href);

  if (options.onclick.length > 0)
    link.attr("onclick", options.onclick);

  link.html(options.label);

  return link;
}

function loadHeader(page) {
  var header = $("#header");
  var menu = $("#menu");
  var nav = $("#navigator");

  /**
   * manipuladores dos itens do header itens left
   */
  var action = header.find("#action");
  var icons = action.find("#icons");
  var drawer = icons.find("#ico-drawer");
  var back = icons.find("#ico-back");
//  var logo = action.find("#ico-logo");
  var title = action.find("#title");
  var descs = title.find(".desc");

  /**
   * itens right
   */
  var search = header.find("#search");
  var actionsAux = header.find("#actions-aux");
  var actionsHeader = actionsAux.find(".actions");
  var exibMenu = header.find("#exibMenu");

//  hideMenuSec();
  back.hide();
  descs.hide().html("");
  actionsHeader.hide().html("");

  search.hide();
  menu.hide().html("");
  exibMenu.hide();

  // action.removeAttr("onclick");
  // drawer.removeClass("drawer-mini").show();

  // personaliza os itens de acordo com cada pagina
  // personaliza o header

  $.ajax({
    url: "menus/" + page + ".json",
    type: "GET",
    dataType: "json",
    success: function(response) {

      var pageTitle = response.hasOwnProperty("title") ? response.title : false;
      var pageDrawer = response.hasOwnProperty("drawer") ? response.drawer : false;
      var pageBack = response.hasOwnProperty("back") ? response.back : false;
      var pageActions = response.hasOwnProperty("actions") ? response.actions : false;
      var pageMenu = response.hasOwnProperty("menu") ? response.menu : false;
      var pageNav = response.hasOwnProperty("nav") ? response.nav : false;

      if (pageTitle) {
        if (pageTitle.hasOwnProperty("show") && pageTitle.show) {
          if (pageTitle.hasOwnProperty("logo")) {
            title.find(".logo").html(pageTitle.logo).show();
          }
          else {
            title.find(".logo").hide();
            $.each(pageTitle.itens, function(i, item) {
              descs.eq(i).html(item.desc).show();
            });
          }
        }
      }

      if (pageDrawer && pageDrawer.hasOwnProperty("show") && pageDrawer.show) {
        action.attr("onclick", pageDrawer.onclick);
        animateClick(action);
        back.hide();
        drawer.show();
      }

      else if (pageBack && pageBack.hasOwnProperty("show") && pageBack.show) {
        action.attr("onclick", pageBack.onclick);
        animateClick(action);
        drawer.hide();
        back.show();
      }

      else {
        action.removeAttr("onclick");
      }

      if (pageActions && pageActions.hasOwnProperty("show") && pageActions.show) {
        $.each(pageActions.itens, function(i, item) {
          var icon = getIcon(item.icon);
          actionsHeader.eq(i).attr("onclick", item.onclick).html(icon).show();
          animateClick(actionsHeader.eq(i));
          if (item.type)
            $("#search").find("input[name=funcSearch]").val(item.type);
        });
      }

      if (pageMenu && pageMenu.hasOwnProperty("show") && pageMenu.show) {
        $.each(pageMenu.itens, function(i, item) {
          var op = $("<li>");
          op.attr("onclick", item.onclick).text(item.label);
          menu.append(op);
        });
        exibMenu.show();
        window.setTimeout(function() {
          menu.show();
        }, 500);
      }

      if (pageNav && pageNav.hasOwnProperty("show") && pageNav.show) {
        nav.find(".nav-filter").hide();
        nav.show().find("#filter-" + pageNav.type).show();
        var myScroll = new IScroll("#scroll", {
          bounce: false,
          scrollY: true,
          scrollbars: "custom",
          fadeScrollbars: true
        });
      }
      else {
        nav.hide();
      }

      /** FastClick
       *
       * Remove o delay do clique em qualquer item do documento
       */
      FastClick.attach(document.body);
    }
  });
}

function getIcon(type) {
  var icon = $("<img>");
  var src = "";

  switch (type) {
    case "search":
      src = "img/ico-search.png";
      break;
    case "new":
      src = "img/ico-new.png";
      break;
  }

  icon.attr("src", src).addClass("ico-actions");

  return icon;
}

function animateClick(elem) {
  elem.addClass("click").click(function() {
    var duration = elem.css("transition-duration").replace("s", "");
    duration = duration * 1000;

    elem.addClass("clickActive");
    window.setTimeout(function() {
      elem.removeClass("clickActive");
    }, duration);
  });
}

function actionSearch() {
  var search = $("#search");
  if (search.is(":visible"))
    hideSearch();
  else
    showSearch();
}

function clickOut() {

  var menu = $("#menu");

  $(window).click(function() {
    if (menu.hasClass("activeMenu"))
      hideMenu();
  });

  $("#content").on("touchmove", function() {
    if (menu.hasClass("activeMenu"))
      hideMenu();
  });

  $("#search").click(function() {
    return false;
  });

  $("#exibMenu").click(function() {
    if (menu.hasClass("activeMenu"))
      hideMenu();
    else
      showMenu();
    return false;
  });

  $("#menu").click(function() {
    if (menu.hasClass("activeMenu"))
      hideMenu();
  });

  animateClick($("#exibMenu"));
  animateClick($("#menu li"));

  $("#mask-shadow").click(function() {
    hideMenuSec();
  });

  $("#mask-full").click(function() {
    hideMaskFull();
    hidePopup();
  });
}

function hideLogin() {
  $("#login").fadeOut();
  loadPage('index');
}

function showDialog(title, msg, labelBt1, onclickBt1, labelBt2, onclickBt2) {
  showMaskFull();

  // oculta todos os botoes
  $("#popup-dialog").find("button").hide();

  // seta o titulo e a mensagem no dialog
  $("#popup-dialog").find(".dialog").find(".title").text(title);
  $("#popup-dialog").find(".dialog").find(".msg").text(msg);

  // seta o primeiro botao
  $("#popup-dialog").find("button").eq(0).text(labelBt1).attr("onclick", onclickBt1).show();

  // caso o segundo botao esteja definido reduz o tamanho dos botoes para 50% e exibe o segundo botao
  if (labelBt2) {
    $("#popup-dialog").find("button").eq(0).addClass("cancel").css("width", "50%");
    $("#popup-dialog").find("button").eq(1).text(labelBt2).attr("onclick", onclickBt2).css("width", "50%").show();
  }

  // caso o segundo botao nao esteja definido aumenta o tamanho do primeiro botao para 100%
  else {
    $("#popup-dialog").find("button").eq(0).css("width", "100%");
  }

  var marginTop = -(parseInt($("#popup-dialog").css("height")) / 2);
  $("#popup-dialog").css("margin-top", marginTop).show();
}

function hideDialog() {
  hidePopup();
  hideMaskFull();
}

function showSelect(type, elem) {

  switch (type) {

    case "day":
      var ul = $("<ul>");
      var lis = "";
      for (var i = 1; i <= 31; i++) {
        lis += "<li>" + (i < 10 ? "0" + i : i) + "</li>";
      }
      ul.append(lis);
      $("#popup-select").html(ul);
      $("#popup-select").find("ul").find("li").click(function() {
        var value = $(this).text();
        $(elem).text(value);
        hideMaskFull();
        $("#popup-select").hide();
      });
      break;

    case "month":
      var ul = $("<ul>");
      var lis = "";
      for (var i = 1; i <= 12; i++) {
        lis += "<li>" + (i < 10 ? "0" + i : i) + "</li>";
      }
      ul.append(lis);
      $("#popup-select").html(ul);
      $("#popup-select").find("ul").find("li").click(function() {
        var value = $(this).text();
        $(elem).text(value);
        hideMaskFull();
        $("#popup-select").hide();
      });
      break;

    case "year":
      var year = new Date().getFullYear();
      var ul = $("<ul>");
      var lis = "";
      year -= 10;
      for (var i = 0; i <= 20; i++) {
        lis += "<li>" + (year + i) + "</li>";
      }
      ul.append(lis);
      $("#popup-select").html(ul);
      $("#popup-select").find("ul").find("li").click(function() {
        var value = $(this).text();
        $(elem).text(value);
        hideMaskFull();
        $("#popup-select").hide();
      });
      break;

    case "tipoLista":
      var ul = $("<ul>");
      var lis = "";
      var tipos = sessionStorage.getItem("tiposListas");
      var tiposListas = JSON.parse(tipos);

      $.each(tiposListas, function(i, tipo) {
        lis += "<li title='" + tipo.tipo_lista_codigo + "'>" + tipo.tipo_lista_nome + "</li>";
      });
      ul.append(lis);
      $("#popup-select").html(ul);
      $("#popup-select").find("ul").find("li").click(function() {
        var tipo_name = $(this).text();
        var tipo_codigo = $(this).attr("title");
        $(elem).text(tipo_name).attr("title", tipo_codigo);
        hideMaskFull();
        $("#popup-select").hide();
      });
      break;
  }
  showMaskFull();
  var marginTop = -(parseInt($("#popup-select").css("height")) / 2);
  $("#popup-select").css("margin-top", marginTop);
  $("#popup-select").show();
}

function resetFields(elem, type) {
  var p = $(elem).parent();

  switch (type) {
    case "select":
      p.find(".input-select").text("Selecione").attr("title", "");
      break;
    case "date":
      p.find(".input-date.day").text("00");
      p.find(".input-date.month").text("00");
      p.find(".input-date.year").text("0000");
      break;
  }
}

function init() {

  $.ajaxSetup({cache: false});
//  hideLogin();

  // Ativa algumas acoes ao clicar em determinados locais da tela
  clickOut();

  // instancia algumas variaveis globais para auxiliar no controle do menu lateral
  var currentPageX = 0;
  var currentPageY = 0;
  var touchStartPageX = 0;
  var touchStartPageY = 0;
  var touchStartMenuLeft = 0;

  // Controlador do menu lateral
  var menu = document.getElementById("navigator");

  /** Evento TouchStart
   *
   * Ao iniciar um toque no menu lateral executa este processo
   */
  menu.addEventListener("touchstart", function(evt) {
    var touch = evt.targetTouches[0];
    var menu = $("#navigator");

    showMaskShadow();

    touchStartPageX = touch.pageX;
    touchStartPageY = touch.pageY;

    touchStartMenuLeft = getTranslateX(menu);

    evt.preventDefault();
  });

  /** Evento TouchMove
   *
   * Ao mover o dedo sobre o menu lateral executa este processo
   */
  menu.addEventListener("touchmove", function(evt) {
    var touch = evt.targetTouches[0];
    currentPageX = touch.pageX;
    currentPageY = touch.pageY;

    var menu = $("#navigator");

    var menuLeft = getTranslateX(menu);

    var newMenuLeft = touchStartMenuLeft + (currentPageX - touchStartPageX);

    var slideOk = Math.abs(currentPageX - touchStartPageX) > Math.abs(currentPageY - touchStartPageY) ? true : false;

    if (slideOk && (menuLeft <= 0 && newMenuLeft <= 0)) {
      menu.css({
        "-moz-transform": "translateX(" + newMenuLeft + "px)",
        "-webkit-transform": "translateX(" + newMenuLeft + "px)",
        "transform": "translateX(" + newMenuLeft + "px)",
      });
    }

    evt.preventDefault();
  });

  /** Evento TouchEnd
   *
   * Ao finalizar um toque no menu lateral executa este processo
   */
  menu.addEventListener("touchend", function() {
    var menu = $("#navigator");

    var menuLeft = getTranslateX(menu);
    var newMenuLeft = 0;

    if (menuLeft < -(menu.width() / 2))
      newMenuLeft = -330;

    menu.addClass("animate").css({
      "-moz-transform": "translateX(" + newMenuLeft + "px)",
      "-webkit-transform": "translateX(" + newMenuLeft + "px)",
      "transform": "translateX(" + newMenuLeft + "px)",
    });

    window.setTimeout(function() {
      menu.removeClass("animate");
    }, 300);

    if (newMenuLeft == 0)
      showDrawer();
    else
      hideDrawer();
  });

  $("#scroll").find("li").on("touchstart", function(evt) {
    evt.stopPropagation();
  });

  $("#scroll").find("li").on("touchmove", function(evt) {
    evt.stopPropagation();
  });

  $("#scroll").find("button").on("touchstart", function(evt) {
    evt.stopPropagation();
  });

  $("#scroll").find("button").on("touchmove", function(evt) {
    evt.stopPropagation();
  });

  var date = new Date();
  var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  var year = date.getFullYear();

  $(".input-date.day").text(day);
  $(".input-date.month").text(month);
  $(".input-date.year").text(year);

  $("button").click(function() {
    var button = $(this);
    button.addClass("activeButton");

    window.setTimeout(function() {
      button.removeClass("activeButton");
    }, 200);
  });

  $("#search").find("input[name=search]").keypress(function(evt) {
    var tecla = (evt.keyCode ? evt.keyCode : evt.which);
    if (tecla == 13) {
      var typeSearch = $("#search").find("input[name=funcSearch]").val();

      switch (typeSearch) {

        case "cliente":
          wsGetCliente();
          break;

        case "lista":
          wsGetLista();
          break;
      }
    }
  });
}

/*
 Document   : actions
 Created on : 24/06/2014, 17:00:09
 Author     : Felipe Jorge - felipejorgeas@gmail.com
 Description:
 Comunicacao com o servidor
 */


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
  var dados = { wscallback: "wsResponseGetTipoDeLista" };

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getTipoDeLista.php",
    type: "POST",
    dataType: "jsonp",
    data: { dados: dados }
  });
}

/**
 * wsResponseGetTipoDeLista
 *
 * Funcao para tratar o retorno da requisicao "wsGetTipoDeLista"
 *
 * @param {json} response
 */
function wsResponseGetTipoDeLista(response) {
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

    sessionStorage.setItem("tiposListas", JSON.stringify(tiposListas));
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
  
  var clienteCodigo = sessionStorage.getItem("clienteSelecionado");
  
  if(clienteCodigo > 0) {
        var lista = {
            codigo_cliente:  clienteCodigo
        };
  } else {
  // obtem os dados para execucao da requisicao
  var dia = $(".input-date.day").text();
  var mes = $(".input-date.month").text();
  var ano = $(".input-date.year").text();
  var tipoListaCodigo = $(".input-select.tipoLista").attr("title");

  var cliente_nome = $("#search input[name=search]").val();
  $("#search input[name=search]").val("");

  // preparacao dos dados
  var dataEvento = "" + ano + mes + dia;

  var lista = {
    data_evento:  parseInt(dataEvento) > 0 ? dataEvento : "",
    tipo:         tipoListaCodigo.length > 0 ? tipoListaCodigo : "",
    nome_cliente: cliente_nome
  };
  
}

  // cria bloco de dados a serem enviados na requisicao
  var dados = { wscallback: "wsResponseGetLista", lista: lista };

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getLista.php",
    type: "POST",
    dataType: "jsonp",
    data: { dados: dados }
  });
}

/**
 * wsResponseGetLista
 *
 * Funcao para tratar o retorno da requisicao "wsGetLista"
 *
 * @param {json} response
 */
function wsResponseGetLista(response) {
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

    if(listas.length > 0){

      // limpa a pagina a ser preenchida com os dados
      var page = $("#content").find(".page.activePage:last");
      var pageId = "#" + page.attr("id");
      var marcaDagua = $(pageId).find(".mark-agua");
      var contentResponse = $(pageId).find(".content-response");

      var listasStorage = [];

      marcaDagua.hide();
      contentResponse.html("").scrollTop(0).show();

      $.each(listas, function(i, lista){
        listasStorage.push(lista);
 
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
        card.addClass("card").addClass("bradius").attr("id", i);
        card.append(title);
        card.append(desc);

        // insere o bloco na pagina
        contentResponse.append(card);
      });

      // ativa as acoes de cliques nos blocos inseridos
      $(".card").removeClass("activeCard");
      $(".card").click(function(){
        if($(this).hasClass("activeCard")){
          var lista = listasStorage[this.id];
          sessionStorage.setItem("listaSelecionada", JSON.stringify(lista));
          loadPage("lista-produto");
        }
        else{
          $(".card").removeClass("activeCard");
          $(this).addClass("activeCard");
        }
      });
    }
    sessionStorage.removeItem("clienteSelecionado");
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
  var cliente_nome = $("#search [name=search]").val();
  $("#search input[name=search]").val("");

  if(cliente_nome.length == 0){
    alert("Favor buscar algum nome")
  }

  var cliente = {
    nome_cliente: cliente_nome
  };

  // cria bloco de dados a serem enviados na requisicao
  var dados = { wscallback: "wsResponseGetCliente", cliente: cliente };

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getCliente.php",
    type: "POST",
    dataType: "jsonp",
    data: { dados: dados }
  });
}

/**
 * wsResponseGetCliente
 *
 * Funcao para tratar o retorno da requisicao "wsGetCliente"
 *
 * @param {json} response
 */
function wsResponseGetCliente(response) {
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

    if(clientes.length > 0){

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
        contentResponse.append("<p class='cliente' id='" + clienteCodigo + "'>" + clienteCodigo + " - " + clienteName + "</p>");
      });

      // ativa as acoes de cliques nos blocos inseridos
      $(".cliente").removeClass("activeCard");
      $(".cliente").click(function(){
        if($(this).hasClass("activeCard")){
          sessionStorage.setItem("clienteSelecionado", this.id);
          loadPage("cliente-lista");
        }
        else{
          $(".card").removeClass("activeCard");
          $(this).addClass("activeCard");
        }
      });
    }
    hideMask();
  }
}

/**
 * wsSaveCliente
 *
 * Funcao salvar novos clientes via ajax
 *
 * @param {json} response
 */
function wsSaveCliente() {
  showMask();

  // obtem os dados para execucao da requisicao
  var cliente_nome = $(".form [name=new_cliente_nome]").val();
  var cliente_cpf = $(".form [name=new_cliente_cpf]").val();

  if(cliente_nome.length == 0 || cliente_cpf.length == 0){
    alert("Todos os campos são obrigatórios")
  }

  var cliente = {
    cliente_nome: cliente_nome,
    cliente_cpf: cliente_cpf
  };

  // cria bloco de dados a serem enviados na requisicao
  var dados = { wscallback: "wsResponseSaveCliente", cliente: cliente };

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/saveCliente.php",
    type: "POST",
    dataType: "jsonp",
    data: { dados: dados }
  });
}

/**
 * wsResponseSaveCliente
 *
 * Funcao para tratar o retorno da requisicao "wsSaveCliente"
 *
 * @param {json} response
 */
function wsResponseSaveCliente(response) {
  // faz o parser do json
  response = JSON.parse(response);

  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Não foi possível cadastrar o cliente!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    hideMask();
    showDialog("Cliente", msg, "Fechar", "hideDialog()");
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var cliente = response.wsresult;

    var msg = "Cliente cadastrado com sucesso!";

    hideMask();
    showDialog("Cliente", msg, "Fechar", "hideDialog()");
  }
}