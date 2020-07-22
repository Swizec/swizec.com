const visit = require('unist-util-visit')
const visitWithParents = require(`unist-util-visit-parents`)
const path = require("path");
const url = require('url');
const fs = require('fs');
const fsExtra = require("fs-extra")
const slugify = require('slugify')
var mime = require('mime-types');

module.exports = async ({ markdownNode, markdownAST, getNode }) => {
    
    const frontmatter = markdownNode.frontmatter;
    if (
        frontmatter &&
        frontmatter.title)
    {
            const dir = getNode(markdownNode.parent).dir;
            const imagePath = path.join(dir, 'img');
            
            let remoteImages = [];

            visit(markdownAST, [`image`], (node) => {
              // I search for all the remote images in the mdx
              if (node.url.startsWith('http')) {
                remoteImages.push(node);
              }
            })

            return Promise.all(
              remoteImages.map( ( node ) => {
                return new Promise( async function(resolve, reject) {

                  const title = node.title || node.alt || node.url.slice(node.url.length - 10);
                  const slugTitle = slugify(title, {remove: /[*+~.()'"!?:@,]/g});

                  //I search img folder with slugtitle to find the file extension
                  const files = await fsExtra.readdir(imagePath);
                  const image = files.find(x => x.includes(slugTitle));
                  if (!image) {
                    console.error(`Cannot find local image for ${node.url} in file ${dir}`);
                    reject();
                  } else {
                    node.url = `./img/${slugTitle}${path.extname(image)}`;
                    resolve();
                  }
                })
              }) 
            ).then(() =>{ return markdownAST });
    }

    return markdownAST;
}