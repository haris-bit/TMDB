document.addEventListener('DOMContentLoaded', function () {

  let movieId = localStorage.getItem("movieid");
  function toggleRatingInput(val) {
    const userRatingInput = document.getElementById("userRating");
    userRatingInput.disabled = val;
  }
  async function loadMovieDescription(movieId) {
    const apiKey = "YOUR_API_KEY";
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ODljOWJlMTkxYWUwN2VlZjk0YTgwNmQ1N2E1YTExNiIsInN1YiI6IjY0Nzk1YmM1MGUyOWEyMDBiZjFkZjEyMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Myu-8IC9IvWsw9SMBdkGRmme1mgdzSWmbrasn7nWoFY'
      }
    };

    const url = `https://api.themoviedb.org/3/movie/${movieId}`;
    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        displayMovieDescription(data);
        fetchMovieVideos(movieId);
      })
      .catch(err => console.error(err));


      await get_movie_providers(movieId);
  }

  function fetchMovieVideos(movieId) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ODljOWJlMTkxYWUwN2VlZjk0YTgwNmQ1N2E1YTExNiIsInN1YiI6IjY0Nzk1YmM1MGUyOWEyMDBiZjFkZjEyMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Myu-8IC9IvWsw9SMBdkGRmme1mgdzSWmbrasn7nWoFY'
      }
    };

    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`;
    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        //const videoKey = data.results.length > 0 ? data.results[0].key : null;
        let trailerVideo = data.results.find(video => video.name.toLowerCase().includes('trailer'));

        const videoKey = trailerVideo ? trailerVideo.key : null;
        displayMovieVideo(videoKey);

      })
      .catch(err => console.error(err));
  }

  async function getUserRatings(movieId) {
    let response = await fetch(`/get-movie-rating/${movieId}`);
    let data = await response.json();

    console.log(data)
    document.getElementById("userRating").value = data.user_rating;

    let rating_btn = document.getElementById("rating_submit")


    if (data.user_rating != null) {
      rating_btn.disabled = true;
      rating_btn.style.backgroundColor = "#adf90f";
      rating_btn.innerText = "Already submitted";
      toggleRatingInput(true);
    }
    else {
      document.getElementById("userRating").value = 1;
    }

    // The server returns a JSON object with 'average_rating' and 'votes'.
    // If the movie hasn't been rated by any user, 'average_rating' will be null,
    // so we return an empty array. Otherwise, we return an array of votes,
    // all having the same value - the average rating.
    return data.average_rating ? Array(data.votes).fill(data.average_rating) : [];
  }

  async function calculateNewAverage(movie) {
    let tmdbRating = movie.vote_average;
    let tmdbVotes = movie.vote_count;

    let userRatings = await getUserRatings(movie.id);
    let userVotes = userRatings.length;
    let userRating = userRatings.reduce((a, b) => a + b, 0) / userVotes;

    // If no user has rated this movie, the userRating will be NaN, so we default to 0
    if (isNaN(userRating)) userRating = 0;

    let totalRating = tmdbRating * tmdbVotes + userRating * userVotes;
    let totalVotes = tmdbVotes + userVotes;
    let newAverage = totalRating / totalVotes;

    // You might want to round the new average to a certain number of decimal places
    newAverage = newAverage.toFixed(2);

    return newAverage;
  }

  if (document.querySelector('#ratingForm') != null) {
    document.querySelector('#ratingForm').addEventListener('submit', function (event) {
      event.preventDefault();
      const userRating = document.querySelector('#userRating').value;

      // TODO: Fetch user rating for the movie from your server
      fetch('/get-movie-rating/' + movieId)
        .then(response => response.json())
        .then(data => {

          let rating_btn = document.getElementById("rating_submit")
          // Check if user has already rated the movie
          if (data.user_rating !== null) {
            alert('You have already rated this movie!');
            rating_btn.disabled = true;
          } else {
            //rating_btn.disabled = false;
            // TODO: Submit the user's rating to your server
            let movieName = localStorage.getItem("moviename");
            fetch('/submit-rating', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ movieId: movieId, rating: userRating, movieName: movieName })
            })
              .then(response => response.json())
              .then(data => {
                alert('Your rating has been submitted!');
                rating_btn.disabled = true;
                rating_btn.innerText = "Already submitted";
                toggleRatingInput(true);
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          }
        });
    });
  }

  async function get_movie_providers(id) {

    console.log("GETTING MOVIE PROVIDERS");

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

      console.log(response.status);

      let providers_result = result.results;

      console.log(providers_result);

      let usproviders = providers_result['US'];

      let buyContainer = document.getElementById("buy-container");


      if (usproviders == undefined) {
        buyContainer.getElementsByClassName('row')[0].innerHTML = "<h6>Not Available for streaming</h6><br/>";
        return;
      }

      console.log("PROVIDERS");
      console.log(usproviders);

      let buys = [];
      let streams = [];
      let rents = [];
      if (usproviders) {
        buys = usproviders['buy'] || [];
        streams = usproviders['flatrate'] || [];
        rents = usproviders['rent'] || [];
      }

      console.log(buys);
      console.log(streams);
      console.log(rents);


      let base_logo = "https://image.tmdb.org/t/p/original/";






      let rentContainer = document.getElementById("rent-container");
      let streamContainer = document.getElementById("stream-container");
      let html = "";
      let no_stream = true;
      for (let i = 0; i < buys.length; i++) {
        let buy = buys[i];
        console.log(buy);
        let provider_id = buy.provider_id;
        let provider_name = buy.provider_name;
        let logo = base_logo + buy.logo_path;
//Amazon Prime Video
        if (
        buy.provider_name != "Amazon Prime Video" &&
          buy.provider_name != "Apple TV" &&
          buy.provider_name != "Disney Plus" &&
          buy.provider_name != "Netflix" &&
          buy.provider_name != "Paramount Plus"

        ) {
          continue;
        }

        // create new element and append to buy_container
        let element = `<div class="provider col-md-1 mb-1"><img src="${logo}" alt="${provider_name}"></div>`;
        html += element;
      }
      if (html != '') {

        buyContainer.getElementsByClassName('row')[0].innerHTML = "<h5>Buy</h5><br/>" + html;

        no_stream = false;

      }

      html = "";
      for (let i = 0; i < rents.length; i++) {
        let rent = rents[i];
        let provider_id = rent.provider_id;
        let provider_name = rent.provider_name;
        let logo = base_logo + rent.logo_path;


        if (
        rent.provider_name != "Amazon Prime Video" &&
          rent.provider_name != "Apple TV" &&
          rent.provider_name != "Disney Plus" &&
          rent.provider_name != "Netflix" &&
          rent.provider_name != "Paramount Plus"

        ) {
          continue;
        }

        // create new element and append to rent_container
        let element = `<div class="provider col-md-1 mb-1"><img src="${logo}" alt="${provider_name}"></div>`;
        html += element;

      }

      if (html != '') {
        rentContainer.getElementsByClassName('row')[0].innerHTML = "<h5>Rent</h5><br/>" + html;
        no_stream = false;
      }



      html = "";
      for (let i = 0; i < streams.length; i++) {
        let stream = streams[i];
        let provider_id = stream.provider_id;
        let provider_name = stream.provider_name;
        let logo = base_logo + stream.logo_path;

        if (
          stream.provider_name != "Apple TV" &&
          stream.provider_name != "Amazon Prime Video" &&
          stream.provider_name != "Disney Plus" &&
          stream.provider_name != "Netflix" &&
          stream.provider_name != "Paramount Plus"

        ) {
          continue;
        }

        // create new element and append to stream_container
        let element = `<div class="provider col-md-1 mb-1"><img src="${logo}" alt="${provider_name}"></div>`;
        html += element;

      }
      if (html != '') {
        streamContainer.getElementsByClassName('row')[0].innerHTML = "<h5>Stream</h5><br/>" + html;
        no_stream = false;
      }
      console.log("NO STREAM", no_stream);
      if (no_stream) {
        buyContainer.getElementsByClassName('row')[0].innerHTML = "<h5>Not Available for streaming</h5><br/>";
      }

      return usproviders;

    } catch (error) {
      console.log(error);
    }


    return undefined;


  }


  async function displayMovieDescription(movie) {
    const movieTitle = document.querySelector(".movie-desc h3");
    const movieTags = document.querySelectorAll(".tags p")[1];
    const movieAbout = document.querySelector(".about p");
    const movieImage = document.querySelector(".movie-img img");

    //new rating
    let newRating = 0;
    if (document.querySelector('#ratingForm') != null) {
      newRating = await calculateNewAverage(movie);
    }


    var year = '';
    if (movie.release_date != null) {
      year = '(' + movie.release_date.split('-')[0] + ')';
    }
    movieTitle.textContent = movie.title + "\t" + year;

    // Store the movie name in the local storage
    localStorage.setItem("moviename", movie.title);

    movieTags.textContent = `${movie.runtime} min | ${movie.genres.map(genre => genre.name).join(", ")}`;
    movieAbout.textContent = movie.overview;
    const movieRating = document.querySelector("#movieRating");
    if (newRating == 0) {
      newRating = movie.vote_average.toFixed(2);
    }
    movieRating.textContent = `${newRating}/10`;

    var emptyimage = 'http://127.0.0.1:8080/static/images/movie_poster.jpg';
    movieImage.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : emptyimage;
  }

  function displayMovieVideo(videoKey) {
    if (videoKey) {
      const iframeElement = document.createElement("iframe");
      iframeElement.src = `https://www.youtube.com/embed/${videoKey}`;
      iframeElement.setAttribute("allowfullscreen", "");
      iframeElement.setAttribute("frameborder", "0");
      iframeElement.classList.add("video-frame"); // Add CSS class for sizing
      //const videoContainer = document.querySelector(".bottom");
      const videoContainer = document.getElementById('video_container');

      videoContainer.innerHTML = "";
      videoContainer.appendChild(iframeElement);
    }
  }
  function markMovieAsWatched(movieId, movieName) {
    fetch('/mark-as-watched', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ movieId: movieId, movieName: movieName })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        var buttonContainer = document.querySelector(".watch-container");
        buttonContainer.innerHTML = '<div class="col-md-6"><button style="background-color:#adf90f" id="removeFromWatched">Remove from Watched</button></div>';
        addToEventListenerToRemoveButton();
      })
      .catch(err => console.error(err));
  }

  function removeFromWatchedList(movieId) {
    fetch('/unmark-as-watched', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ movieId: movieId })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        var buttonContainer = document.querySelector(".watch-container");
        buttonContainer.innerHTML = '<div class="col-md-6"><button id="markAsWatched">Mark as Watched</button></div>';
        addToEventListenerToWatchButton();
      })
      .catch(err => console.error(err));
  }

  function addToEventListenerToWatchButton() {
    var markAsWatchedButton = document.querySelector("#markAsWatched");
    if (markAsWatchedButton) {
      markAsWatchedButton.addEventListener("click", function () {
        markMovieAsWatched(localStorage.getItem("movieid"), localStorage.getItem("moviename"));
      });
    }
  }

  function addToEventListenerToRemoveButton() {
    var removeFromWatchedButton = document.querySelector("#removeFromWatched");
    if (removeFromWatchedButton) {
      removeFromWatchedButton.addEventListener("click", function () {
        removeFromWatchedList(localStorage.getItem("movieid"));
      });
    }
  }

  // Initially add the event listeners
  addToEventListenerToWatchButton();
  addToEventListenerToRemoveButton();

  // Example usage: Load movie description for movie with ID 123
  loadMovieDescription(movieId);


});
