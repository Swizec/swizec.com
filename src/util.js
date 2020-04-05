export function currentLocation({ location }) {
  if (typeof window !== "undefined") {
    return window.location.pathname
  } else if (location) {
    return location.pathname
  } else {
    return null
  }
}

export function isWorkshopPage({ location }) {
  return currentLocation({ location }).includes("workshop")
}

// candidate for useAuth feature
export function isAuthorized(user) {
  return user["https://serverlessreact.dev/user_metadata"].roles.includes(
    "Student"
  )
}
