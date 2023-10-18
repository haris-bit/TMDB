let genre_id = [];
let length = null;

function selectlength(name) {


  let node = document.getElementById(name);

  //document.getElementById("80").parentNode.style.border = "none";
  //document.getElementById("90").parentNode.style.border = "none";
  //document.getElementById("121").parentNode.style.border = "none";
  //document.getElementById("0").parentNode.style.border = "none";

  /*if (node.parentNode.style.border == "none" || node.parentNode.style.border == "") {
    node.parentNode.style.border = "5px solid green";
    genre_id.push(node.innerHTML);
    length = name;
  }
  else {
    node.parentNode.style.border = "none";
    length = null;
  }*/
  //#e6b400
  if(node.parentNode.style.border == "none" || node.parentNode.style.border == ""){
      node.parentNode.style.border = "5px solid #adf90f";
      genre_id.push(name);
  }else{
      node.parentNode.style.border = "none";
      genre_id = genre_id.filter((item)=>{
          return item != name;
      })

  }
  console.log(genre_id);


  // console.log(document.getElementById(genre).innerHTML)
}


function setactors() {
  if (!genre_id) {
    alert("Please select at least 1 length");
  } else {
    localStorage.setItem("length", genre_id);
    window.location.href = "/select-movie";
    //"/select-characteristics";
  }
}
