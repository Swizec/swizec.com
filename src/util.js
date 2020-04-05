export function currentLocation({ location }) {
  if (typeof window !== "undefined") {
    return window.location.pathname
  } else if (location) {
    return location.pathname
  } else {
    return null
  }
}
