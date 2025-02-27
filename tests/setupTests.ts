import  { TextDecoder, TextEncoder }  from 'util';
import { ReadableStream } from 'stream/web';
global.TextEncoder = TextEncoder;
//@ts-ignore
global.TextDecoder = TextDecoder;
//@ts-ignore
global.ReadableStream = ReadableStream
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'regenerator-runtime/runtime'
import '@testing-library/jest-dom'

Enzyme.configure({ adapter: new Adapter() });