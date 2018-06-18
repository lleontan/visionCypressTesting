describe('Basic Reddit', function () {
  it('Check reddit commenting', function () {
    cy.visit("www.old.reddit.com/r/worldnews/")
  //  cy.route('GET','/omnafield.png').as('commentSectionGet')       //alias
    cy.get("a.bylink.comments.may-blank").then((linksElements) => {
      return linksElements.first();
    }).click()
    cy.url().should('include', 'old.reddit.com/r/worldnews/comments/')
  })
  it('Check sorting button visibility', function () {
    cy.visit('www.old.reddit.com/r/worldnews')
    // Css may uppercase the first letter.
    cy.contains('a.choice', 'hot').should("be.visible")
    cy.contains('a.choice', 'new').should("be.visible")
    cy.contains('a.choice', 'rising').should("be.visible")
    cy.contains('a.choice', 'controversial').should("be.visible")
    cy.contains('a.choice', 'top').should("be.visible")
    cy.contains('a.choice', 'gilded').should("be.visible")
  })
  it('Check the search', function () {
    cy.visit('www.old.reddit.com')
    // Css may uppercase the first letter.
    cy.contains('a', 'all').click()
    cy.url().should('include', 'old.reddit.com/r/all')
    cy.get('input[placeholder=search]').type('puppies').should('have.value',
      'puppies')
    cy.get('input[placeholder=search]').type('{enter}')
    cy.contains('search')
  })

})
