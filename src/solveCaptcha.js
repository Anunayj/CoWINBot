import { SVG } from '@svgdotjs/svg.js';
import parseSVG from "svg-path-parser";
import crypto from 'crypto';

const lookuptable = {
  '0b4d11db': 'S',
  '0c711c82': 'r',
  '0e0a7611': '5',
  '105213ca': 'T',
  '20a72252': 'D',
  '2313913c': '9',
  '2dad1065': 'd',
  '2dc4154e': 'Y',
  '30916dd8': 'A',
  '32d539f2': 'F',
  '3570f45f': 'R',
  '36af6060': 'e',
  '39caafdb': 'B',
  '4408d7d9': 'm',
  '494b9ed1': 'n',
  '4a5dc6a2': 'v',
  '4eefeea4': 'w',
  '4f306dd3': '3',
  '58883f6d': 'f',
  '5c782e43': 'E',
  '5d6dd820': 'b',
  '5ffeb256': 'x',
  '60ecf441': 'U',
  '62befde0': 'y',
  '65772b30': 'S',
  '6db1038f': 'N',
  '6e636bc0': 'c',
  '6f666b73': 'H',
  '701ea7b3': 'G',
  '74d68427': '4',
  '75e7f23d': '8',
  '7c99d4a1': 'C',
  '842f574b': 'Q',
  '85a5195a': 't',
  '8c9fab48': 'g',
  '948168f5': 'a',
  '96cab668': 'p',
  '9bee8455': 'j',
  '9e43188f': 'x',
  'a1499014': 'j',
  'a59bd53d': 'U',
  'b258a657': 'z',
  'b9ccddc6': 'q',
  'b9dc9bd2': 'V',
  'c49fcddb': 'k',
  'c99ed5e1': '7',
  'd6492bf5': 'P',
  'e41b9a13': 'K',
  'e8f30ea3': 'h',
  'eaeb913b': 'W',
  'ec14083f': '2',
  'ec24e827': 'Z',
  'f91e5ca8': 'M',
  'fa80057a': '6'
}

export default function getSolution(svg){
  const canvas = SVG(svg);
  let solution = '';
  const paths = Array.from(canvas.children().sort((a,b) => a.x()-b.x()).filter(elem => (elem.width()/elem.height()) < 2))
  for(let elem of paths){
    const pathtext = parseSVG(elem.attr().d).map(e => e.code).join('');
    const fingerprint = crypto.createHash('sha256').update(pathtext).digest('hex').slice(0,8);
    solution += lookuptable[fingerprint];
  }
  return(solution);
    
}

