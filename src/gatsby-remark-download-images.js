const visit = require('unist-util-visit')
const path = require("path");
const url = require('url');
const https = require('https');
const http = require('http');
var fs = require('fs');

module.exports = async ({ markdownNode, markdownAST, getNode }) => {
    
    const frontmatter = markdownNode.frontmatter;
    if (
        frontmatter &&
        frontmatter.hero &&
        frontmatter.title &&
        frontmatter.title.includes("aaAAaa"))
    {
            console.log(`==========================${frontmatter.title}====================`);

            // console.log("markdownAST", markdownAST);
            const dir = getNode(markdownNode.parent).dir;
            
            visit(markdownAST, "paragraph", async (node) => {
                //Check if node type is link
                if (node.children.some( x => x.type === 'image')) {
                    
                    const destinationFolder = path.join(dir, 'img', 'prova.jpg');


                    const imageNode = node.children.find(x => x.type === 'image');
                    console.log("imageNode", imageNode)
                    console.log("url", imageNode.url)

                    await download(imageNode.url, destinationFolder);
                    node.type = 'html';
                }
            })

            console.log(`==========================/${frontmatter.title}====================`);

    }
    return markdownAST;
}

async function download(url, filePath) {
    const proto = !url.charAt(4).localeCompare('s') ? https : http;
  
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      const fileInfo = null;
  
      const request = proto.get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          return;
        }
  
        fileInfo = {
          mime: response.headers['content-type'],
          size: parseInt(response.headers['content-length'], 10),
        };
  
        response.pipe(file);
      });
  
      // The destination stream is ended by the time it's called
      file.on('finish', () => resolve(fileInfo));
  
      request.on('error', err => {
        fs.unlink(filePath, () => reject(err));
      });
  
      file.on('error', err => {
        fs.unlink(filePath, () => reject(err));
      });
  
      request.end();
    });
  }

/* 
    TARGET IMAGE

 {
      type: 'html',
      title: null,
      url: './img/multimedia-archive-03167-Only-Fools-and-Hor_3167098b.jpg',
      alt: null,
      position: [Position],


*/