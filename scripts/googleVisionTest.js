/* Sends images to an api to be processed and displays the results on the webpage.
  EXTERNAL JS IS CURRENTLY BROKEN ON THE SERVER.
  WRITE CODE IN THIS FILE AND PASTE INTO html.
 */
"use strict";
(function () {
  const DEFAULT_IMG_URL = "omnafield.png"; //Default image for testing.
  const DEFAULT_API_URL = "http://localhost:4536/";
  /*Reads a file from the element converts it to a base64String and returns the result.
  @param {file} file - The file to encode.
  @return {string} - file as a base64String
   */
  function encodeImageFileAsURL(file) {
    let reader = new FileReader();
    reader.onloadend = function (e) {
      document.getElementById("currentImg").src = e.target.result;
      sendImageAsString(reader.result, onLabelDetectionReply);
    }
    reader.readAsDataURL(file);
  }

  function changeImagePreview() {
    let reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("currentImg").src = e.target.result;
    }
    reader.readAsDataURL(document.getElementById("picUpload").files[0]);
  }

  function sendImageAsString(result, onReplyFunction) {
    //let packageForm=new FormData();
    document.getElementById("labelAnnotations").classList.add("hidden");
    let packageBody = {
      mode: "labels",
      image: result
    };
    makeImagePost(onReplyFunction, packageBody);
  }

  /* Makes POST call to the default API and calls the given function using the returned data.
  @param {string} urlSuffix - the string to append to the base api url.
  @param {function} callFunction - the function to call on a properly executed request.
  @param {object} packageBody - The request's body paramter. Will be stringified into JSON. */
  function makeImagePost(callFunction, packageBody) {
    doFetch("vision", callFunction, {
      method: "POST",
      body: JSON.stringify(packageBody)
    });
  }

  /* Preforms a fetch call on the default API and calls the given function when replied to.
  @param {string} urlSuffix - the string to append to the base api link.
  @param {function} callFunction - the function to call on a valid request.
  @param {object} params - The request's parameters. */
  function doFetch(urlSuffix, callFunction, params) {
    console.log(params);
    let allHeaders = new Headers({
      'Content-Length': JSON.stringify(params['body']).length,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      //"content-type":"application/json"
      "Content-Type": "application/json; charset=utf-8",
      "Accept-Encoding": "deflate"
    });
    params.mode = "cors";
    params.headers = allHeaders;
    //params['Content-Length'] = JSON.stringify(params['body']).length.toString();
    fetch(DEFAULT_API_URL + urlSuffix, params)
      .then(checkStatus)
      .then(callFunction)
      .catch(errorMessage);
  }

  /*Tells the user that an error has occured with a fetch request through the console.
  @param {string} statusMessage - The message to display */
  function errorMessage(statusMessage) {
    console.log(statusMessage);
  }

  /* Checks the response status and if valid returns the response.
  If invalid prints an error message to the console.
  @param {object} response - Response from server
  @return {string} - The server's response. */
  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.text();
    } else {
      return Promise.reject(new Error(response.status + ":" + response.statusText));
    }
  }

  function submitImage() {
    let image = document.querySelector('input[type=file]').files[0];
    encodeImageFileAsURL(image);
  }

  function onLabelDetectionReply(str) {
    let jsonData = JSON.parse(str);     //For whatever reason it gets sent a
    console.log(jsonData);
    let outputParagraph = document.getElementById("textOutput");
    let responses=jsonData['responses'];
    console.log(responses);
    let labelAnnotations=responses[0]['labelAnnotations'];
    document.getElementById("labelAnnotations").classList.remove("hidden");

    outputParagraph.innerText = str;

  }

  function toDataURL(src, callback, callbacksCallback) {
    let xhttp = new XMLHttpRequest();

    xhttp.onload = function () {
      let fileReader = new FileReader();
      fileReader.onloadend = function () {
        callback(fileReader.result, callbacksCallback);
      }
      fileReader.readAsDataURL(xhttp.response);
    };

    xhttp.responseType = 'blob';
    xhttp.open('GET', src, true);
    xhttp.send();
  }

  window.onload = function () {
    document.getElementById("defaultImageSubmit").onclick = function () {
      document.getElementById("currentImg").src = DEFAULT_IMG_URL;
      toDataURL(DEFAULT_IMG_URL, sendImageAsString, onLabelDetectionReply);
    }
    document.getElementById("picUpload").onchange = function (e) {
      changeImagePreview();
    }
    let submitButton = document.getElementById("submitButton");
    submitButton.addEventListener("click", function (event) {
      event.preventDefault();
      submitImage();
    });
  }
})();
