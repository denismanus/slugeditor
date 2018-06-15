
var data;
var sprites = [];
var actionType;
var currentMap;
var currentCell = {};
var currentTeleport = {};
var maxX = 0, maxY = 0;



document.getElementById('files').addEventListener('change', handleSpriteSelect, false);
document.getElementById('map').addEventListener('change', handleJsonLoad, false);

function loadSprites(){
    
}

function handleJsonLoad(evt) {
    var f = evt.target.files[0]; // FileList object
    var reader = new FileReader();
    reader.onload = (function (theFile) {
        return function (e) {
            try {
                json = JSON.parse(e.target.result);
                parseMap(json);
            } catch (ex) {
                console.log(ex);
            }
        }
    })(f);
    reader.readAsText(f);
}

function parseMap(json) {

    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            for (var block in json[key]) {
                for (var pos in json[key][block]) {
                    if (pos == "x")
                        maxX = json[key][block][pos] > maxX ? json[key][block][pos] : maxX;
                    if (pos == "y")
                        maxY = json[key][block][pos] > maxY ? json[key][block][pos] : maxY;
                }
            }
        }
    }
    createTable(maxY, maxX);
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            if (key == "Start" || key == "Exit") {
                drawSprites(maxY - json[key]['y'], json[key]['x'], key);
                createSpriteInfo(maxY - json[key]['y'], json[key]['x'], key);
            } else if (key == "SimpleBlock" || key == "Saw" || key == "Danger") {
                for (var block in json[key]) {
                    drawSprites(maxY - json[key][block]['y'], json[key][block]['x'], key);
                    createSpriteInfo(maxY - json[key][block]['y'], json[key][block]['x'], key);
                }
            } else {
                for (var block in json[key]) {
                    drawSprites(maxY - json[key][block]['position']['y'],
                        json[key][block]['position']['x'],
                        key,
                        json[key][block]['teleportPosition']['x'],
                        maxY - json[key][block]['teleportPosition']['y']);
                    createSpriteInfo(maxY - json[key][block]['position']['y'],
                        json[key][block]['position']['x'],
                        key,
                        json[key][block]['teleportPosition']['x'],
                        maxY - json[key][block]['teleportPosition']['y']);
                }
            }
        }
    }
}

function handleSpriteSelect(evt) {
    var files = evt.target.files;
    $('#sprites_holder').empty();
    for (var i = 0, f; f = files[i]; i++) {
        serReader(files[i]);
    }
}

function serReader(file) {
    var obj = {};
    var reader = new FileReader();
    reader.onload = function (e) {
        obj.image = reader.result;
        sprites.push(obj);
        createSprite(sprites[sprites.length - 1]);
    }
    obj.name = file.name.slice(0, -4);
    reader.readAsDataURL(file);
}

function createSprite(sprite) {
    var label = $('<label class="btn btn-default">');
    var newRadio = $('<input/>').attr({ type: 'radio', name: 'block', value: sprite.name });
    var newImage = $('<img/>').attr({ src: sprite.image, class: "sprite" });
    $(label).append(newRadio);
    $(label).append(newImage);
    $('#mode_select').append(label);
}



function generateArray(rows, columns) {
    data = [];
    for (var e = 0; e < rows; e++) {
        let ar = [];
        ar.length = columns;
        data.push(ar);
    }
}

function drawSprites(r, c, type, x, y) {
    var path;
    for (i = 0; i < sprites.length; i++) {
        if (sprites[i].name == type) {
            path = sprites[i].image;
        }
    }
    var table = document.getElementById("table");
    $(table.rows[r].cells[c]).find('div').css("background-image", "url(" + path + ")");
}

function saveAsJson() {
    var obj;
    var root = {
        SimpleBlock: [],
        Danger: [],
        Red: [],
        Green: [],
        Purple: [],
        Empty: [],
        Saw: [],
        Start: {},
        Blue: [],
        Exit: {}
    }
    for (i = 0; i < data.length; i++) {
        for (q = 0; q < data[i].length; q++) {
            if (data[i][q] != undefined) {
                if (data[i][q].type == "Start" || data[i][q].type == "Exit") {
                    obj = {
                        x: data[i][q].x,
                        y: maxY - data[i][q].y
                    };
                    root[data[i][q].type] = obj;
                } else if (data[i][q].type == "Empty" || data[i][q].type == "Red" || data[i][q].type == "Green" || data[i][q].type == "Blue" || data[i][q].type == "Purple") {
                    obj = {
                        position: { x: data[i][q].position.x, y: maxY - data[i][q].position.y },
                        teleportPosition: { x: data[i][q].teleportPosition.x, y: maxY - data[i][q].teleportPosition.y }
                    }
                    root[data[i][q].type].push(obj)
                } else if (data[i][q].type == "SimpleBlock" || data[i][q].type == "Saw" || data[i][q].type == "Danger") {
                    obj = {
                        x: data[i][q].x,
                        y: maxY - data[i][q].y
                    };
                    root[data[i][q].type].push(obj);
                }
            }
        }
    }
    console.log(root);
    return JSON.stringify(root);
}

$("#btn-save").click( function() {
    var a = document.createElement("a");
    var text = saveAsJson();
    var filename = $("#input-fileName").val();
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    a.href = URL.createObjectURL(blob);
    a.download = filename+".json";
    a.click();
});

function saveAs(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    
}

function AddToRoot(obj) {
    root[obj.type].push
}

function clicked(r, c) {
    var table = document.getElementById("table");
    if ($('input:checked').length == 0)
        return;
    var type = $('input:checked').val();
    if (type == "delete") {
        $(table.rows[r].cells[c]).find('div').css("background-image", "none")
        createSpriteInfo(r, c, type);
        return;
    }
    if (type == 'select') {
        showInfo(r, c);
        return;
    }
    drawSprites(r, c, type);
    createSpriteInfo(r, c, type);
}

function createSpriteInfo(r, c, type, tX, tY) {
    if (arguments[2] == 'delete') {
        data[r][c] = undefined;
        return;
    }
    var obj = {};
    obj.type = type;

    if (type == "Empty" || type == "Red" || type == "Green" || type == "Blue" || type == "Purple") {
        obj.position = {
            x: c,
            y: r
        }
        obj.teleportPosition = {
            x: tX,
            y: tY
        }
    } else {
        obj.x = c;
        obj.y = r;
    }
    data[r][c] = obj;
}

function setBorders(row, column) {
    var table = document.getElementById("table");
    if (currentCell.hasOwnProperty("row")) {
        if (currentCell.row == row && currentCell.column == column) {
            if ($(table.rows[currentCell.row].cells[currentCell.column]).find('div').css("border") == "0px none rgb(51, 51, 51)") {
                $(table.rows[row].cells[column]).find('div').css("border", "2px solid rgb(255, 136, 0)");
            } else {
                $(table.rows[currentCell.row].cells[currentCell.column]).find('div').css("border", "");
            }
            return;
        }
        $(table.rows[currentCell.row].cells[currentCell.column]).find('div').css("border", "");
    }
    currentCell.row = row;
    currentCell.column = column;
    $(table.rows[row].cells[column]).find('div').css("border", "2px solid rgb(255, 136, 0)");
}

function showInfo(row, column) {
    if (data[row][column] != {} && data[row][column] != null) {
        setBorders(row, column);
        let type = data[row][column].type;
        $('#type').text(type);
        if (type == "Empty" || type == "Red" || type == "Green" || type == "Blue" || type == "Purple") {
            $('#tX').val(data[row][column].teleportPosition.x);
            $('#tY').val(data[row][column].teleportPosition.y);
            $('#X').text(data[row][column].position.x);
            $('#Y').text(data[row][column].position.y);
            showTeleport(data[row][column].teleportPosition.y, data[row][column].teleportPosition.x);
            return;
        }
        $('#tX').val("");
        $('#tY').val("");
        $('#X').text(data[row][column].x);
        $('#Y').text(data[row][column].y);
    }
}
function saveTeleport() {
    data[currentCell.row][currentCell.column].teleportPosition.x = $("#tX").val();
    data[currentCell.row][currentCell.column].teleportPosition.y = $("#tY").val();
}

function showTeleport(r, c) {
    if (r == undefined || c == undefined)
        return;
    if (currentTeleport.hasOwnProperty("x")) {
        if (currentCell.column != currentTeleport.x || currentCell.row != currentTeleport.y) {
            $(table.rows[currentTeleport.y].cells[currentTeleport.x]).find('div').css("border", "");
        }
    }

    if (data[r][c] != undefined) {
        let type = data[r][c].type;
        if (type == "Empty" || type == "Red" || type == "Green" || type == "Blue" || type == "Purple") {
            currentTeleport.x = c;
            currentTeleport.y = r;
            $(table.rows[r].cells[c]).find('div').css("border", "2px solid rgb(255, 0, 0)");
        }
    }
}

function createTable() {
    var rows = $("input[name=rows]").val();
    var columns = $("input[name=columns]").val();
    if (arguments.length == 2) {
        rows = arguments[0];
        columns = arguments[1];
    }
    if (rows == null || rows == "" || columns == null || columns == "") {
        alert('Введите размер поля');
        return;
    }
    maxX = columns;
    maxY = rows;
    generateArray(rows, columns);
    $('#here_table').empty();
    $('#here_table').append('<table />');
    $('#here_table table').attr("border", "1");
    $('#here_table table').attr("id", "table");
    for (i = 0; i < rows; i++) {
        $('#here_table table').append('<tr></tr>');
        for (q = 0; q < columns; q++) {
            $('#here_table tr:last').append('<td></td>');
        }
    }
    SetListeners();
}

function SetListeners() {
    var table = document.getElementById("table"), rIndex, cIndex;
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++) {
            $(table.rows[i].cells[j]).wrapInner('<div class="fadein" />');
            table.rows[i].cells[j].onclick = function () {
                rIndex = this.parentElement.sectionRowIndex;
                cIndex = this.cellIndex;
                clicked(rIndex, cIndex);
            };
        }
    }
}

