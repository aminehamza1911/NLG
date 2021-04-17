import React from 'react';
import Navbar from './Navbar/Navbar';
import './App.css';
import Dropzone from "./dropzone/Dropzone";

function App() {
  return (
    <div>
      <Navbar/>
      <p className="title">We make it easy for you to generate your event reports</p>
      <ol className="circle">
        <li>Upload your excel file&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>
        <li>Select language &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>
        <li>Choose the right format </li>

      </ol>
      <div className="content">
        <Dropzone />
      </div>
    </div>
  );
}

export default App;
