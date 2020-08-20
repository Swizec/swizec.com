const fetch = require("isomorphic-fetch")
const { v4: uuidv4 } = require("uuid")

const regex = /^https:\/\/www\.youtube\.com\/watch\?v=(\S+)$/

async function getThumbnail(targetUrl) {
  const url = `https://pifc233qp6.execute-api.us-east-1.amazonaws.com/dev/embed?url=${targetUrl}`

  const res = await fetch(url).then((res) => res.json())

  return res.url
}

const getHTML = async (url) => {
  const videoId = url.trim().match(regex)[1]
  const domId = uuidv4()

  const newUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
  const imageUrl = await getThumbnail(url)

  return `<img src="${imageUrl}" id="${domId}" data-embed-url="${newUrl}" data-embed-type="youtube" />`

  //   return `<div className="youtube-embed" id="${domId}">
  //             <iframe title="Youtube embed" width="100%" height="100%" src="${newUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
  //         </div>`
}

const name = "YouTube"

const shouldTransform = (url) => regex.test(url)

module.exports = { getHTML, name, shouldTransform }
