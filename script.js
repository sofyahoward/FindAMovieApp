// Javascript and jQuery scripts for Movie Time App

// Globals

var apiBaseUrl = 'http://api.themoviedb.org/3';
var imageBaseUrl = 'http://image.tmdb.org/t/p';
var currentBaseUrl = '';
var placeholderImage = './placeholder.jpg';
var currentPage = 1;
var currentFilter = 'popular';
var movieIDArr = [];
var mpaaArr = [];
var currentMpaa = 'NR';
var currentID = 0;
var today = new Date();
var apiDate = today.toJSON().slice(0,10);
var zip = 30350;
var currentQuery = '';
var searchQuery = '';
var nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key=' + apiKey + '&region=US' + '&page=' + currentPage;
var searchMoviesUrl = apiBaseUrl + '/search/movie?api_key=' + apiKey + '&query=' + searchQuery + '&region=US' + '&page=' + currentPage;
var discoverBaseUrl = apiBaseUrl + '/discover/movie?api_key=' + apiKey + '&page=' + currentPage;
var upcomingBaseUrl = apiBaseUrl + '/movie/upcoming?api_key=' + apiKey + '&region=US' + '&page=' + currentPage;
var detailsUrl = apiBaseUrl + '/movie/' + currentID + '?api_key=' + apiKey;
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var numMonths = ['01','02','03','04','05','06','07','08','09','10','11','12'];
var nowPlayingHTML = '';
var upcomingHTML = '';
var discoverHTML = '';
var favoritesHTML = '';


// Document Ready (jQuery)

$(document).ready(function(){
        // Default to Now Playing search. This is the most popular search.
        var currentFilter = 'popular';
        $('.main-menu a p').removeClass('active-browse');
        $('.playing p').addClass('active-browse');
        getNowPlaying();

        // Handling the search bar functionality.
        // Some conditional styles, a basic UX flow and a form submit.
        $('.fa-search').click(function(event){
                event.preventDefault();
                if($('.search-field').hasClass('active-search') && $('.search-field').val() !== ''){
                        $('.search-form').submit();
                }else{
                        $('.search-field').toggleClass('hidden-search');
                        $('.search-field').toggleClass('active-search');
                }
        });

        $('.search-field').on('input',function(){
                $('.fa-times-circle').removeClass('hidden');
        });

        $('.fa-times-circle').click(function(){
                $('.fa-times-circle').addClass('hidden');
                $('.search-field').val('');
        });

        $('.search-field').blur(function(){
                if($('.search-field').val() === ''){
                        $('.search-field').addClass('hidden-search');
                        $('.search-field').removeClass('active-search');
                }
        });

        $('.search-form').submit(function(event){
                event.preventDefault();
                $('.main-menu a p').removeClass('active-browse');
                searchQuery = $('.search-field').val();
                currentPage = 1;
                searchMoviesUrl = apiBaseUrl + '/search/movie?api_key=' + apiKey + '&query=' + searchQuery + '&region=US' + '&page=' + currentPage;
                // Run the search with the current query.
                searchMovies(searchQuery);

        });
        
        // Another instance where the user clicks the Now Playing option in the side menu.
        
        $('.playing').click(function(){
                $('.main-menu a p').removeClass('active-browse');
                $('.playing p').addClass('active-browse');
                $('.main-menu').removeClass('active');
                $('.main-menu-tab').removeClass('active');
                currentPage = 1;
                nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key=' + apiKey + '&region=US' + '&page=' + currentPage;
                getNowPlaying();
        });
        
        // This handles Infinite Scroll functionality.
      
        $(window).scroll(function(){
                var newCallStart = $(document).height() - $(window).height();
                var newCallEnd = $(document).height() - $(window).height();
                // Set a range to fire.
                // And listen for the scrollTop to hit that range.
                if($(window).scrollTop() >= newCallStart && $(window).scrollTop() <= newCallEnd){
                        currentPage += 1;
                        nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key=' + apiKey + '&region=US' + '&page=' + currentPage;
                        discoverBaseUrl = apiBaseUrl + '/discover/movie?api_key=' + apiKey + '&page=' + currentPage;
                        upcomingBaseUrl = apiBaseUrl + '/movie/upcoming?api_key=' + apiKey + '&region=US' + '&page=' + currentPage;
                        searchMoviesUrl = apiBaseUrl + '/search/movie?api_key=' + apiKey + '&query=' + searchQuery + '&region=US' + '&page=' + currentPage;
                        // Then, judge the current page and query.
                        if(currentQuery === "nowPlaying"){
                                getNowPlaying();
                        }else if(currentQuery === "discover"){
                                var linkVar = $("#"+currentFilter).attr('lval');
                                discoverJSON(linkVar,sortVar);
                        }else if(currentQuery === "upcoming"){
                                getUpcoming();
                        }else if(currentQuery === "searchMovies"){
                                searchQuery = $('.search-field').val();
                                searchMoviesUrl = apiBaseUrl + '/search/movie?api_key=' + apiKey + '&query=' + searchQuery + '&region=US' + '&page=' + currentPage;
                                searchMovies(searchQuery);
                        }
                }
        });
        
        // The first Main Endpoint of the App.
        // Basic search from the restful API.
        
        function searchMovies(searchQuery){
                currentQuery = "searchMovies";
                $('.fa-heart').removeClass('active-favorites');
                $.getJSON(searchMoviesUrl, function(searchData){
                        currentBaseUrl = searchMoviesUrl;
                        // logic for scroll
                        if( currentPage === 1){
                                movieIDArr = [];
                                searchHTML = '';
                                $('body').scrollTop(0);
                        }
                        // Loop through results and set variables to add to dynamic HTML below.
                        for(let i = 0; i < searchData.results.length; i++){
                                var title = searchData.results[i].original_title;
                                var release = searchData.results[i].release_date;
                                var protoDate = new Date(release);
                                var day = (protoDate.getDate(release)+1);
                                var month = months[protoDate.getMonth(release)];
                                var year = (protoDate.getFullYear(release));
                                var poster = imageBaseUrl + '/w300' + searchData.results[i].poster_path;
                                // Just in case no poster is available...
                                if (poster === 'https://image.tmdb.org/t/p/w300null'){
                                        poster = placeholderImage;
                                }
                                var ratingAvg = searchData.vote_average;
                                var searchID = searchData.results[i].id;
                                // Grab any information on Saved Favorites from Local Storage.
                                var savedFavorite = localStorage.getItem('favorite');
                                if(savedFavorite == null){
                                        savedFavorite = "";
                                }
                                var savedArray = savedFavorite.split(',');
                                movieIDArr.push(searchID);
                                searchHTML += '<div class="movie-item col-sm-6 col-md-4 col-lg-3" id="' + searchID + '" data-toggle="modal" data-target=".movie-modal" onclick="updateModal(this);">';
                                        searchHTML += '<img src="' + poster + '">';
                                        searchHTML += '<div class="overlay">';
                                                searchHTML += '<div class="movie-title">';
                                                        searchHTML += '<h2>' + title + '</h2>';
                                                        // The date is just some custom JS Date Object manipulation.
                                                        searchHTML += '<h4>Release Date: ' + month + ' ' + day + ', ' + year + '<h4>';
                                                searchHTML += '</div>';
                                                searchHTML += '<div id="details" class="details text-center">';
                                                        // A bit of conditional rendering for the heart icon for favorites.
                                                        for(let j = 0; j < savedArray.length; j++){
                                                                if(savedArray.indexOf(searchID.toString()) === -1){
                                                                        searchHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart-o" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }else{
                                                                        searchHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }
                                                        }
                                                        //stars
                                                        searchHTML += '<p><span id="overlay-stars">';
                                                                searchHTML += '<div class="star-ratings"><a href="#" data-toggle="tooltip" data-placement="top" title="' + (ratingAvg * 10) + '%">';
                                                                        searchHTML += '<div class="star-ratings-top" style="width: ' + (ratingAvg * 10) + '%"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>';
                                                                        searchHTML += '<div class="star-ratings-bottom"><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span></div>';
                                                                searchHTML += '</a></div>';
                                                        searchHTML += '</span></p>';
                                                searchHTML += '</div>';
                                        searchHTML += '</div>';
                                searchHTML += '</div>';
                                // Finally, add all the HTML to the grid for each Movie Item.
                                $('#movie-grid').html(searchHTML);
                        }
                });
        };
       
        // The rest of the functions are the same basic premise. Just different endpoints and purposes.
       
        // Here, the Now Playing includes all current movies in theaters, and I believe that includes art theaters, dollar movies, and limited runs.
       
        function getNowPlaying(){
                currentQuery = "nowPlaying";
                $('.fa-heart').removeClass('active-favorites');
                $.getJSON(nowPlayingUrl, function(nowPlayingData){
                        currentBaseUrl = nowPlayingUrl;
                        if( currentPage === 1){
                                movieIDArr = [];
                                nowPlayingHTML = '';
                                $('body').scrollTop(0);
                        }
                        for(let i = 0; i < nowPlayingData.results.length; i++){
                                var title = nowPlayingData.results[i].original_title;
                                var release = nowPlayingData.results[i].release_date;
                                var protoDate = new Date(release);
                                var day = (protoDate.getDate(release)+1);
                                var month = months[protoDate.getMonth(release)];
                                var year = (protoDate.getFullYear(release));
                                var poster = imageBaseUrl + '/w300' + nowPlayingData.results[i].poster_path;
                                if (poster === 'https://image.tmdb.org/t/p/w300null'){
                                        poster = placeholderImage;
                                }
                                var ratingAvg = nowPlayingData.results[i].vote_average;
                                var nowPlayingID = nowPlayingData.results[i].id;
                                var savedFavorite = localStorage.getItem('favorite');
                                if(savedFavorite == null){
                                        savedFavorite = "";
                                }
                                var savedArray = savedFavorite.split(',');
                                movieIDArr.push(nowPlayingID);
                                nowPlayingHTML += '<div class="movie-item col-sm-6 col-md-4 col-lg-3" id="' + nowPlayingID + '" data-toggle="modal" data-target=".movie-modal" onclick="updateModal(this);">';
                                        nowPlayingHTML += '<img src="' + poster + '">';
                                        nowPlayingHTML += '<div class="overlay">';
                                                nowPlayingHTML += '<div class="movie-title">';
                                                        nowPlayingHTML += '<h2>' + title + '</h2>';
                                                        nowPlayingHTML += '<h4>Release Date: ' + month + ' ' + day + ', ' + year + '<h4>';
                                                nowPlayingHTML += '</div>';
                                                nowPlayingHTML += '<div id="details" class="details text-center">';
                                                        for(let j = 0; j < savedArray.length; j++){
                                                                if(savedArray.indexOf(nowPlayingID.toString()) === -1){
                                                                        nowPlayingHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart-o" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }else{
                                                                        nowPlayingHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }
                                                        }
                                                        nowPlayingHTML += '<p><span id="overlay-stars">';
                                                                nowPlayingHTML += '<div class="star-ratings"><a href="#" data-toggle="tooltip" data-placement="top" title="' + (ratingAvg * 10) + '%">';
                                                                        nowPlayingHTML += '<div class="star-ratings-top" style="width: ' + (ratingAvg * 10) + '%"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>';
                                                                        nowPlayingHTML += '<div class="star-ratings-bottom"><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span></div>';
                                                                nowPlayingHTML += '</a></div>';
                                                        nowPlayingHTML += '</span></p>';
                                                nowPlayingHTML += '</div>';
                                        nowPlayingHTML += '</div>';
                                nowPlayingHTML += '</div>';
                                $('#movie-grid').html(nowPlayingHTML);
                        }
                });
        };
    
        // This click listener does the same thing that the one for Now Playing does.
       
        $('.upcoming').click(function(){
                currentPage = 1;
                $('.main-menu a p').removeClass('active-browse');
                $('.upcoming p').addClass('active-browse');
                $('.main-menu').removeClass('active');
                $('.main-menu-tab').removeClass('active');
                upcomingBaseUrl = apiBaseUrl + '/movie/upcoming?api_key=' + apiKey + '&region=US' + '&page=' + currentPage;
                getUpcoming();
        });
       
        // Again, the function is basically the same as well. Just pulling unreleased movies within a set date range out from today.
       
        function getUpcoming(){
                currentQuery = "upcoming";
                $('.fa-heart').removeClass('active-favorites');
                $.getJSON(upcomingBaseUrl, function(upcomingData){
                        currentBaseUrl = upcomingBaseUrl;
                        if( currentPage === 1){
                                movieIDArr = [];
                                upcomingHTML = '';
                                $('body').scrollTop(0);
                        }
                        for(let i = 0; i < upcomingData.results.length; i++){
                                var title = upcomingData.results[i].original_title;
                                var release = upcomingData.results[i].release_date;
                                var protoDate = new Date(release);
                                var today = new Date();
                                var day = (protoDate.getDate(release)+1);
                                var month = months[protoDate.getMonth(release)];
                                var year = (protoDate.getFullYear(release));
                                var poster = imageBaseUrl + '/w300' + upcomingData.results[i].poster_path;
                                if (poster === 'https://image.tmdb.org/t/p/w300null'){
                                        poster = placeholderImage;
                                }
                                var ratingAvg = upcomingData.results[i].vote_average;
                                var upcomingID = upcomingData.results[i].id;
                                var savedFavorite = localStorage.getItem('favorite');
                                if(savedFavorite == null){
                                        savedFavorite = "";
                                }
                                var savedArray = savedFavorite.split(',');
                                movieIDArr.push(upcomingID);
                                if(protoDate.getTime() > today.getTime()){
                                        upcomingHTML += '<div class="movie-item col-sm-6 col-md-4 col-lg-3" id="' + upcomingID + '" data-toggle="modal" data-target=".movie-modal" onclick="updateModal(this);">';
                                                upcomingHTML += '<img src="' + poster + '">';
                                                upcomingHTML += '<div class="overlay">';
                                                        upcomingHTML += '<div class="movie-title">';
                                                                upcomingHTML += '<h2>' + title + '</h2>';
                                                                upcomingHTML += '<h4>Release Date: ' + month + ' ' + day + ', ' + year + '<h4>';
                                                        upcomingHTML += '</div>';
                                                        upcomingHTML += '<div id="details" class="details text-center">';
                                                        for(let j = 0; j < savedArray.length; j++){
                                                                if(savedArray.indexOf(upcomingID.toString()) === -1){
                                                                        upcomingHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart-o" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }else{
                                                                        upcomingHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }
                                                        }
                                                        upcomingHTML += '<p><span id="overlay-stars">';
                                                                upcomingHTML += '<div class="star-ratings"><a href="#" data-toggle="tooltip" data-placement="top" title="' + (ratingAvg * 10) + '%">';
                                                                        upcomingHTML += '<div class="star-ratings-top" style="width: ' + (ratingAvg * 10) + '%"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>';
                                                                        upcomingHTML += '<div class="star-ratings-bottom"><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span></div>';
                                                                upcomingHTML += '</a></div>';
                                                        upcomingHTML += '</span></p>';
                                                upcomingHTML += '</div>';
                                                upcomingHTML += '</div>';
                                        upcomingHTML += '</div>';
                                }
                        }
                        $('#movie-grid').html(upcomingHTML);
                });
        };
        
        // Here is the basic logic and conditional styling for the sort options and toggles.
        // Each can be sorted ascending, or descending, and can have a priority if active.
        
        var sortVar = $('.sortBy.Active').attr('svalD');
        $('.sortBy').click(function(){
                $('.sortBy').removeClass('Active');
                $(this).addClass('Active');
                if($('.sortBy.Active').attr('up') === 'true'){
                        sortVar = $('.sortBy.Active').attr('svalA');
                        $('.sortBy.Active').attr('up','false');
                        $('.sortBy.Active .arrowUp').toggleClass('up');
                        $('.sortBy.Active .arrowDown').toggleClass('down');
                }else{
                        sortVar = $('.sortBy.Active').attr('svalD');
                        $('.sortBy.Active').attr('up','true');
                        $('.sortBy.Active .arrowUp').toggleClass('up');
                        $('.sortBy.Active .arrowDown').toggleClass('down');
                }
        });
        // With the Discover endpoint, I resused the function for each one of the various genres that can be set.
        // If the genre, (or popular) is clicked, then the special HTML attribute, lval, is passed into the call, along with the current sort value.
        var discoverUrl = discoverBaseUrl;
        $('.filter').click(function(){
                currentFilter = $(this).attr('id');
                var linkVar = $(this).attr('lval');
                $('.main-menu a p').removeClass('active-browse');
                $('#'+currentFilter+' p').addClass('active-browse');
                $('.main-menu').removeClass('active');
                $('.main-menu-tab').removeClass('active');
                currentPage = 1;
                discoverBaseUrl = apiBaseUrl + '/discover/movie?api_key=' + apiKey + '&page=' + currentPage;
                discoverJSON(linkVar,sortVar);
        });
        // The function itself doesn't change too much, but the variability here is the key.
        // (Obviously, this is a far more efficient way of calling the API and in the future, this is the first pain point I will refactor.
        function discoverJSON(linkVar,sortVar){
                var discoverUrl = '';
                $('.fa-heart').removeClass('active-favorites');
                discoverUrl = discoverBaseUrl + linkVar + sortVar;
                currentQuery = "discover";
                $.getJSON(discoverUrl, function(discoverData){
                        currentBaseUrl = discoverUrl;
                        if( currentPage === 1){
                                movieIDArr = [];
                                mpaaArr = [];
                                discoverHTML = '';
                                $('body').scrollTop(0);
                        }
                        for(let i = 0; i < discoverData.results.length; i++){
                                var title = discoverData.results[i].original_title;
                                var release = discoverData.results[i].release_date;
                                var protoDate = new Date(release);
                                var day = (protoDate.getDate(release)+1);
                                var month = months[protoDate.getMonth(release)];
                                var year = (protoDate.getFullYear(release));
                                var poster = imageBaseUrl + '/w300' + discoverData.results[i].poster_path;
                                if (poster === 'https://image.tmdb.org/t/p/w300null'){
                                        poster = placeholderImage;
                                }
                                var ratingAvg = discoverData.results[i].vote_average;
                                var discoverID = discoverData.results[i].id;
                                var savedFavorite = localStorage.getItem('favorite');
                                if(savedFavorite == null){
                                        savedFavorite = "";
                                }
                                var savedArray = savedFavorite.split(',');
                                movieIDArr.push(discoverID);
                                discoverHTML += '<div class="movie-item col-sm-6 col-md-4 col-lg-3" id="' + discoverID + '" data-toggle="modal" data-target=".movie-modal" onclick="updateModal(this);">';
                                        discoverHTML += '<img src="' + poster + '">';
                                        discoverHTML += '<div class="overlay">';
                                                discoverHTML += '<div class="movie-title">';
                                                        discoverHTML += '<h2>' + title + '</h2>';
                                                        discoverHTML += '<h4>' + month + ' ' + year + '<h4>';
                                                discoverHTML += '</div>';
                                                discoverHTML += '<div id="details" class="details text-center">';
                                                        for(let j = 0; j < savedArray.length; j++){
                                                                if(savedArray.indexOf(discoverID.toString()) === -1){
                                                                        discoverHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart-o" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }else{
                                                                        discoverHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }
                                                        }
                                                        discoverHTML += '<p><span id="overlay-stars">';
                                                                discoverHTML += '<div class="star-ratings"><a href="#" data-toggle="tooltip" data-placement="top" title="' + (ratingAvg * 10) + '%">';
                                                                        discoverHTML += '<div class="star-ratings-top" style="width: ' + (ratingAvg * 10) + '%"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>';
                                                                        discoverHTML += '<div class="star-ratings-bottom"><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span></div>';
                                                                discoverHTML += '</a></div>';
                                                        discoverHTML += '</span></p>';
                                                discoverHTML += '</div>';
                                        discoverHTML += '</div>';
                                discoverHTML += '</div>';
                        }
                        $('#movie-grid').html(discoverHTML);
                });
        };
        
        // Here is the basic listener for the main menu. Click the tabe and the menu slides into place.
        
        $('.main-menu-tab').click(function(){
                animateMenu();
        });
        
        // Also, here is the listener for the favorites button on the top bar.
        // This one is a bit more interesting, since it pulls the array of favorites from local storage first, and then runs a new call for each favorite.
       
        $('.favorites-button').click(function(){
                favoritesHTML = '';
                currentQuery = 'favorites';
                $('.main-menu a p').removeClass('active-browse');
                $('.fa.fa-heart').addClass('active-favorites');
                $('#movie-grid').html(favoritesHTML);
                var favStr = localStorage.favorite;
                var favArray = favStr.split(',');
                for(let i=0; i<favArray.length; i++){
                        showFavorites(favArray[i]);
                }
        });
       
        // The basic function is the same as usual, but it does take the id passed from the favorites array.
        
        function showFavorites(favorite){
                var favoritesUrl = apiBaseUrl + '/movie/' + favorite + '?api_key=' + apiKey;
                $.getJSON(favoritesUrl, function(favoritesData){
                        var title = favoritesData.original_title;
                        var release = favoritesData.release_date;
                        var protoDate = new Date(release);
                        var day = (protoDate.getDate(release)+1);
                        var month = months[protoDate.getMonth(release)];
                        var year = (protoDate.getFullYear(release));
                        var poster = imageBaseUrl + '/w300' + favoritesData.poster_path;
                        if (poster === 'https://image.tmdb.org/t/p/w300null'){
                                poster = placeholderImage;
                        }
                        var ratingAvg = favoritesData.vote_average;
                        var savedFavorite = localStorage.getItem('favorite');
                        if(savedFavorite == null){
                                savedFavorite = "";
                        }
                        var savedArray = savedFavorite.split(',');
                        favoritesHTML += '<div class="movie-item col-sm-6 col-md-4 col-lg-3" id="' + favorite + '" data-toggle="modal" data-target=".movie-modal" onclick="updateModal(this);">';
                                favoritesHTML += '<img src="' + poster + '">';
                                favoritesHTML += '<div class="overlay">';
                                        favoritesHTML += '<div class="movie-title">';
                                                favoritesHTML += '<h2>' + title + '</h2>';
                                                favoritesHTML += '<h4>' + month + ' ' + year + '<h4>';
                                        favoritesHTML += '</div>';
                                        favoritesHTML += '<div id="details" class="details text-center">';
                                                        for(let j = 0; j < savedArray.length; j++){
                                                                if(savedArray.indexOf(favorite.toString()) === -1){
                                                                        favoritesHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart-o" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }else{
                                                                        favoritesHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }
                                                        }
                                                        favoritesHTML += '<p><span id="overlay-stars">';
                                                                favoritesHTML += '<div class="star-ratings"><a href="#" data-toggle="tooltip" data-placement="top" title="' + (ratingAvg * 10) + '%">';
                                                                        favoritesHTML += '<div class="star-ratings-top" style="width: ' + (ratingAvg * 10) + '%"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>';
                                                                        favoritesHTML += '<div class="star-ratings-bottom"><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span></div>';
                                                                favoritesHTML += '</a></div>';
                                                        favoritesHTML += '</span></p>';
                                                favoritesHTML += '</div>';
                                favoritesHTML += '</div>';
                        favoritesHTML += '</div>';
                        $('#movie-grid').html(favoritesHTML);
                });
        }
}); // <==== End of Document ready.
// I had to play with what worked in an out of the main ready function, but this is currenly working, so good enough for now. Added to ToDo for version 2!

// Here is the function to animate the menu. Just fancy css classes.

function animateMenu(){
        $('.main-menu').toggleClass('active');
        $('.main-menu-tab').toggleClass('active');
}

// This is the big bad Modal Updater! This thing just gets bigger and bigger as I work on it.
// It takes the current ID from the clicked movie tile, and runs a full search with additional items appended to it.
// All this comes back and I grab what I want for the render.

function updateModal(thisMovie){
        currentID = 0;
        currentID = $(thisMovie).attr('id');
        var currentUrl = apiBaseUrl + '/movie/' + currentID + '?api_key=' + apiKey +'&append_to_response=videos,images,release_dates';
        var posterHTML = '';
        var titleHTML = '';
        var infoHTML = '';
        var ratingHTML = '';
        var backdropHTML = '';
        var ticketsHTML = '';
        var trailerHTML = '';
        // reseting some variables...
        $.getJSON(currentUrl, function(detailsData){
                var zip = 30075;
                var title = detailsData.original_title;
                var release = detailsData.release_date;
                var protoDate = new Date(release);
                var day = (protoDate.getDate(release)+1);
                var month = months[protoDate.getMonth(release)];
                var year = protoDate.getFullYear(release);
                var poster = imageBaseUrl + '/w300' + detailsData.poster_path;
                if (poster === 'https://image.tmdb.org/t/p/w300null'){
                        poster = placeholderImage;
                }
                // Add backdrops to rotate...
                var backdrop = imageBaseUrl + '/w600' + detailsData.backdrop_path;
                var description = detailsData.overview;
                var runTime = detailsData.runtime;
                var webSite = detailsData.homepage;
                // Just in case there are no trailers...
                if (detailsData.videos.results.length > 0){
                        var trailerId = detailsData.videos.results[0].key;
                }else{
                        var trailerId = undefined;
                }
                var ratingAvg = detailsData.vote_average;
                var ratingCount = detailsData.vote_count;
                var genre = '';
                var genreArray = [];
                var currentRootId = '';
                var mpaaRating = currentMpaa;
                // Grabbed MPAA ratings from a country and cirtificates object in release_dates (appended to the URL).
                $('#main-content').html('');
                var releaseResults = detailsData.release_dates.results;
                var mpaa = 'NR';
                // There were results for multiple countries and regions, so there were more than just MPAA ratings...
                for (let result of releaseResults) {
                        if (result.iso_3166_1 === "US") {
                                var certifications = result.release_dates;
                                for (let cert of certifications) {
                                        if (cert.certification !== '') {
                                                mpaa = cert.certification;
                                                break;
                                        }
                                }
                        }
                }
                // Grabbed all available genres.
                for(let i = 0; i < detailsData.genres.length; i++){
                        genre = detailsData.genres[i].name;
                        genreArray.push(genre);
                }
                for(let i = 0; i < genreArray.length; i++){
                        var visGenre = genreArray.join(', ');
                }
                // Setup a rotating backdrop with the gallery images.
                var backdropCounter = 0;
                var backdropRotate = setInterval(function(){
                        $('#main-content').html('');
                        backdrop = imageBaseUrl + '/w600' + detailsData.images.backdrops[backdropCounter].file_path;
                        $('#main-content').html('<img src="' + backdrop +'">');
                        backdropCounter++;
                        if(backdropCounter == detailsData.images.backdrops.length){
                                backdropCounter = 0;
                        }
                }, 10000);
                // Had to stop the backdrop rotation and clear the content on close of the modal.
                $('.close, .modal-backdrop').click(function stopRotate(){
                        clearInterval(backdropRotate);
                        $('#main-content').html('');
                });
                // More custom HTML to setup the layout and get the content I wanted.
                posterHTML += '<img src="' + poster + '">';
                titleHTML += '<h1 id="title-text">' + title + ' <divƒ id="mpaaRating">' + mpaa + '</div></h1>';
                titleHTML += '<hr/>';
                titleHTML += '<p id="desc">' + description + '</p>';
                titleHTML += '<p id="desc"><span>Release Date: ' + month + ' ' + day + ', ' + year + '</span></p>';
                titleHTML += '<p>';
                        titleHTML += '<span id="run-time">Length: ' + runTime + ' minutes &nbsp; &nbsp; </span>';
                        titleHTML += '<span id="modal-genre">Genres: ' + visGenre + '</span>';
                titleHTML += '</p';
                if(webSite != ""){
                infoHTML += '<p>';
                        infoHTML += '<span id="trailer-btn" class="btn btn-secondary"><a href="' + webSite + '" target="_blank">Visit the Website</a></span>';
                        infoHTML += '<span id="trailer-btn" class="btn btn-secondary"><a id="trailer-link" href="#" data-toggle="modal" data-target=".trailer-modal"  data-theVideo="https://www.youtube.com/embed/' + trailerId + '">View the trailer</a></span>';
                        if(protoDate.getTime() > (Date.now() - 3888000000)){
                                ticketsHTML += '<div class="text-center">';
                                        ticketsHTML += '<a href="https://www.fandango.com/moviesintheaters" target="_blank" id="tickets-button" class="btn btn-lg btn-primary"> Get Tickets</a>';
                                ticketsHTML += '</div>';
                        }
                infoHTML += '</p>';
                }
                ratingHTML += '<div>';
                        ratingHTML += '<div id="stars">';
                                ratingHTML += 'Rating: &nbsp; <div class="star-ratings"><a href="#" data-toggle="tooltip" data-placement="top" title="' + (ratingAvg * 10) + '%">';
                                        ratingHTML += '<div class="star-ratings-top" style="width: ' + (ratingAvg * 10) + '%"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>';
                                        ratingHTML += '<div class="star-ratings-bottom"><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span></div>';
                                ratingHTML += '</a></div>';
                                ratingHTML += ' &nbsp; &nbsp; (' + ratingCount + ' reviews) &nbsp; | &nbsp; Favorite: <i id="heart" class="fa fa-heart-o" aria-hidden="true"></i>';
                        ratingHTML += '</div>';
                ratingHTML += '</div>';

                // This added a new sub-modal on top of the main modal for the trailer video player.
                trailerHTML += '<iframe id="player" src="" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>';

                // Saved local storage settings for the favorite button.
                var savedFavorite = localStorage.getItem('favorite');
                if(savedFavorite == null){
                        savedFavorite = "";
                }
                var savedArray = savedFavorite.split(',');
                // Listener for favorite. If it is in the array, this movie will load as a favorite.
                $('#heart').ready(function(){
                        for(let i = 0; i < savedArray.length; i++){
                                if(savedArray[i] == currentID){
                                        $('#heart').removeClass();
                                        $('#heart').addClass('fa fa-heart');
                                }
                        }
                });
                // Final rendering of all sub components.
                $('#heart').removeClass();
                $('#movie-poster').html(posterHTML);
                $('.modal-movie-title').html(titleHTML);
                $('#trailer').html(infoHTML);
                $('#trailer-content').html(trailerHTML);
                $('#movie-rating').html(ratingHTML);
                $('.tickets').html(ticketsHTML);
                $('[data-toggle="tooltip"]').tooltip();
                
                // This is the favorite click listener function.
                // If it is already a favorite, remove the id and save to local storage.
                // Else, add the append to the array and save that to local storage.
              
                $('#heart').click(function(){
                        $('#heart').toggleClass('fa fa-heart');
                        $('#heart').toggleClass('fa fa-heart-o');
                        var favArray = [];
                        var old = localStorage.getItem('favorite');
                        // Setting base cases, and making sure it isn't null.
                        if(old === null){
                                localStorage.setItem('favorite', currentID);
                                old = localStorage.getItem('favorite');
                                favArray.push(old);
                        }else if(old === currentID){
                                localStorage.removeItem('favorite');
                        }else{
                                favArray = old.split(',');
                                for(let i = 0; i < favArray.length; i++){
                                        if(favArray[i] == currentID){
                                                removeFromStorage('favorite', currentID);
                                                break;
                                        }else if(favArray.indexOf(currentID, 0) === -1){
                                                appendToStorage('favorite', currentID);
                                                break;
                                        }
                                }
                        }
                        
                        // Helper functions to append or remove the item.
                        
                        function appendToStorage(name, data){
                                localStorage.setItem(name, old + ',' + data);
                        }
                        function removeFromStorage(name, data){
                                for(let i = 0; i < favArray.length; i++){
                                        if(favArray[i] == currentID){
                                                favArray.splice(i,1);
                                        }
                                }
                                var favString = favArray.join();
                                localStorage.setItem('favorite', favString);
                                if(currentQuery === 'favorites'){
                                        favoritesHTML = '';
                                        $('#movie-grid').html(favoritesHTML);
                                        var favArr = favString.split(',');
                                        for(let i=0; i<favArr.length; i++){
                                                updateFavorites(favArr[i]);
                                                
                                                // At the end, if you are on the favorites page and you just dropped the favorite, it should be gone immediately.
                                                // Just a very verbose way to keep nice UX...
                                                
                                        }
                                }
                        }
                       
                        // Here is the forced re-render of the favorites page, so there will be no doubt if these need to be updated.
                        
                        function updateFavorites(favorite){
                                var favoritesUrl = apiBaseUrl + '/movie/' + favorite + '?api_key=' + apiKey;
                                $.getJSON(favoritesUrl, function(favoritesData){
                                        var title = favoritesData.original_title;
                                        var release = favoritesData.release_date;
                                        var protoDate = new Date(release);
                                        var day = (protoDate.getDate(release)+1);
                                        var month = months[protoDate.getMonth(release)];
                                        var year = (protoDate.getFullYear(release));
                                        var poster = imageBaseUrl + '/w300' + favoritesData.poster_path;
                                        if (poster === 'https://image.tmdb.org/t/p/w300null'){
                                                poster = placeholderImage;
                                        }
                                        var ratingAvg = favoritesData.vote_average;
                                        var savedFavorite = localStorage.getItem('favorite');
                                        if(savedFavorite == null){
                                                savedFavorite = "";
                                        }
                                        var savedArray = savedFavorite.split(',');
                                        favoritesHTML += '<div class="movie-item col-sm-6 col-md-4 col-lg-3" id="' + favorite + '" data-toggle="modal" data-target=".movie-modal" onclick="updateModal(this);">';
                                                favoritesHTML += '<img src="' + poster + '">';
                                                favoritesHTML += '<div class="overlay">';
                                                        favoritesHTML += '<div class="movie-title">';
                                                                favoritesHTML += '<h2>' + title + '</h2>';
                                                                favoritesHTML += '<h4>' + month + ' ' + year + '<h4>';
                                                        favoritesHTML += '</div>';
                                                        favoritesHTML += '<div id="details" class="details text-center">';
                                                        for(let j = 0; j < savedArray.length; j++){
                                                                if(savedArray.indexOf(favorite.toString()) === -1){
                                                                        favoritesHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart-o" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }else{
                                                                        favoritesHTML += '<p><span id="overlay-heart"><i class="fa fa-3x fa-heart" aria-hidden="true"></i></span></p>';
                                                                        break;
                                                                }
                                                        }
                                                        favoritesHTML += '<p><span id="overlay-stars">';
                                                                favoritesHTML += '<div class="star-ratings"><a href="#" data-toggle="tooltip" data-placement="top" title="' + (ratingAvg * 10) + '%">';
                                                                        favoritesHTML += '<div class="star-ratings-top" style="width: ' + (ratingAvg * 10) + '%"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>';
                                                                        favoritesHTML += '<div class="star-ratings-bottom"><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span></div>';
                                                                favoritesHTML += '</a></div>';
                                                        favoritesHTML += '</span></p>';
                                                favoritesHTML += '</div>';
                                                favoritesHTML += '</div>';
                                        favoritesHTML += '</div>';
                                        $('#movie-grid').html(favoritesHTML);
                                });
                        }
                });
              
                // Finally, here is the autoplay for the trailer modal. I wanted to autoplay, be available to change settings, or make fullscreen, and still be able to stop on close...
                // Really tough with the YouTube iFrame API, but it worked in the end!
                
                function autoPlayYouTubeModal(){
                        var trigger = $(".modal-body").find('[data-toggle="modal"]');
                        trigger.click(function() {
                                var theModal = $(this).data( "target" )
                                videoSRC = $(this).attr( "data-theVideo" )
                                videoSRCauto = videoSRC+"?autoplay=1" ;
                                $(theModal+' iframe').attr('src', videoSRCauto);
                                $(theModal).on('hidden.bs.modal',function () {
                                        $(theModal+' iframe').attr('src', videoSRC);
                                });
                        });
                }
                autoPlayYouTubeModal();
        });
}


