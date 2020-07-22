const fsExtra = require('fs-extra');
const path = require('path');
const { read } = require('to-vfile')
const remark = require('remark');
const mdx = require('remark-mdx');
const visit = require('unist-util-visit')
const https = require('https');
const http = require('http');
var mime = require('mime-types');
const slugify = require('slugify');
const glob = require('glob');


const articlesPath = './src/pages/blog';

glob(articlesPath + '/*/*.mdx', {}, (err, files) => {
    files.forEach( async (file) => {

        const parentDirectory = path.dirname(file);

        const mdxFile = await read(file)
        //I process the file to get the AST
        await remark()
            .use(mdx)
            .use(() => tree => {
                 //I visit the AST to find images, searching for remote images
                visit(tree, ['image'], async (node) => {
                    // I check if it starts with either http or https
                    if (node.url && node.url.startsWith('http')) {
                        const title = node.title || node.alt || node.url.slice(node.url.length - 10);
                        const slugTitle = slugify(title, {remove: /[*+~.()'"!?:@,]/g});

                        const imagesPath = path.join(parentDirectory, 'img');
                        const destFileWithoutExtension = path.join(imagesPath, slugTitle);

                        try {
                            await fsExtra.ensureDir(imagesPath);
                            downloadFile(node.url, destFileWithoutExtension)
                                .then(fileInfo => console.log(`Image ${slugTitle}.${fileInfo.extension} downloaded in ${imagesPath}`))
                                .catch(err => console.error(`Error downloading image in ${imagesPath} from ${node.url}`, err));

                          } catch (e) {
                            console.error(e)
                          }


                    }
                })
            })
            .process(mdxFile)
    });
})


function downloadFile (url, filePath) {
    const proto = !url.charAt(4).localeCompare('s') ? https : http;
  
    return new Promise(function(resolve, reject) {
        try {
            
            proto.get(url, function (response) {
                if (response.statusCode !== 200) reject(new Error('HTTP error ' + response.statusCode));
               
                const ext = mime.extension(response.headers['content-type'])
                const fileInfo = {
                    mime: response.headers['content-type'],
                    extension: ext,
                    size: parseInt(response.headers['content-length'], 10),
                };
                const stream = fsExtra.createWriteStream(`${filePath}.${ext}`);
                response.pipe(stream);
                stream.on('finish', function() {
                stream.end();
                resolve(fileInfo);
                });
            }).on('error', function(e) {
                reject(e);
                // console.error(`Error downloading image from ${url}`);
            })
        } catch (e) {
            console.log("EXCFETPION???", url)
            return reject(e);
        }
    });
  };

