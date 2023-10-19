//beginPath, moveTo, lineTo, stroke, fill
const saveBtn = document.getElementById("save");
const textInput = document.getElementById("text");
const fileInput = document.getElementById("file");
const modeBtn = document.getElementById("mode-btn");
const destroyBtn = document.getElementById("destroy-btn");
const eraseBtn = document.getElementById("erase-btn");
const colorOptions = Array.from(document.getElementsByClassName("color-option"));
const color = document.getElementById("color");
const lineWidth = document.getElementById("line-width");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d"); //캔버스에 그림을 그릴 때 사용하는 붓

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
ctx.lineWidth = lineWidth.value;
ctx.lineCap = "round";
let isPainting = false;
let isFilling = false;

let stompClient = null;

function connectToWebSocket() {
    // SockJS 및 STOMP를 사용하여 서버에 연결
    const socket = new SockJS('/ws'); // 웹소켓 엔드포인트 URL
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);

        // 서버로부터 메시지 수신을 위한 구독
        stompClient.subscribe('/topic/public', function(drawingMessage) {
            handleDrawingMessage(JSON.parse(drawingMessage.body));
        });
    });
}

function sendDrawingMessage(startX, startY, endX, endY) {
    const drawingMessage = {
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        color: ctx.strokeStyle,
        lineWidth: ctx.lineWidth
    };

    // 서버에 메시지 전송
    stompClient.send("/app/drawing", { 'content-type': 'application/json' }, JSON.stringify(drawingMessage));
}

function handleDrawingMessage(message) {
    // 수신한 메시지를 사용하여 그림 그리기
    ctx.strokeStyle = message.color;
    ctx.lineWidth = message.lineWidth;
    ctx.beginPath();
    ctx.moveTo(message.startX, message.startY);
    ctx.lineTo(message.endX, message.endY);
    ctx.stroke();
}


function onMove(event){
    if(isPainting){
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();

        // 서버에 그린 선 데이터 전송
        sendDrawingMessage(event.offsetX, event.offsetY);
        return;
    }
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY); //드래그 상태가 아닐 경우에 마우스를 움직이기만 함
}

function startPainting(){
    isPainting = true;
}

function cancelPainting(){
    isPainting = false;
}

function onLineWidthChange(event){
    ctx.lineWidth = event.target.value;
}

function onColorChange(event){
    ctx.strokeStyle = event.target.value;
    ctx.fillStyle = event.target.value;
}

function onColorClick(event){
    const colorValue = event.target.dataset.color;
    ctx.strokeStyle = colorValue;
    ctx.fillStyle = colorValue;
    color.value = colorValue;
}

function onModeClick(){
    if(isFilling){
        isFilling = false;
        modeBtn.innerText = "Fill";
    }
    else {
        isFilling = true;
        modeBtn.innerText = "Draw";
    }
}

function onCanvasClick(){
    if(isFilling){
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}

function onDestroyClick(){
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function onEraserClick(){
    ctx.strokeStyle = "white";
    isFilling = false;
    modeBtn.innerText = "Fill";
}

function onFileChange(event){
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    image.onload = function(){
        ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        fileInput.value = null;
    }
}

function onDoubleClick(event){
    ctx.save(); //현재 상태, 색상, 스타일을 전부 저장
    if(text != ""){
        ctx.save(); //현재 상태, 색상, 스타일을 전부 저장
        ctx.lineWidth = 1;
        ctx.font = "68px serif";
        ctx.fillText(text, event.offsetX, event.offsetY);
        ctx.restore(); //다시 되돌림
    }
}

function onSaveClick(){
    const url = canvas.toDataURL(); //방금 내가 그린 이미지가 URL로 인코딩되는 것
    const a = document.createElement("a");
    a.href = url;
    a.download = "myDrawing.png";
    a.click();
}

canvas.addEventListener("dblclick", onDoubleClick);
canvas.addEventListener("mousemove", onMove);
canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mouseup", cancelPainting);
canvas.addEventListener("mouseleave", cancelPainting);
canvas.addEventListener("change", onColorChange);
canvas.addEventListener("click", onCanvasClick);

lineWidth.addEventListener("change", onLineWidthChange);
color.addEventListener("change", onColorChange);

colorOptions.forEach((colorOption) => colorOption.addEventListener("click", onColorClick));

modeBtn.addEventListener("click", onModeClick);
destroyBtn.addEventListener("click", onDestroyClick);
eraseBtn.addEventListener("click", onEraserClick);
fileInput.addEventListener("change", onFileChange);
saveBtn.addEventListener("click", onSaveClick);

// WebSocket에 연결
connectToWebSocket();