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
var waitToastMsg;

var setElementPopupVal;

var configServerUrl = "http://192.168.1.13/saciPresenteServidor";

var fileSplit;
var limitSplitPrds = 10;

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
  window.setTimeout(function () {
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

  window.setTimeout(function () {
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

    window.setTimeout(function () {
      menu.removeClass("animate");
    }, 300);

    hideDrawer();
  }

  else {
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

  var reloadPageOk = false;

  if (backButton && $("#search").is(":visible")) {
    hideSearch();
  }

  else if (backButton && menuLeft == 0) {
    hideMenuSec();
  }

  else {

    if (waitLoadPage == 0) {
      clearInterval(waitLoadPageInterval);
      waitLoadPageInterval = window.setInterval(function () {
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

    else {
      page = pageBack.pop().page;
      reloadPageOk = true;
    }

    var element = $("#" + page);
    var content = "pages/" + page + ".html";

    $("#content").find(".page").removeClass("activePage").addClass("inactivePage");

    window.setTimeout(function () {
      if (!backButton || reloadPageOk) {
        $.ajax({
          url: content,
          type: "POST",
          dataType: "html",
          data: {},
          success: function (response) {
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
  waitResponseAjax = window.setInterval(function () {
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
  if(page != undefined){
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

    // personaliza os itens de acordo com cada pagina
    $.ajax({
      url: "menus/" + page + ".json",
      type: "GET",
      dataType: "json",
      success: function (response) {
        
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
              $.each(pageTitle.itens, function (i, item) {
                descs.eq(i).html(item.desc).show();
              });
            }
          }
          if (pageTitle.hasOwnProperty("subtitle")) {
            $("#sub-title-page").text(pageTitle.subtitle);
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
          $.each(pageActions.itens, function (i, item) {
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
                search.find("#action-0").show();
                animateClick(search.find("#action-0"));
              } else {
                search.find("#action-0").hide();
              }
              search.find("input[name=search]").attr("placeholder", type);
              search.find("input[name=funcSearch]").val(item.type);
            }
          });
        }

        if (pageMenu && pageMenu.hasOwnProperty("show") && pageMenu.show) {
          var options = "";
          $.each(pageMenu.itens, function (i, item) {
            options += '<li onclick="' + item.onclick + '">' + item.label + '</li>';
          });
          menu.append(options);
          exibMenu.show();
          window.setTimeout(function () {
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
}

function getIcon(type) {
  var icon = $("<img>");

  icon.attr("src", "img/ico-" + type + ".png").addClass("ico-actions");

  return icon;
}

function animateClick(elem) {
  elem.addClass("click").click(function () {
    var duration = elem.css("transition-duration").replace("s", "");
    duration = duration * 1000;

    elem.addClass("clickActive");
    window.setTimeout(function () {
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

  $(window).click(function () {
    if (menu.hasClass("activeMenu"))
      hideMenu();
  });

  $("#content").on("touchmove", function () {
    if (menu.hasClass("activeMenu"))
      hideMenu();
  });

  $("#search").click(function () {
    return false;
  });

  $("#exibMenu").click(function () {
    if (menu.hasClass("activeMenu"))
      hideMenu();
    else
      showMenu();
    return false;
  });

  $("#menu").click(function () {
    if (menu.hasClass("activeMenu"))
      hideMenu();
  });

  animateClick($("#exibMenu"));
  animateClick($("#menu li"));

  $("#mask-shadow").click(function () {
    hideMenuSec();
  });

  $("#mask-full").click(function () {
    hidePopup();
    hideMaskFull();
  });
  
  $("#nav-options").find("li").click(function(){
    hideMenuSec();
  });
}

function hideLogin() {
  $("#login").fadeOut();
  loadPage('index');
}

function showDialog(title, msg, labelBt1, onclickBt1, labelBt2, onclickBt2, elem, input) {
  showMaskFull();

  var popupDialog = $("#popup-dialog");

  if (labelBt1 == null)
    labelBt1 = "Fechar";

  if (onclickBt1 == null)
    onclickBt1 = "hideDialog();";

  // oculta todos os botoes
  popupDialog.find("button").hide();

  // seta o titulo e a mensagem no dialog
  popupDialog.find(".dialog").find(".title").text(title);
  popupDialog.find(".dialog").find(".msg").text(msg);

  if (input == true) {
    setElementPopupVal = elem;
    popupDialog.find("input").show().val("").keypress(function (evt) {
      var tecla = (evt.keyCode ? evt.keyCode : evt.which);
      if (tecla == 13) {
        popupDialog.find("button").eq(1).click();
      }
    })
  }
  else {
    popupDialog.find("input").hide();
  }

  var marginTop = -(parseInt(popupDialog.css("height")) / 2);
  popupDialog.css("margin-top", marginTop);

  // seta o primeiro botao
  popupDialog.find("button").eq(0).text(labelBt1).attr("onclick", onclickBt1).show();

  // caso o segundo botao esteja definido reduz o tamanho dos botoes para 50% e exibe o segundo botao
  if (labelBt2) {
    popupDialog.find("button").eq(0).addClass("cancel").css("width", "50%");
    popupDialog.find("button").eq(1).text(labelBt2).attr("onclick", onclickBt2).css("width", "50%").show();
  }

  // caso o segundo botao nao esteja definido aumenta o tamanho do primeiro botao para 100%
  else {
    popupDialog.find("button").eq(0).css("width", "100%");
  }

  popupDialog.show();

  if (input) {
    popupDialog.find("input").focus();
  }

}

function hideDialog() {
  hidePopup();
  hideMaskFull();
}

function setPopupGradeQtty() {
  var val = $("#popup-dialog").find("input").val();

  val = parseInt(val);

  if (!isNaN(val))
    $(setElementPopupVal).text(val);

  hideDialog();
}

function showSelect(type, elem) {
  var popupSelect = $("#popup-select");
  var marginTop = 0;

  switch (type) {

    case "day":
      var ul = $("<ul>");
      var lis = "";
      for (var i = 1; i <= 31; i++) {
        lis += "<li>" + (i < 10 ? "0" + i : i) + "</li>";
      }
      ul.append(lis);
      popupSelect.html(ul);
      popupSelect.find("ul").find("li").click(function () {
        var value = $(this).text();
        $(elem).text(value);
        hideMaskFull();
        popupSelect.hide();
      });
      break;

    case "month":
      var ul = $("<ul>");
      var lis = "";
      for (var i = 1; i <= 12; i++) {
        lis += "<li>" + (i < 10 ? "0" + i : i) + "</li>";
      }
      ul.append(lis);
      popupSelect.html(ul);
      popupSelect.find("ul").find("li").click(function () {
        var value = $(this).text();
        $(elem).text(value);
        hideMaskFull();
        popupSelect.hide();
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
      popupSelect.html(ul);
      popupSelect.find("ul").find("li").click(function () {
        var value = $(this).text();
        $(elem).text(value);
        hideMaskFull();
        popupSelect.hide();
      });
      break;

    case "tipoLista":
      var ul = $("<ul>");
      var lis = "";
      var tipos = sessionStorage.getItem("tiposListas");
      var tiposListas = JSON.parse(tipos);

      $.each(tiposListas, function (i, tipo) {
        lis += "<li data-value='" + tipo.tipo_lista_codigo + "'>" + tipo.tipo_lista_nome + "</li>";
      });
      ul.append(lis);
      popupSelect.html(ul);
      popupSelect.find("ul").find("li").click(function () {
        var tipoName = $(this).text();
        var tipoCodigo = $(this).attr("data-value");
        $(elem).text(tipoName).attr("data-value", tipoCodigo);
        hideMaskFull();
        popupSelect.hide();
      });
      break;

    case "tipoListaDefault":
      var ul = $("<ul>");
      var lis = "";
      var tipos = sessionStorage.getItem("tiposListas");
      var tiposListas = JSON.parse(tipos);

      $.each(tiposListas, function (i, tipo) {
        lis += "<li data-value='" + tipo.tipo_lista_codigo + "'>" + tipo.tipo_lista_nome + "</li>";
      });
      ul.append(lis);
      popupSelect.html(ul);
      popupSelect.find("ul").find("li").click(function () {
        var tipoName = $(this).text();
        var tipoCodigo = $(this).attr("data-value");

        wsGetListaDefault(tipoCodigo);

        hideMaskFull();
        popupSelect.hide();        
      });
      break;
  }
  showMaskFull();
  marginTop = -(parseInt(popupSelect.css("height")) / 2);
  popupSelect.css("margin-top", marginTop);
  popupSelect.show();
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

function calcTotalPrds(prds) {
  var price = 0;
  var total = 0;

  prds.each(function (i, prd) {
    price = $(prd).find(".prd-price").find("span").text();
    total += parseInt(price);
  });

  total = number_format(total / 100, 2, ',', '.');

  return total;
}

function init() {

  //hideLogin();

  $.ajaxSetup({cache: false});

  // Ativa algumas acoes ao clicar em determinados locais da tela
  clickOut();

  // instancia algumas variaveis globais para auxiliar no controle do menu lateral   var currentPageX = 0;
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
  menu.addEventListener("touchstart", function (evt) {
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
  menu.addEventListener("touchmove", function (evt) {
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
  menu.addEventListener("touchend", function () {
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

    window.setTimeout(function () {
      menu.removeClass("animate");
    }, 300);

    if (newMenuLeft == 0)
      showDrawer();
    else
      hideDrawer();
  });

  $("#scroll").find("li").on("touchstart", function (evt) {
    evt.stopPropagation();
  });

  $("#scroll").find("li").on("touchmove", function (evt) {
    evt.stopPropagation();
  });

  $("#scroll").find("button").on("touchstart", function (evt) {
    evt.stopPropagation();
  });

  $("#scroll").find("button").on("touchmove", function (evt) {
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

  $("button").click(function () {
    var button = $(this);
    button.addClass("activeButton");

    window.setTimeout(function () {
      button.removeClass("activeButton");
    }, 200);
  });

  $("#search").find("input[name=search]").keypress(function (evt) {
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
  $("#popup-login").find("input").keypress(function (evt) {
    var tecla = (evt.keyCode ? evt.keyCode : evt.which);
    if (tecla == 13) {
      wsLogin();
    }
  });

  $(".show-pass").click(function () {
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
    fieldPass.focus();
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
    slide: function (event, ui) {
      priceMin.text(ui.values[0]);
      priceMax.text(ui.values[1]);
    }
  });
  priceMin.text(sliderRange.slider("values", 0));
  priceMax.text(sliderRange.slider("values", 1));
}

function toast(msg) {
  clearInterval(waitToastMsg);
  $('#toast').html(msg);
  $('#toast').fadeIn();
  waitToastMsg = window.setInterval(function () {
    $('#toast').fadeOut();
  }, 3000);
}

function inArrayCl(key, arr) {
  var existsOk = false
  $.each(arr, function (i, reg) {
    if (reg.centro_lucro == key) {
      existsOk = true;
    }
  });
  return existsOk;
}

function resetPageContent() {
  // limpa a pagina a ser preenchida com os dados
  var page = $("#content").find(".page.activePage:last").attr("id");

  $("#" + page).find(".content-response").hide();
  $("#" + page).find(".mark-agua").show();
}

/*
 Document   : actions
 Created on : 24/06/2014, 17:00:09
 Author     : Felipe Jorge - felipejorgeas@gmail.com  Description:
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

    $("#login #followingBallsG").fadeOut();

    toast(msg);
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
 * wsResponseGetTipoDeLista  *
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
  }

  else {
    var filtros = $("#filter-lista-busca");
    // obtem os dados para execucao da requisicao
    var dia = filtros.find(".input-date.day").text();
    var mes = filtros.find(".input-date.month").text();
    var ano = filtros.find(".input-date.year").text();
    var tipoListaCodigo = filtros.find(".input-select.tipoLista").attr("data-value");

    var clienteNome = $("#search input[name=search]").val();
    clienteNome = removerAcentos(clienteNome);

    // preparacao dos dados
    var dataEvento = "" + ano + mes + dia;
    var lista = {
      data_evento: parseInt(dataEvento) > 0 ? dataEvento : "",
      tipo: tipoListaCodigo.length > 0 ? tipoListaCodigo : "",
      nome_cliente: clienteNome
    };

  }

// cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseGetLista", lista: lista};

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getLista.php",
    type: "POST", dataType: "jsonp",
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

    resetPageContent();

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
      $.each(listas, function (i, lista) {
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
      contentResponse.find(".card").click(function () {
        if ($(this).hasClass("activeCard")) {
          var modulo = sessionStorage.getItem("modulo");
          var listaId = this.id;
          listaId = listaId.replace("lista-", "");
          var lista = listasStorage[listaId];
          
          var prd;

          var listaOk = {
            clienteCodigo: lista.cliente_codigo,
            clienteNome: lista.cliente_nome,
            dataEvento: lista.data_evento,
            tipoLista: {tipoListaCodigo: lista.tipo_codigo, tipoListaNome: lista.tipo_nome},
            produtos: []
          };

          /* padroniza o formato da lista */
          $.each(lista.produtos, function (i, produto) {
            prd = {
              produto: {
                codigo: produto.codigo,
                descricao: produto.descricao,
                multiplicador: produto.multiplicador,
                preco: produto.preco,
                img: produto.img,
                centrolucro: {codigo_categoria: produto.centro_lucro, nome_categoria: produto.centro_lucro_nome},
                fornecedor: {codigo_fabricante: produto.codigo_fabricante, nome_fabricante: produto.nome_fabricante, nome_fantasia: produto.nome_fantasia_fabricante}
              },
              grade: {gradeNome: produto.grade, gradeQtty: produto.quantidade_listada / 1000}
            }
            listaOk.produtos.push(prd);
          });
          
          sessionStorage.setItem("listaName", "listaSelecionada");
          sessionStorage.setItem("listaSelecionada", JSON.stringify(listaOk));

          switch (modulo) {
            case "cliente":
              loadPage("lista-produto-visualizacao-lista");
              break;
              
            case "convidado":
              loadPage("lista-produto-visualizacao-convidado");
              break;
          }

        }
        
        else {
          contentResponse.find(".card").removeClass("activeCard");
          $(this).addClass("activeCard");
        }
        
        return false;
      });
      
      $(window).click(function () {
        $(".card").removeClass("activeCard");
      });
    }
    hideMask();
  }
  $("#search").find("input[name=search]").val("");
}

























/**
 * wsGetListaDefault
 *
 * Funcao obter as listas de presentes padroes via ajax
 *
 * @param {int} tipoListaCodigo
 */
function wsGetListaDefault(tipoListaCodigo) {
  hideMenuSec();
  showMask();

  if (tipoListaCodigo != null) {
    var lista = {
      tipo: tipoListaCodigo,
      listaDefault: 1
    }
  }

  // cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseGetListaDefault", lista: lista};

  // executa a requisicao via ajax
  $.ajax({
    url: configServerUrl + "/getLista.php",
    type: "POST", dataType: "jsonp",
    data: {dados: dados}
  });
}

/**
 * wsResponseGetListaDefault
 *
 * Funcao para tratar o retorno da requisicao "wsGetListaDefault"
 *
 * @param {json} response
 */
function wsResponseGetListaDefault(response) {
  // faz o parser do json
  response = JSON.parse(response);

  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Nenhuma lista encontrada!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    resetPageContent();

    toast(msg);
    hideMask();
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var lista = response.wsresult;
    
    var prd;
    
    var listaOk = {
      clienteCodigo: lista.cliente_codigo,
      clienteNome: lista.cliente_nome,
      dataEvento: lista.data_evento,
      tipoLista: {tipoListaCodigo: lista.tipo_codigo, tipoListaNome: lista.tipo_nome},
      produtos: []
    };

    /* padroniza o formato da lista */
    $.each(lista.produtos, function (i, produto) {
      prd = {
        produto: {
          codigo: produto.codigo,
          descricao: produto.descricao,
          multiplicador: produto.multiplicador,
          preco: produto.preco,
          img: produto.img,
          centrolucro: {codigo_categoria: produto.centro_lucro, nome_categoria: produto.centro_lucro_nome},
          fornecedor: {codigo_fabricante: produto.codigo_fabricante, nome_fabricante: produto.nome_fabricante, nome_fantasia: produto.nome_fantasia_fabricante}
        },
        grade: {gradeNome: produto.grade, gradeQtty: produto.quantidade_listada / 1000}
      }
      listaOk.produtos.push(prd);
    });    
    
    sessionStorage.setItem("listaDefault", JSON.stringify(listaOk));
    loadPage("lista-produto-padrao");
  }
}

/**
 * wsGetCliente
 *  * Funcao obter os clientes via ajax
 *
 * @param {json} response
 */
function wsGetCliente() {
  hideMenuSec();

  // obtem os dados para execucao da requisicao
  var clienteNome = $("#search [name=search]").val();
  clienteNome = removerAcentos(clienteNome);

  if (clienteNome.length == 0) {
    showDialog("Cliente", "É necessário informar o nome do cliente", "Ok");
    hideMask();
  }

  else {

    showMask();

    var cliente = {
      nome_cliente: clienteNome
    };

// cria bloco de dados a serem enviados na requisicao
    var dados = {wscallback: "wsResponseGetCliente", cliente: cliente};

    // executa a requisicao via ajax
    $.ajax({
      url: configServerUrl + "/getCliente.php",
      type: "POST",
      dataType: "jsonp", data: {dados: dados}
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

      $.each(clientes, function (i, cliente) {
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
      contentResponse.find(".cliente").click(function () {
        if ($(this).hasClass("activeCliente")) {
          var clienteId = this.id;
          clienteId = clienteId.replace("cliente-", "");
          var cliente = clientesStorage[clienteId];
          sessionStorage.setItem("clienteSelecionado", JSON.stringify(cliente));
          sessionStorage.removeItem("listaNew");
          loadPage("cliente-lista");
        }
        else {
          contentResponse.find(".cliente").removeClass("activeCliente");
          $(this).addClass("activeCliente");
        }
        return false;
      });
      
      $(window).click(function () {
        $(".cliente").removeClass("activeCliente");
      });
      
      hideMask();
    }
  }
}

function exibeDialogSaveCliente() {
  // obtem os dados para execucao da requisicao   
  var clienteNome = $(".form [name=new_cliente_nome]").val();
  var clienteCpf = $(".form [name=new_cliente_cpf]").val();

  if (clienteNome.length == 0 || clienteCpf.length == 0) {
    showDialog("Cadastro", "Todos os campos são obrigatórios");
  }

  else {
    var clienteInfo = {
      clienteNome: clienteNome,
      clienteCpf: clienteCpf
    }
    
    sessionStorage.setItem("clienteInfo", JSON.stringify(clienteInfo));

    showDialog("Cliente", "Salvar este cliente no SACI?", "Cancel", "hideDialog()", "Ok", "wsSaveCliente()");
  } 
}

/**
 * wsSaveCliente  *
 * Funcao salvar novos clientes via ajax
 *
 */
function wsSaveCliente() {  
  showMask();

  var clienteInfo = sessionStorage.getItem("clienteInfo");
  clienteInfo = JSON.parse(clienteInfo);

  var cliente = {
    cliente_nome: clienteInfo.clienteNome,
    cliente_cpf: clienteInfo.clienteCpf
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
  
  hideDialog();
  
  // faz o parser do json
  response = JSON.parse(response);
  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Não foi possível cadastrar o cliente!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    toast(msg);
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {

    var cliente = response.wsresult;
    sessionStorage.removeItem("clienteInfo");
    
    toast("Cliente salvo no SACI!");
  }

  hideMask();
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
  var prd = searchField.val();

  searchField.val("");
  prd = removerAcentos(prd);

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

/**  * wsResponseGetProduto
 *
 * Funcao para tratar o retorno da requisicao "wsGetProduto"
 *
 * @param {json} response
 */
function wsResponseGetProduto(response) {
  // faz o parser do json
  response = JSON.parse(response);

  var search = $("#search");
  var searchField = search.find("input[name=search]");

  var page = $("#content").find(".page.activePage:last");
  var pageId = "#" + page.attr("id");
  var marcaDagua = $(pageId).find(".mark-agua");
  var contentResponse = $(pageId).find(".content-response");

  /* verifica se houve erro ou sucesso */
  if (response.wsstatus == 0) {
    var msg = 'Produto não encontrado!';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    hideMask();
    toast(msg);
  }

  /* lista de produtos quando busca pelo nome */
  else if (response.wsstatus == 2) {
    var produtos = response.wsresult;

    if (produtos.length > 0) {

      var contentResponseList = $("#list-prds");
      var produtosLista = [];
      var produtosStorage = [];

      $.each(produtos, function (i, produto) {
        produtosStorage.push(produto);

        // tratamento dos dados retornados
        var produtoCodigo = produto.codigo;
        var produtoNome = produto.descricao;
        var produtoImg = produto.img;

        if (produtoImg.length > 0) {
          /* acessando a miniatura da imagem no servidor */
          var file = produtoImg.split('.');
          var extensao = file[file.length - 1];
          produtoImg = produtoImg.replace('.' + extensao, '_min.' + extensao);
        }
        else
          produtoImg = "img/nophoto.jpg";

        // criacao dos objetos a serem inseridos na pagina
        var box =
                "<div id='produto-" + i + "' class='prds'>" +
                "<div class='prd-img bradius'>" +
                "<img src='" + produtoImg + "' />" +
                "</div>" +
                "<div class='prd-info'>" +
                "<p><strong>" + produtoNome + "</strong></p>" +
                "<p>Cód.: " + produtoCodigo + "</p>" +
                "</div>" +
                "</div>";

        produtosLista.push(box);
      });

      // insere os blocos na pagina
      contentResponse.scrollTop(0).show();
      contentResponseList.html(produtosLista).scrollTop(0).slideDown();

      // ativa as acoes de cliques nos blocos inseridos
      contentResponseList.find(".prds").click(function () {
        contentResponseList.slideUp();
        var produtoId = this.id;
        produtoId = produtoId.replace("produto-", "");
        var produto = produtosStorage[produtoId];
        searchField.val(produto.codigo);
        wsGetProduto();
      });

      hideMask();
      hideSearch();

      $(window).click(function () {
        contentResponseList.slideUp();
      });
    }
  }

  else {

    /* obtem as informacoes do produto que veio no retorno */
    var produto = response.wsresult;

    /* armazena os dados do produto buscado */
    sessionStorage.setItem("produtoLoad", JSON.stringify(produto));

    var listaName = sessionStorage.getItem("listaName");
    var modulo = sessionStorage.getItem("modulo");

    var lista;
    
    /* obtem a lista atual para preencher as quantidades na tela caso o produto 
     * ja esteja na lista */     
    if(modulo == "cliente"){
      lista = sessionStorage.getItem(listaName);
    }
    else if(modulo == "convidado" && listaName == "listaSelecionada"){
      lista = sessionStorage.getItem("pedidoNew");
    }
    
    lista = JSON.parse(lista);

    var galeria = $("<div id='galeria-imagens'>");
    var galeriaWrapper = $("<div class='swiper-wrapper'>");
    var imagensLista = [];
    var gallerySwiper;

    var grades = $("<div id='produto-grades'>");
    var gradesLista = [];
    var gradeQtty = 0;
    var activeGrade = "";
    var prd;

    var info;
    var box;

    // limpa quaisquer conteudo antigo
    contentResponse.html("");

    // Galeria de fotos
    if (produto.img.length > 0) {
      $.each(produto.img, function (i, img) {
        var imgUrl = img.arquivo;

        /* acessando a miniatura da imagem no servidor */
        var file = imgUrl.split('.');
        var extensao = file[file.length - 1];
        imgUrl = imgUrl.replace('.' + extensao, '_min.' + extensao);

        box =
                "<div class='swiper-slide'>" +
                "<div class='content-slide'>" +
                "<img src='" + imgUrl + "' />" +
                "</div>" +
                "</div>";

        imagensLista.push(box);
      });
    }
    else {
      box =
              "<div class='swiper-slide'>" +
              "<div class='content-slide'>" +
              "<img src='img/nophoto.jpg' />" +
              "</div>" +
              "</div>";
      imagensLista.push(box);
    }

    galeriaWrapper.html(imagensLista);
    galeria.append(galeriaWrapper);
    contentResponse.append(galeria);

    // ativa a galeria
    gallerySwiper = new Swiper("#galeria-imagens", {
      speed: 500
    });

    // ajusta as dimensoes da galeria
    $(".content-slide").width(page.width() + 20);

    // Informações do produto
    var centrolucro = produto.centrolucro.nome_categoria;
    centrolucro = centrolucro.replace(/\//g, ">");
    info =
            "<div id='produto-info' class='bradius'>" +
            "<p class='produto-nome bradius'>" + produto.descricao + "</p>" +
            "<p class='produto-detalhes'>CÓD.: " + produto.codigo + "</p>" +
            "<p class='produto-detalhes'>" + produto.fornecedor.nome_fantasia + "</p>" +
            "<p class='produto-detalhes'>" + centrolucro + "</p>" +
            "<p class='produto-preco'>R$ <span>" + number_format(produto.preco / 100, 2, ",", ".") + "</span></p>" +
            "<p class='produto-mult hidden'>" + produto.multiplicador + "</span>" +
            "</div>";

    contentResponse.append(info);

    // Grades do produto
    if (produto.grades[0].length > 0) {
      $.each(produto.grades, function (i, grade) {
        gradeQtty = 0;
        activeGrade = "";

        /* monta o bloco com as informacoes do produto */
        prd = {
          "produto": produto,
          "grade": {
            gradeNome: grade
          }
        }

        if (prdInList(prd, lista.produtos)) {
          prd = listPrdGet(prd, lista.produtos);
          gradeQtty = prd.grade.gradeQtty;
        }

        if (gradeQtty > 0)
          activeGrade = "activeGrade";

        if(listaName == "listaSelecionada" && modulo == "cliente"){
          box =
                  "<div class='produto-grade bradius " + activeGrade + "'>" +
                  "<p class='produto-grade-title'>" + grade + "</p>" +
                  "<p class='produto-grade-bt'>" +
                  "<span class='down bt hidden'>" +
                  "<img src='img/ico-expand.png' />" +
                  "</span>" +
                  "<span class='qtty' >" + gradeQtty + "</span>" +
                  "<span class='up bt hidden'>" +
                  "<img src='img/ico-collapse.png' />" +
                  "</span>" +
                  "</p>" +
                  "</div>";
        }
        else{
          box =
                  "<div class='produto-grade bradius " + activeGrade + "'>" +
                  "<p class='produto-grade-title'>" + grade + "</p>" +
                  "<p class='produto-grade-bt'>" +
                  "<span class='down bt'>" +
                  "<img src='img/ico-expand.png' />" +
                  "</span>" +
                  "<span class='qtty' onclick=\"showDialog('Quantidade', 'Digite a quantidade no campo abaixo:', 'Cancelar', 'hideDialog()', 'Ok', 'setPopupGradeQtty()', this, true);\">" + gradeQtty + "</span>" +
                  "<span class='up bt'>" +
                  "<img src='img/ico-collapse.png' />" +
                  "</span>" +
                  "</p>" +
                  "</div>";                 
        }

        gradesLista.push(box);
      });
    }

    else {
      /* monta o bloco com as informacoes do produto */
      prd = {
        "produto": produto,
        "grade": {
          gradeNome: ""
        }
      }

      if (prdInList(prd, lista.produtos)) {
        prd = listPrdGet(prd, lista.produtos);
        gradeQtty = prd.grade.gradeQtty;
      }

      if (gradeQtty > 0)
        activeGrade = "activeGrade";

      if(listaName == "listaSelecionada" && modulo == "cliente"){
        box =
                "<div class='produto-grade bradius " + activeGrade + "' style='width: 100%;'>" +
                "<p class='produto-grade-title'>Quantidade</p>" +
                "<p class='produto-grade-bt'>" +
                "<span class='down bt hidden'>" +
                "<img src='img/ico-expand.png' />" +
                "</span>" +
                "<span class='qtty' >" + gradeQtty + "</span>" +
                "<span class='up bt hidden'>" +
                "<img src='img/ico-collapse.png' />" +
                "</span>" +
                "</p>" +
                "</div>";
      }
      
      else{
        box =
                "<div class='produto-grade bradius " + activeGrade + "' style='width: 100%;'>" +
                "<p class='produto-grade-title'>Quantidade</p>" +
                "<p class='produto-grade-bt'>" +
                "<span class='down bt'>" +
                "<img src='img/ico-expand.png' />" +
                "</span>" +
                "<span class='qtty' onclick=\"showDialog('Quantidade', 'Digite a quantidade no campo abaixo:', 'Cancelar', 'hideDialog()', 'Ok', 'setPopupGradeQtty()', this, true);\">" + gradeQtty + "</span>" +
                "<span class='up bt'>" +
                "<img src='img/ico-collapse.png' />" +
                "</span>" +
                "</p>" +
                "</div>";
      }

      gradesLista.push(box);
    }

    grades.html(gradesLista);
    contentResponse.append(grades);

    // ativa o botoes de quantidade
    $(".produto-grade-bt").find(".bt").click(function () {
      var objBox = $(this).parent().parent();
      var objQtty = $(this).parent().find(".qtty");
      var qttyVal = parseInt(objQtty.text());

      if (isNaN(qttyVal))
        qttyVal = 0;

      if ($(this).hasClass("down")) {
        if (qttyVal > 0) {
          qttyVal--;
        }
      }
      else {
        qttyVal++;
      }

      objQtty.text(qttyVal);
    });

    marcaDagua.hide();
    contentResponse.scrollTop(0).show();

    hideMask();
    hideSearch();
  }
}

function prdAddList() {
  var modulo = sessionStorage.getItem("modulo");
  var listaName = sessionStorage.getItem("listaName");  
  var produtoLoad = sessionStorage.getItem("produtoLoad");
  var lista;
  var prd;
  
  if(modulo == "convidado" && listaName == "listaSelecionada"){
    listaName = "pedidoNew";
  }
  
  lista = sessionStorage.getItem(listaName);

  var page = $("#content").find(".page.activePage:last");
  var pageId = "#" + page.attr("id");
  var contentResponse = $(pageId).find(".content-response");

  var gradesObj = contentResponse.find(".produto-grade");
  var grd;
  var gradeNome;
  var gradeQtty;

  var updateOk = false;

  lista = JSON.parse(lista);
  produtoLoad = JSON.parse(produtoLoad);

  /* percorre todos os blocos de quantidades */
  $.each(gradesObj, function (i, item) {
    grd = $(item);
    gradeNome = grd.find(".produto-grade-title").text();
    gradeQtty = parseFloat(grd.find(".qtty").text());

    /* monta o bloco com as informacoes do produto */
    prd = {
      "produto": produtoLoad,
      "grade": {
        gradeNome: gradeNome == "Quantidade" ? "" : gradeNome,
        gradeQtty: gradeQtty
      }
    }

    /* verifica se ja existe este produto/grade na lista atual, 
     * se nao existir e a quantidade definida for maior que zero,
     * adiciona-o na lista de produtos */
    if (!prdInList(prd, lista.produtos) && gradeQtty > 0)
      lista.produtos.push(prd);

    /* caso o produto ja exista na lista atual apenas atualiza sua quantidade */
    else
      lista.produtos = listPrdUpdate(prd, lista.produtos);

    if (gradeQtty > 0)
      grd.addClass("activeGrade");
    else
      grd.removeClass("activeGrade");

    updateOk = true;
  });

  if (updateOk) {
    sessionStorage.setItem(listaName, JSON.stringify(lista));
    toast("Lista de presentes atualizada!");
  }

  else {
    toast("Busque por um produto antes!");
  }
}

function prdInList(produto, lista) {
  var existsOK = false;

  $.each(lista, function (i, prd) {
    if (prd.produto.codigo == produto.produto.codigo && prd.grade.gradeNome == produto.grade.gradeNome)
      existsOK = true;
  });

  return existsOK;
}

function listPrdUpdate(produto, lista) {
  var listaAux = lista;

  $.each(lista, function (i, prd) {
    if (prd) {
      if (prd.produto.codigo == produto.produto.codigo && prd.grade.gradeNome == produto.grade.gradeNome) {
        /* caso a quantidade do produto seja zero, remove-o da lista */
        if (produto.grade.gradeQtty == 0)
          listaAux.splice(i, 1);
        /* caso a quantidade seja maior que zero, atualiza a quantidade na lista */
        else
          listaAux[i].grade.gradeQtty = produto.grade.gradeQtty;
      }
    }
  });

  return listaAux;
}

function listPrdGet(produto, lista) {
  var existsOK = false;
  var produtoInfo;
  $.each(lista, function (i, prd) {
    if (prd.produto.codigo == produto.produto.codigo && prd.grade.gradeNome == produto.grade.gradeNome) {
      produtoInfo = prd;
      existsOK = true;
    }
  });
  return existsOK ? produtoInfo : false;
}

function wsSaveLista() {

  var listaName = sessionStorage.getItem("listaName");

  /* obtem a lista atual */
  var lista = sessionStorage.getItem(listaName);
  lista = JSON.parse(lista);

  if (lista != null) {

    /* obtem so dados do funcionario logado */
    var funcionarioCodigo = 1;//getUsuarioCodigo();
    var usuarioCodigo = 1;//getUsuarioUsuario();

    var listaOk = {
      cabecalho: "",
      produtos: []
    }

    var produtos = [];
    var produto;

    var cabecalho = {
      funcionarioCodigo: funcionarioCodigo,
      usuarioCodigo: usuarioCodigo,
      clienteCodigo: lista.clienteCodigo,
      tipoListaCodigo: lista.tipoLista.tipoListaCodigo,
      dataEvento: lista.dataEvento
    };

    $.each(lista.produtos, function (i, prd) {
      produto = {
        produtoCodigo: prd.produto.codigo,
        produtoGrade: prd.grade.gradeNome,
        produtoQuantidade: prd.grade.gradeQtty * 1000
//          produtoPreco: prd.produto.preco
      };
      produtos.push(produto);
    });

    listaOk.cabecalho = cabecalho;
    listaOk.produtos = produtos;
    
    sessionStorage.setItem("listaOk", JSON.stringify(listaOk));
  }

  showMask();
  wsSplitLista(true, false);
}

function wsSplitLista(first, last) {
  /* obtem a lista pronta para enviar para o SACI */
  var listaOk = sessionStorage.getItem("listaOk");
  listaOk = JSON.parse(listaOk);

  /* no primeiro envio de dados envia apenas as informacoes do cabecalho da lista 
   * sem os produtos */
  if (first) {

    /* gera um nome para o arquivo temporario a ser criado no servidor */
    fileSplit = Math.random().toString().split(".")[1];

    var dados = {
      wscallback: 'wsResponseSplitLista',
      inicio: 1,
      file: fileSplit,
      cabecalho: listaOk.cabecalho
    };

    $.ajax({
      url: configServerUrl + '/splitLista.php',
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }

  /* no ultimo envio envio apenas informa que todos os dados foram enviados */
  else if (last) {

    var dados = {
      wscallback: "wsResponseSaveLista",
      file: fileSplit
    };

    $.ajax({
      url: configServerUrl + '/saveLista.php',
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }

  else {
    var produtos = [];

    limitSplitPrds = (limitSplitPrds <= listaOk.produtos.length) ? limitSplitPrds : listaOk.produtos.length;

    for (var i = 0; i < limitSplitPrds; i++)
      produtos.push(listaOk.produtos.pop());

    sessionStorage.setItem("listaOk", JSON.stringify(listaOk));

    var dados = {
      wscallback: "wsResponseSplitLista",
      file: fileSplit,
      produtos: produtos
    };

    $.ajax({
      url: configServerUrl + '/splitLista.php',
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }
}

function wsResponseSplitLista(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* obtem a lista pronta para enviar para o SACI */
  var listaOk = sessionStorage.getItem("listaOk");
  listaOk = JSON.parse(listaOk);

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'Não foi possível salvar a lista no SACI!.';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    toast(msg);
  }

  else {

    /* se nao houver mais produtos a serem enviados finaliza o split */
    if (listaOk.produtos.length == 0)
      wsSplitLista(false, true);

    /* caso contrario, continua realizando o split na lista de produtos */
    else
      wsSplitLista(false, false);
  }
}

function wsResponseSaveLista(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  hideDialog();

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'Não foi possível salvar a lista no SACI!';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    toast(msg);
  }

  else {
    /* obtem as informacoes do orcamento que veio no retorno */
    var lista = response.wsresult;

    var listaName = sessionStorage.getItem("listaName");

    /* grava o historico de lista */
    //saveHist("lista", lista);

    toast("Lista salva no SACI!");

    /* remove a lista da sessao */
    sessionStorage.removeItem(listaName);

    /* retorna para o inicio do aplicativo */
    loadPage("index");

    /* verifica se esta configurado para enviar orcamentos por email */
//      if (configOrderSendMail == 1)
//        exibeDialogSendEmailOrcameto(orcamento.codigo);
  }
}

function wsSavePedido() {

  var listaName = sessionStorage.getItem("listaName");

  /* obtem a lista atual que serviu de base para o pedido */
  var lista = sessionStorage.getItem(listaName);
  lista = JSON.parse(lista);

  /* obtem o pedido atual */
  var pedido = sessionStorage.getItem("pedidoNew");
  pedido = JSON.parse(pedido);

  if (pedido != null) {

    /* obtem so dados do funcionario logado */
    var funcionarioCodigo = 1;//getUsuarioCodigo();
    var usuarioCodigo = 1;//getUsuarioUsuario();

    var pedidoOk = {
      cabecalho: "",
      produtos: []
    }

    var produtos = [];
    var produto;

    var cabecalho = {
      funcionarioCodigo: funcionarioCodigo,
      usuarioCodigo: usuarioCodigo,
      clienteCodigo: lista.clienteCodigo,
      tipoListaCodigo: lista.tipoLista.tipoListaCodigo,
      dataEvento: lista.dataEvento
    };

    $.each(pedido.produtos, function (i, prd) {
      produto = {
        produtoCodigo: prd.produto.codigo,
        produtoGrade: prd.grade.gradeNome,
        produtoQuantidade: prd.grade.gradeQtty * 1000
//          produtoPreco: prd.produto.preco
      };
      produtos.push(produto);
    });

    pedidoOk.cabecalho = cabecalho;
    pedidoOk.produtos = produtos;
    
    sessionStorage.setItem("pedidoOk", JSON.stringify(pedidoOk));
  }

  showMask();
  wsSplitPedido(true, false);
}

function wsSplitPedido(first, last) {
  /* obtem o pedido pronto para enviar para o SACI */
  var pedidoOk = sessionStorage.getItem("pedidoOk");
  pedidoOk = JSON.parse(pedidoOk);

  /* no primeiro envio de dados envia apenas as informacoes do cabecalho do pedido
   * sem os produtos */
  if (first) {

    /* gera um nome para o arquivo temporario a ser criado no servidor */
    fileSplit = Math.random().toString().split(".")[1];

    var dados = {
      wscallback: 'wsResponseSplitPedido',
      inicio: 1,
      file: fileSplit,
      cabecalho: pedidoOk.cabecalho
    };

    $.ajax({
      url: configServerUrl + '/splitPedido.php',
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }

  /* no ultimo envio envio apenas informa que todos os dados foram enviados */
  else if (last) {

    var dados = {
      wscallback: "wsResponseSavePedido",
      file: fileSplit
    };

    $.ajax({
      url: configServerUrl + '/savePedido.php',
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }

  else {
    var produtos = [];

    limitSplitPrds = (limitSplitPrds <= pedidoOk.produtos.length) ? limitSplitPrds : pedidoOk.produtos.length;

    for (var i = 0; i < limitSplitPrds; i++)
      produtos.push(pedidoOk.produtos.pop());

    sessionStorage.setItem("pedidoOk", JSON.stringify(pedidoOk));

    var dados = {
      wscallback: "wsResponseSplitPedido",
      file: fileSplit,
      produtos: produtos
    };

    $.ajax({
      url: configServerUrl + '/splitPedido.php',
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }
}

function wsResponseSplitPedido(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* obtem o pedido pronto para enviar para o SACI */
  var pedidoOk = sessionStorage.getItem("pedidoOk");
  pedidoOk = JSON.parse(pedidoOk);

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'Não foi possível salvar o pedido no SACI!.';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    toast(msg);
  }

  else {

    /* se nao houver mais produtos a serem enviados finaliza o split */
    if (pedidoOk.produtos.length == 0)
      wsSplitPedido(false, true);

    /* caso contrario, continua realizando o split dos produtos */
    else
      wsSplitPedido(false, false);
  }
}

function wsResponseSavePedido(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  hideDialog();

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'Não foi possível salvar o pedido no SACI!';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;

    toast(msg);
  }

  else {
    /* obtem as informacoes do orcamento que veio no retorno */
    var pedido = response.wsresult;

    /* grava o historico de lista */
    //saveHist("lista", lista);

    toast("Pedido salvo no SACI!");

    /* remove a lista da sessao */
    sessionStorage.removeItem("pedidoNew");

    /* retorna para o inicio do aplicativo */
    loadPage("index");

    /* verifica se esta configurado para enviar orcamentos por email */
//      if (configOrderSendMail == 1)
//        exibeDialogSendEmailOrcameto(orcamento.codigo);
  }
}

function exibeDialogClearList() {
  var page = $("#content").find(".page.activePage:last");  
  var contentResponse = page.find(".content-response");
  
  if(contentResponse.find(".produto").length == 0){
    toast("Não há produtos a serem removidos!");
  }
  
  else
    showDialog("Produto", "Excluir todos os produto?", "Cancel", "hideDialog()", "Ok", "clearList()");  
}

function clearList(){
  
  hideDialog();
  
  var modulo = sessionStorage.getItem("modulo");
  var listaName = sessionStorage.getItem("listaName");
  
  var lista;
  
  var page = $("#content").find(".page.activePage:last");
  var pageId = "#" + page.attr("id");
  var marcaDagua = $(pageId).find(".mark-agua");
  var contentResponse = $(pageId).find(".content-response");
  var totalPrds = $("#prd-total");
  
  if(modulo == "convidado" && listaName == "listaSelecionada"){
    listaName = "pedidoNew";
  }
  lista = sessionStorage.getItem(listaName);
  lista = JSON.parse(lista);
  
  lista.produtos = [];
  
  sessionStorage.setItem(listaName, JSON.stringify(lista));
  
  contentResponse.find(".produto").remove();
  contentResponse.hide();
  marcaDagua.show();
  totalPrds.hide();  
}

function exibeDialogPrdDel(produtoId, produtoCodigo, produtoGrade) {

  var prdDel = {
    produtoPos: produtoId,
    produtoCodigo: produtoCodigo,
    produtoGrade: produtoGrade
  }

  sessionStorage.setItem("prdDel", JSON.stringify(prdDel));

  showDialog("Produto", "Excluir produto da lista?", "Cancel", "hideDialog()", "Ok", "prdDel()");
}

function prdDel() {
  hideDialog();

  var page = $("#content").find(".page.activePage:last");
  var pageId = "#" + page.attr("id");
  var marcaDagua = $(pageId).find(".mark-agua");
  var contentResponse = $(pageId).find(".content-response");

  var modulo = sessionStorage.getItem("modulo");
  var listaName = sessionStorage.getItem("listaName");

  var lista;

  var prdDel = sessionStorage.getItem("prdDel");
  sessionStorage.removeItem("prdDel");

  prdDel = JSON.parse(prdDel);

  var prd = contentResponse.find("#produto-" + prdDel.produtoPos);

  prd.slideUp(function () {

    if(modulo == "convidado" && listaName == "listaSelecionada"){
      listaName = "pedidoNew";
    }
    lista = sessionStorage.getItem(listaName);
    lista = JSON.parse(lista);

    prd.remove();

    var produto = {
      produto: {codigo: prdDel.produtoCodigo},
      grade: {gradeNome: prdDel.produtoGrade, gradeQtty: 0}
    }

    lista.produtos = listPrdUpdate(produto, lista.produtos);
    sessionStorage.setItem(listaName, JSON.stringify(lista));

    var prds = contentResponse.find(".produto");
    var total = calcTotalPrds(prds);
    var totalPrds = $("#prd-total");

    totalPrds.find("#qtty").hide();
    totalPrds.find("#price").find("span").text(total);

    if (contentResponse.find(".produto").length == 0) {
      contentResponse.hide();
      marcaDagua.show();
      totalPrds.hide();
    }
    else
      totalPrds.show();
  });
}

function prdLoad(produtoCodigo) {
  var listaName = sessionStorage.getItem("listaName");
  var modulo = sessionStorage.getItem("modulo");
  sessionStorage.setItem("produtoLoadInfo", produtoCodigo);
  
  switch(listaName){
    
    case "listaSelecionada":
      if(modulo == "cliente")
        loadPage("produto-visualizacao");
      else
        loadPage("produto-busca");
      break;
      
    default:
      loadPage("produto-busca");
  }  
}

function exibeDialogSaveLista() {
  var listaName = sessionStorage.getItem("listaName");
  var lista = sessionStorage.getItem(listaName);
  lista = JSON.parse(lista);

  /* caso nao haja uma lista ou a mesma esteja sem produtos nao salva a lista */
  if (lista == null || !lista.produtos.hasOwnProperty(0))
    toast("É necessário adicionar produtos na lista!");

  else
    showDialog('Concluir', 'Salvar esta lista no SACI?', 'Cancelar', 'hideDialog()', 'Ok', 'wsSaveLista()');
}

function exibeDialogSavePedido() {
  var pedido = sessionStorage.getItem("pedidoNew");
  pedido = JSON.parse(pedido);

  /* caso nao haja um pedido ou o mesmo esteja sem produtos nao salva o pedido */
  if (pedido == null || !pedido.produtos.hasOwnProperty(0))
    toast("É necessário adicionar produtos na pedido!");

  else
    showDialog('Concluir', 'Salvar este pedido no SACI?', 'Cancelar', 'hideDialog()', 'Ok', 'wsSavePedido()');
}