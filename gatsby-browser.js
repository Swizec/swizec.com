export { wrapPageElement } from "./src"

function addJS(jsCode) {
  var s = document.createElement(`script`)

  s.type = `text/javascript`
  s.innerText = jsCode
  document.getElementsByTagName(`head`)[0].appendChild(s)
}

export const onRouteUpdate = () => {
  if (document.querySelector("[data-embed-url]")) {
    addJS(`
for (let embed of document.querySelectorAll('[data-embed-url]')) {
    embed.addEventListener('click', (event) => {
        const embed = event.currentTarget;

        const type = embed.dataset.embedType;
        const url = embed.dataset.embedUrl;
        const dimensions = embed.getBoundingClientRect();

        if (type === 'youtube') {
            const el = document.createElement('p');

            el.innerHTML = '<iframe title="Youtube embed" width="'+dimensions.width+'px" height="'+dimensions.height+'px" src="'+url+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>';

            embed.replaceWith(el);
        }
    })
}
        `)
  }
}
