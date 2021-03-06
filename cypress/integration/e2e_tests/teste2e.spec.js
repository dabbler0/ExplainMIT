describe('Logs in and Visits Tabs', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'ExplainMIT')
    cy.wait(2500)
    // cy.get('#home-page').toMatchImageSnapshot()
  })
  
  it('signs out', () => {
    cy.get('[data-qa="account-btn"]').click()
    cy.contains('@')
    cy.get('[data-qa="sign-out-btn"]').click()
    cy.wait(1000)
  })

  it('logs in', () => {
    cy.get('[data-qa="log-in-btn"]').click()
    cy.get('[data-qa="email"]').type('explainmit@gmail.com')
    cy.get('[data-qa="password"]').type('explain')
    cy.get('[data-qa="Log in"]').click()
    cy.wait(1000)
  })

  it('enters Integration Testing class', () => {
    cy.get('[data-qa="Integration Testing"]').click()
    cy.wait(1000)
  })

  it('lands tutorial', () => {
    cy.contains("Tutorial")
  })

})

describe("Tests New Post", () => {
  it("clicks New Post", () => {
    cy.contains('New Post').click({force:true})
    cy.wait(1000)
  })

  it("Draws on board", () => {
    cy.get("[data-qa='front-canvas']")
      .trigger('mousedown', {offsetX:200, offsetY:100})
      .trigger('mousemove', {offsetX:600, offsetY:300})
      .trigger('mouseup')

    cy.get("[data-qa='orange']").click()

    cy.get("[data-qa='front-canvas']")
      .trigger('mousedown', {offsetX:600, offsetY:300} )
      .trigger('mousemove', {offsetX:800, offsetY:100})
      .trigger('mousemove', {offsetX:800, offsetY:400})
      .trigger('mouseup')

    cy.get("[data-qa='eraser']").click()

    cy.get("[data-qa='front-canvas']")
      .trigger('mousedown', {offsetX:100, offsetY:200} )
      .trigger('mousemove', {offsetX:800, offsetY:200})
      .trigger('mouseup')

    cy.wait(1000)
  })

  function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  var titleString = makeid(5)

  it("enters title and description", () => {
    cy.get("[data-qa='title-field']").type(titleString)
    cy.get("[data-qa='text-editor']").type("Testing new Post")
    cy.wait(1000)
  })

  it('submits post', () => {
    cy.get( "[data-qa='submit-post-btn']").click()
    cy.wait(1000)
  })

  it('visits new post', () => {
    cy.get( "[data-qa='toggle-drawer']").click()
    cy.contains(titleString).click({force: true})
    cy.wait(1000)
  })

  it('checks thumbnail snapshot', () => {
    
    cy.wait(1000)
    cy.get("[data-qa='expl-thumbnail']").toMatchImageSnapshot()
    
    cy.wait(1000)
  })
  
  it('checks video page and plays video', () => {
    cy.get('[data-qa="create-expl"]')
    cy.get("[data-qa='play-btn']").click()
    cy.wait(1000)
  })

  it('checks canvas snapshot', () => {
    cy.get("[data-qa='doodle-canvas']").toMatchImageSnapshot()
    cy.wait(1000)
    // cy.get("[data-qa='delete-post-btn']").click()
    // cy.get("[data-qa='confirm-delete']").click()
  })
    
})

describe("Realtime Board Test", () => {
  it('opens side drawer', () => {
    cy.get( "[data-qa='toggle-drawer']").click()
  })

  it('moves to RT Board', () => {
    cy.get('[data-qa="blackboard-tab"]').click()
    cy.contains("Blackboard 0").click()
    cy.contains("Record Audio")
    cy.contains("Save Board")
    cy.contains("Full Screen")
    cy.url().should('include', '/class/')
    cy.url().should('include', '/room/')
    cy.wait(1000)
  })

  it('resets board', ()=> {
    cy.get("[data-qa='wipe-board']").click()
    cy.get("[data-qa='Reset board']").click()
    cy.contains('Successfully reset blackboard.')
    cy.contains('CLOSE').click()
  })

  it('draws on board', () => {
    cy.get("[data-qa='#ec1bf7']").click()
    cy.get("[data-qa='front-canvas']")
      .trigger('mousedown', {offsetX:250, offsetY:100})
      .trigger('mousemove', {offsetX:260, offsetY:300})
      .trigger('mouseup')

    cy.get("[data-qa='orange']").click()

    cy.get("[data-qa='front-canvas']")
      .trigger('mousedown', {offsetX:260, offsetY:300} )
      .trigger('mousemove', {offsetX:800, offsetY:100})
      .trigger('mousemove', {offsetX:800, offsetY:400})
      .trigger('mouseup')

    cy.get("[data-qa='front-canvas']")
      .trigger('mousedown', {offsetX:100, offsetY:500} )
      .trigger('mousemove', {offsetX:800, offsetY:500})
      .trigger('mouseup')

    cy.wait(1000)
  })

  it('checks RT snapshot', () => {
    cy.get("[data-qa='front-canvas']").toMatchImageSnapshot()
  })

  it('signs out', () => {
    cy.get('[data-qa="account-btn"]').click()
    cy.contains('@')
    cy.get('[data-qa="sign-out-btn"]').click()
    cy.wait(1000)
  })

  it('logs in with new user', () => {
    cy.get('[data-qa="log-in-btn"]').click()
    cy.get('[data-qa="email"]').type('it@g.com')
    cy.get('[data-qa="password"]').type('testing')
    cy.get('[data-qa="Log in"]').click()
    cy.wait(1000)
  })

  it('closes snackbar', () => {
    cy.contains("Welcome to ExplainMIT!")
    cy.contains("CLOSE").click()
    cy.wait(1000)
  })

  it('checks RT snapshot with new user', () => {
    cy.get("[data-qa='front-canvas']").toMatchImageSnapshot()
  })

  it('erases line', () => {
    cy.get("[data-qa='eraser']").click()
    cy.get("[data-qa='front-canvas']")
      .trigger('mousedown', {offsetX:800, offsetY:100})
      .trigger('mousemove', {offsetX:800, offsetY:400})
      .trigger('mouseup')
  })

  it('signs out', () => {
    cy.get('[data-qa="account-btn"]').click()
    cy.contains('@')
    cy.get('[data-qa="sign-out-btn"]').click()
    cy.wait(1000)
  })

  it('logs in', () => {
    cy.get('[data-qa="log-in-btn"]').click()
    cy.get('[data-qa="email"]').type('explainmit@gmail.com')
    cy.get('[data-qa="password"]').type('explain')
    cy.get('[data-qa="Log in"]').click()
    cy.wait(1000)
  })

  it('closes snackbar', () => {
    cy.contains("Welcome to ExplainMIT!")
    cy.contains("CLOSE").click()
    cy.wait(1000)
  })

  it('checks RT erase snapshot with explain', () => {
    cy.get("[data-qa='front-canvas']").toMatchImageSnapshot()
  })

})




// it("Uses URL to go back to Q&A", () => {
      //   cy.url().then((url) => { 
      //     cy.task('cutURL', { original: url, cutStart: 'room'})
      //     .then( (url) => {
      //       cy.visit(url)
      //       cy.wait(1000)
      //       cy.contains("Tutorial")
      //     }) 
      //   })
      // })