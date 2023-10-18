let moviesids = [];
var current_page = 1;
let allMovies = [];  // declare this variable globally
let debounceTimer;


var page = 1;
let globalQuery = ''
let movies = []
let totalPage = 1
let trending = true;


var genreid = [];

let sort_by = "vote_count.desc";

function onSort(sortBy) {

  page = 1;
  totalPage = 1;
  sort_by = sortBy;
  movies = [];
  trending = false;
  loadmovies();
}

async function loadgenres() {

  //localStorage.removeItem("recommendations");
  //localStorage.removeItem("genreid")
  //localStorage.removeItem("actorid")
  //localStorage.removeItem("directorid")
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
    }
  };
  fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options)
    .then(response => response.json())
    .then(response => showgenere(response))
    .catch(err => console.error(err));


}

var generelist = [];

let currentSelected = null;
window.selectgenre = function (id) {
  let node = document.getElementById(id);
  let genreBlock = node.parentNode;

  // Create a div for overlay
// Create a div for overlay
let overlay = document.createElement('div');
overlay.style = `
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  border-color:#adf90f;
  border-width: 2px;
  border-radius: 42%; /* Match parent's border radius */
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
  } else {
    // Change card class
    genreBlock.classList.add('selected');

    overlay.classList.add('overlay');  // add class to new overlay
    genreBlock.appendChild(overlay);  // add overlay to genreBlock

    node.classList.remove('fw-medium');
    node.classList.add('fw-bolder');

    // Update current selected
    currentSelected = id;
  }

  page = 1;
  totalPage = 1;
  movies = [];
  trending = false;
  loadmovies()

  console.log(generelist);
}

function showgenere(response) {
  console.log(response);
  let data = response;
  let html = ``;
  let genre = Object.values(data);
  let genreContainer = document.getElementById("genre")

  genre[0].map((genre, index) => {



    html += `
    <div class="genre-container d-flex align-items-center justify-content-center">
      <div style="cursor:pointer;
                  border: 2px solid #ffffff; /* Border color */
                  height: 50px;
                  width: 140px; /* You need to specify the width */
                  border-radius: 42%; /* This makes it oval */
                  display: flex;
                  align-items: center; border-width: 2px; border-color:#adf90f;
                  justify-content: center;
                  background-color: rgba(0, 0, 0, 0.7);"
           class="card" id="genre-${index}"
           onclick="selectgenre(${genre.id})">
        <p style="background-color: rgba(0, 0, 0, 0.5);"
           class="fw-medium fs-7 text-white m-2"
           id=${genre.id}>${genre.name}</p>
      </div>
    </div>`;


    /*html += `
    <div style="cursor:pointer;" class="card col-md-2 text-center m-2 p-0 bg-warning" id="genre-${index}" onclick="selectgenre(${genre.id})">
      <p class="fw-medium bg-warning" id=${genre.id}>${genre.name}</p>
    </div>
`*/
  })

  genreContainer.innerHTML = html;
}


function loadmovies() {
  //var url = 'https://api.themoviedb.org/3/trending/movie/day?language=en-US';

  var actorid = JSON.parse(localStorage.getItem("actorid"))
  var directorid = JSON.parse(localStorage.getItem("directorid"))

  var peopleid = actorid;
  //actorid.concat(directorid)
  genreid = JSON.parse(localStorage.getItem("genreid"))

  var length = localStorage.getItem("length");
  console.log(length)
  length = length.split(','); // assuming length is a JSON string

  var lengthValues = [];
  var length_str = "";

  if (!length.includes('0')) {
    length.forEach(val => {
      if (val === '80') {
        lengthValues.push(90); // upper limit for this category
      }
      else if (val === '90') {
        lengthValues.push(121); // upper limit for this category
        lengthValues.push(90); // lower limit for this category
      }
      else if (val === '121') {
        lengthValues.push(121); // lower limit for this category
      }
    });

    if (lengthValues.length > 0) {
      var minRuntime = Math.min(...lengthValues);
      var maxRuntime = Math.max(...lengthValues);

      length_str = `with_runtime.gte=${minRuntime}&&with_runtime.lte=${maxRuntime}&&`;
    }
  }
  let genrefilter = generelist.join("|");
  let genereslist = '&&with_genres='+currentSelected+"&&";



  //genreIds = JSON.parse(localStorage.getItem('genreid'))
  console.log("GENRES ID listed", genreid)
  //console.log(url)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
    }
  };

  clearTimeout(debounceTimer);
  let url = "";
  debounceTimer = setTimeout(async () => {

    //url=`https://api.themoviedb.org/3/search/movie?query=${globalQuery}&&page=${page}`;
    var currentYear = new Date().getFullYear();

    var vote_limit = '';

    console.log(sort_by)
    if (sort_by === 'vote_average.desc') {
      vote_limit = '&&vote_count.gte=500&&';
    }
    else {
      vote_limit = '';
    }





    url = `https://api.themoviedb.org/3/discover/movie?${genereslist}page=${page}&&${vote_limit}primary_release_date.lte=${currentYear}&&language=en-US&&sort_by=${sort_by}`;
    // url = `https://api.themoviedb.org/3/movie/popular?page=${page}`;

    console.log(url)
    if (globalQuery != '') {
      url = `https://api.themoviedb.org/3/search/movie?query=${globalQuery}&&page=${page}`;
    }
    /*if (page % 2 == 0) {
      url = `https://api.themoviedb.org/3/discover/movie?${length_str}with_genres=${genreid.join("|")}&&with_people=${peopleid.join("|")}&&page=${page}&&language=en-US&&sort_by=${sort_by}`;
    } else {
      url = `https://api.themoviedb.org/3/movie/popular?page=${page}`;
    }*/




    let response = await fetch(url, options);
    let responseData = await response.json();

    let actorResults = responseData.results;




    totalPage = responseData.total_pages;

    /*actorResults = actorResults.filter(actor => {
      // Check if at least one of the actor's genre_ids is included in genreIds
      return actor.genre_ids.some(genreId => genreid.includes(genreId));
    });




    // where each object has an id property that uniquely identifies the actor
    let uniqueActorIds = new Set(movies.map(actor => actor.id));



    actorResults = actorResults.filter(actor => {
      if (!uniqueActorIds.has(actor.id)) {
        uniqueActorIds.add(actor.id);
        return true;
      }
      return false;
    });

    actorResults = actorResults.filter(actor => {
      console.log('FILTER NAME', actor)
      if (actor.title.toLowerCase().includes(globalQuery.toLowerCase())) {
        uniqueActorIds.add(actor.id);
        return true;
      }
      return false;
    });*/

    movies = [...movies, ...actorResults,]

    //sortAndShowMovies();


    showmovies();
    //showmovies({ results: actorResults });
    console.log("total page ", totalPage, "current page ", page)

    if (movies.length < 20 && page < totalPage) {
      page = page + 1;
      loadmovies()
    }


  }, 300); // Adjust the delay value (in milliseconds) as needed

}


function sortAndShowMovies() {
  var currentYear = new Date().getFullYear();

  movies = movies.filter(movie => {
    if (movie.release_date != null) {
      var movieYear = movie.release_date.split('-')[0];
      return parseInt(movieYear) <= currentYear;
    } else {
      return false; // or return true; if you want to keep movies without a release_date
    }
  });

  if (sort_by === 'vote_count.desc') {

    console.log("MOVIES TO BE SORTED")
    console.log(movies)

    movies.sort((a, b) => b.vote_average - a.vote_average);
  }
  else if (sort_by === 'primary_release_date.desc') {
    movies.sort((movieA, movieB) => {
      if (movieA.release_date != null && movieB.release_date != null) {
        var movieYearA = movieA.release_date.split('-')[0];
        var movieYearB = movieB.release_date.split('-')[0];
        return parseInt(movieYearB) - parseInt(movieYearA);
      } else if (movieA.release_date != null) {
        return -1;  // movieA has a release_date, but movieB doesn't, so movieA comes first
      } else if (movieB.release_date != null) {
        return 1;  // movieB has a release_date, but movieA doesn't, so movieB comes first
      } else {
        return 0;  // both movies don't have a release_date, so their order doesn't matter
      }
    });
  }

  showmovies();
}


document.getElementById('search_movie_input').addEventListener('input', function (event) {
  let query = event.target.value.toLowerCase();

  //assign to the global value
  globalQuery = query;
  //disable trending search
  trending = false;
  //reset the actors list
  movies = []
  //query the actors from first page
  page = 1;
  //set the total page for the result to one
  totalPage = 1;
  //load the actors
  loadmovies()
});

function showmovies(response) {

  var moviesContainer = document.querySelector("#movies_grid .movies-container");
  var html = "";

  moviesContainer.innerHTML = html;



  console.log(sort_by)



  /*movies = movies.filter((movie) => {
    var currentYear = new Date().getFullYear();
    var year = '';

    if (movie.release_date != null) {
      year = movie.release_date.split('-')[0];

      // Parse year to integer and check if it's less than or equal to the current year.
      // If it is, keep the movie in the filtered list.
      if (parseInt(year) <= currentYear) {
        return true;
      }
    }

    // If the movie has no release date or if the release year is greater than the current year, exclude it.
    return false;
  });*/



  movies = movies.filter(movie => movie.poster_path !== null);
  movies.map(movie => {
    var url = 'http://127.0.0.1:8080/static/images/movie_poster.jpg';
    /*if (movie.poster_path != null) {
      url = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${movie.poster_path}`;
    }*/
    url = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${movie.poster_path}`;

    var year = '';
    if (movie.release_date != null) {
      year = '(' + movie.release_date.split('-')[0] + ')';
    }

    var currentYear = new Date().getFullYear();
    var year = '';
    if (movie.release_date != null) {
      year = '' + movie.release_date.split('-')[0] + '';
    }


    console.log(movie, year)

//${movie.title}
    var movieHtml = `
    <div class="card movie-card m-1 h-100">
    <a id="${movie.id}" onclick="selectmovie(${movie.id})">
      <img src="${url}" alt="${movie.title}" class="card-img-top img-fluid">
      <div class="card-body">
        <div class="row">
          <div class="col-md-12 col-12">
            <p class="fw-bolder text-wrap" style="color:#adf90f">${movie.title}: ${year}</p>
          </div>
          <div class="col-md-12 col-12 text-md-start text-start">
            <p style="color:#adf90f" class="fw-bolder">Rating: ${movie.vote_average}</p>
          </div>
        </div>
      </div>
    </a>
  </div>

     `;

    html += movieHtml;
  });
  moviesContainer.innerHTML += html;
  referameSelection();

}
/*
 <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 col-xxl-2 mb-2">
    <div class="card movie-card h-100" style="background-color: #000">
        <a id="${movie.id}" onclick="selectmovie(${movie.id})">
            <img src="${url}" alt="${movie.title}" class="card-img-top img-fluid">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-12 col-12">
                        <p class="fw-bolder text-wrap text-warning">${movie.title}: ${year}</p>
                    </div>
                    <div class="col-md-12 col-12 text-md-start text-start">
                        <p class="fw-bolder text-warning">Rating: ${movie.vote_average}</p>
                    </div>
                </div>
            </div>
        </a>
    </div>
</div>
*/

// create observer
const sentinel = document.querySelector('#sentinel');
// create observer
let observer = new IntersectionObserver((entries) => {
  // if the sentinel comes into view
  if (entries[0].isIntersecting) {
    // if there are more pages to load
    if (page <= totalPage) {
      page++;
      loadmovies();
    } else {
      // if there are no more pages to load, disconnect the observer
      observer.disconnect();
    }
  }
}, { rootMargin: '0px' });

// start observing the sentinel
observer.observe(sentinel);

//redraw the border after selection
function referameSelection() {

  moviesids.map((id) => {
    let node = document.getElementById(id);

    //Its not in the view
    if (node != null) {
      let imgnode = node.querySelector('img');
      let imgname = node.querySelector('p').innerHTML;

      //add to director list
      imgnode.style.border = "5px solid #adf90f";

      //movie_ids.push(id)
    }
  })
}


function selectmovie(id) {
  let element = document.getElementById(id);
  let imgnode = element.querySelector('img');
  let imgname = element.querySelector('p').innerHTML;

  if (imgnode.style.border === "none" || imgnode.style.border === "") {
    imgnode.style.border = "5px solid #adf90f";
    //movies.push({ 'name': imgname, 'id': id });
    moviesids.push(id)
  } else {
    imgnode.style.border = "none";
    //movies = movies.filter(item => item !== imgname);

    if (moviesids.includes(id)) {
      moviesids.splice(moviesids.indexOf(id), 1)
    }
  }


}

function setmovies() {
  if (moviesids.length == 0) {
    alert("Please select at least 5 movies.");
  } else {
    localStorage.setItem("movies", JSON.stringify(moviesids));
    window.location.href = "/select-recentness";


  }
}
loadgenres()
