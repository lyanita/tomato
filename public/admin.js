window.addEventListener('load', (event) => {
  var username = JSON.parse(sessionStorage.getItem('username'));
  var req = new XMLHttpRequest();
  req.open("GET", "https://tomato-dictionary.herokuapp.com/", true);
  req.onload = function (e) {
    if (req.readyState === 4) {
      if (req.status >= 200 && req.status < 400) {
        window.responseOrg = JSON.parse(req.responseText);
        window.response = responseOrg.rows;
        console.log(response);
        window.dictionaryOrg = JSON.parse(req.responseText);
        window.dictionary = dictionaryOrg.rows;
        let result = document.getElementById('results');
        result.appendChild(buildTable("tableResult"));
        console.log(response);
        showTable(response);
        deleteFcn();
        editFcn();
        likeFcn();
        editSubmit();
        insertSubmit();
        searchFcn();
        buildCount();
        copyResults();
        getRequests();
      } else {
        console.log("Error");
      }
    }
  };
  /*req.onerror = function(e) {
    console.error(req.statusText);
  };*/
  req.send(null);
});

function showTable(response) {
  let table = document.getElementById('tableResult');
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
  let headRow = document.createElement("tr");
  for (let head = 1; head <= 4; head++) {
    let headCell = document.createElement("th");
    switch (head) {
      case 1:
        headContent = "Acronym";
        break;
      case 2:
        headContent = "Term";
        break;
      case 3:
        headContent = "Definition";
        break;
      case 4:
        headContent = "Likes";
        break;
      default:
        break;
    }
    headCell.appendChild(document.createTextNode(headContent));
    headRow.appendChild(headCell);
  }
  table.appendChild(headRow);
  for (let count = 0; count < response.length; count++) {
    let row = document.createElement("tr");
    for (let col = 1; col <= 4; col++) {
      let cell = document.createElement("td");
      switch (col) {
        case 1:
          cellContent = response[count].acronym;
          break;
        case 2:
          cellContent = response[count].term;
          break;
        case 3:
          cellContent = response[count].definition;
          break;
        case 4:
          cellContent = response[count].ranking;
          break;
        default:
          break;
      }
      cell.appendChild(document.createTextNode(cellContent));
      row.appendChild(cell);
    }
    num = count + 1
    value = response[count].id;
    let delButton = buildButton(value, "delete", "Delete", num, row);
    let editButton = buildButton(value, "edit", "Edit", num, row)
    let likeButton = buildButton(value, "like", "Like", num, row);
    //cellContent = reponse[count].ranking;
    table.appendChild(row);
  }
};

function buildButton(idName, className, text, row, parentNode) {
  let button = document.createElement("button");
  button.id = idName;
  button.className = className;
  button.textContent = text;
  button.value = row;
  parentNode.appendChild(button);
};

function buildTable(name) {
  let table = document.createElement("table");
  table.setAttribute("id", name);
  return table;
};


function buildDiv(text) {
  let newDiv = document.createElement("div");
  newDiv.id = text;
  return newDiv;
}

function buildCount() {
  let resultLine = document.getElementById("searchWrapper");
  resultLine.appendChild(buildDiv("count"));
  let countDiv = document.getElementById("count");
  let count = dictionary.length;
  let countNode = document.createTextNode(count + " result(s) displayed out of " + count + " entries.");
  let item = countDiv.childNodes[0];
  if (item === undefined) {
    countDiv.appendChild(countNode);
  } else {
    countDiv.replaceChild(countNode, item);
  }
};

function searchFcn() {
  document.getElementById("search").addEventListener("keyup", function (response) {
    var text = document.getElementById("search").value;
    console.log(text);
    const searchString = text.toLowerCase();
    var library = dictionary;
    console.log(library);
    const filtered = library.filter((entry) => {
      return (entry.acronym.toLowerCase().includes(searchString) || entry.term.toLowerCase().includes(searchString));
    });
    showTable(filtered); //Create table of records
    let countDiv = document.getElementById("count");
    let count = filtered.length;
    let countNode = document.createTextNode(count + " result(s) displayed out of " + library.length + " entries.");
    let item = countDiv.childNodes[0];
    if (item === undefined) {
      countDiv.appendChild(countNode);
    } else {
      countDiv.replaceChild(countNode, item);
    }
    deleteFcn(); //Add delete button
    editFcn(); //Add edit button
    likeFcn(); //Add like button
  });
};

function deleteFcn() {
  buttons = document.querySelectorAll('button.delete');
  buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
      let id = this.id;
      let ind = this.value;
      var req = new XMLHttpRequest();
      req.open('GET', 'https://tomato-dictionary.herokuapp.com/delete?id=' + id, true);
      req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
          console.log(req);
          var row = document.getElementById(id);
          row.parentNode.parentNode.removeChild(row.parentNode);
        } else {
          console.log("Did Not Delete.")
        }
      });
      req.send(null);
      event.preventDefault();
      searchFcn();
    }, false);
  });
};

function likeFcn() {
  buttons = document.querySelectorAll('button.like');
  buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
      let id = this.id;
      console.log(id);
      var row = document.getElementById(id).parentNode;
      console.log(row);
      var elements = row.children;
      likes = parseInt(elements[3].innerText);
      likes += 1;
      likes = likes.toString();
      console.log(likes);
      var req = new XMLHttpRequest();
      req.open("GET", "https://tomato-dictionary.herokuapp.com/update?id=" + id + "&ranking=" + encodeURIComponent(likes), true);
      req.addEventListener('load', function () {
        if (req.readyState === 4) {
          if (req.status >= 200 && req.status < 400) {
            console.log(req);
            var responseOrg = JSON.parse(req.responseText);
            var response = responseOrg.rows;
            console.log(response);
            var table = document.getElementById("tableResult");
            table.parentNode.removeChild(table);
            let result = document.getElementById('results');
            result.appendChild(buildTable("tableResult"));
            showTable(response);
          } else {
            console.log("Error");
          }
        }
        editFcn();
        deleteFcn();
        likeFcn()
      });
      req.send(null);
      event.preventDefault();
      var cellContent = '';
      let searchField = document.getElementById('search');
      searchField.value = cellContent;
    });
  });
};

function editFcn() {
  buttons = document.querySelectorAll('button.edit');
  buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
      let id = this.id;
      let ind = this.value;
      var row = document.getElementById(id).parentNode;
      var elements = row.children;
      console.log(elements);
      for (var col = 0; col < elements.length - 2; col++) {
        cellContent = elements[col].innerText;
        switch (col) {
          case 0:
            var acronym = document.getElementById("acronym");
            acronym.setAttribute("value", cellContent);
            acronym.value = cellContent;
            break;
          case 1:
            var term = document.getElementById("term");
            console.log(term);
            term.setAttribute("value", cellContent);
            term.value = cellContent;
            break;
          case 2:
            var definition = document.getElementById("definition");
            definition.setAttribute("value", cellContent);
            definition.value = cellContent;
            break;
          default:
            break;
        }
      }
      document.getElementById('editId').textContent = id;
    });
  });
};

function editSubmit() {
  document.getElementById('editSubmit').addEventListener('click', function (event) {
    let id = document.getElementById('editId').innerText;
    let acronym = document.getElementById('acronym').value;
    let term = document.getElementById('term').value;
    let definition = document.getElementById('definition').value;
    var req = new XMLHttpRequest();
    req.open("GET", "https://tomato-dictionary.herokuapp.com/update?id=" + id + "&acronym=" + encodeURIComponent(acronym) + "&term=" + encodeURIComponent(term) + "&definition=" + encodeURIComponent(definition), true);
    req.addEventListener('load', function () {
      if (req.readyState === 4) {
        if (req.status >= 200 && req.status < 400) {
          console.log(req);
          var responseOrg = JSON.parse(req.responseText);
          var response = responseOrg.rows;
          console.log(response);
          var table = document.getElementById("tableResult");
          table.parentNode.removeChild(table);
          let result = document.getElementById('results');
          result.appendChild(buildTable("tableResult"));
          showTable(response);
        } else {
          console.log("Error");
        }
      }
      editFcn();
      deleteFcn();
      likeFcn();
    });
    //req.onerror = function(e) {
    //  console.error(req.statusText);
    //};
    req.send(null);
    event.preventDefault();
    var cellContent = '';
    let acronymField = document.getElementById('acronym');
    let termField = document.getElementById('term');
    let definitionField = document.getElementById('definition');
    let searchField = document.getElementById('search');
    acronymField.value = cellContent;
    termField.value = cellContent;
    definitionField.value = cellContent;
    searchField.value = cellContent;
  });
};

function insertSubmit() {
  document.getElementById('insertSubmit').addEventListener('click', function (event) {
    var req = new XMLHttpRequest();
    let acronym = document.getElementById('acronym').value;
    let term = document.getElementById('term').value;
    let definition = document.getElementById('definition').value;
    let ranking = 0;
    if (!acronym || !term || !definition) {
      console.log("Missing an Input.");
    } else {
      req.open('POST', 'https://tomato-dictionary.herokuapp.com/?acronym=' + encodeURIComponent(acronym) + "&term=" + encodeURIComponent(term) + "&definition=" + encodeURIComponent(definition) + "&ranking=" + encodeURIComponent(ranking), true);
      req.addEventListener('load', function () {
        console.log(req);
        if (req.readyState === 4) {
          if (req.status >= 200 & req.status < 400) {
            var responseOrg = JSON.parse(req.responseText);
            console.log(response);
            var response = responseOrg.rows;
            var table = document.getElementById("tableResult");
            console.log(table);
            table.parentNode.removeChild(table);
            let result = document.getElementById('results');
            result.appendChild(buildTable("tableResult"));
            showTable(response);
            editFcn();
            deleteFcn();
            likeFcn();
          } else {
            console.log("Error in network request: " + req.statusText);
          }
        }
      });
      req.send(null);
      event.preventDefault();
    }
    var cellContent = '';
    let acronymField = document.getElementById('acronym');
    let termField = document.getElementById('term');
    let definitionField = document.getElementById('definition');
    let searchField = document.getElementById('search');
    acronymField.value = cellContent;
    termField.value = cellContent;
    definitionField.value = cellContent;
    searchField.value = cellContent;
  });
};

function copyResults() {
  document.getElementById('copyResults').addEventListener('click', function (event) {
    let copyText = document.getElementById("tableResult");
    let copyList = copyText.children;
    console.log(copyText.children);
    let values = [];
    for (i = 1; i < copyList.length; i++) {
      console.log(copyList[i]);
      let copyRow = copyList[i].children;
      for (j = 0; j <= 2; j++) {
        //cleanText = copyRow[j].innerText;
        cleanText = copyRow[j].innerText.replace(/\n\s*\n/g, '\n');
        values.push(cleanText);
      }
    }
    console.log(values);
    let text = document.createElement('textArea');
    document.body.appendChild(text);
    text.value = values.join('\n');
    text.select();
    document.execCommand("copy");
    text.parentNode.removeChild(text);
  });
};

function getRequests() {
  document.getElementById('getRequests').addEventListener('click', function (event) {
    var req = new XMLHttpRequest();
    req.open('GET', 'https://tomato-dictionary.herokuapp.com/requests', true);
    req.addEventListener('load', function () {
      if (req.readyState === 4) {
        if (req.status >= 200 && req.status < 400) {
          var responseOrg = JSON.parse(req.responseText);
          console.log(responseOrg);
          var response = responseOrg.rows;
          console.log(response);
          let result = document.getElementById('requests');
          result.appendChild(buildTable("requestResult"));
          showRequests(response);
        }
      }
    })
    req.send(null);
    event.preventDefault();;
  });
}

function showRequests(response) {
  let table = document.getElementById('requestResult');
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
  let headRow = document.createElement("tr");
  for (let head = 1; head <= 5; head++) {
    let headCell = document.createElement("th");
    switch (head) {
      case 1:
        headContent = "Date";
        break;
      case 2:
        headContent = "User";
        break;
      case 3:
        headContent = "Acronym";
        break;
      case 4:
        headContent = "Term";
        break;
      case 5:
        headContent = "Definition";
        break;
      default:
        break;
    }
    headCell.appendChild(document.createTextNode(headContent));
    headRow.appendChild(headCell);
  }
  table.appendChild(headRow);
  for (let count = 0; count < response.length; count++) {
    let row = document.createElement("tr");
    for (let col = 1; col <= 5; col++) {
      let cell = document.createElement("td");
      switch (col) {
        case 1:
          cellContent = response[count].date;
          break;
        case 2:
          cellContent = response[count].username;
          break;
        case 3:
          cellContent = response[count].acronym;
          break;
        case 4:
          cellContent = response[count].term;
          break;
        case 5:
          cellContent = response[count].definition;
          break;
        default:
          break;
      }
      cell.appendChild(document.createTextNode(cellContent));
      row.appendChild(cell);
    }
    num = count + 1
    value = response[count].id;
    let delButton = buildButton(value, "deleteRequest", "Delete", num, row);
    let addButton = buildButton(value, "add", "Add", num, row)
    //cellContent = reponse[count].ranking;
    table.appendChild(row);
  }
};

function deleteRequest() {
  buttons = document.querySelectorAll('button.deleteRequest');
  buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
      let id = this.id;
      let ind = this.value;
      var req = new XMLHttpRequest();
      req.open('GET', 'https://tomato-dictionary.herokuapp.com/deleteRequests?id=' + id, true);
      req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
          console.log(req);
          var row = document.getElementById(id);
          row.parentNode.parentNode.removeChild(row.parentNode);
        } else {
          console.log("Did Not Delete.")
        }
      });
      req.send(null);
      event.preventDefault();
      searchFcn();
    }, false);
  });
};