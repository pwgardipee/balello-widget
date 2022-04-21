import React, { useState, useEffect } from "react";
import "./App.css";
import { db } from "./lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  limit,
  onSnapshot,
  doc,
} from "firebase/firestore";
import BalelloAPI from "./lib/balelloAPI";
import US_STATES from "./assets/us_states.json";

import { STRIPE_API_KEY } from "./lib/stripe";
import { loadStripe } from "@stripe/stripe-js";

const balelloAPI = new BalelloAPI();

function App({ domElement }) {
  //State variables - form input
  const [email, setEmail] = useState("");
  const [toName, setToName] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [toAddress1, setToAddress1] = useState("");
  const [toAddress2, setToAddress2] = useState("");
  const [toCity, setToCity] = useState("");
  const [toState, setToState] = useState(US_STATES[0].Code);
  const [toZip, setToZip] = useState("");
  const [toResidential, setToResidential] = useState(false);
  const [fromName, setFromName] = useState("");
  const [fromPhone, setFromPhone] = useState("");
  const [fromAddress1, setFromAddress1] = useState("");
  const [fromAddress2, setFromAddress2] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [fromState, setFromState] = useState(US_STATES[0].Code);
  const [fromZip, setFromZip] = useState("");
  const [fromResidential, setFromResidential] = useState(false);
  const [packageWidth, setPackageWidth] = useState(undefined);
  const [packageLength, setPackageLength] = useState(undefined);
  const [packageHeight, setPackageHeight] = useState(undefined);
  const [packageWeightOz, setPackageWeigthOz] = useState(undefined);
  const [packageWeightLbs, setPackageWeigthLbs] = useState(undefined);

  // name, phone, address line 1, address line 2, city, state, zip, residential address bool

  //State variable - other
  const [labelSessionID, setLabelSessionID] = useState("");
  const [labelSessionData, setLabelSessionData] = useState(undefined);
  const [rates, setRates] = useState([]);
  const [selectedRate, setSeletedRate] = useState(undefined);
  const [selectedLabelScheme, setSelectedLabelScheme] = useState();
  const [loadingRates, setLoadingRates] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [currentUserID, setCurrentUserID] = useState(undefined);
  const [currentUserData, setCurrentUserData] = useState(undefined);
  const [QRCodeAvailable, setQRCodeAvailable] = useState(undefined);

  // set variables from widget instantiation
  const paymentSuccessURL = domElement.getAttribute("payment-success-url");
  const paymentCancelURL = domElement.getAttribute("payment-cancel-url");

  useEffect(() => {
    if (currentUserID) {
      onSnapshot(doc(db, "users", currentUserID), (doc) => {
        setCurrentUserData(doc.data());
      });
    } else {
      setCurrentUserData(undefined);
    }
  }, [currentUserID]);

  useEffect(() => {
    if (!(rates && selectedRate)) {
      setSelectedLabelScheme(undefined);
      setQRCodeAvailable(false);
      return;
    }

    const rateObj = rates.find((rate) => rate.rateId === selectedRate);

    if (!rateObj || !rateObj.serviceType) {
      setSelectedLabelScheme(undefined);
      setQRCodeAvailable(false);
    } else {
      const isUSPS = rateObj.serviceType.includes("USPS");
      setQRCodeAvailable(isUSPS);
      if (!isUSPS) setSelectedLabelScheme("label");
    }
  }, [rates, selectedRate]);

  useEffect(() => {
    const weightOzs = (packageWeightLbs || 0) * 16 + packageWeightOz;

    const testLabel = {
      shipTo: {
        name: toName,
        phone: toPhone,
        addressLine1: toAddress1,
        addressLine2: toAddress2,
        cityLocality: toCity,
        stateProvince: toState,
        postalCode: toZip,
        countryCode: "US",
        addressResidentialIndicator: toResidential ? "yes" : "no",
      },
      shipFrom: {
        name: fromName,
        phone: fromPhone,
        addressLine1: fromAddress1,
        addressLine2: fromAddress2,
        cityLocality: fromCity,
        stateProvince: fromState,
        postalCode: fromZip,
        countryCode: "US",
        addressResidentialIndicator: fromResidential ? "yes" : "no",
      },
      weight: {
        value: weightOzs,
        unit: "ounce",
      },
      dimensions: {
        unit: "inch",
        length: packageLength,
        width: packageWidth,
        height: packageHeight,
      },
    };

    if (loadingRates) {
      const usersRef = collection(db, "users");
      // Create a query against the collection.
      const q = query(usersRef, where("email", "==", email), limit(1));
      getDocs(q).then((querySnapshot) => {
        const existingUser = querySnapshot.docs[0];
        if (existingUser) {
          setCurrentUserID(existingUser.id);
          const userRef = collection(
            db,
            "users",
            existingUser.id,
            "label-sessions"
          );
          addDoc(userRef, testLabel).then((newLabelSession) => {
            setLabelSessionID(newLabelSession.id);
            balelloAPI
              .getEstimates(existingUser.id, newLabelSession.id)
              .then((resp) => {
                setRates(resp.data.rateResponse.rates);
                setLoadingRates(false);
              });
            onSnapshot(
              doc(
                db,
                "users",
                existingUser.id,
                "label-sessions",
                newLabelSession.id
              ),
              (doc) => {
                setLabelSessionData(doc.data());
              }
            );
          });
        } else {
          addDoc(collection(db, "users"), {
            email: email,
          }).then((newUser) => {
            setCurrentUserID(newUser.id);

            const userLabelsRef = collection(
              db,
              "users",
              newUser.id,
              "label-sessions"
            );
            addDoc(userLabelsRef, testLabel).then((newLabelSession) => {
              setLabelSessionID(newLabelSession.id);
              balelloAPI
                .getEstimates(newUser.id, newLabelSession.id)
                .then((resp) => {
                  setRates(resp.data.rateResponse.rates);
                  setLoadingRates(false);
                });
              onSnapshot(
                doc(
                  db,
                  "users",
                  newUser.id,
                  "label-sessions",
                  newLabelSession.id
                ),
                (doc) => {
                  setLabelSessionData(doc.data());
                }
              );
            });
          });
        }
      });
    }
  }, [
    email,
    fromAddress1,
    fromAddress2,
    fromCity,
    fromName,
    fromPhone,
    fromResidential,
    fromState,
    fromZip,
    loadingRates,
    packageHeight,
    packageLength,
    packageWeightLbs,
    packageWeightOz,
    packageWidth,
    toAddress1,
    toAddress2,
    toCity,
    toName,
    toPhone,
    toResidential,
    toState,
    toZip,
  ]);

  useEffect(() => {
    if (loadingPayment) {
      balelloAPI
        .createPaymentLink(
          currentUserID,
          labelSessionID,
          selectedRate,
          paymentSuccessURL,
          paymentCancelURL,
          selectedLabelScheme
        )
        .then(async (resp) => {
          setLoadingPayment(false);
          // window.open(resp.data.paymentLink, "_blank").focus();
          const stripe = await loadStripe(STRIPE_API_KEY);

          return stripe.redirectToCheckout({ sessionId: resp.data.id });
        })
        .then(function (result) {
          if (result.error) {
            alert(result.error.message);
          }
        });
    }
  }, [
    currentUserID,
    labelSessionID,
    loadingPayment,
    paymentCancelURL,
    paymentSuccessURL,
    selectedLabelScheme,
    selectedRate,
  ]);

  function resetForm() {
    setLabelSessionID(undefined);
    setLabelSessionData(undefined);
    setRates(undefined);
    setSeletedRate(undefined);
    setSelectedLabelScheme(undefined);
    setCurrentUserID(undefined);
  }

  return (
    <div className="balello-widget-app">
      <div className="balello-grid-wrapper">
        {(!labelSessionData ||
          (labelSessionData && !labelSessionData.label)) && (
          <>
            <div className="balello-grid-item">
              <div className="balello-title">Account Information</div>
              <div className="balello-carousel-step-1-account-info">
                <div>
                  <div className="balello-input-group">
                    <input
                      type="text"
                      id="balello-input-account-email"
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="balello-grid-item">
              <div className="balello-title">Address Information</div>
              <div className="balello-carousel-step-1-address-info-grid">
                <div>
                  <div className="balello-header">To</div>
                  <div className="balello-input-group">
                    <input
                      type="text"
                      id="balello-input-to-name"
                      placeholder="Name"
                      onChange={(e) => setToName(e.target.value)}
                    />
                    <input
                      type="tel"
                      id="balello-input-to-phone"
                      placeholder="Phone"
                      onChange={(e) => setToPhone(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-to-address-1"
                      placeholder="Address Line 1"
                      onChange={(e) => setToAddress1(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-to-address-2"
                      placeholder="Address Line 2"
                      onChange={(e) => setToAddress2(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-to-city"
                      placeholder="City"
                      onChange={(e) => setToCity(e.target.value)}
                    />

                    <select
                      className="balello-dropdown"
                      value={toState}
                      onChange={(e) => setToState(e.target.value)}
                    >
                      {US_STATES.map((state) => {
                        return (
                          <option value={state.Code} key={state.Code}>
                            {state.State}
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="number"
                      id="balello-input-to-zipcode"
                      placeholder="Zip Code"
                      onChange={(e) => setToZip(e.target.value)}
                    />
                    <div>
                      <input
                        type="checkbox"
                        checked={toResidential}
                        onChange={(e) => setToResidential(!toResidential)}
                      />
                      <label className="balello-content">
                        Residential Address
                      </label>
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
                      onChange={(e) => setFromName(e.target.value)}
                    />
                    <input
                      type="tel"
                      id="balello-input-from-phone"
                      placeholder="Phone"
                      onChange={(e) => setFromPhone(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-from-address-1"
                      placeholder="Address Line 1"
                      onChange={(e) => setFromAddress1(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-from-address-2"
                      placeholder="Address Line 2"
                      onChange={(e) => setFromAddress2(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-from-city"
                      placeholder="City"
                      onChange={(e) => setFromCity(e.target.value)}
                    />
                    <select
                      className="balello-dropdown"
                      value={fromState}
                      onChange={(e) => setFromState(e.target.value)}
                    >
                      {US_STATES.map((state) => {
                        return (
                          <option value={state.Code} key={state.Code}>
                            {state.State}
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="number"
                      id="balello-input-from-zipcode"
                      placeholder="Zip Code"
                      onChange={(e) => setFromZip(e.target.value)}
                    />
                    <div className="balello-checkbox">
                      <input
                        type="checkbox"
                        checked={fromResidential}
                        onChange={(e) => setFromResidential(!fromResidential)}
                      />
                      <label className="balello-content">
                        Residential Address
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Package Details */}
        {(!labelSessionData ||
          (labelSessionData && !labelSessionData.label)) && (
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
                      placeholder="Width (inches)"
                      onChange={(e) => setPackageWidth(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-package-size-length"
                      placeholder="Length (inches)"
                      onChange={(e) => setPackageLength(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-package-size-height"
                      placeholder="Height (inches)"
                      onChange={(e) => setPackageHeight(e.target.value)}
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
                      id="balello-input-package-weight-lbs"
                      placeholder="Lbs"
                      onChange={(e) => setPackageWeigthLbs(e.target.value)}
                    />
                    <input
                      type="text"
                      id="balello-input-package-weight-oz"
                      placeholder="Oz"
                      onChange={(e) => setPackageWeigthOz(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </form>
            <div className="balello-carousel-nav-buttons-bottom">
              {loadingRates ? (
                <button className="balello-button" disabled={true}>
                  <svg
                    className="balello-spinner"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </button>
              ) : (
                <button
                  className="balello-button"
                  onClick={() => {
                    setLoadingRates(true);
                  }}
                >
                  Calculate Rates
                </button>
              )}
            </div>
          </div>
        )}

        {/* Shipping Options */}
        {(!labelSessionData || (labelSessionData && !labelSessionData.label)) &&
          !!(rates && rates.length) && (
            <div className="balello-grid-item">
              <form className="balello-carousel-step-3-form">
                <div className="balello-carousel-step-3-shipping-options">
                  <div className="balello-title">Shipping Options</div>
                  <div className="balello-carousel-step-3-shipping-options-input-group">
                    {rates.map((rate) => {
                      return (
                        <div
                          className="balello-shipping-option-radio-button-group"
                          key={rate.rateId}
                        >
                          <input
                            type="radio"
                            id="shipping_option"
                            name="shipping_option"
                            value={rate.rateId}
                            onChange={(e) => {
                              setSeletedRate(e.target.value);
                            }}
                          />
                          <label className="balello-shipping-option-radio-button">
                            <div>
                              <div className="balello-radio-title">
                                {rate.serviceType}
                              </div>
                              <div className="balello-radio-subtitle">
                                {rate.packageType && `${rate.packageType}  - `}
                                {rate.deliveryDays} Days
                              </div>
                            </div>
                            <div className="balello-shipping-option-price">
                              ${rate.shippingAmount.amount}
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedRate && (
                  <div
                    className="balello-carousel-step-3-form-label-format"
                    style={{ marginTop: "24px" }}
                  >
                    <div className="balello-title">Label Format</div>
                    <div className="balello-carousel-step-3-form-label-format-input-group">
                      <div className="balello-label-radio-button">
                        <input
                          type="radio"
                          id="label_format"
                          name="label_format"
                          value="label"
                          checked={selectedLabelScheme === "label"}
                          onChange={(e) => {
                            setSelectedLabelScheme(e.target.value);
                          }}
                        />
                        <label>
                          <div className="balello-radio-title">4x6 Label</div>
                          <div className="balello-radio-subtitle">
                            Best if you want to print the label. PNG, PDF, and
                            ZPL files will be available.
                          </div>
                        </label>
                      </div>
                      {QRCodeAvailable && (
                        <div className="balello-label-radio-button">
                          <input
                            type="radio"
                            id="label_format"
                            name="label_format"
                            value="qr_code"
                            checked={selectedLabelScheme === "qr_code"}
                            onChange={(e) => {
                              setSelectedLabelScheme(e.target.value);
                            }}
                          />
                          <label>
                            <div className="balello-radio-title">QR Code</div>
                            <div className="balello-radio-subtitle">
                              Use a Paperless Label. Present your code at
                              participating locations and a shipping label will
                              be printed for you.
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
              {selectedRate && selectedLabelScheme && (
                <div className="balello-carousel-nav-buttons-bottom">
                  {loadingPayment ? (
                    <button className="balello-button" disabled={true}>
                      <svg
                        className="balello-spinner"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </button>
                  ) : (
                    <button
                      className="balello-button"
                      onClick={() => {
                        setLoadingPayment(true);
                      }}
                    >
                      Payment
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Step 3 */}
        {labelSessionData && labelSessionData.label && (
          <div className="balello-grid-item">
            <div>
              <div className="balello-title">Your label is ready!</div>
              <div className="balello-content">
                We have emailed your label to you. If you purchased a 4x6 label,
                you can print it, attach it to your package, and drop it off. If
                you purchased a QR Code, you can take it into your local USPS to
                ship your parcel.
              </div>

              <div className="balello-carousel-step-4-label-img">
                <img
                  src={
                    labelSessionData && labelSessionData.label.labelDownload.png
                  }
                  alt="Shipping Label"
                />
              </div>

              <div style={{ marginTop: "24px" }}>
                <div className="balello-title">Label Formats</div>
                <div className="balello-carousel-step-4-label-format-options">
                  <a
                    className="balello-button-small"
                    href={labelSessionData.label.labelDownload.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PDF
                  </a>
                  <a
                    className="balello-button-small"
                    href={labelSessionData.label.labelDownload.png}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PNG
                  </a>
                  <a
                    className="balello-button-small"
                    href={labelSessionData.label.labelDownload.zpl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ZPL
                  </a>
                  <a
                    className="balello-button-small"
                    href={labelSessionData.label.labelDownload.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    HREF
                  </a>
                </div>
              </div>
              <div style={{ marginTop: "24px" }}>
                <div className="balello-title">Account Information</div>
                <div className="balello-header">
                  {currentUserData && currentUserData.email}
                </div>
              </div>
            </div>
            <div className="balello-carousel-nav-buttons-bottom">
              <button className="balello-button" onClick={resetForm}>
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
