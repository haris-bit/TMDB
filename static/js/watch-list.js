var page = 0; // Track the current page number
var moviesPerPage = 10; // Number of movies to load per page
var totalMovies = 0; // Track the total number of movies loaded
var total_pages = 0;
let loadedMovies = [];


const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ODljOWJlMTkxYWUwN2VlZjk0YTgwNmQ1N2E1YTExNiIsInN1YiI6IjY0Nzk1YmM1MGUyOWEyMDBiZjFkZjEyMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Myu-8IC9IvWsw9SMBdkGRmme1mgdzSWmbrasn7nWoFY'
  }
};



function loadMovies() {

  var movieElements = document.querySelectorAll('[data-movie-id]');

  var moviesidlist = [];

  for (var i = 0; i < movieElements.length; i++) {
    var movieId = movieElements[i].dataset.movieId;
    console.log(movieId);
    moviesidlist.push(movieId)
  }

  totalMovies = moviesidlist.length;


  function fetchNextMovie() {

    //console.log(`Fetching recommendations for movie at index ${index} with ID ${movies[index]}`);

    moviesidlist.forEach((movieid)=>{
      let url = `https://api.themoviedb.org/3/movie/${movieid}?language=en-US`;
      fetch(url, options)
      .then(response => response.json())
      .then(data => {
        console.log("server response:", data);

        loadedMovies.push(data);

        displayRecommendations();

      })
      .catch(err => console.error(err));
    })

  }

  fetchNextMovie();
}


// Helper function to check if an movie is already in the HTML
function isUniqueMovie(movieId) {
  const movieElement = document.getElementById(movieId.toString());
  return !movieElement;
}

function sortMoviesInDom() {
  // Get the movies grid container
  var moviesContainer = document.getElementById("movies_grid");

  // Convert HTML collection to array
  var movieCards = Array.prototype.slice.call(moviesContainer.getElementsByClassName("movie-card"));

  // Sort movie cards based on percentage
  movieCards.sort(function (a, b) {
    // Get percentage of movie a and b
    var aPercent = parseFloat(a.getElementsByTagName("span")[0].innerText.replace('%', ''));
    var bPercent = parseFloat(b.getElementsByTagName("span")[0].innerText.replace('%', ''));

    // Return comparison result
    return bPercent - aPercent;
  });

  // Empty the container
  while (moviesContainer.firstChild) {
    moviesContainer.removeChild(moviesContainer.firstChild);
  }

  // Create a new row for every four cards
  for (let i = 0; i < movieCards.length; i += 4) {
    let row = document.createElement("div");
    row.className = "row";

    // Append four cards to the row
    for (let j = 0; j < 4 && i + j < movieCards.length; j++) {
      let column = document.createElement("div");
      column.className = "col-md-3";

      column.appendChild(movieCards[i + j]);

      row.appendChild(column);
    }

    // Append the row to the container
    moviesContainer.appendChild(row);
  }
}


function displayRecommendations() {

  var moviesContainer = document.querySelector("#movies_grid .row");
  var html = "";

  loadedMovies.forEach(function (movie) {

    console.log(movie)

    var emptyimage = 'http://127.0.0.1:8080/static/images/movie_poster.jpg';

    var imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : emptyimage;

    if (!isUniqueMovie(movie.id)) {
      return
    }

    var percent = 0;
    if (movie.vote_average != null) {
      percent = (parseFloat(movie.vote_average) / 10) * 100
      percent = percent.toFixed(2)
    }

    var movieHtml = `
      <div class="col-md-3">
        <div class="movie-card">
          <a onclick=onMovieClick(${movie.id})>
            <img src="${imageUrl}" alt="${movie.original_title}" class="img-fluid">
          </a>
          <div class='row'>
          <div class='col-md-8'>
          <p id="${movie.id}">${movie.title}</p>
          </div>
          <div class='col-md-4'>
          <span>${percent}%</span>
          </div>
          <div>

        </div>
      </div>
    `;
    html += movieHtml;
  });

  moviesContainer.innerHTML += html;
}

function viewMore() {
  page++; // Increment the page number
  loadMovies();
}

function onMovieClick(movieid) {
  localStorage.setItem("movieid", movieid);
  window.location.href = "/movie-description/" + movieid;
}

// Create observer
const sentinel = document.querySelector('#sentinel');
let observer = new IntersectionObserver((entries) => {
  // if the sentinel comes into view

  if (entries[0].isIntersecting) {
    // if there are more movies to load
    console.log("TOTAL MOVIES ", totalMovies, 'TOTAL PAGESS ', total_pages, ' PAGE ', page)
    if (totalMovies == 0) {
      page++;
      loadMovies();
      return;
    }

    if (total_pages > page) {
      page++;
      loadMovies();
    } else {
      // if there are no more movies to load, disconnect the observer
      observer.disconnect();
    }
  }
}, { rootMargin: '0px' });
// Start observing the sentinel
observer.observe(sentinel);



//loadMovies();
