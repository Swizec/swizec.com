const { v4: uuidv4 } = require("uuid")

const regex = /^https:\/\/www\.youtube\.com\/watch\?v=(\S+)$/

const getHTML = (url) => {
  const videoId = url.trim().match(regex)[1]
  const domId = uuidv4()

  const newUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`

  return `<div>
        <div className="youtube-embed" id="${domId}">
        </div>
        <script>
            const observer = new IntersectionObserver(
                ([entry]) => {
                    console.log("IN VIEW", entry);
                    document.getElementById("${domId}").innerHTML = '<iframe title="Youtube embed" width="100%" height="100%" src="${newUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>';
                },
                {
                    root: null,
                    rootMargin: '0px',
                    threshold: 1
                }
            )
            observer.observe(document.getElementById("${domId}"))
        </script>
    </div>`
}

const name = "YouTube"

const shouldTransform = (url) => regex.test(url)

module.exports = { getHTML, name, shouldTransform }
