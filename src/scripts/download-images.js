const fsExtra = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { read, write } = require('to-vfile')
const remark = require('remark');
const mdx = require('remark-mdx');
const visit = require('unist-util-visit')
const https = require('https');
const http = require('http');
var mime = require('mime-types');
const slugify = require('slugify');
const glob = require('glob');


const articlesPath = './src/pages/blog';

const ACCEPTED_FILES = ['jpg', 'jpeg', 'png', 'gif', 'svg'];

glob(articlesPath + '/*/*.mdx', {}, (err, files) => {
    files.forEach( async (file) => {
        const parentDirectory = path.dirname(file);
        
        const mdxFile = await read(file)
        
        //I process the file to get the AST
        const contents = await remark()
            .use(mdx)
            .use(() => async tree => {
                
                let nodes = [];

                    visit(tree, ['image'], async (node) => {
                        if (node.url && node.url.startsWith('http')) {
                            nodes.push(node);
                        }
                    })

                    await Promise.all(
                        nodes.map(async function (node) {
                            const title = node.title || node.alt || node.url.slice(node.url.length - 10);
                            const slugTitle = slugify(title, {remove: /[*+~.()'"!?/:@,]/g});
        
                            const imagesPath = path.join(parentDirectory, 'img');
                            const destFileWithoutExtension = path.join(imagesPath, slugTitle);
        
                            try {
                                await fsExtra.ensureDir(imagesPath);
                                await downloadFile(node.url, destFileWithoutExtension)
                                .then(fileInfo => {
                                        console.log(`Image ${slugTitle}.${fileInfo.extension} downloaded in ${imagesPath}`);
                                        node.url = `./img/${slugTitle}.${fileInfo.extension}`;
                                    }) 
                                    .catch(err => console.log(`${chalk.red('Error downloading image')} in ${imagesPath} from ${node.url}: `, err));
                            } catch (e) {
                                console.log(`${chalk.red('Error downloading image')} in ${imagesPath} from ${node.url}: `, e);
                            }
                        })
                    )
                })
            .process(mdxFile);

        await write({
            path: file,
            contents
        })
    });
})


function downloadFile (url, filePath) {
    const proto = !url.charAt(4).localeCompare('s') ? https : http;
  
    return new Promise(function(resolve, reject) {
        try {
            
            proto.get(url, function (response) {
                if (response.statusCode !== 200) return reject(new Error('HTTP error ' + response.statusCode));
               
                const ext = mime.extension(response.headers['content-type'])
                if (!ACCEPTED_FILES.includes(ext)) {
                    return new Error(`Format ${ext} not allowed`);
                }

                const fileInfo = {
                    mime: response.headers['content-type'],
                    extension: ext,
                    size: parseInt(response.headers['content-length'], 10),
                };
                const stream = fsExtra.createWriteStream(`${filePath}.${ext}`);
                response.pipe(stream);
                stream.on('finish', function() {
                    stream.end();
                    return resolve(fileInfo);
                });

            }).on('error', function(e) {
                return reject(new Error(e));
            })
        } catch (e) {
            return reject(new Error(e));
        }
    });
  };

