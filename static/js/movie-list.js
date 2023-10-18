document.addEventListener('DOMContentLoaded', function () {


  let recommendedMoviesList = [];
  let currentIndex = 0;
  let itemsPerPage = 50;



  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ODljOWJlMTkxYWUwN2VlZjk0YTgwNmQ1N2E1YTExNiIsInN1YiI6IjY0Nzk1YmM1MGUyOWEyMDBiZjFkZjEyMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Myu-8IC9IvWsw9SMBdkGRmme1mgdzSWmbrasn7nWoFY'
    }
  };



  function sortMovies(movies, sortBy) {
    // Sort by newest
    if (sortBy === 'year') {
      return movies.sort((a, b) => {
        return new Date(b.release_date) - new Date(a.release_date);
      });
    }

    // Sort by best rated
    else if (sortBy === 'rating') {
      return movies.sort((a, b) => {
        return b.vote_average - a.vote_average;
      });
    }
  }

  window.onSort = function (sortBy) {

    let moviesContainer = document.querySelector("#movies_grid .row");


    // Sort the movies
    recommendedMoviesList = sortMovies(recommendedMoviesList, sortBy);

    // Clear the displayed movies
    moviesContainer.innerHTML = "";

    // Reset the current index
    currentIndex = 0;

    // Display the sorted movies
    displayMovies();

  }

  window.onMovieClick = function (movieid) {
    localStorage.setItem("movieid", movieid);
    window.location.href = "/movie-description/" + movieid;
  }


  async function getMoviesId() {
    var storedMovies = localStorage.getItem("movies");

    var movies = JSON.parse(storedMovies);

    if (document.querySelectorAll('[data-movie-rid]') != null) {
      console.log("No movies found in local storage");
      var movieElements = document.querySelectorAll('[data-movie-rid]');


      console.log(movieElements)

      movies = [];

      for (var i = 0; i < movieElements.length; i++) {
        var movieId = movieElements[i].dataset.movieRid;

        movies.push(movieId)

        console.log(movieId)
      }


      if (movies.length == 0) {

        movies = JSON.parse(storedMovies);
        console.log(movies)
        if (movies.length == 0) {
          return movies;
        }

      }
    }

    //Get top rated movies for the actors and directors
    var topRatedMoviesID = await getTopRatedMovies();

    movies = movies.concat(topRatedMoviesID);


    return movies;

  }


  async function getTopRatedMovies() {
    var actorid = JSON.parse(localStorage.getItem("actorid"))
    if (actorid == null) {
      actorid = [];
    }
    var directorid = JSON.parse(localStorage.getItem("directorid"))
    if (directorid == null) {
      directorid = [];
    }
    actorid.concat(directorid)
    let topRatedMovies = [];

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
      }
    };

    console.log("TOP RATED MOVIES");
    for (let i = 0; i < actorid.length; i++) {

      url = `https://api.themoviedb.org/3/discover/movie?with_people=${actorid[i]}&&page=1&&language=en-US&&sort_by=vote_average.desc`;

      let response = await fetch(url, options);
      let responseData = await response.json();

      console.log('TOP RATED MOVIES')

      //actor results
      let actorResults = responseData.results;

      console.log(actorResults);

      if (actorResults.length != 0) {
        topRatedMovies.push(actorResults[0].id);
      }
    }

    return topRatedMovies;
  }



  async function getAllReccommendations(movieid) {

    var startPage = 1;

    var totalPages = 10;
    var url = `https://api.themoviedb.org/3/movie/${movieid}/recommendations?page=${startPage}`;

    var response = await fetch(url, options)

    var data = await response.json();

    var recommendations = data.results;
    totalPages = data.total_pages;

    let allReccommendations = [];

    for (let i = 1; i <= totalPages; i++) {
      url = `https://api.themoviedb.org/3/movie/${movieid}/recommendations?page=${i}`;

      response = await fetch(url, options)

      data = await response.json();

      recommendations = data.results;

      // Sort the recommendations by release date
      recommendations.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

      // Only take the top 3 (latest) recommendations
      //recommendations = recommendations.slice(0, 3);

      allReccommendations = allReccommendations.concat(recommendations)

    }

    return allReccommendations;
  }


  function searchCache() {
    let movies = localStorage.getItem("recommendations");

    if (movies == null) {
      return [];
    }

    return JSON.parse(movies);
  }


  async function getTopMoviesActors() {
    var actorid = JSON.parse(localStorage.getItem("actorid"))
    console.log(
      localStorage.getItem("actorid")
    )
    if (actorid == null) {
      actorid = [];
    }

    let topRatedMovies = [];

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
      }
    };

    console.log("TOP RATED MOVIES");
    for (let i = 0; i < actorid.length; i++) {

      url = `https://api.themoviedb.org/3/discover/movie?with_people=${actorid[i]}&&page=1&&language=en-US&&sort_by=vote_average.desc`;

      let response = await fetch(url, options);
      let responseData = await response.json();

      console.log('TOP RATED MOVIES')

      //actor results
      let actorResults = responseData.results;

      console.log(actorResults);

      if (actorResults.length != 0) {
        topRatedMovies.push(actorResults[0].id);
      }
    }

    return topRatedMovies;
  }


  async function getTopMoviesDirectors() {
    var actorid = [];

    var directorid = JSON.parse(localStorage.getItem("directorid"))
    if (directorid == null) {
      directorid = [];
    }
    actorid.concat(directorid)
    let topRatedMovies = [];

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
      }
    };

    console.log("TOP RATED MOVIES");
    for (let i = 0; i < actorid.length; i++) {

      url = `https://api.themoviedb.org/3/discover/movie?with_people=${actorid[i]}&&page=1&&sort_by=vote_average.desc`;

      let response = await fetch(url, options);
      let responseData = await response.json();

      console.log('TOP RATED MOVIES')

      //actor results
      let actorResults = responseData.results;

      console.log(actorResults);

      if (actorResults.length != 0) {
        topRatedMovies.push(actorResults[0].id);
      }
    }

    return topRatedMovies;
  }



  async function nowPlayingMovies() {
    let givengenresids = JSON.parse(localStorage.getItem("genreid"));

    var directorid = JSON.parse(localStorage.getItem("directorid"))

    var actorid = JSON.parse(localStorage.getItem("actorid"))

    console.log(actorid)

    actorid = actorid.concat(directorid)

    let actorslist = actorid.join('|'); // change from actorslist to actorid

    console.log("SELECTED GENRE's ID");

    console.log(givengenresids)
    let genreid = '';
    if (givengenresids != null) {
      genreid = givengenresids.join("|")
    }

    //with_people=${actorslist}&&


    var currentYear = new Date().getFullYear();


    //url = `https://api.themoviedb.org/3/discover/movie?page=${page}&&vote_count.gte=500&&primary_release_date.lte=${currentYear}&&language=en-US&&sort_by=vote_average.desc`;

    url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&page=1&primary_release_date.gte=${currentYear}&primary_release_date.lte=${currentYear}&sort_by=vote_count.desc&with_genres=${genreid}&vote_average.gte=5`

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
      }
    };

    //url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1`;

    let response = await fetch(url, options);
    let responseData = await response.json();

    console.log('NOW PLAYING RATED MOVIES')

    //actor results

    let movieResults = responseData.results;

    return movieResults;
  }

  async function getRangePlayingMovies(dateRanges) {
    let givengenresids = JSON.parse(localStorage.getItem("genreid"));


    var directorid = JSON.parse(localStorage.getItem("directorid"))

    var actorid = JSON.parse(localStorage.getItem("actorid"))

    actorid = actorid.concat(directorid)

    let actorslist = actorid.join('|');

    let genreid = '';
    if (givengenresids != null) {
      genreid = givengenresids.join("|")
    }

    let allMovieResults = [];

    for (let range of dateRanges) {
      let startDate = range.start.toISOString().split('T')[0];  // Convert Date object to 'YYYY-MM-DD' format
      let endDate = range.end.toISOString().split('T')[0];  // Convert Date object to 'YYYY-MM-DD' format
      //vote_average.gte=5&
      let url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&page=1&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=popularity.desc&vote_average.gte=4&with_genres=${genreid}&with_runtime.gte=70`

      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
        }
      };

      let response = await fetch(url, options);
      let responseData = await response.json();

      let movieResults = responseData.results;
      allMovieResults = allMovieResults.concat(movieResults);
    }

    console.log(allMovieResults);

    return allMovieResults;
  }


  function getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len) {
      return arr;
    }

    while (n--) {
      var x = Math.floor(Math.random() * len);
      let magic = arr[x in taken ? taken[x] : x];

      if (magic.vote_avg == 0)
        continue;

      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }


  function getNowPlayingFilter(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len) {
      return arr;
    }


    return arr.slice(0, n);
  }

  let watch_providers = [];
  async function get_movie_providers(id) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ODljOWJlMTkxYWUwN2VlZjk0YTgwNmQ1N2E1YTExNiIsInN1YiI6IjY0Nzk1YmM1MGUyOWEyMDBiZjFkZjEyMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Myu-8IC9IvWsw9SMBdkGRmme1mgdzSWmbrasn7nWoFY'
      }
    };


    try {
      let response = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, options);


      let result = await response.json();

      let providers_result = result.results;

      let usproviders = providers_result['US']



      console.log("PROVIDERS");
      console.log(usproviders);


      return usproviders;

    } catch (error) {

    }


    return undefined;


  }
  let watch_providers_mapping = {};
  async function getRecommendation() {

    let cacheItems = searchCache();


    // watch_providers = await getWatchProviders();

    /*getWatchProviders().then(data => {
      watch_providers = data;
      const ulElement = document.getElementById('watchProviders');

      data.forEach((provider) => {
          const liElement = document.createElement('li');
          const aElement = document.createElement('a');

          aElement.classList.add('dropdown-item');
          aElement.href = "#";
          aElement.onclick = function() {
              // Handle the onclick event here
              console.log(provider.provider_name);
          };
          aElement.textContent = provider.provider_name;

          liElement.appendChild(aElement);
          ulElement.appendChild(liElement);
      });
  }).catch(err => console.log(err));*/


    let movieElements = document.querySelectorAll('[data-movie-id]');
    let movieIds = Array.from(movieElements).map(el => el.getAttribute('data-movie-id'));

    var storedMovies = localStorage.getItem("movies");

    let moviesIDs = JSON.parse(storedMovies);

    //cacheItems.length == 0
    if (cacheItems.length == 0) {
      //only if cache items is empty query this
      document.getElementById("loadingcontainer").style.display = "block";
      document.getElementById("recommendationcontainer").style.display = "none";

      //Get top rated movies for the actors and directors

      //Get recommended movies actors
      let topMoviesActorsMovieIds = await getTopMoviesActors();
      for (let i = 0; i < topMoviesActorsMovieIds.length; i++) {

        let moviesList = await getAllReccommendations(topMoviesActorsMovieIds[i])

        recommendedMoviesList = recommendedMoviesList.concat(moviesList);

        //choose only 2 movies
        // if (i == 2) {
        //break;
        //  }
      }

      //Get recommended movies directors
      let topMoviesDirectorsTopMovieIds = await getTopMoviesDirectors();
      for (let i = 0; i < topMoviesDirectorsTopMovieIds.length; i++) {

        let moviesList = await getAllReccommendations(topMoviesDirectorsTopMovieIds[i])

        recommendedMoviesList = recommendedMoviesList.concat(moviesList);
        //choose only 2 movies
        // if (i == 2) {
        // break;
        //  }
      }


      //get recommended movies from selected movies
      for (let i = 0; i < moviesIDs.length; i++) {

        let moviesList = await getAllReccommendations(moviesIDs[i])

        recommendedMoviesList = recommendedMoviesList.concat(moviesList);
      }

      let recentmovies = JSON.parse(localStorage.getItem('recent'));
      let recentness = '';

      // if list contain 2 then movies which are 2 months older get displayed
      // if list contain 4 then movies which are 2 years older get displayed
      // if list contain 5 then movies which are older than 2 years get displayed
      //if list contain 0 then any movie can be displayed

      console.log("RECENTNESS")
      console.log(recentmovies)

      let now = new Date();

      // Calculate the date for 2 months ago, 2 years ago, and 2 years plus
      let twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(now.getMonth() - 2);
      let twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(now.getFullYear() - 2);
      let olderThanTwoYears = new Date();
      olderThanTwoYears.setFullYear(now.getFullYear() - 3); // One year less than 2 years

      // Prepare the date ranges based on recentness values
      let dateRanges = recentmovies.map(recentness => {
        if (recentness === '2') {
          return { start: twoMonthsAgo, end: now };
        } else if (recentness === '4') {
          return { start: twoYearsAgo, end: now };
        } else if (recentness === '5') {
          return { start: olderThanTwoYears, end: twoYearsAgo };
        } else {
          return null;
        }
      }).filter(range => range !== null);

      if (!recentmovies.includes('0')) {
        console.log("RECENT MOVIES NOT INCLUDED")
        recommendedMoviesList = recommendedMoviesList.filter(movie => {
          let releaseDate = new Date(movie.release_date);
          // Check if the movie's release date falls into any of the date ranges
          //&& releaseDate <= range.end
          //releaseDate >= range.start &&
          return dateRanges.some(range => releaseDate >= range.start && releaseDate <= range.end);
        });

      }


      let givengenresids = JSON.parse(localStorage.getItem("genreid"));
      console.log("SELECTED GENRE's ID");

      console.log(givengenresids)
      if (givengenresids != null) {
        recommendedMoviesList = recommendedMoviesList.filter(movie => {
          // Check if any of the movie's genre IDs are in givengenresids
          return movie.genre_ids.some(id => givengenresids.includes(id));
        });
      }

      if (recommendedMoviesList.length < 10) {
        //newly playable movies range
        let nowPlayingMoviesList = await getRangePlayingMovies(dateRanges);
        //getRandom(nowPlayingMoviesList, 10-recommendedMoviesList.length)
        recommendedMoviesList = recommendedMoviesList.concat(nowPlayingMoviesList)
      }





      // Convert to Set and back to Array to remove duplicates
      recommendedMoviesList = Array.from(new Set(recommendedMoviesList.map(movie => movie.id))).map(id => recommendedMoviesList.find(movie => movie.id === id));


      for (var i = 0; i < recommendedMoviesList.length; i++) {
        let providers = await get_movie_providers(recommendedMoviesList[i].id);

        if (providers == undefined) {
          continue;
        }
        let alltypes = [];
        let buys = providers['buys'];
        if (buys != undefined) {
          alltypes = alltypes.concat(buys);
        }
        let streams = providers['flatrate'];
        if (streams != undefined) {
          alltypes = alltypes.concat(streams);
        }
        let rent = providers['rent'];

        if (rent != undefined) {
          alltypes = alltypes.concat(rent);
        }
        console.log("alltypes providers");
        console.log(alltypes);
        for (let j = 0; j < alltypes.length; j++) {

          //logo_path
          //provider_id
          //provider_name
          let provider = alltypes[j];

          if (
          provider.provider_name != "Apple TV" &&
          provider.provider_name != "Amazon Prime Video" &&
          provider.provider_name != "Disney Plus" &&
          provider.provider_name != "Netflix" &&
          provider.provider_name != "Paramount Plus"

        ) {
          continue;
        }

          //storing the id
          if (watch_providers_mapping[provider.provider_name] == undefined) {
            watch_providers_mapping[provider.provider_name] = { "logo": "https://image.tmdb.org/t/p/original/" + provider.logo_path, "id": provider.provider_id, "movies": [] };

          }
          watch_providers_mapping[provider.provider_name]["movies"].push(recommendedMoviesList[i].id);

        }
      }

      console.log("ALL PROVIDERS");
      console.log(watch_providers_mapping);


      let watchContainer = document.getElementById("genre");

      let html = "";

      Object.keys(watch_providers_mapping).forEach((providerName, index) => {
        let provider = watch_providers_mapping[providerName];

            html += `
      <div class="provider-container d-flex align-items-center justify-content-center m-1">
        <div style="cursor:pointer;
                      border: 2px solid #ffffff; // Border color
                      height: 50px;
                      width: 140px; // You need to specify the width
                      border-radius: 42%; // This makes it oval
                      display: flex;
                      align-items: center; border-width: 2px; border-color:#adf90f;
                      justify-content: center;
                    "
              class="card" id="provider-${index}"
              onclick='selectProvider(${provider.id},"${providerName}")'>
            <img id=${provider.id} src="${provider.logo}" />
          </div>
        </div>`;
      });

      watchContainer.innerHTML = html

      document.getElementById("loadingcontainer").style.display = "none";
      document.getElementById("recommendationcontainer").style.display = "block";





      localStorage.setItem("recommendations", JSON.stringify(recommendedMoviesList));
    }

    else {

      recommendedMoviesList = cacheItems;

      let givengenresids = JSON.parse(localStorage.getItem("genreid"));

      console.log("SELECTED GENRE's ID");

      console.log(givengenresids)



      if (givengenresids != null) {
        recommendedMoviesList = recommendedMoviesList.filter(movie => {
          // Check if any of the movie's genre IDs are in givengenresids
          return movie.genre_ids.some(id => givengenresids.includes(id));
        });
      }
      for (var i = 0; i < recommendedMoviesList.length; i++) {
        let providers = await get_movie_providers(recommendedMoviesList[i].id);

        if (providers == undefined) {
          continue;
        }
        let alltypes = [];
        let buys = providers['buys'];
        if (buys != undefined) {
          alltypes = alltypes.concat(buys);
        }
        let streams = providers['flatrate'];
        if (streams != undefined) {
          alltypes = alltypes.concat(streams);
        }
        let rent = providers['rent'];

        if (rent != undefined) {
          alltypes = alltypes.concat(rent);
        }
        console.log("alltypes providers");
        console.log(alltypes);
        for (let j = 0; j < alltypes.length; j++) {

          //logo_path
          //provider_id
          //provider_name
          let provider = alltypes[j];

          if (
          provider.provider_name != "Apple TV" &&
          provider.provider_name != "Amazon Prime Video" &&
          provider.provider_name != "Disney Plus" &&
          provider.provider_name != "Netflix" &&
          provider.provider_name != "Paramount Plus"

        ) {
          continue;
        }

          //storing the id
          if (watch_providers_mapping[provider.provider_name] == undefined) {
            watch_providers_mapping[provider.provider_name] = { "logo": "https://image.tmdb.org/t/p/original/" + provider.logo_path, "id": provider.provider_id, "movies": [] };

          }
          watch_providers_mapping[provider.provider_name]["movies"].push(recommendedMoviesList[i].id);

        }
      }

      console.log("ALL PROVIDERS");
      console.log(watch_providers_mapping);


      let watchContainer = document.getElementById("genre");

      let html = "";

      Object.keys(watch_providers_mapping).forEach((providerName, index) => {
        let provider = watch_providers_mapping[providerName];

        html += `
  <div class="provider-container d-flex align-items-center justify-content-center m-3">
    <div style="cursor:pointer;
                border: 2px solid #ffffff; // Border color
                height: 50px;
                width: 140px; // You need to specify the width
                border-radius: 42%; // This makes it oval
                display: flex;
                align-items: center; border-width: 2px; border-color:#adf90f;
                justify-content: center;
               "
         class="card" id="provider-${index}"
         onclick='selectProvider(${provider.id},"${providerName}")'>
      <img id=${provider.id} src="${provider.logo}" />
    </div>
  </div>`;
      });

      watchContainer.innerHTML = html

    }

    recommendedMoviesList = recommendedMoviesList.filter(movie => {
      // Only keep movies not present in movieIds
      return !movieIds.includes(movie.id.toString());
    });

    console.log("HERE WE GOT THE RECCOMENDATIONS")

    console.log(recommendedMoviesList)


    let moviesContainer = document.querySelector("body");

    if (recommendedMoviesList.length == 0) {

      moviesContainer.insertAdjacentHTML('beforeend', `<div class="subtitle">
        <p class="text-center">No movies selected for reccommendation</p>
      </div>`);

      return;
    }
    else {
      recommendedMoviesList = sortMovies(recommendedMoviesList, 'year');
      displayMovies();
    }



  }


  var generelist = [];

  let currentSelected = null;
  let selectedProviderName = undefined;
  window.selectProvider = function (id, providerName) {
    let node = document.getElementById(id);
    let genreBlock = node.parentNode;

    // Create a div for overlay
    // Create a div for overlay
    /*  .provider-card {
        position: relative;
    }

    .provider-card::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Adjust the opacity as needed
    }*/
    let overlay = document.createElement('div');
    overlay.style = `
        position: absolute;
        top: 0;
        left: 0;
      width:100%;
      height:100%;
        border-color:#adf90f;
        border-width: 2px;
        background-color: rgb(173,249,15,0.5);  // semi-transparent white overlay
      `;
    // If another item is selected, deselect it
    if (currentSelected && currentSelected !== id) {
      let previousSelectedNode = document.getElementById(currentSelected);
      let previousSelectedBlock = previousSelectedNode.parentNode;

      previousSelectedBlock.classList.remove('selected');
      previousSelectedNode.classList.add('fw-medium');
      previousSelectedNode.classList.remove('fw-bolder');

      // Remove the 'overlay' if it exists
      let existingOverlay = previousSelectedBlock.querySelector('.overlay');
      if (existingOverlay) {
        previousSelectedBlock.removeChild(existingOverlay);
      }
    }

    if (genreBlock.classList.contains('selected')) {
      // Revert to initial card class
      genreBlock.classList.remove('selected');

      node.classList.add('fw-medium');
      node.classList.remove('fw-bolder');

      // Remove the 'overlay' if it exists
      let existingOverlay = genreBlock.querySelector('.overlay');
      if (existingOverlay) {
        genreBlock.removeChild(existingOverlay);
      }

      // Clear current selected
      currentSelected = null;
      selectedProviderName = null;

    } else {
      // Change card class
      genreBlock.classList.add('selected');

      overlay.classList.add('overlay');  // add class to new overlay
      genreBlock.appendChild(overlay);  // add overlay to genreBlock

      node.classList.remove('fw-medium');
      node.classList.add('fw-bolder');

      // Update current selected
      currentSelected = id;

      selectedProviderName = providerName;

    }

    //page = 1;
    //totalPage = 1;
    //movies = [];
    //trending = false;
    //loadmovies()

    sortDisplay();
    console.log(providerName);
  }






  async function getSimilarMovies() {


    //url = `https://api.themoviedb.org/3/discover/movie?page=${page}&&vote_count.gte=500&&primary_release_date.lte=${currentYear}&&language=en-US&&sort_by=vote_average.desc`;
    let givengenresids = JSON.parse(localStorage.getItem("genreid"));

    let genreid = '';
    if (givengenresids != null) {
      genreid = givengenresids.join("|")
    }

    url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&&with_genres=${genreid}`

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
      }
    };

    //url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1`;

    let response = await fetch(url, options);
    let responseData = await response.json();

    console.log('NOW SIMILAR  MOVIES')

    //actor results

    let movieResults = responseData.results;

    return movieResults;
  }


  async function startObserver() {

    let cacheItems = searchCache();



    let movieElements = document.querySelectorAll('[data-movie-id]');
    let movieIds = Array.from(movieElements).map(el => el.getAttribute('data-movie-id'));


    if (cacheItems.length == 0) {
      //only if cache items is empty query this
      document.getElementById("loadingcontainer").style.display = "block";
      document.getElementById("recommendationcontainer").style.display = "none";

      let moviesIDs = await getMoviesId();



      //Get movies
      for (let i = 0; i < moviesIDs.length; i++) {

        let moviesList = await getAllReccommendations(moviesIDs[i])

        recommendedMoviesList = recommendedMoviesList.concat(moviesList);
      }


      document.getElementById("loadingcontainer").style.display = "none";
      document.getElementById("recommendationcontainer").style.display = "block";




      let givengenresids = JSON.parse(localStorage.getItem("genreid"));

      console.log("SELECTED GENRE's ID");

      console.log(givengenresids)




      if (givengenresids != null) {
        recommendedMoviesList = recommendedMoviesList.filter(movie => {
          // Check if any of the movie's genre IDs are in givengenresids
          return movie.genre_ids.some(id => givengenresids.includes(id));
        });
      }


      // Convert to Set and back to Array to remove duplicates
      recommendedMoviesList = Array.from(new Set(recommendedMoviesList.map(movie => movie.id))).map(id => recommendedMoviesList.find(movie => movie.id === id));



      localStorage.setItem("recommendations", JSON.stringify(recommendedMoviesList));
    }

    else {

      recommendedMoviesList = cacheItems;

      let givengenresids = JSON.parse(localStorage.getItem("genreid"));

      console.log("SELECTED GENRE's ID");

      console.log(givengenresids)


      if (givengenresids != null) {
        recommendedMoviesList = recommendedMoviesList.filter(movie => {
          // Check if any of the movie's genre IDs are in givengenresids
          return movie.genre_ids.some(id => givengenresids.includes(id));
        });
      }

    }

    recommendedMoviesList = recommendedMoviesList.filter(movie => {
      // Only keep movies not present in movieIds
      return !movieIds.includes(movie.id.toString());
    });

    console.log("HERE WE GOT THE RECCOMENDATIONS")

    console.log(recommendedMoviesList)


    let moviesContainer = document.querySelector("body");

    if (recommendedMoviesList.length == 0) {

      moviesContainer.insertAdjacentHTML('beforeend', `<div class="subtitle">
        <p class="text-center">No movies selected for reccommendation</p>
      </div>`);

      return;
    }



    //This one is for lazy load
    /* const sentinel = document.querySelector('#sentinel');
     const observer = new IntersectionObserver((entries) => {
       if (entries[0].isIntersecting) {
         displayMovies();
         if (currentIndex >= recommendedMoviesList.length) {
           observer.disconnect();
         }
       }
     });

     observer.observe(sentinel);

     */

  }


  async function getWatchProviders() {

    url = `/get-watch-providers`

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
      }
    };

    //url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1`;

    let response = await fetch(url, options);
    let responseData = await response.json();

    console.log('NOW SIMILAR  MOVIES')

    //actor results

    let watchProviders = responseData.results;
    console.log(watchProviders);

    return watchProviders;

  }

  window.retryReccomendation = function () {
    window.location.href = "/";

    /*window.history.pushState(null, "/", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };*/

  }


  function sortDisplay() {

    let nextMovies = recommendedMoviesList;


    let moviesContainer = document.querySelector("#movies_grid .row");

    moviesContainer.innerHTML = "";

    if (nextMovies.length == 0) {
      moviesContainer.insertAdjacentHTML('beforeend', `<div>No Movies for recommendation, Please Try Again</div>`);
    }

    setTimeout(() => {
      console.log(watch_providers_mapping[selectedProviderName]);
      for (let movie of nextMovies) {

        if (selectedProviderName != null &&
          watch_providers_mapping[selectedProviderName] &&
          watch_providers_mapping[selectedProviderName]["movies"] &&
          !watch_providers_mapping[selectedProviderName]["movies"].includes(movie.id)) {

          console.log("DISPLAY ONLY MOVIES");
          console.log(watch_providers_mapping[selectedProviderName]["movies"]);
          continue;
        }


        let emptyimage = 'http://127.0.0.1:8080/static/images/movie_poster.jpg';
        let imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : emptyimage;
        let percent = movie.vote_average ? (parseFloat(movie.vote_average) / 10) * 100 : 0;
        percent = percent.toFixed(2);
        let year = movie.release_date ? '(' + movie.release_date.split('-')[0] + ')' : '';

        let movieHtml = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 col-xxl-2 mb-2">
                <div class="card movie-card h-100" style="background-color: #000">
                    <a id="${movie.id}" onclick="onMovieClick(${movie.id})">
                        <img src="${imageUrl}" alt="${movie.title}" class="card-img-top img-fluid">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-12 col-12">
                                    <p style="color:#adf90f" class="fw-bolder text-wrap">${movie.title}: ${year}</p>
                                </div>
                                <div class="col-md-12 col-12 text-md-start text-start">
                                    <p style="color:#adf90f" class="fw-bolder">Rating: ${movie.vote_average}</p>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
          `;
        moviesContainer.insertAdjacentHTML('beforeend', movieHtml);
      }
    }, 1000); // Delay of 1 second

  }





  function displayMovies() {
    if (currentIndex < recommendedMoviesList.length) {
      let nextMovies = recommendedMoviesList.slice(currentIndex, currentIndex + itemsPerPage);
      currentIndex += itemsPerPage;

      let moviesContainer = document.querySelector("#movies_grid .row");

      moviesContainer.innerHTML = "";

      if (nextMovies.length == 0) {
        moviesContainer.insertAdjacentHTML('beforeend', `<div>No Movies for recommendation, Please Try Again</div>`);
      }

      setTimeout(() => {
        console.log(watch_providers_mapping[selectedProviderName]);
        for (let movie of nextMovies) {

          if (selectedProviderName != null &&
            watch_providers_mapping[selectedProviderName] &&
            watch_providers_mapping[selectedProviderName]["movies"] &&
            !watch_providers_mapping[selectedProviderName]["movies"].includes(movie.id)) {

            console.log("DISPLAY ONLY MOVIES");
            console.log(watch_providers_mapping[selectedProviderName]["movies"]);
            continue;
          }


          let emptyimage = 'http://127.0.0.1:8080/static/images/movie_poster.jpg';
          let imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : emptyimage;
          let percent = movie.vote_average ? (parseFloat(movie.vote_average) / 10) * 100 : 0;
          percent = percent.toFixed(2);
          let year = movie.release_date ? '(' + movie.release_date.split('-')[0] + ')' : '';

          let movieHtml = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 col-xxl-2 mb-2">
                <div class="card movie-card h-100" style="background-color: #000">
                    <a id="${movie.id}" onclick="onMovieClick(${movie.id})">
                        <img src="${imageUrl}" alt="${movie.title}" class="card-img-top img-fluid">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-12 col-12">
                                    <p style="color:#adf90f" class="fw-bolder text-wrap">${movie.title}: ${year}</p>
                                </div>
                                <div class="col-md-12 col-12 text-md-start text-start">
                                    <p style="color:#adf90f" class="fw-bolder">Rating: ${movie.vote_average}</p>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
          `;
          moviesContainer.insertAdjacentHTML('beforeend', movieHtml);
        }
      }, 1000); // Delay of 1 second
    }
  }




  //startObserver();
  getRecommendation();

})
