let genre_id = [];
function selectchar(name){
  let node = document.getElementById(name);
  if(node.parentNode.style.border == "none" || node.parentNode.style.border == ""){
      node.parentNode.style.border = "5px solid #e6b400";
      genre_id.push(node.innerHTML);
  }else{
      node.parentNode.style.border = "none";
      genre_id = genre_id.filter((item)=>{
          return item != name;
      })

  }
  console.log(genre_id);


  // console.log(document.getElementById(genre).innerHTML)
}


function setactors(){
  if(!genre_id){
      alert("Please select at least 1 genre");
  }else{
      localStorage.setItem("genre",genre_id);
      window.location.href = "/select-movie";
  }
}
