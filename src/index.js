import React from "react"
import { navigate } from "gatsby"
import { AuthProvider } from "react-use-auth"
import Layout from "./components/layout"

export { default as Layout } from "./components/layout"
export * from "./components/blocks"
export { default as DemoProvider } from "./components/demo-provider"
export { default as Note } from "./components/note"
export { default as RecipeCard } from "./components/recipe-card"

export const wrapPageElement = ({ element, props }) => (
  <AuthProvider
    navigate={navigate}
    auth0_domain="serverlessreactcourse.auth0.com"
    auth0_client_id="pCO5jInBC1g4aCAtEfJNL6uftWSw40un"
    auth0_params={{
      scope: "openid profile email user_metadata",
    }}
  >
    <Layout {...props}>{element}</Layout>
  </AuthProvider>
)
