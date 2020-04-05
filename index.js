const ca = document.getElementById("canvas");
const c = ca.getContext("2d");
const l = document.getElementById("z");
function includes(array,object,ignores){ //special function for objects...
  return array.filter(o=>{
    for(let i in o){
      if(typeof(object[i]) != "undefined" && object[i] == o[i]){
        continue;
      }else{
        if(ignores && ignores.includes(i)){
          continue;
        }
        return false;
      }
    }
    return true;
  }).length >= 1;
}
let id = {
  w: 0,
  h: 0
};
l.addEventListener("change",(e)=>{
  c.clearRect(0,0,ca.width,ca.height);
  let d = Array.from(document.getElementsByTagName("p"));
  d.forEach(o=>{o.outerHTML = "";});
  const url = URL.createObjectURL(e.target.files[0]);
  const i = new Image();
  i.onload = ()=>{
    ca.width = i.width;
    ca.height = i.height;
    id.w = i.width;
    id.h = i .height;
    c.drawImage(i,0,0);
    URL.revokeObjectURL(url);
    let boxes = newFindBoxes(c.getImageData(0,0,canvas.width,canvas.height));
  }
  i.src = url;
});

function newFindBoxes(pixels) {
  pixels = Array.from(pixels.data);
  let rows = [];
  // split into rows, get transparency.
  for(let i = 0;i<pixels.length;i+=ca.width * 4){
    let rowo = [];
    for(let j = 0;j<pixels.slice(i,i+ca.width * 4).length;j+=4){
      rowo.push(pixels.slice(i,i+ca.width * 4).slice(j,j+4)[3]);
    }
    rows.push(rowo);
  }
  const threshold = 10;
  let boundingBoxes = [];
  let tracked = [];
  let id = 0;
  // go through all the rows until we hit a pixel, and then outline the object.
  for(let i = 0;i < rows.length;i++) {
    for(let j = 0;j<rows[i].length;j++){
      if(rows[i][j] < threshold){ // if transparent pixel
        continue;
      }
      if(includes(tracked,{x:j,y:i},["id"])){
        let skipX = j;
        // get the id.
        const matchedId = tracked.filter(pos => {
          return pos.x == j && pos.y == i;
        })[0].id;
        for(let k = 0;k<tracked.length;k++){ // find last pixel that matches y pos.
          if(tracked[k].y == i && tracked[k].x > skipX && tracked[k].id == matchedId){
            skipX = tracked[k].x;
          }
        }
        j = skipX;
        continue;
      }
      // pixel valid. begin outlining stuff.
      let box = [];
      id ++;
      let finder = new boxFinder({x:j,y:i},0,{x:j,y:i},null);
      let firstRun = true;
      while (true) {
        // back at the start.
        if(includes([finder.pos],finder.start) && !firstRun){
          // done! calculate bounding box!
          break;
        }
        if(firstRun){
          firstRun = false;
        }
        tracked.push({
          x: finder.pos.x,
          y: finder.pos.y,
          id: id
        });
        box.push({
          x: finder.pos.x,
          y: finder.pos.y
        });
        let found = false;
        switch (finder.dir) {
          case 0:
          // check left (up)
          if(finder.pos.y - 1 >= 0 && rows[finder.pos.y - 1][finder.pos.x] >= threshold){
            finder.update(1,{
              x: finder.pos.x,
              y: finder.pos.y - 1
            },found);
            found = true;
            continue;
          }
          // check forward (right)
          if (finder.pos.x + 1 < ca.width && rows[finder.pos.y][finder.pos.x + 1] >= threshold && !found) {
            finder.update(0,{
              x: finder.pos.x + 1,
              y: finder.pos.y
            },found);
            found = true;
            continue;
          }
          // check right (down)
          if (finder.pos.y + 1 < ca.height && rows[finder.pos.y + 1][finder.pos.x] >= threshold && !found) {
            finder.update(3,{
              x: finder.pos.x,
              y: finder.pos.y + 1
            },found);
            continue;
          }
          break;
          case 1:
          // check left (left)
          if(finder.pos.x - 1 >= 0 && rows[finder.pos.y][finder.pos.x - 1] >= threshold){
            finder.update(2,{
              x: finder.pos.x - 1,
              y: finder.pos.y
            },found);
            found = true;
            continue;
          }
          // check forward (up)
          if (finder.pos.y - 1 >= 0 && rows[finder.pos.y - 1][finder.pos.x] >= threshold && !found) {
            finder.update(1,{
              x: finder.pos.x,
              y: finder.pos.y - 1
            },found);
            found = true;
            continue;
          }
          // check right (right)
          if (finder.pos.x + 1 < ca.width && rows[finder.pos.y][finder.pos.x + 1] >= threshold && !found) {
            finder.update(0,{
              x: finder.pos.x + 1,
              y: finder.pos.y
            },found);
            continue;
          }
          break;
          case 2:
          // check left (down)
          if(finder.pos.y + 1 < ca.height && rows[finder.pos.y + 1][finder.pos.x] >= threshold){
            finder.update(3,{
              x: finder.pos.x,
              y: finder.pos.y + 1
            },found);
            found = true;
            continue;
          }
          // check forward (left)
          if (finder.pos.x - 1 >= 0 && rows[finder.pos.y][finder.pos.x - 1] >= threshold && !found) {
            finder.update(2,{
              x: finder.pos.x - 1,
              y: finder.pos.y
            },found);
            found = true;
            continue;
          }
          // check right (up)
          if (finder.pos.y - 1 >= 0 && rows[finder.pos.y - 1][finder.pos.x] >= threshold && !found) {
            finder.update(1,{
              x: finder.pos.x,
              y: finder.pos.y - 1
            },found);
            continue;
          }
          break;
          case 3:
          // check left (right)
          if(finder.pos.x + 1 < ca.width && rows[finder.pos.y][finder.pos.x + 1] >= threshold){
            finder.update(0,{
              x: finder.pos.x + 1,
              y: finder.pos.y
            },found);
            found = true;
            continue;
          }
          // check forward (down)
          if (finder.pos.y + 1 < ca.height && rows[finder.pos.y + 1][finder.pos.x] >= threshold && !found) {
            finder.update(3,{
              x: finder.pos.x,
              y: finder.pos.y + 1
            },found);
            found = true;
            continue;
          }
          // check right (left)
          if (finder.pos.x - 1 >= 0 && rows[finder.pos.y][finder.pos.x - 1] >= threshold && !found) {
            finder.update(2,{
              x: finder.pos.x - 1,
              y: finder.pos.y
            },found);
            continue;
          }
          break;
        }
        // no valid pixels. turn around!
        if (finder.old == null) {
          finder.dir = (finder.dir + 2) % 4;
        } else {
          finder = finder.old;
        }
      }
      // get bounding box
      let tmp = {
        lowX: Infinity,
        lowY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
      };
      for(let pos of box){
        tmp.lowX = pos.x < tmp.lowX ? pos.x : tmp.lowX;
        tmp.lowY = pos.y < tmp.lowY ? pos.y : tmp.lowY;
        tmp.maxX = pos.x > tmp.maxX ? pos.x : tmp.maxX;
        tmp.maxY = pos.y > tmp.maxY ? pos.y : tmp.maxY;
      }
      boundingBoxes.push({
        x: tmp.lowX,
        y: tmp.lowY,
        width: tmp.maxX - tmp.lowX,
        height: tmp.maxY - tmp.lowY
      });
      // put position at end.
      j = tmp.maxX;
    }
  }
  //draw the bounding boxes.
  for(let i in boundingBoxes){
    c.lineWidth = 1;
    c.strokeRect(boundingBoxes[i].x,boundingBoxes[i].y,boundingBoxes[i].width,boundingBoxes[i].height);
    c.strokeText(i,boundingBoxes[i].x,boundingBoxes[i].y + boundingBoxes[i].height + 0);
    document.body.append((()=>{
      let a = document.createElement("p");
      a.innerHTML=i + ": " + JSON.stringify(boundingBoxes[i]);
      a.addEventListener("click",()=>{
        document.execCommand("copy");
      });
      a.addEventListener("copy",e=>{
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', JSON.stringify(boundingBoxes[i]));
        } else if (window.clipboardData) {
          window.clipboardData.setData('Text', JSON.stringify(boundingBoxes[i]));
        }
      });
      return a;
    })());
  }

  // debug
  window.boundingBoxes = boundingBoxes;
  window.tracked = tracked;
}

class boxFinder {
  constructor (start, dir, pos, finder) {
    this.old = finder; // to go back to if stuck
    this.start = start; // the original starting point
    this.dir = dir; // the direction of the finder
    // 0 = R, 1 = U, 2 = L, 3 = D
    this.pos = pos; // the pos of the finder
  }
  createFinder () {
    return new boxFinder(this.start,this.dir,this.pos,this.old);
  }
  update (dir,pos,found) {
    if (found) {
      this.old = new boxFinder(this.start,dir,this.pos,this.old);
    } else {
      this.dir = dir;
      this.pos = pos;
    }
  }
}

let canvasCopyEvt = {
  x: null,
  y: null
}

ca.addEventListener("click",e=>{
  canvasCopyEvt.x = (Math.abs(id.w / ca.clientWidth) * e.offsetX);
  canvasCopyEvt.y = (Math.abs(id.h / ca.clientHeight) * e.offsetY);
  document.execCommand("copy");
});

document.getElementById("canvasText").addEventListener("copy",e=>{
  e.preventDefault();
  for(let i in boundingBoxes){
    if(boundingBoxes[i].x <= canvasCopyEvt.x && boundingBoxes[i].y <= canvasCopyEvt.y && boundingBoxes[i].width + boundingBoxes[i].x >= canvasCopyEvt.x && boundingBoxes[i].height + boundingBoxes[i].y >= canvasCopyEvt.y){
      let data = JSON.stringify(boundingBoxes[i]);
      ca.style.border = "10px solid green";
      setTimeout(()=>{
        ca.style.border = "10px solid black";
      },1000);
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', data);
      } else if (window.clipboardData) {
        window.clipboardData.setData('Text', data);
      }
    }
  }
});
