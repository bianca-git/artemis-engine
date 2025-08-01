// Commented out as we're generating Portable Text directly in the API
// This can be used later if needed for HTML to Portable Text conversion

/*
import { JSDOM } from 'jsdom';
import { htmlToBlocks } from '@portabletext/block-tools';

// You must define your blockContentSchema according to your Portable Text setup
import blockContentSchema from './blockContentSchema'; // <-- Adjust path as needed

export async function htmlToBlockContent(html: string) {
    const blocks = htmlToBlocks(html, blockContentSchema, {
        parseHtml: (html) => new JSDOM(html).window.document,
        rules: [
            {
                deserialize(node, _next, block) {
                    const el = node as HTMLElement;

                    // Custom rule for <figure> images
                    if (node.nodeName.toLowerCase() === 'figure') {
                        const img = el.querySelector('img');
                        const imgSrc = img?.getAttribute('src');

                        if (!img || !imgSrc) {
                            return undefined;
                        }

                        const altText = img.getAttribute('alt');

                        return block({
                            _type: 'image',
                            url: imgSrc,
                            altText,
                        });
                    }

                    // Add more custom rules as needed

                    return undefined;
                },
            },
        ],
    });

    // TODO: Insert your own logic to upload any blocks
    // where block._type == "image" and change
    // them to an asset reference!

    return blocks;
}
*/