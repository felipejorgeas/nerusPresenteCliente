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
var waitResponseAjax;

var configServerUrl = "http://192.168.1.25/saciPresenteServidor";

function onBackKeyMenu(e) {
  //e.preventDefault();
}

function onBackKeyDown(e) {
  //e.preventDefault();
}

function getTranslateX(el) {
  var translateX = el.css("transform");

  if (translateX != "none") {
    translateX = translateX.split("(")[1];
    translateX = translateX.split(")")[0];
    translateX = translateX.split(", ")[4];
  }
  else {
    translateX = -1;
  }

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

  if (menuLeft >= -1)
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
  var menuLeft = getTranslateX(menu);

  if (menuLeft >= -1) {
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
  
  else{
    
    hideSearch();
  }
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

  search.show();
  searchInput.val("").focus();
}

function hideSearch() {
  var page = $("#content").find(".page.activePage:last").attr("id");  
  loadHeader(page);
}

function loadPage(page, backButton, noPushPage) {
  $("#abas").hide();
  $("#prd-total").hide();

  var menu = $("#navigator");
  var menuLeft = getTranslateX(menu);

  if (backButton && $("#search").is(":visible")) {
    hideSearch();
  }

  else if (backButton && menuLeft == 0) {
    hideMenuSec();
  }

  else {

    if (waitLoadPage == 0) {
      clearInterval(waitLoadPageInterval);
      waitLoadPageInterval = window.setInterval(function() {
        verifyOnline(page, backButton);
        waitLoadPage = 1;
      }, 2000);
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
            element.removeClass("inactivePage").addClass("activePage").html(response);
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
  $("#mask-shadow").show();
}

function hideMaskShadow() {
  $("#mask-shadow").hide();
}

function showMask() {
  clearInterval(waitResponseAjax);
  waitResponseAjax = window.setInterval(function(){
    toast("Não foi possível concluir a operação. Tente novamente!");
    hideMask();
  }, 10000);
  $("#mask").show();
}

function hideMask() {
  waitLoadPage = 0;
  clearInterval(waitLoadPageInterval);
  clearInterval(waitResponseAjax);
  $("#mask").hide();
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
          var type = "";
          actionsHeader.eq(i).attr("onclick", item.onclick).html(icon).show();
          animateClick(actionsHeader.eq(i));
          if (item.type) {
            switch (item.type) {
              case "produto":
                type = "Produto";
                break;
              default:
                type = "Cliente";
            }
            if (item.hasOwnProperty("barcode") && item.barcode) {
              $("#search").find("#action-0").show();
              animateClick($("#search").find("#action-0"));
            } else {
              $("#search").find("#action-0").hide();
            }
            $("#search").find("input[name=search]").attr("placeholder", type);
            $("#search").find("input[name=funcSearch]").val(item.type);
          }
        });
      }

      if (pageMenu && pageMenu.hasOwnProperty("show") && pageMenu.show) {
        var options = "";
        $.each(pageMenu.itens, function(i, item) {
          options += "<li onclick='" + item.onclick + "'>" + item.label + "</li>";
        });
        menu.append(options);
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
    case "accept":
      src = "img/ico-accept.png";
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

  if (onclickBt1 == null)
    onclickBt1 = "hideDialog();";

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
        lis += "<li data-value='" + tipo.tipo_lista_codigo + "'>" + tipo.tipo_lista_nome + "</li>";
      });
      ul.append(lis);
      $("#popup-select").html(ul);
      $("#popup-select").find("ul").find("li").click(function() {
        var tipo_name = $(this).text();
        var tipo_codigo = $(this).attr("data-value");
        $(elem).text(tipo_name).attr("data-value", tipo_codigo);
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
      p.find(".input-select").text("Selecione").attr("data-value", "");
      break;
    case "date":
      p.find(".input-date.day").text("00");
      p.find(".input-date.month").text("00");
      p.find(".input-date.year").text("0000");
      break;
    default:
      p.find(".input").val("");
  }
}

function text2Float(price) {
  price = price.replace(/\./g, "");
  price = price.replace(/\,/g, ".");
  price = parseFloat(price);
  return price;
}

function formatMoney(price) {
  var totalStr = "" + price;
  var decimais = "";

  totalStr = totalStr.replace(".", ",");

  if (totalStr.length >= 7) {
    var aux = totalStr.length - 6;
    price = totalStr.substr(0, aux) + "." + totalStr.substr(-6, totalStr.length);
  }

  price = "" + price;
  price = price.split(".");

  if (price.hasOwnProperty(1) && price.split(".")[1].length == 1)
    price += decimais;

  return price;
}

function calcTotalPrds(prds) {
  var price = 0;
  var total = 0;

  prds.each(function(i, prd) {
    price = $(prd).find(".prd-price").find("strong").text();
    price = text2Float(price);

    total += price;
  });

  total = formatMoney(total);

  return total;
}

function init() {

  hideLogin();

  $.ajaxSetup({cache: false});

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

//  var date = new Date();
//  var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
//  var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
//  var year = date.getFullYear();

  var day = "00";
  var month = "00";
  var year = "0000";

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

        case "produto":
          wsGetProduto();
          break;
      }
    }
  });

  $("#popup-login").find("input").keypress(function(evt) {
    var tecla = (evt.keyCode ? evt.keyCode : evt.which);
    if (tecla == 13) {
      wsLogin();
    }
  });

  $(".show-pass").click(function() {
    var elem = $(this);
    var fieldPass = $("#" + elem.attr("data-field"));
    var type = fieldPass.attr("type");

    if (type == "password") {
      fieldPass.attr("type", "text");
      elem.addClass("active");
    }
    else {
      fieldPass.attr("type", "password");
      elem.removeClass("active");
    }
  });

  /** FastClick
   *
   * Remove o delay do clique em qualquer item do documento
   */
  FastClick.attach(document.body);

  var sliderRange = $("#slider-range");
  var priceMin = $("#price-min");
  var priceMax = $("#price-max");
  sliderRange.slider({
    range: true,
    min: 0,
    max: 1000,
    values: [0, 1000],
    slide: function(event, ui) {
      priceMin.text(ui.values[0]);
      priceMax.text(ui.values[1]);
    }
  });
  priceMin.text(sliderRange.slider("values", 0));
  priceMax.text(sliderRange.slider("values", 1));
}

function toast(msg) {
  //hideDialog();
  $('#toast').html(msg);
  $('#toast').fadeIn();
  setTimeout(function() {
    $('#toast').fadeOut();
  }, 3000);
}

function inArrayCl(key, arr) {
  var existsOk = false
  $.each(arr, function(i, reg) {
    if (reg.centro_lucro == key) {
      existsOk = true;
    }
  });
  return existsOk;
}

/*
 Document   : actions
 Created on : 24/06/2014, 17:00:09
 Author     : Felipe Jorge - felipejorgeas@gmail.com
 Description:
 Comunicacao com o servidor
 */

/**
 * wsLogin
 * 
 * Funcao para executar a requisicao de busca de usuario
 * 
 */
function wsLogin() {
  /* obtem os dados para execucao da requisicao */
  var usuario = $("#popup-login").find("input[name=usuario]").val();
  var senha = $("#popup-login").find("input[name=senha]").val();

  if ((usuario.length > 0) && (senha.length > 0)) {

    /* ativa a tela de loading */
    $("#login #followingBallsG").fadeIn();

    var usuario = {
      usuario: usuario,
      senha: senha
    };

    // cria bloco de dados a serem enviados na requisicao
    var dados = {wscallback: "wsResponseLogin", usuario: usuario};

    /* executa a requisicao via ajax */
    $.ajax({
      url: configServerUrl + '/getFuncionario.php',
      type: 'POST',
      dataType: 'jsonp',
      data: {dados: dados}
    });
  }
}

/**
 * wsResponseLogin
 * 
 * Funcao para tratar o retorno da funcao 'wsLogin'
 * 
 * @param {json} response
 */
function wsResponseLogin(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'Funcion&aacute;rio n&atilde;o cadastrado!';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    hideLogin();
    toast('Login realizado com sucesso');
  }
  /* em caso de sucesso */
  else if (response.wsstatus == 1) {

    /* guarda os dados do usuario na sessao */
    sessionStorage.setItem('usuarioLogado', JSON.stringify(response.wsresult));

    wsGetTipoDeLista();
    hideLogin();

    toast('Login realizado com sucesso');
  }
}

function logoutAction() {
  window.location.reload();
}

/**
 * wsGetTipoDeLista
 *
 * Funcao obter os tipos de listas de presentes via ajax
 *
 */
function wsGetTipoDeLista() {

  // cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseGetTipoDeLista"};

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getTipoDeLista.php",
    type: "POST",
    dataType: "jsonp",
    data: {dados: dados}
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
    toast(msg);
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
 * @param {int} clienteCodigo
 */
function wsGetLista(clienteCodigo) {
  hideMenuSec();
  showMask();

  if (clienteCodigo != null && clienteCodigo > 0) {
    var lista = {
      codigo_cliente: clienteCodigo
    };
  } else {
    // obtem os dados para execucao da requisicao
    var dia = $(".input-date.day").text();
    var mes = $(".input-date.month").text();
    var ano = $(".input-date.year").text();
    var tipoListaCodigo = $(".input-select.tipoLista").attr("data-value");

    var cliente_nome = $("#search input[name=search]").val();

    // preparacao dos dados
    var dataEvento = "" + ano + mes + dia;

    var lista = {
      data_evento: parseInt(dataEvento) > 0 ? dataEvento : "",
      tipo: tipoListaCodigo.length > 0 ? tipoListaCodigo : "",
      nome_cliente: cliente_nome
    };

  }

  // cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseGetLista", lista: lista};

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getLista.php",
    type: "POST",
    dataType: "jsonp",
    data: {dados: dados}
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

    toast(msg);
    hideMask();
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var listas = response.wsresult;

    if (listas.hasOwnProperty("0")) {

      // limpa a pagina a ser preenchida com os dados
      var page = $("#content").find(".page.activePage:last");
      var pageId = "#" + page.attr("id");
      var marcaDagua = $(pageId).find(".mark-agua");
      var contentResponse = $(pageId).find(".content-response");

      var listasStorage = [];

      marcaDagua.hide();
      contentResponse.html("").scrollTop(0).show();

      $.each(listas, function(i, lista) {
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
        card.addClass("card").addClass("bradius").attr("id", "lista-" + i);
        card.append(title);
        card.append(desc);

        // insere o bloco na pagina
        contentResponse.append(card);
      });

      // ativa as acoes de cliques nos blocos inseridos
      contentResponse.find(".card").removeClass("activeCard");
      contentResponse.find(".card").click(function() {
        if ($(this).hasClass("activeCard")) {
          var listaId = this.id;
          listaId = listaId.replace("lista-", "");
          var lista = listasStorage[listaId];
          sessionStorage.setItem("listaSelecionada", JSON.stringify(lista));
          loadPage("lista-produto");
        }
        else {
          contentResponse.find(".card").removeClass("activeCard");
          $(this).addClass("activeCard");
        }
      });
    }
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

  // obtem os dados para execucao da requisicao
  var cliente_nome = $("#search [name=search]").val();  

  if (cliente_nome.length == 0) {
    showDialog("Cliente", "É necessário informar o nome do cliente", "Ok");
    hideMask();
  }

  else {

    showMask();

    var cliente = {
      nome_cliente: cliente_nome
    };

    // cria bloco de dados a serem enviados na requisicao
    var dados = {wscallback: "wsResponseGetCliente", cliente: cliente};

    // executa a requisicao via ajax
    $.ajax({
      url: configServerUrl + "/getCliente.php",
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }
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

    toast(msg);
    hideMask();
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var clientes = response.wsresult;

    if (clientes.length > 0) {

      // limpa a pagina a ser preenchida com os dados
      var page = $("#content").find(".page.activePage:last");
      var pageId = "#" + page.attr("id");
      var marcaDagua = $(pageId).find(".mark-agua");
      var contentResponse = $(pageId).find(".content-response");

      marcaDagua.hide();
      contentResponse.html("").scrollTop(0).show();

      var clientesLista = [];
      var clientesStorage = [];

      $.each(clientes, function(i, cliente) {
        clientesStorage.push(cliente);

        // tratamento dos dados retornados
        var clienteCodigo = cliente.cliente_codigo;
        var clienteName = cliente.cliente_nome;

        // criacao dos objetos a serem inseridos na pagina
        var box =
                "<div id='cliente-" + i + "' class='cliente bradius'>" +
                "<p class='title'>" + clienteName + "</p>" +
                "</div>";

        clientesLista.push(box);
      });

      // insere os blocos na pagina
      contentResponse.html(clientesLista);

      // ativa as acoes de cliques nos blocos inseridos
      contentResponse.find(".cliente").removeClass("activeCliente");
      contentResponse.find(".cliente").click(function() {
        if ($(this).hasClass("activeCliente")) {
          var clienteId = this.id;
          clienteId = clienteId.replace("cliente-", "");
          var cliente = clientesStorage[clienteId];
          sessionStorage.setItem("clienteSelecionado", JSON.stringify(cliente));
          loadPage("cliente-lista");
        }
        else {
          contentResponse.find(".cliente").removeClass("activeCliente");
          $(this).addClass("activeCliente");
        }
      });
      hideMask();
    }
  }
}

/**
 * wsSaveCliente
 *
 * Funcao salvar novos clientes via ajax
 *
 */
function wsSaveCliente() {
  showMask();

  // obtem os dados para execucao da requisicao
  var cliente_nome = $(".form [name=new_cliente_nome]").val();
  var cliente_cpf = $(".form [name=new_cliente_cpf]").val();

  if (cliente_nome.length == 0 || cliente_cpf.length == 0) {
    alert("Todos os campos são obrigatórios")
  }

  var cliente = {
    cliente_nome: cliente_nome,
    cliente_cpf: cliente_cpf
  };

  // cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseSaveCliente", cliente: cliente};

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/saveCliente.php",
    type: "POST",
    dataType: "jsonp",
    data: {dados: dados}
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
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var cliente = response.wsresult;
    var msg = "Cliente cadastrado com sucesso!";
  }

  hideMask();
  showDialog("Cliente", msg, "Fechar", "hideDialog()");
}

/**
 * wsGetProduto
 *
 * Funcao obter os produtos via ajax
 *
 */
function wsGetProduto() {
  var search = $("#search");
  var searchField = search.find("input[name=search]");
  
  // obtem os dados para execucao da requisicao
  var prd = searchField.val();
  searchField.val("");

  if (prd.length == 0) {
    showDialog("Produto", "É necessário informar o código ou o nome do produto", "Ok");
    hideMask();
  }

  else {

    showMask();
    
    /* searchType
     * 0 => numero
     * 1 => texto
     */
    var searchType = 0;
    
    /* verifica se o campo foi preenchido com digito ou texto */
    var num = new Number(prd);
    if (!(num > 0))
      searchType = 1;

    var produto = {
      produto: prd,
      searchType: searchType
    };

    // cria bloco de dados a serem enviados na requisicao
    var dados = {wscallback: "wsResponseGetProduto", produto: produto};

    // executa a requisicao via ajax
    $.ajax({
      url: configServerUrl + "/getProduto.php",
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }
}

/**
 * wsResponseGetProduto
 *
 * Funcao para tratar o retorno da requisicao "wsGetProduto"
 *
 * @param {json} response
 */
function wsResponseGetProduto(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* verifica se houve erro ou sucesso */
  if (response.wsstatus == 0) {
    var msg = 'Produto não encontrado!';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;
    
    toast(msg);
  }

  /* lista de produtos quando busca pelo nome */
  else if (response.wsstatus == 2) {
    var produtos = response.wsresult;
    var ul = $("#list_prds");
    ul.html("");
    $.each(produtos, function(i, prd) {
      var codigo = prd.codigo;
      var descricao = prd.descricao;

      var li = $("<li>");
      var strong = $("<strong>");
      var span = $("<span>");

      strong.html(codigo);
      span.html(descricao);
      li.attr("id", codigo).append(strong).append(span);

      ul.append(li);
    });
    $("#list_prds li").click(function() {
      var codigo = $(this).attr("id");
      $('input[name=codigo]').val(codigo);
      wsGetProduto();
    });
    $("#list_prds").slideDown();
    $(window).click(function() {
      $('input[name=codigo]').val("");
      $("#list_prds").slideUp();
    });
    $("#list_prds").click(function() {
      return false;
    });
    $("input[name=codigo]").click(function() {
      return false;
    });
    $(".bt").click(function() {
      return false;
    });
  }

  else {

    /* obtem as informacoes do produto que veio no retorno */
    var produto = response.wsresult;

    var topoOk = false;
    var grade_anterior = "";
    var estoque = $('<table>');

    if (produto.estoque.length > 0) {
      /* percorre o array 'estoque' que contem as quantidades disponiveis do produto */
      $.each(produto.estoque, function(i, stk) {
        var grade = stk.grade;
        var qtty = parseInt(stk.qtty) / 1000;

        var loja_cod = stk.codigo_loja;
        var loja = stk.nome_loja;

        var td_button = '<td><button type="button" class="bt btshort bradius mask_red" onclick=\'exibeDialogQtty("' + grade + '");\'>+</button></td>';

        var topo = '<tr class="header"><td>Loja</td><td>Qtde.</td>' + td_button + '</tr>';

        /* monta a lista para exibir as grades e lojas */
        if (grade_anterior != grade) {
          var grd = $('<strong>');
          $(grd).addClass("grade");
          $(grd).html("Grade: " + grade);

          /* quando muda de grade adiciona a tabela de estoque na tela */
          if (grade_anterior.length > 0) {
            $(".list_estoques").append(estoque);
            estoque = $('<table>');
          }

          $(".list_estoques").append(grd);
          grade_anterior = grade;

          $(estoque).append(topo);
        }
        else if (!(grade.length > 0) && !topoOk) {
          topoOk = true;
          $(estoque).append(topo);
        }

        var td_loja = '<td>' + loja_cod + ' - ' + loja + '</td>';
        var td_qtty = '<td>' + qtty + '</td>';

        var tr = '<tr>' + td_loja + td_qtty + '<td></td></tr>';
        $(estoque).append(tr);
      });
    }

    $(".list_estoques").append(estoque);
    grade_anterior = 0;

    if (produto.img.length > 0) {
      /* percorre o array 'img' que contem as imagens do produto */
      var indiceImg = 0;
      $.each(produto.img, function(i, img) {
        var link = img.arquivo;
        /* cria os elementos utilizados na galeria de fotos */
        var galeriaSlide = $('<div>');
        var galeriaSlideA = $('<a>');
        var galeriaSlideImg = $('<img>');

        /* define alguns atributos necessarios para o funcionamento da galeria */
        $(galeriaSlideA).attr('href', 'javascript:gallery("' + produto.codigo + '", "' + link + '", "' + indiceImg + '")');
        $(galeriaSlide).addClass('swiper-slide');
        $(galeriaSlideImg).addClass('title');

        /* acessando a miniatura da imagem no servidor */
        var file = link.split('.');
        var extensao = file[file.length - 1];
        link = link.replace('.' + extensao, '_min.' + extensao);

        /* define a imagem e adiciona na div slide */
        $(galeriaSlideImg).attr('src', link);
        $(galeriaSlideA).append(galeriaSlideImg);
        $(galeriaSlide).append(galeriaSlideA);

        /* adiciona a div slide com a imagem da galeria de fotos */
        $('.swiper-container1 .swiper-wrapper').append(galeriaSlide);

        indiceImg++;
      });
    }
    else {
      var link = 'img/logo_nophoto.jpg';

      /* cria os elementos utilizados na galeria de fotos */
      var galeriaSlide = $('<div>');
      var galeriaSlideImg = $('<img>');

      /* define alguns atributos necessarios para o funcionamento da galeria */
      $(galeriaSlide).addClass('swiper-slide');
      $(galeriaSlideImg).addClass('title');

      /* define a imagem e adiciona na div slide */
      $(galeriaSlideImg).attr('src', link);
      $(galeriaSlide).append(galeriaSlideImg);

      /* adiciona a div slide com a imagem da galeria de fotos */
      $('.swiper-container1 .swiper-wrapper').append(galeriaSlide);
    }

    $('#conteudo #produto').html(produto.descricao);
    $('#conteudo #codigo').html(produto.codigo);
    $('#conteudo #preco').html("R$ " + produto.preco);
    $('#conteudo #mult').html(produto.multiplicador / 1000);

    /* adiciona a div slide com a imagem da galeria de fotos */
    $('.swiper-container1 .swiper-wrapper').append(galeriaSlide);

    /* remove o 'focus' do campo 'codigo' */
    $('input[name=codigo]').blur();

    /* recarrega as funcoes de javascript */
    loadSwiper();
    initialSlide = 0;
    heigth = $('.swiper-container').height();
    $('.swiper-container').css({'height': '200px'});
    $("#list_prds").slideUp();
  }
  $('input[name=codigo]').val("");
}
