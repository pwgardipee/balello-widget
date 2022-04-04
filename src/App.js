import React, { useState } from "react";
import "./App.css";

function App({ domElement }) {
  // const testVariable = domElement.getAttribute("data-balello");
  const [showingShippingOptions, setShowingShippingOptions] = useState(false);
  const [showingShippingResult, setShowingShippingResult] = useState(false);

  return (
    <div className="balello-widget-app">
      <div className="balello-grid-wrapper">
        {/* Address Information*/}
        <div className="balello-grid-item">
          <div className="balello-title">Address Information</div>
          <form className="balello-carousel-step-1-form">
            <div>
              <div className="balello-header">To</div>
              <div className="balello-input-group">
                <input
                  type="text"
                  id="balello-input-to-name"
                  placeholder="Name"
                />
                <input
                  type="tel"
                  id="balello-input-to-phone"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  id="balello-input-to-address-1"
                  placeholder="Address Line 1"
                />
                <input
                  type="text"
                  id="balello-input-to-address-2"
                  placeholder="Address Line 2"
                />
                <input
                  type="text"
                  id="balello-input-to-city"
                  placeholder="City"
                />
                <input
                  type="state"
                  id="balello-input-to-state"
                  placeholder="State"
                />
                <input
                  type="number"
                  id="balello-input-to-zipcode"
                  placeholder="Zip Code"
                />

                <div>
                  <input type="checkbox" />
                  <label className="balello-content">Residential Address</label>
                </div>
              </div>
            </div>
            <div>
              <div className="balello-header">From</div>
              <div className="balello-input-group">
                <input
                  type="text"
                  id="balello-input-from-name"
                  placeholder="Name"
                />
                <input
                  type="tel"
                  id="balello-input-from-phone"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  id="balello-input-from-address-1"
                  placeholder="Address Line 1"
                />
                <input
                  type="text"
                  id="balello-input-from-address-2"
                  placeholder="Address Line 2"
                />
                <input
                  type="text"
                  id="balello-input-from-city"
                  placeholder="City"
                />
                <input
                  type="state"
                  id="balello-input-from-state"
                  placeholder="State"
                />
                <input
                  type="number"
                  id="balello-input-from-zipcode"
                  placeholder="Zip Code"
                />

                <div className="balello-checkbox">
                  <input type="checkbox" />
                  <label className="balello-content">Residential Address</label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Package Details */}
        <div className="balello-grid-item">
          <div className="balello-title">Package Details</div>
          <form className="balello-carousel-step-2-form">
            <div className="balello-carousel-step-2-form-package-size">
              <div className="balello-header"> Size</div>
              <div className="balello-carousel-step-2-form-package-size-input-group balello-content">
                <div className="balello-input-group">
                  <input
                    type="text"
                    id="balello-input-package-size-width"
                    placeholder="Width"
                  />
                  <input
                    type="text"
                    id="balello-input-package-size-length"
                    placeholder="Length"
                  />
                  <input
                    type="text"
                    id="balello-input-package-size-height"
                    placeholder="Height"
                  />
                </div>
              </div>
            </div>
            <div className="balello-carousel-step-2-form-package-width">
              <div className="balello-header">Weight</div>
              <div className="balello-carousel-step-2-form-package-width-input-group">
                <div className="balello-input-group">
                  <input
                    type="text"
                    id="balello-input-package-weight-oz"
                    placeholder="Oz"
                  />
                  <input
                    type="text"
                    id="balello-input-package-weight-lbs"
                    placeholder="Lbs"
                  />
                </div>
              </div>
            </div>
          </form>
          <div className="balello-carousel-nav-buttons-bottom">
            <button
              className="balello-button"
              onClick={() => setShowingShippingOptions(true)}
            >
              Calculate Rates
            </button>
          </div>
        </div>

        {/* Shipping Options */}
        {showingShippingOptions && (
          <div className="balello-grid-item">
            <form className="balello-carousel-step-3-form">
              <div classname="balello-carousel-step-3-shipping-options">
                <div className="balello-title">Shipping Options</div>
                <div className="balello-carousel-step-3-shipping-options-input-group">
                  {[1, 1, 1, 1, 1, 1, 1, 1].map(() => {
                    return (
                      <div className="balello-shipping-option-radio-button-group">
                        <input
                          type="radio"
                          id="shipping_option"
                          name="shipping_option"
                          value="HTML"
                        />
                        <label
                          for="shipping_option"
                          className="balello-shipping-option-radio-button"
                        >
                          <div>
                            <div className="balello-radio-title">4x6 Label</div>
                            <div className="balello-radio-subtitle">7 days</div>
                          </div>
                          <div className="balello-shipping-option-price">
                            $3.19
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div
                classname="balello-carousel-step-3-form-label-format"
                style={{ marginTop: "24px" }}
              >
                <div className="balello-title">Label Format</div>
                <div className="balello-carousel-step-3-form-label-format-input-group">
                  <div className="balello-label-radio-button">
                    <input
                      type="radio"
                      id="label_format"
                      name="label_format"
                      value="HTML"
                    />
                    <label for="label_format">
                      <div className="balello-radio-title">4x6 Label</div>
                      <div className="balello-radio-subtitle">
                        Best if you want to print the label. PNG, PDF, and ZPL
                        files will be available.
                      </div>
                    </label>
                  </div>
                  <div className="balello-label-radio-button">
                    <input
                      type="radio"
                      id="label_format"
                      name="label_format"
                      value="CSS"
                    />
                    <label for="label_format">
                      <div className="balello-radio-title">QR Code</div>
                      <div className="balello-radio-subtitle">
                        Use a Paperless Label. Present your code at
                        participating locations and a shipping label will be
                        printed for you.
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </form>

            <div className="balello-carousel-nav-buttons-bottom">
              <button
                className="balello-button"
                onClick={() => setShowingShippingResult(true)}
              >
                Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {showingShippingResult && (
          <div className="balello-grid-item">
            <div>
              <div className="balello-title">Your label is ready!</div>
              <div className="balello-content">
                You purchased a 4x6 label and we have emailed it to you. Now you
                can print it, attach it to your package, and drop it off.
              </div>

              <div className="balello-header" style={{ marginTop: "12px" }}>
                Your 4x6 Shipping Label
              </div>
              <div className="balello-carousel-step-4-label-img">
                <img
                  src="https://api.shipengine.com/v1/downloads/10/zd5EZ1RzX0i3os9_yG6Oaw/label-150729210.png"
                  alt="Shipping Label"
                />
              </div>

              <div style={{ marginTop: "24px" }}>
                <div className="balello-title">Label Formats</div>
                <div className="balello-carousel-step-4-label-format-options">
                  <button className="balello-button-small">PDF</button>
                  <button className="balello-button-small">PNG</button>
                  <button className="balello-button-small">ZPL</button>
                  <button className="balello-button-small">HREF</button>
                </div>
              </div>
              <div style={{ marginTop: "24px" }}>
                <div className="balello-title">Account Information</div>
                <div className="balello-header">Peyton Gadipee</div>
                <div className="balello-content">peytongardipee@gmail.com</div>
              </div>
            </div>
            <div className="balello-carousel-nav-buttons-bottom">
              <button
                className="balello-button"
                onClick={() => {
                  setShowingShippingOptions(false);
                  setShowingShippingResult(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
