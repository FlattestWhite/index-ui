/// <reference types="cypress" />

describe('ETH2x-FLI', () => {
  before(() => {
    cy.visit('http://localhost:3000/ethfli')
  })

  context('Product Header', () => {
    it('should show product symbol', () => {
      cy.get('[data-cy=token-symbol]').should('contain', 'ETH2x-FLI')
    })
    it('should show product name', () => {
      cy.get('[data-cy=token-name]').should(
        'contain',
        'Ethereum 2x Flexible Leverage Index'
      )
    })
    it('should show product price', () => {
      cy.get('.sc-jhDJEt').should('not.be.empty')
    })
    it('should show product percent change', () => {
      cy.get('.sc-jhDJEt').should('not.be.empty')
    })
  })

  context('Product Metadata', () => {
    it('should show real leverage', () => {
      cy.get('[data-cy=real-leverage-label').should('contain', 'Real Leverage')
      cy.get('[data-cy=real-leverage-value]').should('contain', 'x')
    })
    it('should show target leverage', () => {
      cy.get('[data-cy=target-leverage-label]').should('contain', 'Target Leverage')
      cy.get('[data-cy=target-leverage-value]').should('contain', '2x')
    })
    it('should show current supply', () => {
      cy.get('[data-cy=current-supply-label]').should('contain', 'Current Supply')
      cy.get('[data-cy=current-supply-value]').should('not.be.empty')
    })
    it('should show NAV', () => {
      cy.get('[data-cy=net-asset-value-label]').should('contain', 'Net Asset Value')
      cy.get('[data-cy=net-asset-value-value]').should('not.be.empty')
    })
    it('should show prem/discount', () => {
      cy.get(':nth-child(5) > .sc-hndLF').should('not.be.empty')
      cy.get(':nth-child(5) > .sc-geBCVM').should('not.be.empty')
    })
  })

  context('Product Market Data', () => {
    it('should render chart', () => {
      cy.get('.recharts-surface').should('not.be.empty')
    })
    it('should have all date range selectors', () => {
      // 5 date range selectors and 4 spacers between. 5 + 4 = 9
      cy.get('[data-cy=date-range-selector]').children().should('have.length', 9)
    })
  })

  context('Buy/Sell Widget', () => {
    it('should render', () => {
      cy.get('[data-cy=buy-sell-selector]').should('contain', 'Buy')
      cy.get('[data-cy=buy-sell-selector]').should('contain', 'Sell')
      cy.get('[data-cy=buy-sell-selector]').should('contain', 'Pay with')
      cy.get('[data-cy=buy-sell-selector]').should('contain', 'Buy (estimated)')
    })
  })

  context('Product Stats', () => {
    it('should have a title', () => {
      cy.get('[data-cy=stats]').should('contain', 'Stats')
    })

    it('should render values', () => {
      cy.get(':nth-child(1) > .sc-liAPKD').should('not.be.empty')
      cy.get(':nth-child(1) > .sc-fiCYzP').should('not.be.empty')
      cy.get(':nth-child(2) > .sc-hfVBHA').should('not.be.empty')
      cy.get(':nth-child(2) > .sc-fiCYzP').should('not.be.empty')
      cy.get(':nth-child(3) > .sc-hfVBHA').should('not.be.empty')
      cy.get(':nth-child(3) > .sc-fiCYzP').should('not.be.empty')
      cy.get(':nth-child(4) > .sc-hfVBHA').should('not.be.empty')
      cy.get(':nth-child(4) > .sc-fiCYzP').should('not.be.empty')
      cy.get(':nth-child(5) > .sc-hfVBHA').should('not.be.empty')
      cy.get(':nth-child(5) > .sc-fiCYzP').should('not.be.empty')
    })
  })

  context('My Assets', () => {
    it('should have a title', () => {
      cy.get('[data-cy=my-assets]').should('contain', 'My Assets')
    })

    it('should render values', () => {
      cy.get('[data-cy=my-assets-token-balance]').should('not.be.empty')
      cy.get('[data-cy=my-assets-token-balance]').should('contain', 'ETH2x-FLI')
    })

    it('should contain MetaMask button', () => {
      cy.get('.sc-kJNqyW').should('not.be.empty')
    })
  })

  context('Product Changes', () => {
    it('should have a title', () => {
      cy.get('[data-cy=changes]').should('contain', 'Changes')
    })

    it('should render values', () => {
      cy.get(':nth-child(1) > .sc-bTJQgd').should('not.be.empty')
      cy.get(':nth-child(1) > .sc-hQYpqk').should('not.be.empty')
      cy.get(':nth-child(2) > .sc-bTJQgd').should('not.be.empty')
      cy.get(':nth-child(2) > .sc-hQYpqk').should('not.be.empty')
      cy.get(':nth-child(3) > .sc-bTJQgd').should('not.be.empty')
      cy.get(':nth-child(3) > .sc-hQYpqk').should('not.be.empty')
      cy.get(':nth-child(4) > .sc-bTJQgd').should('not.be.empty')
      cy.get(':nth-child(4) > .sc-hQYpqk').should('not.be.empty')
    })
  })

  context('Product Allocations', () => {
    it('should have a title', () => {
      cy.get('[data-cy=allocations]').should('contain', 'Allocations')
    })

    it('should render allocations', () => {
      cy.get('.sc-jVSGNQ > :nth-child(2) > .sc-QxirK').should('not.be.empty')
      cy.get(':nth-child(3) > .sc-QxirK').should('not.be.empty')
      cy.get(':nth-child(4) > .sc-QxirK').should('not.be.empty')
      cy.get('.sc-jVSGNQ > :nth-child(5)').should('not.be.empty')
      cy.get('.sc-jVSGNQ > :nth-child(6)').should('not.be.empty')
    })
  })

  context('Product Content', () => {
    it('should not be empty', () => {
      cy.get('.sc-gVtoEh > :nth-child(5)').should('not.be.empty')
    })
  })

  context('Footer Links', () => {
    it('should contain all links', () => {
      cy.get('[data-cy=footer-links]').children().should('have.length', 4)
    })
  })
})
