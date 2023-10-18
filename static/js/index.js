document.addEventListener('DOMContentLoaded', function () {

let genre_id = [];
async function loaddata() {

  localStorage.removeItem("recommendations");
  localStorage.removeItem("genreid")
  localStorage.removeItem("actorid")
  localStorage.removeItem("directorid")
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1N2ZjYmJiZjI3YzQxNTk3MDQxZGZhMTU3YjRlN2Q3ZCIsInN1YiI6IjY0ODEzYmVkNjQ3NjU0MDEwNWJmZWUzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WWPU5zM9ef2R8M7qHLVXRaGjosEzNU0ev3ZwEEN9f2U'
    }
  };
  fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options)
    .then(response => response.json())
    .then(response => showdata(response))
    .catch(err => console.error(err));


}

/*function showdata(response){
    console.log(response);
    let data =response;
    let html = ``;
    let genre = Object.values(data);
    genre[0].map((genre,index)=>{
        html+= `<div class ="suboptions" id =${index} onclick="selectgenre(${genre.id})"><p id =${genre.id}>${genre.name}</p></div>`
    })
    document.getElementById("genre").innerHTML = html;
}*/

function showdata(response) {
  console.log(response);
  let data = response;
  let html = ``;
  let genre = Object.values(data);
  let genreContainer = document.getElementById("genre")

  genre[0].map((genre, index) => {



    html += `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 col-xxl-2 mb-2">
    <div style="cursor:pointer;
    background-image: url('/static/images/genres/genre-${genre.id}.jpg');
    background-size: cover;
    background-position: center;
    height: 370px;"
    class="card d-flex align-items-end justify-content-end" id="genre-${index}"
    onclick="selectgenre(${genre.id})">



      <div style="width: 100%; background-color: rgba(0, 0, 0, 0.7);">
        <p style="background-color: rgba(0, 0, 0, 0.5);" class="fw-medium fs-5 text-white m-2" id=${genre.id}>${genre.name}</p>
      </div>


    </div></div>`

    /*html += `
    <div style="cursor:pointer;" class="card col-md-2 text-center m-2 p-0 bg-warning" id="genre-${index}" onclick="selectgenre(${genre.id})">
      <p class="fw-medium bg-warning" id=${genre.id}>${genre.name}</p>
    </div>
`*/
  })

  genreContainer.innerHTML = html;
}

var generelist = [];

window.selectgenre = function (id) {
  let node = document.getElementById(id);
  let genreBlock = node.parentNode;

  // Create a div for overlay
  let overlay = document.createElement('div');
  overlay.style = `
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.3);  // semi-transparent white overlay
  `;

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

    // Remove the genre from the list
    generelist = generelist.filter(item => item !== id);
  } else {
    // Change card class
    genreBlock.classList.add('selected');

    overlay.classList.add('overlay');  // add class to new overlay
    genreBlock.appendChild(overlay);  // add overlay to genreBlock

    node.classList.remove('fw-medium');
    node.classList.add('fw-bolder');

    // Add the genre to the list
    generelist.push(id);
  }

  console.log(generelist);
}



/*
var generelist = [];

function selectgenre(name){
    let node = document.getElementById(name);
    if(node.parentNode.style.border == "none" || node.parentNode.style.border == ""){
        node.parentNode.style.border = "5px solid #e6b400";
        genre_id.push(node.innerHTML);
        generelist.push(name);
    }else{
        node.parentNode.style.border = "none";
        genre_id = genre_id.filter((item)=>{
            return item != name;
        })

        if(generelist.indexOf(name)!=-1){
          generelist.indexOf(name)
          generelist.splice(name,1);
        }

    }
    console.log(genre_id);




    // console.log(document.getElementById(genre).innerHTML)
}*/


window.setgenre = function() {
  if (generelist.length<3) {
    alert("Please select at least 3 genre");
  } else {
    localStorage.setItem("genre", genre_id);
    localStorage.setItem("genreid", JSON.stringify(generelist))
    window.location.href = "/select-actor";
    //console.log(generelist)
  }
}


loaddata();

});
