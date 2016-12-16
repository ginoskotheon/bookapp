$(document).ready(function(){

  $("#search").keydown(function(event){

    if(event.keyCode == 13){
      event.preventDefault();
        $('#button').click();
      }
  });

  $('#button').on('click', function(){
    var search = document.getElementById('search').value;
    document.getElementById('results').innerHTML = "";
    console.log(search);
    $('#search').val('');
    $.ajax({
      type: 'GET',
      url: 'https://www.googleapis.com/books/v1/volumes?q='+ search,
      dataType: "json",
      success: function(data){
        console.log('got it!');
        for(i = 0; i<data.items.length; i++){
        var title = data.items[i].volumeInfo.title;
        var thumb = data.items[i].volumeInfo.imageLinks.smallThumbnail;
        var thumbray = thumb.split("");
        // console.log(thumbray);
        var thumbsplice = thumbray.splice(4, 0,"s");
        // console.log(thumbray);
        var thumbsecure = thumbray.join('');
        console.log(thumbsecure);
        var author = data.items[i].volumeInfo.authors[0];
        var id = data.items[i].selfLink;

        $('#results').append('<div id='+title+' class="col-md-3 space"><div class="finalresults"  value='+id+'>'+title+' by: '+author+'<div class="plusbox" id="plusbox"><i class="fa fa-check-circle-o myplus" id="myplus"></i></div></div><div id="thumbwrap" class="thumbwrap" draggable="true" ondragstart="drag(event)"><img id="thumb" class="thumb" alt="img" src='+thumbsecure+' /></div></div>');
        }
      },
    });
  });
  var info = [];



  $(document).on('click', '#plusbox', function(){

    $('#myplus').addClass('activated');
    var chosenbook = $(this).parent().attr('value');
    console.log(chosenbook);

    var csrf_token = $('#token').val();
    // console.log(csrf_token);
  var thebook = {
      url: chosenbook,
      _csrf: csrf_token
    }

    $.post({
      type: 'POST',
      url: '/allbooks',
      data: thebook,
      success: function(data){
        console.log('done!');
        window.location.href = '/thankyou';
      }
    });
  });

  $(document).on('click', '.toTrade', function(){

    $('#myModal').show();
    var thumb = $(this).parent().prev().children().attr('src');
    var id =  $(this).parent().next().val();
    var first = $(this).siblings('.firstname').text();
    var last = $(this).siblings('.lastname').text();
    var subject = $(this).siblings('.subject').text();
    var msg = $(this).siblings('.textArea').text();
    console.log(thumb);
    console.log(id);
    console.log(first);
    console.log(last);
    $('.first').val(first);
    $('.last').val(last);
    $('.identified').val(id);
    $('.thumbness').val(thumb);
    $('.thumbnail').attr('src', thumb);

    // var csrf_token = $('#thisToken').val();
    // console.log(csrf_token);
  });

  $('.close').on('click', function(){
    $('.myModal').hide();
  });

  $(document).on('click', '#deleteness', function(){

    var item = $(this).parent().siblings().children().attr('src');
    // console.log(item);
    var csrf_token = $('#aToken').val();
    // console.log(csrf_token);
    var fullItem = {
      item: item,
      _csrf: csrf_token
    }

    $.post({
      type: 'POST',
      url: '/mytrader',
      data: fullItem,
      success: function(data){
        console.log('done');
          window.location.href ='/mytrades';
      }
    });
  });

  $(document).on('click', '#deleted', function(){

    var item = $(this).parent().siblings().children().attr('src');
    console.log(item);
    var csrf_token = $('#bToken').val();
    // console.log(csrf_token);
    var fullItem = {
      item: item,
      _csrf: csrf_token
    }

    $.post({
      type: 'POST',
      url: '/myrequested',
      data: fullItem,
      success: function(data){
        console.log('done');
          window.location.href ='/traderequests';
      }
    });
  });

  $(document).on('click', '#deletemine', function(){

    var item = $(this).parent().siblings().children().attr('src');
    // console.log(item);
    var csrf_token = $('#cToken').val();
    // console.log(csrf_token);
    var fullItem = {
      item: item,
      _csrf: csrf_token
    }

    $.post({
      type: 'POST',
      url: '/mine',
      data: fullItem,
      success: function(data){
        console.log('done');
          window.location.href ='/mybooks';
      }
    });
  });
});
