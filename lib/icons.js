const fs = require('fs');
const path = require('path');
const HTMLParser = require('node-html-parser');
const { optimize } = require('svgo');

const svgoConfig = {
    plugins: [
        'inlineStyles',
        'cleanupAttrs',
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeTitle',
        'removeDesc',
        'removeUselessDefs',
        'removeEditorsNSData',
        'removeEmptyAttrs',
        'removeHiddenElems',
        'removeEmptyText',
        'removeEmptyContainers',
        'cleanupEnableBackground',
        'convertStyleToAttrs',
        'convertColors',
        'convertPathData',
        'convertTransform',
        'removeUnknownsAndDefaults',
        'removeNonInheritableGroupAttrs',
        'removeUselessStrokeAndFill',
        'removeUnusedNS',
        'cleanupIDs',
        'cleanupNumericValues',
        'moveElemsAttrsToGroup',
        'moveGroupAttrsToElems',
        'collapseGroups',
        'removeRasterImages',
        'mergePaths',
        'convertShapeToPath',
        'sortAttrs',
        'removeStyleElement',
    ]
};

const iconsDirectory = path.join(process.cwd(), 'icons');

export function getIcons() {

    const iconData = {};
    const iconFiles = fs.readdirSync(iconsDirectory);
    iconFiles.forEach((fileName) => {
        const stringData = fs.readFileSync(path.join(iconsDirectory, fileName), 'utf8');
        const name = path.parse(fileName).name;
        const result = optimize(stringData, svgoConfig);
        const data = HTMLParser.parse(result.data);
        const pathEl = data.querySelector('path');
        if (pathEl) {
            const d = pathEl.attributes.d;
            if (d) {
                iconData[name] = d;
                return;
            }
        }
        throw (new Error(`Icon ${name} is corrrupted.`));
    });
    return iconData;
}