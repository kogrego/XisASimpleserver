'use strict';

var app = angular.module('xisa', []);
var path = 'https://xisasimpleserver.herokuapp.com/api/';
var flag = false;
var hatedArray = [];

function getUrlParameter(param) {
  var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split(/[&||?]/),
      res;
  for (var i = 0; i < sURLVariables.length; i += 1) {
      var paramName = sURLVariables[i],
          sParameterName = (paramName || '').split('=');
      if (sParameterName[0] === param) {
          res = sParameterName[1];
      }
  }
  return res;
}

function filterBtnClick(filter){
   if(flag){
    $('nav ul').css('opacity', '1');
    $('#leftText').css('opacity', '1');
    $('#cubeContainer').css('opacity', '1');
    $('.filterOptions').removeClass('active');
    $('#close').addClass('hidden');
    $('.filterItem').slideToggle(200);
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs').then(function (response){
      angular.forEach(response.data, function(value){
        var cube =  '<a href="/how?name='+value.name+'">'+
                      '<section class="cube" id="cube'+i+'">'+
                        '<p id="hashtag"><span class="highlight">'+value.word+'</span></p>'+
                        '<p id="celebName"><span class="highlight">'+value.name+'</span></p>'+
                      '</section>'+
                    '<a>';
        $('#cubeContainer').append(cube);
        var url = 'url('+value.image+')';
        $('#cube'+i).css('background-image',url);
        $('#cube'+i).css('background-size', 'cover');
        i++;
      })
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
    flag = false;
  }
}

function setMovingTextClass(news, i){
  $("#text_move"+(i+1)).hover(function(){
    news[0].pauseTicker();
    var content = $('#text_move'+(i+1)+' .ti_content').children('div');
    angular.forEach(content, function(child){
      angular.forEach($(child).children('.whatmark'), function(grandchild){
        $(grandchild).hover(function(){
          $(this).removeClass('whatmark');
          $(this).addClass('redUnder');
        }, function(){
          $(this).first().removeClass('redUnder');
          $(this).first().addClass('whatmark');
        });
      });
    });
  }, function(){
    news[0].startTicker();
  });
}

app.controller('whoCtrl', function($scope, $http, $compile) {
  $http.get('/api/getCelebs').then(function (response){
    $scope.mostHated = 'MOST HATED';
    $scope.people = 'PEOPLE';
    $scope.past = 'The past 7 days on Twitter';  
		var i = 1;
  	angular.forEach(response.data, function(value){
  		var cube =	'<a href="/how?name='+value.name+'">'+
  	    						'<section class="cube" id="cube'+i+'">'+
    									'<p id="hashtag"><span class="highlight">'+value.word+'</span></p>'+
                      '<p id="celebName"><span class="highlight">'+value.name+'</span></p>'+
    								'</section>'+
    							'<a>';
      hatedArray.push(value.name);
      var compiled = $compile(cube)($scope);
			$('#cubeContainer').append(compiled);
      var url = 'url('+value.image+')';
      var cubeId = '#cube'+i;
      $(cubeId).css('background-image',url);
      $(cubeId).css('background-size','cover');
      $('#cubeContainer').on('mouseenter', cubeId, function(){
        $(cubeId+' #hashtag span').removeClass('highlight');
        $(cubeId+' #celebName span').removeClass('highlight');
        $(cubeId+' #hashtag span').addClass('whiteHighlight');
        $(cubeId+' #celebName span').addClass('whiteHighlight');
      }).on('mouseleave', cubeId, function(){
        $(cubeId+' #hashtag span').addClass('highlight');
        $(cubeId+' #celebName span').addClass('highlight');
        $(cubeId+' #hashtag span').removeClass('whiteHighlight');
        $(cubeId+' #celebName span').removeClass('whiteHighlight');
      });
			i++;
  	})
  },function (error){
    $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
	});
});

app.controller('howCtrl', function($scope, $http, $compile) {
   var lastName = getUrlParameter('name').split("%20");
   lastName = lastName[lastName.length -1];
   if(lastName == null){
    lastName = getUrlParameter('name');
   }
   var request = decodeURIComponent('/api/celeb/'+lastName);
   $http.get(request).then(function (response){
    if(response.data == null){
        $('#howContent').append('<section class="error">500<br>Twitter connection error</section>');
    }
    else {
      var url = response.data.celeb_details.image;
      var urlAppend = 'url('+url+')';
      $('body').css('width', '100vw');
      $('body').css('height', '100vh');
      $('body').css('background', '#464646 ' + urlAppend + ' no-repeat fixed center center');
      $('body').css('background-size', 'cover');
      var badWord = response.data.mostUsedWord;
      $scope.celebName = response.data.celeb_details.name;
      $scope.twitterName = '@'+response.data.celeb_details.twitter_name;
      $scope.numOfPeople = 'This week, People said 100 times That he is ';
      $scope.badWord = badWord;
      $scope.also = 'They also said about him:';
      var i = 0;
      angular.forEach(response.data.wordsWithTweets, function(data){
        if(data.texts == null){
          $('#howContent').append('<section class="error">500<br>Twitter connection error</section>');
        }
        else {
          var barDiv =  '<p class="barBadWord">'+data.word.toUpperCase()+'</p>'+
                        '<div class="bar_chart" style="width:'+data.bad_words_count*3+'px;"></div>'+
                        '<p class="barWordCount">'+data.bad_words_count+' times</p>';
          $("#bars").append(barDiv);
          var texts = "";
          texts += '<div class="TickerNews" id="text_move'+(i+1)+'"> <div class="ti_wrapper"> <div class="ti_slide"> <div class="ti_content"> ';
          var k = 0;
          data.texts.forEach(function(text){
            texts += '<div class="ti_news" id="ti_news'+(k+1)+'">';
            text.split(" ").forEach(function(word){
              if(word == data.word){
                texts += '<span id="markWord">'+word.toUpperCase()+'&nbsp</span>';
              } else if(word.startsWith('@')) {
                var found = $.inArray(word, hatedArray) > -1;
                if(found){
                  texts += '<a href="/how?name='+word.substring(1)+'">'+word.toUpperCase()+'&nbsp</a>'
                } 
                else{
                  texts += '<a href="/what?name='+word.substring(1)+'">'+word.toUpperCase()+'&nbsp</a>'
                }
              } else {
                texts += word.toUpperCase() + '&nbsp';
              }
            })
            texts += '&nbsp&nbsp + &nbsp&nbsp</div> ';
            k++;
          });
          texts += '</div> </div> </div> </div>';
          var compiled = $compile(texts)($scope);
          $("#bad_words").append(compiled);
          var news = $("#text_move"+(i+1)).newsTicker();
          setMovingTextClass(news, i);
        }
        i++;
      })
      $('#howContent').append('<div class="clear"></div>');
    }
  },function (error){
      $('#howContent').append('<section class="error">500<br>Twitter connection error</section>');
  });
});

app.controller('whatCtrl', function($scope, $http, $compile) {
   var lastName = getUrlParameter('name').split("%20");
   lastName = lastName[lastName.length -1];
   if(lastName == null){
    lastName = getUrlParameter('name');
   }
   var request = decodeURIComponent('/api/user/'+lastName);
   $http.get(request).then(function (response){
    if(response.data == null){
        $('#howContent').append('<section class="error">500<br>Twitter connection error</section>');
    }
    else {
      var url = response.data.user_details.image;
      var urlAppend = 'url('+url+')';
      $('body').css('background',urlAppend);
      $('body').css('background-repeat','no-repeat');
      $('body').css('background-size','100% 100%');
      $scope.firstName = response.data.user_details.name.split(" ")[0].toUpperCase();
      $scope.lastName = (response.data.user_details.name.split(" ").length > 1) ? response.data.user_details.name.split(" ")[1].toUpperCase() : '';
      $scope.twitterName = '@'+response.data.user_details.screen_name;
      $scope.followersCount = response.data.user_details.followers_count + ' followers';
      $scope.numOfPeople = 'This week, '+$scope.twitterName+' said ';
      $scope.picText = "She doesn't like these people: "
      $scope.also = ' offensive words';
      var i = 0;
      var badWordCount = 0;
      for (var j = 0; j < 5; j++){
        var pic = '';
        pic += '<section class="pics" style="background: url('+response.data.images[j]+'); background-size: contain;">';
        pic += '</section>';
        $('#pics').append(pic);
      }
      $('#pics').append('<div class="clear"></div>');
      angular.forEach(response.data.words_with_texts, function(data){
        if(data.texts == null){
          $('#howContent').append('<section class="error">500<br>Twitter connection error</section>');
        }
        else {
          badWordCount += data.count;
          var barDiv =  '<p class="whatbarBadWord">'+data.word.toUpperCase()+'</p>'+
                        '<div class="whatbar_chart" style="width:'+data.count*3+'px;"></div>'+
                        '<p class="whatbarWordCount">'+data.count+' times</p>';
          $("#whatbars").append(barDiv);
          var texts = "";
          texts += '<div class="TickerNews" id="text_move'+(i+1)+'"> <div class="ti_wrapper"> <div class="ti_slide"> <div class="ti_content"> ';
          var k = 0;
          data.texts.forEach(function(text){
            texts += '<div class="ti_news" id="ti_news'+(k+1)+'">';
            text.tweet.split(" ").forEach(function(word){
              if(word == data.word){
                texts += '<span id="whatmarkWord">'+word.toUpperCase()+'&nbsp</span>'
              } else if(word.startsWith('@')) {
                var found = $.inArray(word, hatedArray) > -1;
                if(found){
                  texts += '<a href="/how?name='+word.substring(1)+'">'+word.toUpperCase()+'&nbsp</a>'
                } 
                else{
                  texts += '<a href="/what?name='+word.substring(1)+'">'+word.toUpperCase()+'&nbsp</a>';
                }
              } else {
                texts += word.toUpperCase() + '&nbsp';
              }
            })
            texts += '&nbsp&nbsp + &nbsp&nbsp</div> ';
            k++;
          });
          texts += '</div> </div> </div> </div>';
          var compiled = $compile(texts)($scope);
          $("#whatbad_words").append(compiled);
          var news = $("#text_move"+(i+1)).newsTicker();
          setMovingTextClass(news, i);
        }
        i++;
      });
      $scope.badWordCount = badWordCount;
      $('#whatContent').append('<div class="clear"></div>');
      }
    },function (error){
      $('#whatContent').append('<section class="error">500<br>Twitter connection error</section>');
  });
});

app.controller('whomCtrl', function($scope, $http) {
    $http.get('/api/getUsers').then(function (response){
    $scope.mostHating = 'MOST HATING';
    $scope.users = 'USERS';
    $scope.past = 'The past 7 days on Twitter';
    var i = 1;
    angular.forEach(response.data, function(value){
      var names = value.tweeter_name.split(" ");
      var name = "";
      angular.forEach(names, function(val){
        if(names.length <= 1){
          name = names[0];
        }
        else{
          name += val + '<br>';
        }
      });
      var followersCount = '<span id="location"><span id="background">'+value.followers_count+' followers</span></span>';
      var cube =  '<a href="/what?name='+value.tweeter_name+'">'+
                      '<section class="cube" id="cube'+i+'">'+
                      '<p id="userName"><span class="blackHighlight">'+name.substring(0, 10)+'</span>'+followersCount+'</p>'+
                    '</section>'+
                  '<a>';
      $('#cubeContainer').append(cube);
      var url = 'url('+value.image+')';
      var cubeId = '#cube'+i;
      $(cubeId).css('background-image',url);
      $(cubeId).css('background-size','cover');
      $('#cubeContainer').on('mouseenter', cubeId, function(){
        $(cubeId+' #userName span:first-child').removeClass('blackHighlight');
        $(cubeId+' #userName span:first-child').addClass('whiteHighlight');
      }).on('mouseleave', cubeId, function(){
        $(cubeId+' #userName span:first-child').addClass('blackHighlight');
        $(cubeId+' #userName span:first-child').removeClass('whiteHighlight');
      });
      i++;
    })
  },function (error){
    $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
  });
});

app.controller('searchCtrl', ['$scope', '$location', function ($scope, $location) {
  $('#serchInput').focusin(function(){
    $('nav ul').css('opacity', '0.1');
    $('#leftText').css('opacity', '0.1');
    $('#cubeContainer').css('opacity', '0.1');
  });

  $('#serchInput').focusout(function(){
    $('nav ul').css('opacity', '1');
    $('#leftText').css('opacity', '1');
    $('#cubeContainer').css('opacity', '1');
  });
}]);
app.controller('navCtrl', ['$scope', '$location', function ($scope, $location) {

    $scope.navLinks = [{
        Title: '/',
        Alias: '/',
        LinkText: 'HATED'
    }, {
        Title: '/whom',
        Alias: 'whom',
        LinkText: 'HATER'
    }];

    $scope.navClass = function (page) {
        var currentRoute = window.location.pathname.substring(1);
        currentRoute = currentRoute.split("?")[0] || '/';
        if(currentRoute.startsWith('what')){
          currentRoute = 'whom';
        } else if(currentRoute.startsWith('how')){
          currentRoute = '/';
        }
        return page === currentRoute ? 'active' : '';
    };   
}]);

app.controller('filterCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
  $scope.selectFilter = 'CATEGORIES';
  $scope.bodyParts = 'BODY PARTS';
  $scope.gay = 'GAY/SEXUALTITY'; 
  $scope.charecteristics = 'CHARECTERISTICS'; 
  $scope.others = 'OTHERS';
  $scope.crazy = 'CRAZY/ILL';
  $scope.belief = 'BELIEF/AGENDA';
  $scope.mysogenist = 'MYSOGENIST';
  $scope.animal = 'ANIMAL';
  
  $('.filterOptions').click(function() {
    if(!flag){
      $('.filterOptions').addClass('active');
      $('#close').removeClass('hidden');
      $('.filterItem').slideToggle(200);
      $('nav ul').css('opacity', '0.1');
      $('#leftText').css('opacity', '0.1');
      $('#cubeContainer').css('opacity', '0.1');
      flag = true;
    }
  });

  function show(){
    if(flag){
      $('nav ul').css('opacity', '1');
      $('#leftText').css('opacity', '1');
      $('#cubeContainer').css('opacity', '1');
      $('.filterOptions').removeClass('active');
      $('#close').addClass('hidden');
      $('.filterItem').slideToggle(200);
      flag = false;
    }
  }

  $('#close').click(function(){
    show();
  });

  $('#filterAnimal').click(function(){
    show();
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs').then(function (response){
      buildCubes(response.data)
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
  });

  $('#filterBody').click(function(){
    show();
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs/body').then(function (response){
      buildCubes(response.data)
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
  });

  $('#filterCharacter').click(function(){
    show();
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs/charecteristics').then(function (response){
      buildCubes(response.data)
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
  });

  $('#filterGay').click(function(){
    show();
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs/gay').then(function (response){
      buildCubes(response.data)
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
  });

  $('#filterOther').click(function(){
    show();
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs/others').then(function (response){
      buildCubes(response.data)
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
  });

  $('#filterCrazy').click(function(){
    show();
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs/crazy').then(function (response){
      buildCubes(response.data)
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
  });

  $('#filterBelief').click(function(){
    show();
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs/belief').then(function (response){
      buildCubes(response.data)
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
  });

  $('#filterMysogenist').click(function(){
    show();
    $('#cubeContainer').empty();
    $http.get('/api/getCelebs/mysogenist').then(function (response){
      buildCubes(response.data)
    },function (error){
      $('#cubeContainer').append('<section class="error">500<br>Twitter connection error</section>');
    });
  });
 
}]);

function buildCubes(data){
var i = 1;
  angular.forEach(data, function(value){
    var cube =  '<a href="/how?name='+value.name+'">'+
                  '<section class="cube" id="cube'+i+'">'+
                    '<p id="hashtag"><span class="highlight">'+value.word+'</span></p>'+
                    '<p id="celebName"><span class="highlight">'+value.name+'</span></p>'+
                  '</section>'+
                '<a>';
    $('#cubeContainer').append(cube);
    var url = 'url('+value.image+')';
    $('#cube'+i).css('background',url);
      $('#cube'+i).css('background-size','cover');
    i++;
  })
}