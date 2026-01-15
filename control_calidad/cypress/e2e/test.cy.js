describe('El usuario debe poder subir un documento', () => {
  it('passes', () => {
    cy.visit(Cypress.env('qa'))
    cy.get('input[placeholder="tu@email.com"]').type('test@gmail.com')
    cy.contains('div', 'Continuar').click()
    cy.contains('Mis Documentos').should('exist')
    cy.get('input[data-cy="input-pdf"]').attachFile('test.pdf')
    cy.contains('div', 'Subir PDF').click()
  })
})