import React from "react";
import "./App.css";

function App({ domElement }) {
  const testVariable = domElement.getAttribute("data-balello");
  return <div className="balello_widget__app">{testVariable}</div>;
}

export default App;
