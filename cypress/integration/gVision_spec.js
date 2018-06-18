/*
  Validates a application that uses the google vision API to detect things.
*/
const DEFAULT_IMG_URL = "omnafield.png"; //Default image for testing.

describe('Basic Reddit', function () {
  it('Check the default image button', function () {
    cy.server()
    cy.visit("http://localhost:4536/")
    cy.route('GET','/omnafield.png').as('defaultImgRoute')       //aliased as @visionRoute
    cy.route('POST','/vision').as('visionEndpoint')       //aliased as @visionRoute

    cy.contains("button","defaultImage").click()
    cy.wait('@defaultImgRoute').then(function(xhr){
      //cy.log(str)
      return xhr.url
      /*XHR documentation is a little bit sparse.
      All xhr properties are displayed below.
      xhr,id,url,method,status,statusMessage,request,response,duration,_getXhr,
      _setDuration,_setStatus,_setRequestBody,_setResponseBody,_setResponseHeaders,
      _getFixtureError,_setRequestHeader,setRequestHeader,getResponseHeader,getAllResponseHeaders,
    */
  }).should(($p)=>{
    //We're asserting that the xhr url gained from the then() equals the omnafield.png string
    cy.log($p)
    expect($p).to.deep.eq("http://localhost:4536/"+DEFAULT_IMG_URL)
  })/*.wait('@visionEndpoint').get("#currentImg").should('have.attr','src',DEFAULT_IMG_URL)
    cy.get("#labelAnnotations").should('be.visible')
    cy.get("#labelAnnotations span").contains(/.+/)*/
  })
  it("Submit button displays error when no file is selected", function () {
    cy.get("#submitButton").click()
    cy.get("#textOutput").contains("Error")
  })
})
