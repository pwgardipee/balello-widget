import React, { useState } from "react";
import "./App.css";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

function App({ domElement }) {
  // const testVariable = domElement.getAttribute("data-balello");
  const [currentItem, setCurrentItem] = useState(0);

  function incrementCurrentItem() {
    setCurrentItem(currentItem + 1);
  }
  function decrementCurrentItem() {
    setCurrentItem(currentItem - 1);
  }

  return (
    <div className="balello-widget-app">
      <div className="balello-carousel-wrapper">
        <Carousel
          selectedItem={currentItem}
          showStatus={false}
          showIndicators={false}
        >
          <div className="balello-carousel-item">
            <div>To Address, From Address, and Email Address</div>
            <button onClick={incrementCurrentItem}>Next</button>
          </div>
          <div className="balello-carousel-item">
            <div>Package Size and Package Weight</div>
            <button onClick={decrementCurrentItem}>Previous</button>
            <button onClick={incrementCurrentItem}>Next</button>
          </div>
          <div className="balello-carousel-item">
            <div>Shipping Options and Label Format</div>
            <button onClick={decrementCurrentItem}>Previous</button>
            <button onClick={incrementCurrentItem}>Next</button>
          </div>
          <div className="balello-carousel-item">
            <div>Your Label is Ready</div>
            <button onClick={decrementCurrentItem}>Previous</button>
          </div>
        </Carousel>
      </div>
    </div>
  );
}

export default App;
