describe("test query yycf", () => {
  it("passes", () => {
    cy.visit("/");
    cy.get(".query").type("yycf");
    cy.get(".container").should("include.text", "yycf");
  });
});
