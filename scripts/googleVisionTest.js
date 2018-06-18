/* Sends images to an api to be processed and displays the results on the webpage.
 */
"use strict";
(function () {
  const API_CALLBACKS = {
    "Labels": {
      mode: "labels",
      callback: onLabelDetectionReply
    },
    "Text Detection": {
      mode: "TEXT_DETECTION",
      callback: onTextDetectionReply
    }
  };

  const DEFAULT_IMG_URL = "omnafield.png"; //Default image url for testing.
  const DEFAULT_API_URL = "http://localhost:4536/";

  function onTextDetectionReply(jsonStr) {
    let jsonData = jsonStr;
    document.getElementById("jsonStringOutput").innerHTML = JSON.stringify(
      jsonData, undefined, 2);
  }
  /** Reads a file from the element converts it to a base64String and returns the result.
  @param {file} file - The file to encode.
  @return {string} - file as a base64String
   */
  function encodeImageFileAsURL(file) {
    let reader = new FileReader();
    reader.onloadend = function (e) {
      document.getElementById("currentImg").src = e.target.result;
      sendImageAsString(reader.result);
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

  /** Sends a image to the api to be processed.
  @param {string} result- base64 encoded string of the image.
  @param {function} onReplyFunction- Callback when replied to successfully.
  @param {string} apiMode- vision call mode.
  */
  function sendImageAsString(result) {
    let modeName = document.getElementById("modeSelect").value;
    let onReplyFunction = API_CALLBACKS[modeName].callback;
    document.getElementById("labelAnnotations").classList.add("hidden");
    document.getElementById("textOutput").innerText = "Loading";
    let packageBody = {
      mode: API_CALLBACKS[modeName].mode,
      image: result
    };
    makeImagePost(onReplyFunction, packageBody);
  }

  /** Makes POST call to the default API and calls the given function using the returned data.
  @param {function} callFunction - the function to call on a properly executed request.
  @param {object} packageBody - The request's body paramter. Will be stringified into JSON. */
  function makeImagePost(callFunction, packageBody) {
    doFetch("vision", callFunction, {
      method: "POST",
      body: JSON.stringify(packageBody)
    });
  }

  /** Preforms a fetch call on the default API and calls the given function when replied to.
  @param {string} urlSuffix - the string to append to the base api link.
  @param {function} callFunction - the function to call on a valid request.
  @param {object} params - The request's parameters. */
  function doFetch(urlSuffix, callFunction, params) {
    console.log(params);
    let allHeaders = new Headers({
      'Content-Length': JSON.stringify(params['body']).length,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json; charset=utf-8",
      "Accept-Encoding": "deflate"
    });
    params.mode = "cors";
    params.headers = allHeaders;
    fetch(DEFAULT_API_URL + urlSuffix, params)
      .then(checkStatus)
      .then(callFunction)
      .catch(onCatchError)
  }
  /** Resets loading messages when a query is finished
   */
  function onVisionRequestLoaded() {
    document.getElementById("textOutput").innerText = "Results";
  }
  /**Resets loading messages and displays an error message.*/
  function onCatchError(statusMessage) {
    onVisionRequestLoaded();
    errorMessage(statusMessage);
  }

  /**Tells the user that an error has occured with a fetch request.
  @param {string} statusMessage - The message to display */
  function errorMessage(statusMessage) {
    console.log(statusMessage);
    document.getElementById("textOutput").innerText = "Error: " + statusMessage;
  }

  /** Checks the response status and if valid returns the response.
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

  /** Submits the currently selected image to the api if it exists.
   */
  function submitImage() {
    let image = document.querySelector('input[type=file]').files[0];
    if (image) {
      encodeImageFileAsURL(image);
    } else {
      errorMessage("No Selected File");
    }
  }

  /**Prints the results of a label detection fetch to the output.
    Reveals the output.
    @param {string} str-unparsed json string of the response from the api.
   */
  function onLabelDetectionReply(str) {
    let jsonData = JSON.parse(str);
    let outputParagraph = document.getElementById("textOutput");
    let responses = jsonData['responses'];
    let labelAnnotations = responses[0]['labelAnnotations'][0];
    document.getElementById("labelAnnotations").classList.remove("hidden");
    document.getElementById("description").innerText = labelAnnotations[
      'description'];
    document.getElementById("mid").innerText = labelAnnotations['mid'];
    document.getElementById("score").innerText = labelAnnotations['score'];
    document.getElementById("topicality").innerText = labelAnnotations[
      'topicality'];
    //outputParagraph.innerText = str;

  }

  /** Converts a local url to a base64string and submits it as a parameter to a callback.
  @param {string} src-url of image, must be local.
  @param {function} callback-function to call onloadend.
  */
  function toDataURL(src, callback) {
    let xhttp = new XMLHttpRequest();

    xhttp.onload = function () {
      let fileReader = new FileReader();
      fileReader.onloadend = function () {
        callback(fileReader.result);
      }
      fileReader.readAsDataURL(xhttp.response);
    };

    xhttp.responseType = 'blob';
    xhttp.open('GET', src, true);
    xhttp.send();
  }
  /**Reads the url from #urlInput, checks for validity and submits the image.
  WARNING ONLY WORKS FOR LOCAL URLS AT THE MOMENT, NEEDS FIXING.
  */
  function submitURL() {
    let urlInput = document.getElementById("urlInput");
    let url = urlInput.value;
    let urlRegex = /^.+\.(png|jpg)$/;
    let regexResults = url.match(urlRegex);
    if (regexResults.length == 1) {
      toDataURL(url, sendImageAsString);
    } else {
      urlInput.value = "";
      errorMessage("Invalid URL " + regexResults);
    }
  }
  /** On load sets onclick handlers and onchange handlers.
   */
  window.onload = function () {
    document.getElementById("defaultImageSubmit").onclick = function () {
      document.getElementById("currentImg").src = DEFAULT_IMG_URL;
      toDataURL(DEFAULT_IMG_URL, sendImageAsString);
    }
    document.getElementById("picUpload").onchange = function (e) {
      changeImagePreview();
    }
    let submitButton = document.getElementById("submitButton");
    submitButton.addEventListener("click", function (event) {
      event.preventDefault();
      submitImage();
    });
    document.getElementById("urlSubmitButton").onclick = submitURL;
    let modeSelect = document.querySelector("#modeSelect");
    modeSelect.innerHTML = "";
    for (let key in API_CALLBACKS) {
      let newOption = document.createElement("option");
      newOption.innerText = key;
      modeSelect.appendChild(newOption);
    }
  }
})();
