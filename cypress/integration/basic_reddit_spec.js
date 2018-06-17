describe('Basic Reddit', function () {
  it('Checks sorting button visibility', function () {
    cy.visit('www.old.reddit.com/r/worldnews')
    // Css may uppercase the first letter.
    cy.contains('a.choice', 'hot').should("be.visible")
    cy.contains('a.choice', 'new').should("be.visible")
    cy.contains('a.choice', 'rising').should("be.visible")
    cy.contains('a.choice', 'controversial').should("be.visible")
    cy.contains('a.choice', 'top').should("be.visible")
    cy.contains('a.choice', 'gilded').should("be.visible")
  })
  it('Checks the search', function () {
    cy.visit('www.old.reddit.com')
    // Css may uppercase the first letter.
    cy.contains('a', 'all').click()
    cy.url().should('include', 'old.reddit.com/r/all')
    cy.get('input[placeholder=search]').type('puppies').should('have.value', 'puppies')
    cy.get('input[placeholder=search]').type('{enter}')
    cy.contains('search')
  })

})
