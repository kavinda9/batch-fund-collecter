import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./PayFund.css";
import bankLogo from "../../assets/bank.png";

/* ============================================================
   PayFund.jsx
   Standalone "batch fund slip upload" page — pulled out of the old
   UserDashboard payment view so it can be its own route (e.g. /pay-fund)
   instead of living inside the dashboard component.

   Props:
   - onBack: called when the user clicks "Back to dashboard"
             (wire this to navigate("/dashboard") if you're using
             react-router — see the commented useNavigate below)
   ============================================================ */

const MONTHLY_FUND_AMOUNT = 250; // Rs. per month — keep in sync with dashboard
const TOTAL_OUTSTANDING = 3000; // Rs. — replace with real value from backend/context

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const monthLabel = (y, m) => `${MONTH_NAMES[m - 1]} ${y}`;

// TODO: replace this mock queue with the real list of unpaid months
// (e.g. passed in as a prop, or fetched from your backend/context).
const MOCK_PAYABLE_QUEUE = [
    { year: 2026, month: 7 },
    { year: 2026, month: 8 },
    { year: 2026, month: 9 },
    { year: 2026, month: 10 },
    { year: 2026, month: 11 },
    { year: 2026, month: 12 },
];

const PayFund = ({ onBack }) => {
    const navigate = useNavigate();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [amount, setAmount] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [copyText, setCopyText] = useState("Copy account number");
    const fileInputRef = useRef(null);

    const amountNum = Number(amount) || 0;
    const monthsToPay = Math.floor(amountNum / MONTHLY_FUND_AMOUNT);
    const remainder = amountNum % MONTHLY_FUND_AMOUNT;
    const isValidAmount = amountNum > 0 && remainder === 0 && monthsToPay >= 1;
    const monthsCovered = isValidAmount
        ? MOCK_PAYABLE_QUEUE.slice(0, monthsToPay)
        : [];
    const canSubmit = uploadedFile && isValidAmount && confirmed;

    const copyAccount = () => {
        navigator.clipboard?.writeText("097200140070892").catch(() => { });
        setCopyText("Copied!");
        setTimeout(() => setCopyText("Copy account number"), 2000);
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (f) setUploadedFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) setUploadedFile(f);
    };

    const removeFile = () => {
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const submitPayment = () => {
        if (!canSubmit) return;
        // TODO: send { uploadedFile, amount, monthsCovered } to your backend here.
        setSubmitted(true);
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate("/landing");
        }
    };

    return (
        <div className="payfund-page">
            <div className="back-bar" onClick={handleBack}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: 16, height: 16 }}
                >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
            </div>

            <div className="payment-body">
                <div className="payment-inner">
                    <div style={{ marginBottom: "1.5rem" }}>
                        <div className="payment-title">Pay Fund</div>
                        <div className="payment-sub">
                            Batch fund is Rs. {MONTHLY_FUND_AMOUNT} per month. Transfer to
                            our bank account, then upload your slip below.
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="steps-row">
                        <div className="step-item">
                            <div className={`step-num ${submitted ? "done" : "active"}`}>
                                {submitted ? "✓" : "1"}
                            </div>
                            <span className={`step-lbl ${!submitted ? "active" : ""}`}>
                                Bank transfer
                            </span>
                        </div>
                        <div className="step-divider" />
                        <div className="step-item">
                            <div className={`step-num ${submitted ? "done" : ""}`}>
                                {submitted ? "✓" : "2"}
                            </div>
                            <span className="step-lbl">Upload slip</span>
                        </div>
                        <div className="step-divider" />
                        <div className="step-item">
                            <div className={`step-num ${submitted ? "active" : ""}`}>3</div>
                            <span className={`step-lbl ${submitted ? "active" : ""}`}>
                                Confirmation
                            </span>
                        </div>
                    </div>

                    {!submitted ? (
                        <div className="payment-grid">
                            {/* Bank details */}
                            <div className="card p-card">
                                <h3 className="p-card-title">Bank account details</h3>
                                <div className="bank-logo-container">
                                    <img src={bankLogo} alt="Bank Logo" className="bank-logo" />
                                </div>
                                <div className="bank-row">
                                    <span className="br-lbl">Bank</span>
                                    <span className="br-val">People's Bank</span>
                                </div>
                                <div className="bank-row">
                                    <span className="br-lbl">Account number</span>
                                    <span className="br-val mono">097200140070892</span>
                                </div>
                                <div className="bank-row">
                                    <span className="br-lbl">Branch</span>
                                    <span className="br-val">Gangodavila</span>
                                </div>
                                <div className="bank-row">
                                    <span className="br-lbl">Monthly fund</span>
                                    <span className="br-val">Rs. {MONTHLY_FUND_AMOUNT}</span>
                                </div>
                                <div className="bank-row">
                                    <span className="br-lbl">
                                        {TOTAL_OUTSTANDING > 0 ? "Total outstanding" : "Status"}
                                    </span>
                                    <span className="br-val primary-val">
                                        {TOTAL_OUTSTANDING > 0
                                            ? `Rs. ${TOTAL_OUTSTANDING.toLocaleString()}`
                                            : "Up to date"}
                                    </span>
                                </div>
                                <div className="copy-hint" onClick={copyAccount}>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        style={{ width: 13, height: 13 }}
                                    >
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    <span>{copyText}</span>
                                </div>
                            </div>

                            {/* Upload slip */}
                            <div className="card p-card">
                                <h3 className="p-card-title">Upload bank slip</h3>
                                {!uploadedFile ? (
                                    <div
                                        className="upload-zone"
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{ width: 24, height: 24, marginBottom: 8 }}
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                        </svg>
                                        <div className="uz-title">Tap to upload slip</div>
                                        <div className="uz-sub">
                                            JPG, PNG, or PDF &middot; max 5 MB
                                        </div>
                                    </div>
                                ) : (
                                    <div className="file-preview">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{ width: 18, height: 18 }}
                                        >
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                                        </svg>
                                        <span className="fp-name">{uploadedFile.name}</span>
                                        <span className="fp-remove" onClick={removeFile}>
                                            Remove
                                        </span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    style={{ display: "none" }}
                                    onChange={handleFile}
                                />

                                <div className="form-field">
                                    <label>Amount paid (Rs.)</label>
                                    <input
                                        type="number"
                                        placeholder={String(MONTHLY_FUND_AMOUNT)}
                                        min="0"
                                        step={MONTHLY_FUND_AMOUNT}
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setConfirmed(false);
                                        }}
                                    />
                                    {amountNum > 0 && remainder !== 0 ? (
                                        <div className="hint hint-error">
                                            Amount must be a multiple of Rs. {MONTHLY_FUND_AMOUNT}{" "}
                                            (1 month = Rs. {MONTHLY_FUND_AMOUNT}).
                                        </div>
                                    ) : isValidAmount ? (
                                        <div className="hint">
                                            This covers {monthsToPay} month
                                            {monthsToPay !== 1 ? "s" : ""} of batch fund.
                                        </div>
                                    ) : (
                                        <div className="hint">
                                            Type the exact amount shown on receipt.
                                        </div>
                                    )}
                                </div>

                                {isValidAmount && (
                                    <div className="confirm-box">
                                        <label className="confirm-check-row">
                                            <input
                                                type="checkbox"
                                                checked={confirmed}
                                                onChange={(e) => setConfirmed(e.target.checked)}
                                            />
                                            <span>
                                                I confirm that I paid Rs. {amountNum.toLocaleString()}{" "}
                                                for {monthsToPay} month{monthsToPay !== 1 ? "s" : ""}{" "}
                                                of batch fund.
                                            </span>
                                        </label>

                                        {confirmed && (
                                            <div className="months-covered-list">
                                                <div className="mcl-title">
                                                    This payment will be recorded as:
                                                </div>
                                                {monthsCovered.map((m) => (
                                                    <div
                                                        key={`${m.year}-${m.month}`}
                                                        className="mcl-row"
                                                    >
                                                        <span>{monthLabel(m.year, m.month)}</span>
                                                        <span>Rs. {MONTHLY_FUND_AMOUNT}/=</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    className="submit-btn"
                                    disabled={!canSubmit}
                                    onClick={submitPayment}
                                >
                                    Submit payment
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Success state */
                        <div className="success-state">
                            <div className="success-icon-wrap">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{ width: 32, height: 32 }}
                                >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                                </svg>
                            </div>
                            <div className="success-title">Slip submitted</div>
                            <div className="success-sub">
                                Your payment for {monthsCovered.length} month
                                {monthsCovered.length !== 1 ? "s" : ""} has been sent for
                                admin review. You'll be notified once it's verified, usually
                                within 24 hours.
                            </div>
                            <button
                                className="btn-primary"
                                style={{ margin: "0 auto" }}
                                onClick={handleBack}
                            >
                                Back to Home
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayFund;