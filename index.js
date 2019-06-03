const ca = document.getElementById("canvas");
const c = ca.getContext("2d");
const l = document.getElementById("z");
function includes(array,object){ //special function for objects...
  return array.filter(o=>{
    for(let i in o){
      if(object[i] && object[i] == o[i]){
        continue;
      }else{
        return false;
      }
    }
    return true;
  }).length >= 1;
}
l.addEventListener("change",(e)=>{
  c.clearRect(0,0,ca.width,ca.height);
  let d = document.getElementsByTagName("p");
  for(let i in d){
    d[i].outerHTML = "";
  }
  const url = URL.createObjectURL(e.target.files[0]);
  const i = new Image();
  i.onload = ()=>{
    ca.width = i.width;
    ca.height = i.height;
    c.drawImage(i,0,0);
    URL.revokeObjectURL(url);
    let boxes = findBoxes(c.getImageData(0,0,canvas.width,canvas.height));
  }
  i.src = url;
});
function findBoxes(pixels){
  pixels = Array.from(pixels.data);
  //split into rows
  let rows = [];
  for(let i = 0;i<pixels.length;i+=ca.width * 4){
    let rowo = [];
    for(let j = 0;j<pixels.slice(i,i+ca.width * 4).length;j+=4){
      rowo.push(pixels.slice(i,i+ca.width * 4).slice(j,j+4)[3]);
    }
    rows.push(rowo);
  }
  window.debugRows = rows;
  //go through every fricking row, until hit a pixel, then begin creating bounding box, and continue.
  const threshold = 10;
  window.u2 = [];
  window.boundingBoxes = [];
  for(let i in rows){
    i = Number(i);
    for(let j in rows[i]){
      j = Number(j);
      if(rows[i][j] < threshold || includes(u2,{x:j,y:i})){
        continue;
      }
      //now find the box... ugh... This is gonna lag so much...
      window.u = [{x:j,y:i}];
      window.u3 = [{x:j,y:i}];
      let incomplete = true;
      let debug = 0;
      while(incomplete/* && debug++ < 20*/){
        let f = false;
        for(let k in u){
          k = Number(k);
          let remSys = [false,false,false,false];
          //detect positions UDLR of the pixel, and determine if there are more valid pixels next to them
          if(u[k].y - 1 >= 0){ //up
            if(!includes(u,{x:u[k].x,y:u[k].y - 1}) && !includes(u2,{x:u[k].x,y:u[k].y - 1}) && rows[u[k].y - 1][u[k].x] >= threshold){ //not already in system and is a valid pixel
              u.push({x:u[k].x,y:u[k].y - 1});
              f=true;
            }else if(includes(u,{x:u[k].x,y:u[k].y - 1}) && !includes(u2,{x:u[k].x,y:u[k].y - 1}) || rows[u[k].y - 1][u[k].x] < threshold){ //already in system or invalid pixel
              remSys[0] = true;
            }
          }else{
            remSys[0] = true;
          }
          if(u[k].y + 1 <= ca.height){ //down
            if(!includes(u,{x:u[k].x,y:u[k].y + 1}) && !includes(u2,{x:u[k].x,y:u[k].y + 1}) && rows[u[k].y + 1][u[k].x] >= threshold){ //not already in system and is a valid pixel
              u.push({x:u[k].x,y:u[k].y + 1});
              f=true;
            }else if(includes(u,{x:u[k].x,y:u[k].y + 1}) && !includes(u2,{x:u[k].x,y:u[k].y + 1}) || rows[u[k].y + 1][u[k].x] < threshold){
              remSys[1] = true;
            }
          }else{
            remSys[1] = true;
          }
          if(u[k].x - 1 >= 0){ //left
            if(!includes(u,{x:u[k].x - 1,y:u[k].y}) && !includes(u2,{x:u[k].x - 1,y:u[k].y}) && rows[u[k].y][u[k].x - 1] >= threshold){ //not already in system and is a valid pixel
              u.push({x:u[k].x - 1,y:u[k].y});
              f=true;
            }else if(includes(u,{x:u[k].x - 1,y:u[k].y}) && !includes(u2,{x:u[k].x - 1,y:u[k].y}) || rows[u[k].y][u[k].x - 1] < threshold){
              remSys[2] = true;
            }
          }else{
            remSys[2] = true;
          }
          if(u[k].x + 1 <= ca.width){ //right
            if(!includes(u,{x:u[k].x + 1,y:u[k].y}) && !includes(u2,{x:u[k].x + 1,y:u[k].y}) && rows[u[k].y][u[k].x + 1] >= threshold){ //not already in system and is a valid pixel
              u.push({x:u[k].x + 1,y:u[k].y});
              f=true;
            }else if(includes(u,{x:u[k].x + 1,y:u[k].y}) && !includes(u2,{x:u[k].x + 1,y:u[k].y}) || rows[u[k].y][u[k].x + 1] < threshold){
              remSys[3] = true;
            }
          }else{
            remSys[3] = true;
          }
          if(remSys.filter(o=>{return o;}).length == 4){
            console.log("remove invalid");
            u2.push({x:u[k].x,y:u[k].y});
            u3.push({x:u[k].x,y:u[k].y});
            u.splice(k,1);
          }
        }
        if(!f){
          incomplete = false;
        }
      }
      u3 = u3.concat(u);
      u2 = u2.concat(u);
      console.log(u);
      //now sort through the used positions and find the top left and bottom right pixels...
      let tempBox = {
        maxY: u3[0].y,
        lowY: u3[0].y,
        maxX: u3[0].x,
        lowX: u3[0].x
      };
      for(let i in u3){
        tempBox.maxX = u3[i].x > tempBox.maxX ? u3[i].x : tempBox.maxX;
        tempBox.maxY = u3[i].y > tempBox.maxY ? u3[i].y : tempBox.maxY;
        tempBox.lowY = u3[i].y < tempBox.lowY ? u3[i].y : tempBox.lowY;
        tempBox.lowX = u3[i].x < tempBox.lowX ? u3[i].x : tempBox.lowX;
      }
      boundingBoxes.push({
        x: tempBox.lowX,
        y: tempBox.lowY,
        width: tempBox.maxX - tempBox.lowX,
        height: tempBox.maxY - tempBox.lowY
      });
      //return;
    }
  }
  //draw the bounding boxes.
  for(let i in boundingBoxes){
    c.lineWidth = 1;
    c.strokeRect(boundingBoxes[i].x,boundingBoxes[i].y,boundingBoxes[i].width,boundingBoxes[i].height);
    c.strokeText(i,boundingBoxes[i].x,boundingBoxes[i].y + boundingBoxes[i].height + 20);
    document.body.append((()=>{let a = document.createElement("p");a.innerHTML=i + ": " + JSON.stringify(boundingBoxes[i]);return a;})());
  }
}
