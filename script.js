// Canvas resilience test
// Copyright 2019 Junnovate, LLC. All rights reserved.

// Author vishwas@kodular.io (Vishwas Adiga)

let canvas = document.getElementById('canvas');
canvas.addEventListener("mousedown", canvasDownHandler, false);
canvas.addEventListener("mouseup", canvasUpHandler, false);
canvas.addEventListener("mousemove", canvasMoveHandler, false);

let ctx = canvas.getContext('2d');
let blocks = [];
let heldBlock;
let blockCount = 0;
let zoomLevel = 1;

ctx.scale(zoomLevel, zoomLevel);

const heightCalculator = document.createElement('SPAN');
document.body.appendChild(heightCalculator);
heightCalculator.classList.add('height-calculator');

class EventBlock {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  traceBackgroundLight() {
    roundRect(ctx, this.x, this.y, 130, 20, {tl: 5, tr: 5, bl: 0, br: 0}, false, false);
  }

  traceBackgroundDark() {
    roundRect(ctx, this.x, this.y + 1, 130, 20, {tl: 5, tr: 5, bl: 0, br: 0}, false, false);
  }

  drawText() {
    ctx.fillText('when', this.x + 7, this.y + 20 - EventBlock.getTextHeight('when', '10px Jost'));
    ctx.fillText('. Initialize', this.x + 50 + ctx.measureText('when').width + 3, this.y + 20 - EventBlock.getTextHeight('. Initialize', '10px Jost'));
  }

  getImg() {
    if(this.img)
      return this.img;

    var img = document.createElement('canvas');
    var imgCtx = img.getContext('2d');
    imgCtx.scale(zoomLevel, zoomLevel);

    img.width = 130;
    img.height = 20;
    this.img = img;
    this.draw(imgCtx);
    return this.img;
  }

  draw(context) {
    let x = 0;
    let y = 0;
    context.fillStyle = '#CC861E';
    roundRect(context, x, y + 1, 130, 20, {tl: 5, tr: 5, bl: 0, br: 0}, true, false);
    context.fillStyle = '#FFA725';
    roundRect(context, x, y, 130, 20, {tl: 5, tr: 5, bl: 0, br: 0}, true, false);
    x += 7;

    context.fillStyle = '#444';
    context.font = '10px Jost';
    context.textBaseline = 'top';

    context.fillText('when', x, y + 20 - EventBlock.getTextHeight('when', '10px Jost'));
    x += context.measureText('when').width + 3;

    context.fillStyle = "rgba(0, 0, 0, 0.1)";
    roundRect(context, x, y + 3, 40, 14, 2, true, false);
    x += 40 + 3;

    context.fillStyle = '#444';
    context.fillText('. Initialize', x, y + 20 - EventBlock.getTextHeight('. Initialize', '10px Jost'));
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  getBoundingBox() {
    return {x : this.x, y : this.y, w : 130, h : 20};
  }

  static getTextHeight(text, font) {
    heightCalculator.style.font = font;
    heightCalculator.innerText = text;
    return heightCalculator.offsetHeight;
  }
}

const myFont = new FontFace('Jost', 'url(Jost-400-Book.otf)');
myFont.load().then((font) => {
  document.fonts.add(font);
});

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}

function canvasDownHandler(e) {
  for(let block of blocks) {
    var box = block.getBoundingBox();
    if(e.offsetX > box.x && e.offsetX < box.x + box.w) {
      if(e.offsetY > box.y && e.offsetY < box.y + box.h) {
        heldBlock = block;
        break;
      }
    } else {
      continue;
    }
  }
}

function canvasMoveHandler(e) {
  if(heldBlock) {
    var box = heldBlock.getBoundingBox();
    ctx.clearRect(box.x, box.y, box.x + box.w, box.y + box.h);
    heldBlock.moveTo(e.offsetX, e.offsetY);

    /*ctx.beginPath();
    for(let block of blocks) {
      ctx.fillStyle = '#CC861E';
      block.traceBackgroundDark();
    }
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    for(let block of blocks) {
      ctx.fillStyle = '#FFA725';
      block.traceBackgroundLight();
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#444';
    ctx.font = '10px Jost';
    ctx.textBaseline = 'top';
    for(let block of blocks) {
      block.drawText();
    }*/
    for(let block of blocks) {
      ctx.drawImage(block.getImg(), block.x, block.y);
    }
  }
}

function canvasUpHandler(e) {
  heldBlock = null;
}

function addBlocks(count) {
  for(var i = 0; i < count; i++)
    blocks.push(new EventBlock(getRandomInt(0, 600), getRandomInt(0, 300)));
  blockCount+= count;
  document.getElementById('total').innerText = 'Total: ' + blockCount;
  heldBlock = blocks[0];
  canvasMoveHandler({offsetX : 0, offsetY : 0});
  heldBlock = null;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
