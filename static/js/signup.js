document.addEventListener('DOMContentLoaded', function () {



  
window.googlesignin = function() {
  // Redirect to the Google login page
  window.location.href = '/login/googlelogin';


}






window.facebooksignin = function() {
  // Redirect to the Google login page
  window.location.href = '/login/facebooklogin';


}


  window.setsignup = async function () {
    //document.getElementById("loadingcontainer").style.display = "block";
    //document.getElementById("signupcontainer").style.display = "none";

    //await combineMovies();

    //var storedMovies = localStorage.getItem("movies");
    //var movies = JSON.parse(storedMovies);
    //window.location.href = "/movie-list";
    window.location.href = "/movie-list";
  }



  document.querySelector("#submitSignUp").addEventListener("click", async function(event) {
    event.preventDefault();

    let email = document.querySelector("input[name='email']").value;
    let password = document.querySelector("input[name='password']").value;

    //Do loading of the movies at the same time signup
    document.getElementById("loadingcontainer").style.display = "block";
    document.getElementById("signupcontainer").style.display = "none";

    //await combineMovies();

    var storedMovies = localStorage.getItem("movies");
    var movies = JSON.parse(storedMovies);



    console.log(email)
    console.log(password)
    console.log(movies)

    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: email, password: password,movies:[]})
    }).then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(function(data) {
      if (data.success) {
        // User is logged in, you could redirect to the movies list here
        window.location.href = "/movie-list";
      } else {
        // Show the error message

        alert('email Already exists')
        document.querySelector("#loginError").innerText = data.error;
        document.querySelector("#loginError").style.display = "block";
      }
    }).catch(function(error) {
      console.error('There has been a problem with your fetch operation:', error);
    });


  });

  document.querySelector("#submitLogin").addEventListener("click", function(event) {
    event.preventDefault();

    let email = document.querySelector("input[name='emailmodal']").value;
    let password = document.querySelector("input[name='passwordmodal']").value;

    var storedMovies = localStorage.getItem("movies");
    var movies = JSON.parse(storedMovies);

    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: email, password: password,movies:[]})
    }).then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(function(data) {
      if (data.success) {
        // User is logged in, you could redirect to the movies list here
        window.location.href = "/movie-list";
      } else {
        // Show the error message
        document.querySelector("#loginError").innerText = data.error;
        document.querySelector("#loginError").style.display = "block";
      }
    }).catch(function(error) {
      console.error('There has been a problem with your fetch operation:', error);
    });


  });



  //$("#loadingcontainer").hide()
  //combineMovies();




})
