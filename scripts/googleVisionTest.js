/* Sends images to an api to be processed and displays the results on the webpage.
 */
"use strict";
(function () {
  const DEFAULT_IMG_URL = "omnafield.png"; //Default image for testing.
  const DEFAULT_API_URL = "http://localhost:4536/";

  /** Reads a file from the element converts it to a base64String and returns the result.
  @param {file} file - The file to encode.
  @return {string} - file as a base64String
   */
  function encodeImageFileAsURL(file) {
    let reader = new FileReader();
    reader.onloadend = function (e) {
      document.getElementById("currentImg").src = e.target.result;
      sendImageAsString(reader.result, onLabelDetectionReply, "labels");
    }
    reader.readAsDataURL(file);
  }

  /** Changes the preview image to the file loaded in the file select input.
  */
  function changeImagePreview() {
    let reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("currentImg").src = e.target.result;
    }
    reader.readAsDataURL(document.getElementById("picUpload").files[0]);
  }

  /**
  */
  function sendImageAsString(result, onReplyFunction, apiMode) {
    document.getElementById("labelAnnotations").classList.add("hidden");
    document.getElementById("textOutput").innerText="Loading";
    let packageBody = {
      mode: apiMode,
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
      .catch(onCatchError)
  }
  /* Resets loading messages when a query is finished
  */
  function onVisionRequestLoaded(){
    document.getElementById("textOutput").innerText="Results";
  }
  function onCatchError(statusMessage){
    onVisionRequestLoaded();
    errorMessage(statusMessage);
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
    onVisionRequestLoaded();
    //console.log(response.text());
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
    console.log(str);
    let jsonData = JSON.parse(str);
    console.log(jsonData);
    let outputParagraph = document.getElementById("textOutput");
    let responses=jsonData['responses'];
    console.log(responses);
    let labelAnnotations=responses[0]['labelAnnotations'][0];
    document.getElementById("labelAnnotations").classList.remove("hidden");
    document.getElementById("description").innerText=labelAnnotations['description'];
    document.getElementById("mid").innerText=labelAnnotations['mid'];
    document.getElementById("score").innerText=labelAnnotations['score'];
    document.getElementById("topicality").innerText=labelAnnotations['topicality'];
    //outputParagraph.innerText = str;

  }

  function toDataURL(src, callback, callbacksCallback, apiMode) {
    let xhttp = new XMLHttpRequest();

    xhttp.onload = function () {
      let fileReader = new FileReader();
      fileReader.onloadend = function () {
        callback(fileReader.result, callbacksCallback, apiMode);
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
      toDataURL(DEFAULT_IMG_URL, sendImageAsString, onLabelDetectionReply, "labels");
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
