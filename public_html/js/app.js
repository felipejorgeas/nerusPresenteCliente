/*
 Document   : apps
 Created on : 24/06/2014, 17:00:09
 Author     : Felipe Jorge - felipejorgeas@gmail.com
 Description:
 Prototipo de transicao de telas com animacao zoom in zoom out basica
 */

var configsApp = {
  serverUrl: {text: "http://eac-gvt.eacsoftware.com.br:8086/saciPresenteServidor", type: "input"},
  maxTimeRequest: {text: "30", type: "input"},
  maxTimeMsgToast: {text: "4", type: "input"},
  storeno: {text: "", type: "input"},
  pdvno: {text: "", type: "input"},
  sendMail: {text: "0", type: "radio"}
};

//var connectionOk = false;

var pageOld = "";
var pageBack = [];
var waitLoadPage = 0;
var waitLoadPageInterval;
var waitResponseAjax;
var waitToastMsg;

var setElementPopupVal;

//http://eac-gvt.eacsoftware.com.br:8086/saciPresenteServidorvar configServerUrl = "http://eac-gvt.eacsoftware.com.br:8086/saciPresenteServidor";

var fileSplit;
var limitSplitPrds = 10;

/**
 * Acoes ao pressionar o botão físico menu
 * 
 * @param {type} e
 * @returns {undefined}
 */
function onBackKeyMenu(e) {
  /* caso nao esteja na tela de login alterna entre abrir e fechar o menu */
  if (!$("#login").is(":visible"))
    menuSec();

  e.preventDefault();
}

/**
 * Acoes ao pressionar o botão físico voltar
 * 
 * @param {type} e
 * @returns {undefined}
 */
function onBackKeyDown(e) {
  // limpa a pagina a ser preenchida com os dados
  var page = $("#content").find(".page.activePage:last").attr("id");

  var header = $("#header");
  var action = header.find("#action");

  var menu = $("#navigator");
  var menuLeft = getTranslateX(menu);

  /* caso a busca esteja ativa, oculta-a */
  if ($("#search").is(":visible"))
    hideSearch();

  /* caso algum dialogo esteja ativo, oculta-o */
  else if ($("#popup-dialog").is(":visible"))
    hideDialog();

  /* caso algum select esteja ativo, oculta-o */
  else if ($("#popup-select").is(":visible")) {
    $("#popup-select").hide();
    hideMaskFull();
  }

  /* caso a lista de produtos esteja ativa, oculta-a */
  else if ($("#list-prds").height() > 0)
    $("#list-prds").slideUp(function () {
      $("#list-prds").html("");
    });

  /* caso o menu topo direito esteja ativo, oculta-o */
  else if ($("#menu").hasClass("activeMenu"))
    hideMenu();

  /* caso o menu lateral esquerdo esteja ativo, oculta-o */
  else if (menuLeft == 0)
    hideMenuSec();

  /* caso nao tenha entrado em nenhuma das clausulas acima
   * executa a seguinte acao:
   * se a pagina ataul nao for a index aciona a acao do botao da logo do cliente */
  else if (page != "index")
    action.click();

  /* caso a pagina atual seja index exibe o popup para fechar o aplicativo */
  else
    exibeDialogAppClose();

  e.preventDefault();
}

//function verifyConnectionServer(args) {
//  if (navigator.onLine) {
//    $.ajax({
//      url: configsApp.serverUrl.text + "/conected.json",
//      type: "POST",
//      dataType: "jsonp",
//      statusCode: {
//        200: function () {
//          execLastFunction(args);
//        },
//        404: function () {
//          toast("Não há conexão com o servidor! Verifique as configurações do aplicativo!");
//        }
//      }
//    });
//  } else {
//    toast("Verifique seu sinal de internet!");
//  }
//}
//
//function execLastFunction(args) {
//  connectionOk = true;
//
//  var execFunc = $("#execFunction");
//  var params = [];
//  var func = "";
//
//  for (var i = 0; i < args.length; i++) {
//    if (args.hasOwnProperty(i))
//      params.push(args[i]);
//  }
//
//  if(params.length == 0)
//    func = args.callee.name + "()";
//  
//  else
//    func = args.callee.name + "('" + params.join("','") + "')";  
//
//  execFunc.attr("onclick", func).click();
//}

function loadConfigsApp() {
  var configs = JSON.parse(localStorage.getItem("configsApp"));

  if (configs == null)
    localStorage.setItem("configsApp", JSON.stringify(configsApp));

  else
    configsApp = configs;
}

function loadConfigsAppPage() {
  if (configsApp != null) {
    if (configsApp.sendMail.text == "1") {
      var checkbox = $(".configs").find("li[data-value=sendMail]").find(".checkbox");
      checkbox.addClass("active");
    }
  }
}

function exibeDialogSetConfigApp(elem) {
  setElementPopupVal = elem;
  showDialog('Configuração', '', 'Cancelar', 'hideDialog()', 'Ok', 'setConfigApp()', true, true);
}

function getConfigApp(configName) {
  var config = configsApp[configName].text;
  return config;
}

function setConfigApp() {
  var elem = $(setElementPopupVal);
  var val = $("#popup-dialog").find("input").val();

  configsApp[elem.attr("data-value")].text = val;

  localStorage.setItem("configsApp", JSON.stringify(configsApp));

  hideDialog();
}

function setConfigAppRadio(item) {
  var elem = $(item);
  var checkbox = elem.find(".checkbox");

  if (checkbox.hasClass("active")) {
    configsApp[elem.attr("data-value")].text = "0";
    checkbox.removeClass("active");
  }
  else {
    configsApp[elem.attr("data-value")].text = "1";
    checkbox.addClass("active");
  }
  localStorage.setItem("configsApp", JSON.stringify(configsApp));
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

  if (backButton == true && $("#search").is(":visible")) {
    hideSearch();
  }

  else if (backButton == true && menuLeft == 0) {
    hideMenuSec();
  }

  else {
    hideMenuSec();

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
  var duration = parseInt(configsApp.maxTimeRequest.text) * 1000;
  clearInterval(waitResponseAjax);
  waitResponseAjax = window.setInterval(function () {
    toast("Não foi possível concluir a operação. Tente novamente!");
    hideMask();
  }, duration);
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

  if (page != undefined) {
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

    back.hide();

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

        /* se a pagina for diferente da anterior recarrega os botoes de acoes */
        if (page != pageOld) {

          descs.hide().html("");
          actionsHeader.hide().html("");

          search.hide();
          menu.hide().html("");
          exibMenu.hide();

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

  $("#nav-options").find("li").click(function () {
    hideMenuSec();
  });
}

function hideLogin() {
  $("#login").hide();
  loadPage('index');
//  loadPage('produto-busca');
}

function showDialog(title, msg, labelBt1, onclickBt1, labelBt2, onclickBt2, input, config) {
  showMaskFull();

  var popupDialog = $("#popup-dialog");

  if (labelBt1 == null)
    labelBt1 = "Fechar";

  if (onclickBt1 == null)
    onclickBt1 = "hideDialog();";

  // oculta todos os botoes
  popupDialog.find("button").hide();

  if (input == true) {
    var value = "";

    if (config == true) {
      var elem = $(setElementPopupVal);
      value = getConfigApp(elem.attr("data-value"));
      msg = elem.text().trim() + ":";
    }

    popupDialog.find("input").show().val(value).keypress(function (evt) {
      var tecla = (evt.keyCode ? evt.keyCode : evt.which);
      if (tecla == 13) {
        popupDialog.find("button").eq(1).click();
      }
    });
  }
  else {
    popupDialog.find("input").hide();
  }

  // seta o titulo e a mensagem no dialog
  popupDialog.find(".dialog").find(".title").text(title);
  popupDialog.find(".dialog").find(".msg").text(msg);

  var marginTop = -(50 + (parseInt(popupDialog.css("height")) / 2));
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

  popupDialog.show().find("input").css("text-transform", "none").focus();
}

function hideDialog() {
  hidePopup();
  hideMaskFull();
}

function tipoListaInArray(tipoCodigo, listas){
  var existsOk = false;
  $.each(listas, function(i, item){
    if(tipoCodigo == item.tipo_codigo)
      existsOk = true;
  });
  return existsOk;
}

function showSelect(type, elem, consistTypeList) {
  var popupSelect = $("#popup-select");
  var marginTop = 0;
  var ul = $("<ul>");
  var lis = "";

  switch (type) {

    case "day":

      for (var i = 1; i <= 31; i++) {
        lis += "<li>" + (i < 10 ? "0" + i : i) + "</li>";
      }

      ul.html(lis);
      popupSelect.html(ul);

      popupSelect.find("ul").find("li").click(function () {
        var value = $(this).text();
        $(elem).text(value);
        popupSelect.hide();
        hideMaskFull();
      });
      break;

    case "month":

      for (var i = 1; i <= 12; i++) {
        lis += "<li>" + (i < 10 ? "0" + i : i) + "</li>";
      }

      ul.html(lis);
      popupSelect.html(ul);

      popupSelect.find("ul").find("li").click(function () {
        var value = $(this).text();
        $(elem).text(value);
        popupSelect.hide();
        hideMaskFull();
      });
      break;

    case "year":
      var year = new Date().getFullYear();
      year -= 10;

      for (var i = 0; i <= 20; i++) {
        lis += "<li>" + (year + i) + "</li>";
      }

      ul.html(lis);
      popupSelect.html(ul);

      popupSelect.find("ul").find("li").click(function () {
        var value = $(this).text();
        $(elem).text(value);
        popupSelect.hide();
        hideMaskFull();
      });
      break;

    case "tipoLista":
      if(consistTypeList){
        var clienteListas = sessionStorage.getItem("clienteListas");
        clienteListas = JSON.parse(clienteListas);
      }

      var itens = sessionStorage.getItem("tiposListas");
      itens = JSON.parse(itens);

      $.each(itens, function (i, item) {
        var inactive = "";
        
        if(consistTypeList && clienteListas != null && tipoListaInArray(item.tipo_lista_codigo, clienteListas))
          inactive = "inactive";
        
        lis += "<li class='" + inactive + "' data-value='" + item.tipo_lista_codigo + "'>" + item.tipo_lista_nome + "</li>";
      });

      ul.html(lis);
      popupSelect.html(ul);

      popupSelect.find("ul").find("li").click(function () {
        var nome = $(this).text();
        var codigo = $(this).attr("data-value");
        
        if(consistTypeList && clienteListas != null && tipoListaInArray(codigo, clienteListas)){
          toast("Não é possível criar mais uma lista deste tipo para este cliente!");
        }
        else{
          $(elem).text(nome).attr("data-value", codigo);
          popupSelect.hide();
          hideMaskFull();
        }
      });
      break;

    case "tipoListaDefault":

      var itens = sessionStorage.getItem("tiposListas");
      itens = JSON.parse(itens);

      $.each(itens, function (i, item) {
        lis += "<li data-value='" + item.tipo_lista_codigo + "'>" + item.tipo_lista_nome + "</li>";
      });

      ul.html(lis);
      popupSelect.html(ul);

      popupSelect.find("ul").find("li").click(function () {
        var nome = $(this).text();
        var codigo = $(this).attr("data-value");
        wsGetListaDefault(codigo);
        popupSelect.hide();
        hideMaskFull();
      });
      break;

    case "tipoProduto":

      var itens = sessionStorage.getItem("tiposProdutos");
      itens = JSON.parse(itens);

      $.each(itens, function (i, item) {
        lis += "<li data-value='" + item.tipo_produto_codigo + "'>" + item.tipo_produto_nome + "</li>";
      });

      ul.html(lis);
      popupSelect.html(ul);

      popupSelect.find("ul").find("li").click(function () {
        var nome = $(this).text();
        var codigo = $(this).attr("data-value");
        $(elem).text(nome).attr("data-value", codigo);
        popupSelect.hide();
        hideMaskFull();
      });
      break;

    case "fabricante":

      var itens = sessionStorage.getItem("fabricantes");
      itens = JSON.parse(itens);

      $.each(itens, function (i, item) {
        lis += "<li data-value='" + item.codigo_fabricante + "'>" + item.nome_fabricante + "</li>";
      });

      ul.html(lis);
      popupSelect.html(ul);

      popupSelect.find("ul").find("li").click(function () {
        var nome = $(this).text();
        var codigo = $(this).attr("data-value");
        $(elem).text(nome).attr("data-value", codigo);
        popupSelect.hide();
        hideMaskFull();
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

  loadConfigsApp();

  wsGetCentroLucro();

//  hideLogin();
//  menuSec();

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

  $("#user-logged").on("touchstart", function (evt) {
    evt.stopPropagation();
  });

  $("#user-logged").on("touchmove", function (evt) {
    evt.stopPropagation();
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

  $("#filter-lista-produto").find(".produtoNome").keypress(function (evt) {
    var tecla = (evt.keyCode ? evt.keyCode : evt.which);
    if (tecla == 13) {
      filterListPrds();
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
}

function toast(msg) {
  var duration = parseInt(configsApp.maxTimeMsgToast.text) * 1000;
  clearInterval(waitToastMsg);
  $('#toast').html(msg);
  $('#toast').fadeIn();
  waitToastMsg = window.setInterval(function () {
    $('#toast').fadeOut();
  }, duration);
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
  var page = $("#content").find(".page.activePage:last");

  page.find(".content-response").hide();
  page.find(".mark-agua").show();
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

  if ((usuario.length == 0) || (senha.length == 0)) {
    toast("É necessário informar usuário e senha!");
  }

  else {

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
      url: configsApp.serverUrl.text + '/getFuncionario.php',
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

//    wsGetTipoDeLista();
    hideLogin();

    toast('Login realizado com sucesso!');
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
    url: configsApp.serverUrl.text + "/getTipoDeLista.php",
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
 * wsGetTipoDeProduto
 *
 * Funcao obter os tipos de produtos via ajax
 *
 */
function wsGetTipoDeProduto() {

// cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseGetTipoDeProduto"};

  // executa a requisicao via ajax
  $.ajax({
    url: configsApp.serverUrl.text + "/getTipoDeProduto.php",
    type: "POST",
    dataType: "jsonp",
    data: {dados: dados}
  });
}

/**
 * wsResponseGetTipoDeProduto
 * 
 * Funcao para tratar o retorno da requisicao "wsGetTipoDeProduto"
 *
 * @param {json} response
 */
function wsResponseGetTipoDeProduto(response) {
  // faz o parser do json
  response = JSON.parse(response);

  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Nenhum tipo de produto cadastrado!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;
    toast(msg);
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {
    var tiposProdutos = response.wsresult;
    sessionStorage.setItem("tiposProdutos", JSON.stringify(tiposProdutos));
  }
}

/**
 * wsGetCentrolucro
 *
 * Funcao obter os centros de lucros via ajax
 *
 */
function wsGetCentroLucro() {

// cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseGetCentroLucro"};

  // executa a requisicao via ajax
  $.ajax({
    url: configsApp.serverUrl.text + "/getCentroLucro.php",
    type: "POST",
    dataType: "jsonp",
    data: {dados: dados}
  });
}

/**
 * wsResponseGetCentroLucro
 * 
 * Funcao para tratar o retorno da requisicao "wsGetCentroLucro"
 *
 * @param {json} response
 */
function wsResponseGetCentroLucro(response) {
  // faz o parser do json
  response = JSON.parse(response);

  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Nenhum centro de lucro cadastrado!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;
    toast(msg);
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {
    var centrosLucro = response.wsresult;
    sessionStorage.setItem("centrosLucro", JSON.stringify(centrosLucro.grupos));

    var gp = "";
    var dp = "";
    var cl = "";

    $.each(centrosLucro.grupos, function (i, g) {
      gp += "<h3>" + g.nome + "</h3><ul>";

      dp = "";
      $.each(g.departamentos, function (i, d) {
        dp += "<li><div class='accordion'><h3>" + d.nome + "</h3><ul>";

        cl = "";
        $.each(d.centrolucros, function (i, c) {
          cl += "<li class='option'>" + c.nome + "<span class='checkbox' data-value='" + c.full + "'><span></span></span></li>";
        });

        dp += cl + "</ul></div></li>";
      });

      gp += dp + "</ul>";
    });

    $(".accordionCentroLucro").html(gp);

    var icons = {
      header: "accordion-mark",
      activeHeader: "accordion-mark-active"
    };

    $(".accordion").accordion({
      active: false,
      collapsible: true,
      heightStyle: "content",
      icons: icons,
      beforeActivate: function (event, ui) {
        // The accordion believes a panel is being opened
        if (ui.newHeader[0]) {
          var currHeader = ui.newHeader;
          var currContent = currHeader.next('.ui-accordion-content');
          // The accordion believes a panel is being closed
        } else {
          var currHeader = ui.oldHeader;
          var currContent = currHeader.next('.ui-accordion-content');
        }
        // Since we've changed the default behavior, this detects the actual status
        var isPanelSelected = currHeader.attr('aria-selected') == 'true';

        // Toggle the panel's header
        currHeader.toggleClass('ui-corner-all', isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top', !isPanelSelected).attr('aria-selected', ((!isPanelSelected).toString()));

        // Toggle the panel's icon
        currHeader.children('.ui-icon').toggleClass('accordion-mark', isPanelSelected).toggleClass('accordion-mark-active', !isPanelSelected);

        // Toggle the panel's content
        currContent.toggleClass('accordion-content-active', !isPanelSelected)
        if (isPanelSelected) {
          currContent.slideUp();
        } else {
          currContent.slideDown();
        }

        return false; // Cancel the default action
      }
    });

    $(".nav-filter").find(".option").click(function () {
      var option = $(this);
      var checkbox = option.find(".checkbox");
      if (checkbox.hasClass("active"))
        checkbox.removeClass("active");
      else
        checkbox.addClass("active");
    });
  }
}

/**
 * wsGetFabricante
 *
 * Funcao obter os fabricantes via ajax
 *
 */
function wsGetFabricante() {

// cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseGetFabricante"};

  // executa a requisicao via ajax
  $.ajax({
    url: configsApp.serverUrl.text + "/getFabricante.php",
    type: "POST",
    dataType: "jsonp",
    data: {dados: dados}
  });
}

/**
 * wsResponseGetFabricante
 * 
 * Funcao para tratar o retorno da requisicao "wsGetFabricante"
 *
 * @param {json} response
 */
function wsResponseGetFabricante(response) {
  // faz o parser do json
  response = JSON.parse(response);

  // em caso de erro
  if (response.wsstatus == 0) {
    var msg = "Nenhum fabricante cadastrado!";
    var error = response.wserror;
    if (error.length > 0)
      msg = error;
    toast(msg);
  }

  // em caso de sucesso
  else if (response.wsstatus == 1) {
    var fabricantes = response.wsresult;
    sessionStorage.setItem("fabricantes", JSON.stringify(fabricantes));
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
    url: configsApp.serverUrl.text + "/getLista.php",
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
    
    sessionStorage.removeItem("clienteListas");    

    var listas = response.wsresult;
    sessionStorage.setItem("clienteListas", JSON.stringify(listas));

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

          switch (modulo) {
            case "cliente":
              listaOk.produtos = [];
              loadPage("lista-produto-edicao-lista");
              break;

            case "convidado":
              loadPage("lista-produto-visualizacao-convidado");
              break;
          }
          
          sessionStorage.setItem("listaName", "listaSelecionada");
          sessionStorage.setItem("listaSelecionada", JSON.stringify(listaOk));          
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
    url: configsApp.serverUrl.text + "/getLista.php",
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
    toast("É necessário informar o nome do cliente!");
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
      url: configsApp.serverUrl.text + "/getCliente.php",
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
    toast("Todos os campos são obrigatórios");
  }

  else {
    var clienteInfo = {
      clienteNome: clienteNome,
      clienteCpf: clienteCpf
    }

    sessionStorage.setItem("clienteInfo", JSON.stringify(clienteInfo));

    showDialog("Cliente", "Salvar este cliente no NÉRUS?", "Cancelar", "hideDialog()", "Ok", "wsSaveCliente()");
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
    url: configsApp.serverUrl.text + "/saveCliente.php",
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

    toast("Cliente salvo no NÉRUS!");

    loadPage("index");
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
  hideMenuSec();
  showMask();

  // obtem os dados para execucao da requisicao
  var search = $("#search");
  var searchField = search.find("input[name=search]");
  var prd = searchField.val();
  prd = removerAcentos(prd);

  var filtros = $("#filter-produto-busca");
  var fabricante = filtros.find(".input-select.fabricante").attr("data-value");
  var tipoProduto = filtros.find(".input-select.tipoProduto").attr("data-value");
  var centrosLucro = filtros.find(".accordionCentroLucro").find(".checkbox.active");
  var cls = [];

  $.each(centrosLucro, function (i, item) {
    cls.push(parseInt($(item).attr("data-value")));
  });

  searchField.val("");

  /* searchType
   * 0 => numero
   * 1 => texto
   */
  var searchType = 0;

  /* verifica se o campo foi preenchido com digito ou texto */
  var num = new Number(prd);
  if (!(num > 0))
    searchType = 1;

  // preparacao dos dados
  var produto = {
    produto: prd,
    codigo_fabricante: fabricante.length > 0 ? fabricante : "",
    tipo_produto: tipoProduto.length > 0 ? tipoProduto : "",
    centro_lucro: cls.join(","),
    searchType: searchType
  };

  // cria bloco de dados a serem enviados na requisicao
  var dados = {wscallback: "wsResponseGetProduto", produto: produto};

  // executa a requisicao via ajax
  $.ajax({
    url: configsApp.serverUrl.text + "/getProduto.php",
    type: "POST",
    dataType: "jsonp",
    data: {dados: dados}
  });
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
        contentResponseList.slideUp(function () {
          contentResponseList.html("");
        });
        var produtoId = this.id;
        produtoId = produtoId.replace("produto-", "");
        var produto = produtosStorage[produtoId];
        searchField.val(produto.codigo);
        wsGetProduto();
      });

      hideMask();
      hideSearch();

      $(window).click(function () {
        contentResponseList.slideUp(function () {
          contentResponseList.html("");
        });
      });
    }
    else{
      var msg = 'Produto não encontrado!';
      var error = response.wserror;
      if (error.length > 0)
        msg = error;

      hideMask();
      toast(msg);
    }
  }

  else {

    /* obtem as informacoes do produto que veio no retorno */
    var produto = response.wsresult;
    
    /* armazena os dados do produto buscado */
    sessionStorage.setItem("produtoLoad", JSON.stringify(produto));
    
    var gradeLoadInfo = sessionStorage.getItem("gradeLoadInfo");

    var listaName = sessionStorage.getItem("listaName");
    var modulo = sessionStorage.getItem("modulo");

    var lista;

    /* obtem a lista atual para preencher as quantidades na tela caso o produto 
     * ja esteja na lista */
    if (modulo == "cliente") {
      lista = sessionStorage.getItem(listaName);
    }
    else if (modulo == "convidado" && listaName == "listaSelecionada") {
      lista = sessionStorage.getItem("pedidoNew");
    }

    lista = JSON.parse(lista);

    var galeria = $("<div id='galeria-imagens'> class='container'");
    var galeriaWrapper = $("<div id='slides'>");
    var imagensLista = [];

    var grades = $("<div id='produto-grades'>");
    var gradesLista = [];
    var gradeQtty;
    var activeGrade = "";
    var prd;

    var info;
    var box;

    // limpa quaisquer conteudo antigo
    contentResponse.html("");

    // Galeria de fotos
    if (produto.img.length > 0) {

      if (produto.img.length > 2) {
        $.each(produto.img, function (i, img) {
          var imgUrl = img.arquivo;

          //          /* acessando a miniatura da imagem no servidor */
          //          var file = imgUrl.split('.');
          //          var extensao = file[file.length - 1];
          //          imgUrl = imgUrl.replace('.' + extensao, '_min.' + extensao);

          box = "<img u='image' src='" + imgUrl + "' />";

          imagensLista.push(box);
        });
      }
      else {
        for (var i = 0; i < 3; i++) {
          var imgUrl = "";
          if (produto.img.hasOwnProperty(i))
            imgUrl = produto.img[i].arquivo;
          else
            imgUrl = produto.img[0].arquivo;

          //          /* acessando a miniatura da imagem no servidor */
          //          var file = imgUrl.split('.');
          //          var extensao = file[file.length - 1];
          //          imgUrl = imgUrl.replace('.' + extensao, '_min.' + extensao);

          box = "<img u='image' src='" + imgUrl + "' />";
          imagensLista.push(box);
        }
      }
    }
    else {
      for (var i = 0; i < 3; i++) {
        box = "<img u='image' src='img/nophoto.jpg' />";
        imagensLista.push(box);
      }
    }

    galeriaWrapper.html(imagensLista);
    galeria.html(galeriaWrapper);
    contentResponse.append(galeria);

    $('#slides').slidesjs({
      width: 360,
      height: 240,
      navigation: {
        active: false,
      },
      pagination: {
        active: true,
      },
      callback: {
        loaded: function (number) {
          var pagination = $(".slidesjs-pagination");
//            pagination.css({
//              "margin-left": -(pagination.width() / 2)
//            });
        },
        start: function (number) {
        },
        complete: function (number) {
        }
      }
    });

    // Informações do produto
    var centrolucro = produto.centrolucro.nome_categoria;
//    centrolucro = centrolucro.replace(/\//g, ">");
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
        gradeQtty = "0.00";
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
          gradeQtty = number_format(prd.grade.gradeQtty, 2);
        }

        if (gradeQtty > 0)
          activeGrade = "activeGrade";
        
        var selectedGrade = "";

        // caso a grade seja a que o 
        if(gradeLoadInfo == grade)
          selectedGrade = "selectedGrade";

        box =
                "<div class='produto-grade bradius " + activeGrade + "'>" +
                "<p class='produto-grade-title " + selectedGrade + "'>" + grade + "</p>" +
                "<p class='produto-grade-bt'>" +
                "<span class='down bt'>" +
                "<img src='img/ico-expand.png' />" +
                "</span>" +
                "<span class='qtty' onclick=\"exibeDialogSetGradeQtty(this);\">" + gradeQtty + "</span>" +
                "<span class='up bt'>" +
                "<img src='img/ico-collapse.png' />" +
                "</span>" +
                "</p>" +
                "</div>";
        

        gradesLista.push(box);
      });
    }

    else {
      gradeQtty = "0.00";
      activeGrade = "";

      /* monta o bloco com as informacoes do produto */
      prd = {
        "produto": produto,
        "grade": {
          gradeNome: ""
        }
      }

      if (prdInList(prd, lista.produtos)) {
        prd = listPrdGet(prd, lista.produtos);
        gradeQtty = number_format(prd.grade.gradeQtty, 2);
      }

      if (gradeQtty > 0)
        activeGrade = "activeGrade";

      box =
              "<div class='produto-grade bradius " + activeGrade + "' style='width: 100%;'>" +
              "<p class='produto-grade-title'>Quantidade</p>" +
              "<p class='produto-grade-bt'>" +
              "<span class='down bt'>" +
              "<img src='img/ico-expand.png' />" +
              "</span>" +
              "<span class='qtty' onclick=\"exibeDialogSetGradeQtty(this);\">" + gradeQtty + "</span>" +
              "<span class='up bt'>" +
              "<img src='img/ico-collapse.png' />" +
              "</span>" +
              "</p>" +
              "</div>";

      gradesLista.push(box);
    }

    grades.html(gradesLista);
    contentResponse.append(grades);

    // ativa o botoes de quantidade
    $(".produto-grade-bt").find(".bt").click(function () {
      var mult = parseFloat($(".produto-mult").eq(0).text()) / 1000;
      var objBox = $(this).parent().parent();
      var objQtty = objBox.find(".qtty");
      var qttyVal = parseFloat(objQtty.text());

      if (isNaN(qttyVal))
        qttyVal = 0;

      if ($(this).hasClass("down")) {
        if (qttyVal > 0) {
          qttyVal -= mult;
        }
      }
      else {
        qttyVal += mult;
      }

      qttyVal = number_format(qttyVal, 2);

      objQtty.text(qttyVal);
    });
    
    sessionStorage.removeItem("gradeLoadInfo");

    marcaDagua.hide();
    contentResponse.scrollTop(0).show();

    hideMask();
    hideSearch();
  }
}

function exibeDialogSetGradeQtty(elem) {
  setElementPopupVal = elem;
  showDialog('Quantidade', 'Digite a quantidade no campo abaixo:', 'Cancelar', 'hideDialog()', 'Ok', 'setGradeQtty()', true);
}

function setGradeQtty() {
  var mult = parseFloat($(".produto-mult").eq(0).text()) / 1000;
  var qttyVal = parseFloat($("#popup-dialog").find("input").val());

  if (!isNaN(qttyVal)) {
    qttyVal = ajustValueMult(qttyVal, mult);
    qttyVal = number_format(qttyVal, 2);
    $(setElementPopupVal).text(qttyVal);
  }

  hideDialog();
}

function ajustValueMult(qtty, mult) {
  qtty = parseFloat(qtty);
  mult = parseFloat(mult);

  var quoe = qtty / mult; //resultado da divisao
  var rest = parseFloat(number_format(qtty % mult, 2)); //resto da divisao

  //se a divisao nao for exata, aumenta "1" no quoeficiente
  if (rest > 0 && rest != mult) {
    quoe++;
    qtty = Math.floor(quoe) * mult;
  }

  return qtty;
}

function prdAddList() {
  var modulo = sessionStorage.getItem("modulo");
  var listaName = sessionStorage.getItem("listaName");
  var produtoLoad = sessionStorage.getItem("produtoLoad");
  var lista;
  var prd;
  var msg = "Lista de Presentes atualizada!";

  if (modulo == "convidado" && listaName == "listaSelecionada") {
    listaName = "pedidoNew";
    msg = "Pedido atualizado!";
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
    toast(msg);
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
  /* obtem a lista pronta para enviar para o NERUS */
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
      url: configsApp.serverUrl.text + '/splitLista.php',
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
      url: configsApp.serverUrl.text + '/saveLista.php',
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
      url: configsApp.serverUrl.text + '/splitLista.php',
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }
}

function wsResponseSplitLista(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* obtem a lista pronta para enviar para o NERUS */
  var listaOk = sessionStorage.getItem("listaOk");
  listaOk = JSON.parse(listaOk);

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'Não foi possível salvar a lista no NÉRUS!';
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
    var msg = 'Não foi possível salvar a lista no NÉRUS!';
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

    toast("Lista salva no NÉRUS!");

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
  
  /* obtem o cliente do pedido */
  var cliente = sessionStorage.getItem("pedidoCliente");

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
      clienteCodigo: 0,
      clienteListaCodigo: lista.clienteCodigo,
      tipoListaCodigo: lista.tipoLista.tipoListaCodigo,
      dataEvento: lista.dataEvento,
      observacoes: cliente
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
  /* obtem o pedido pronto para enviar para o NÉRUS */
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
      url: configsApp.serverUrl.text + '/splitPedido.php',
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
      url: configsApp.serverUrl.text + '/savePedido.php',
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
      url: configsApp.serverUrl.text + '/splitPedido.php',
      type: "POST",
      dataType: "jsonp",
      data: {dados: dados}
    });
  }
}

function wsResponseSplitPedido(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* obtem o pedido pronto para enviar para o NÉRUS */
  var pedidoOk = sessionStorage.getItem("pedidoOk");
  pedidoOk = JSON.parse(pedidoOk);

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'Não foi possível salvar o pedido no NÉRUS!';
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
    var msg = 'Não foi possível salvar o pedido no NÉRUS!';
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

    toast("Pedido salvo no NÉRUS!");

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

  if (contentResponse.find(".produto").length == 0) {
    toast("Não há produtos a serem removidos!");
  }

  else
    showDialog("Produto", "Excluir todos os produto?", "Cancelar", "hideDialog()", "Ok", "clearList()");
}

function clearList() {

  hideDialog();

  var modulo = sessionStorage.getItem("modulo");
  var listaName = sessionStorage.getItem("listaName");

  var lista;

  var page = $("#content").find(".page.activePage:last");
  var pageId = "#" + page.attr("id");
  var marcaDagua = $(pageId).find(".mark-agua");
  var contentResponse = $(pageId).find(".content-response");
  var totalPrds = $("#prd-total");

  if (modulo == "convidado" && listaName == "listaSelecionada") {
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

  toast("Produtos excluídos!");
}

function exibeDialogPrdDel(produtoId, produtoCodigo, produtoGrade) {

  var prdDel = {
    produtoPos: produtoId,
    produtoCodigo: produtoCodigo,
    produtoGrade: produtoGrade
  }

  sessionStorage.setItem("prdDel", JSON.stringify(prdDel));

  showDialog("Produto", "Excluir produto da lista?", "Cancelar", "hideDialog()", "Ok", "prdDel()");
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

    if (modulo == "convidado" && listaName == "listaSelecionada") {
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

    toast("Produto excluído!");
  });
}

function prdLoad(produtoCodigo, produtoGrade) {
  var listaName = sessionStorage.getItem("listaName");
  var modulo = sessionStorage.getItem("modulo");
  
  sessionStorage.setItem("produtoLoadInfo", produtoCodigo);
  sessionStorage.setItem("gradeLoadInfo", produtoGrade);

  switch (listaName) {

    case "listaSelecionada":
      if (modulo == "cliente")
        loadPage("produto-busca");
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
    showDialog('Concluir', 'Salvar esta lista no NÉRUS?', 'Cancelar', 'hideDialog()', 'Ok', 'wsSaveLista()');
}

function exibeDialogSavePedido() {
  var pedido = sessionStorage.getItem("pedidoNew");
  pedido = JSON.parse(pedido);

  /* caso nao haja um pedido ou o mesmo esteja sem produtos nao salva o pedido */
  if (pedido == null || !pedido.produtos.hasOwnProperty(0))
    toast("É necessário adicionar produtos no pedido!");

  else
    showDialog('Concluir', 'Salvar este pedido no NÉRUS?', 'Cancelar', 'hideDialog()', 'Ok', 'wsSavePedido()');
}

function barcodeScan() {
  var scanner = cordova.plugins.barcodeScanner;
  scanner.scan(
          function (result) {
            var produto = result.text;
            if (produto.length > 0) {
              var search = $("#header").find("#search");
              var searchInput = search.find("input[name=search]");
              searchInput.val(result.text);
              wsGetProduto();
            }
          },
          function (error) {
            toast("Erro ao tentar ler o código de barras!");
          }
  );
}

function exibeDialogAppClose() {
  showDialog('Aplicativo', 'Deseja fechar o aplicativo?', 'Cancelar', 'hideDialog()', 'Ok', 'appClose()');  
}

/**
 * appClose
 * Funcao para fechar o aplicativo
 */
function appClose() {
  /* 'mata' o aplicativo */
  if (navigator.app) {
    navigator.app.exitApp();
  }

  else if (navigator.device) {
    navigator.device.exitApp();
  }
}

function logout() {
  sessionStorage.clear();
  window.location.reload();
}

function exibeDialogLogout() {
  showDialog('Usuário', 'Deseja sair deste usuário?', 'Cancelar', 'hideDialog()', 'Ok', 'logout()');
}