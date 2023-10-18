let genreIds = []
var page = 1;
let debounceTimer;
let globalQuery = ''
let actors = []
let totalPage = 1
let trending = true;
var directorlist = [];
let sort_by = 'popularity';

function loaddirectors() {
  var url = 'https://api.themoviedb.org/3/trending/person/day?language=en-US';

  if (globalQuery == '') {
    trending = true;

  }


  if (trending) {
    url = `/director?page=${page}&sortby=${sort_by}`;
  }
  else {
    url = `/director?page=${page}&name=${encodeURIComponent(globalQuery)}&sortby=${sort_by}`;
  }

  genreIds = JSON.parse(localStorage.getItem('genreid'))


  console.log("GENRES ID listed", genreIds)


  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
    }
  };


  window.onSort = function (sortby) {
    let query = '';
    //assign to the global value
    globalQuery = query;
    //disable trending search
    trending = false;
    //reset the actors list
    actors = []
    //query the actors from first page
    page = 1;
    //set the total page for the result to one
    totalPage = 1;
    //load the actors

    sort_by = sortby;


    loaddirectors()
  }


  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    fetch(url, options)
      .then(response => response.json())
      .then(response => {
        let actorResults = response.results;
        console.log(actorResults)
        totalPage = response.total_pages;

        // Filter actorResults based on genre_ids
        actorResults = actorResults.filter(actor => {
          // Check if actor's known_for department is 'Acting' and at least one of the known_for movies has a genre in genreIds

            console.log(actor)
            return actor;
            /*return actor.known_for.some(movie =>
              movie.genre_ids.some(genreId => genreIds.includes(genreId))
            );*/
            //return actor;


        });


        // Assume actors and actorResults are arrays of objects,
        // where each object has an id property that uniquely identifies the actor
        let uniqueActorIds = new Set(actors.map(actor => actor.id));

        // Filter actorResults to only include actors not already in actors
        actorResults = actorResults.filter(actor => {
          if (!uniqueActorIds.has(actor.id)) {
            uniqueActorIds.add(actor.id);
            return true;
          }
          return false;
        });


        actors = [...actors,...actorResults ]

       // actors.sort((a, b) => b.popularity - a.popularity);





        showdirectors({ results: actorResults });

        if (actors.length < 20 && page < totalPage) {
          page = page + 1;
          loaddirectors()
        }


      });

  }, 300); // Adjust the delay value (in milliseconds) as needed

}


//Load the actors whenever the input changes
document.getElementById('search_director_input').addEventListener('input', function (event) {
  let query = event.target.value;
  //assign to the global value
  globalQuery = query;
  //disable trending search
  trending = false;
  //reset the actors list
  actors = []
  //query the actors from first page
  page = 1;
  //set the total page for the result to one
  totalPage = 1;
  //load the actors
  loaddirectors()
});



//Display the actor
function showdirectors(response) {
  console.log(actors);

  var moviesContainer = document.querySelector("#actors .row");
  var html = "";
  moviesContainer.innerHTML = html;


  actors.map(actor => {
    let url = "http://127.0.0.1:8080/static/images/blank-profile.png";
    if (actor.profile_path != null) {
      url = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${actor.profile_path}`;
    }

    var movieHtml = `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 col-xxl-2 mb-2">
        <div class="card" style="background-color: #000;cursor:pointer">
          <a id="${actor.id}" onclick=selectdirector(${actor.id})>
            <img src="${url}" alt="${actor.name}" class="img-fluid">
            <p style="color:lawngreen">${actor.name}</p>
          </a>
        </div>
      </div>
    `;
    html += movieHtml;
  })

  moviesContainer.innerHTML += html;

  referameSelection();

}



// create observer
const sentinel = document.querySelector('#sentinel');
// create observer
let observer = new IntersectionObserver((entries) => {
  // if the sentinel comes into view
  if (entries[0].isIntersecting) {
    // if there are more pages to load
    if (page <= totalPage) {
      page++;
      loaddirectors();
    }

    /*else {
      // if there are no more pages to load, disconnect the observer
      observer.disconnect();
    }*/
  }
}, { rootMargin: '0px' });

// start observing the sentinel
observer.observe(sentinel);


//redraw the border after selection
function referameSelection() {

  directorlist.map((id) => {
    let node = document.getElementById(id);

    //Its not in the view
    if (node != null) {
      let imgnode = node.querySelector('img');
      let imgname = node.querySelector('p').innerHTML;

      //add to director list
      imgnode.style.border = "5px solid lawngreen";

      //actorlist.push(id)
    }
  })
}



function selectdirector(id) {
  console.log(id);
  let node = document.getElementById(id);
  let imgnode = node.querySelector('img');
  let imgname = node.querySelector('p').innerHTML;
  if (imgnode.style.border == "none" || imgnode.style.border == "") {
    //add to director list
    imgnode.style.border = "5px solid #adf90f";

    directorlist.push(id)

  } else {

    //remove from the list of selected director, if already selected
    imgnode.style.border = "none";

    if (directorlist.indexOf(id) != -1) {
      directorlist.splice(directorlist.indexOf(id), 1)
    }
  }
}

function setdirectors() {

  localStorage.setItem("directorid", JSON.stringify(directorlist))
  window.location.href = "/select-length";
}
