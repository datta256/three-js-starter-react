import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import SimplePeer from 'simple-peer';
import randomBytes from 'randombytes';
import process from 'process';
import { Buffer } from 'buffer';
if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}
if (!globalThis.process) {
  globalThis.process = process;
}

// Patch crypto for SimplePeer in browser environments
if (!globalThis.crypto.randomBytes) {
  globalThis.crypto.randomBytes = (size) => {
    const array = new Uint8Array(size);
    globalThis.crypto.getRandomValues(array); // Use native crypto.getRandomValues
    return Buffer.from(array);
  };
}




createRoot(document.getElementById('root')).render(

    <App />
)
