"use client";

import React, { useState } from "react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";
import { LogOut, Package } from "lucide-react";

export default function ProfileView() {
  const { currentCustomer, logout } = useCustomerAuth();
  const { customerOrders, navigateTo } = useStore();
  const [sleepPos, setSleepPos] = useState("Side");
  const [preferredTemp, setPreferredTemp] = useState("Cool");
  const [savedSettings, setSavedSettings] = useState(false);

  const customerName = currentCustomer?.name || "Rahul Sharma";
  const customerEmail = currentCustomer?.email || "rahul@example.com";
  const avatarChar = currentCustomer?.avatar || customerName.charAt(0).toUpperCase();

  const displayOrders = (customerOrders && customerOrders.length > 0)
    ? customerOrders
    : [
        {
          id: "MS-92841",
          createdAt: "2026-08-01",
          orderStatus: "Delivered",
          totalAmount: 968,
          items: [
            { name: "Mellosoft Classic Mattress", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 899 },
            { name: "Mellosoft Organic Mattress Protector", variantSize: "Queen", variantFirmness: "Standard", quantity: 1, price: 69 }
          ]
        }
      ];

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => {
      setSavedSettings(false);
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigateTo("login");
  };

  return (
    <div style={containerStyle}>
      {/* Profile Header */}
      <div style={headerCardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <div style={avatarStyle}>{avatarChar}</div>
          <div style={headerInfoStyle}>
            <h2 style={userNameStyle}>{customerName}</h2>
            <p style={userMetaStyle}>{customerEmail} • Mellosoft Sleep Member since 2026</p>
            <div style={streakBadgeStyle}>
              <span style={streakIconStyle}>🏆</span>
              <span style={streakTextStyle}>8-Night Perfect Sleep Streak</span>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} style={logoutBtnStyle} className="hover-lift">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <div style={gridStyle}>
        
        {/* Left Column: Preferences Form */}
        <div style={leftColStyle}>
          <div style={panelCardStyle}>
            <h3 style={panelTitleStyle}>Sleep Profile & Preferences</h3>
            <p style={panelDescStyle}>We use this data to tailor sleep tips and recommend custom mattress configurations.</p>
            
            <form onSubmit={handleSavePreferences} style={formStyle}>
              {/* Sleep Position */}
              <div style={formFieldStyle}>
                <label style={labelStyle}>Preferred Sleeping Position</label>
                <div style={chipsGroupStyle}>
                  {["Side", "Back", "Stomach", "Combination"].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setSleepPos(pos)}
                      style={{
                        ...chipStyle,
                        backgroundColor: sleepPos === pos ? "#1B1F8C" : "#FFFFFF",
                        color: sleepPos === pos ? "#FFFFFF" : "#14151A",
                        borderColor: sleepPos === pos ? "#1B1F8C" : "#E7E7E2"
                      }}
                      className="hover-lift"
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleeping Temp */}
              <div style={formFieldStyle}>
                <label style={labelStyle}>Preferred Sleep Temperature</label>
                <div style={chipsGroupStyle}>
                  {["Cool", "Neutral", "Warm"].map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setPreferredTemp(temp)}
                      style={{
                        ...chipStyle,
                        backgroundColor: preferredTemp === temp ? "#1B1F8C" : "#FFFFFF",
                        color: preferredTemp === temp ? "#FFFFFF" : "#14151A",
                        borderColor: preferredTemp === temp ? "#1B1F8C" : "#E7E7E2"
                      }}
                      className="hover-lift"
                    >
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" style={saveBtnStyle} className="hover-lift">
                Save Preferences
              </button>

              {savedSettings && (
                <div style={successMessageStyle}>
                  Preference settings saved successfully! Your recommendations will update shortly.
                </div>
              )}
            </form>
          </div>

          {/* AI Coach Advice Box */}
          <div style={coachBoxStyle}>
            <h4 style={coachTitleStyle}>🛌 Sleep Advisor Recommendation</h4>
            <p style={coachTextStyle}>
              Since you are a <strong>{sleepPos} sleeper</strong> who prefers a <strong>{preferredTemp} temperature</strong>, we highly recommend the <strong>Mellosoft Classic Mattress</strong> in <strong>Medium firmness</strong> paired with a Tencel or Bamboo mattress protector.
            </p>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div style={rightColStyle}>
          <div style={panelCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={panelTitleStyle}>Order History</h3>
              <button onClick={() => navigateTo("orders")} style={viewAllOrdersBtnStyle}>
                View All ({displayOrders.length})
              </button>
            </div>
            
            <div style={ordersListStyle}>
              {displayOrders.slice(0, 3).map((order) => (
                <div key={order.id} style={orderItemStyle}>
                  <div style={orderHeaderRowStyle}>
                    <div>
                      <span style={orderIdStyle}>Order #{order.id}</span>
                      <span style={orderDateStyle}>{order.createdAt || order.date}</span>
                    </div>
                    <span style={statusBadgeStyle}>{order.orderStatus || order.status}</span>
                  </div>

                  <div style={orderProductListStyle}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={orderProductRowStyle}>
                        <div>
                          <span style={orderProductNameStyle}>{item.name || item.productId}</span>
                          <span style={orderProductMetaStyle}>
                            {item.variantSize || item.size} • {item.variantFirmness || item.firmness} (x{item.quantity || item.qty})
                          </span>
                        </div>
                        <span style={orderProductPriceStyle}>{formatPrice((item.price || item.actualPrice || 0) * (item.quantity || item.qty || 1))}</span>
                      </div>
                    ))}
                  </div>

                  <div style={orderFooterRowStyle}>
                    <span style={totalLabelStyle}>Total Paid:</span>
                    <span style={totalValueStyle}>{formatPrice(order.totalAmount || order.total || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Styling Object Configurations
const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "40px 24px 80px 24px",
  width: "100%"
};

// Header Card
const headerCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid #E7E7E2",
  padding: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "24px",
  marginBottom: "36px",
  flexWrap: "wrap"
};

const logoutBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  color: "#DC2626",
  padding: "10px 18px",
  borderRadius: "999px",
  fontSize: "13.5px",
  fontWeight: "700",
  cursor: "pointer"
};

const viewAllOrdersBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#1B1F8C",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};

const avatarStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  fontSize: "36px",
  fontWeight: "800",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const headerInfoStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const userNameStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const userMetaStyle = {
  fontSize: "13.5px",
  color: "#6B6B75"
};

const streakBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "rgba(22, 163, 74, 0.08)",
  borderRadius: "14px",
  padding: "4px 12px",
  width: "fit-content",
  marginTop: "6px"
};

const streakIconStyle = {
  fontSize: "14px"
};

const streakTextStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#16A34A"
};

// Grid Layout
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "36px",
  alignItems: "flex-start"
};

const leftColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const rightColStyle = {};

const panelCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 0,
  padding: "30px",
};

const panelTitleStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1B1F8C",
  marginBottom: "8px"
};

const panelDescStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  lineHeight: "1.5",
  marginBottom: "24px"
};

// Form Styles
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const formFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6B6B75"
};

const chipsGroupStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px"
};

const chipStyle = {
  padding: "8px 16px",
  borderRadius: "16px",
  border: "1px solid",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const saveBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "24px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
  alignSelf: "flex-start",
  marginTop: "10px"
};

const successMessageStyle = {
  backgroundColor: "rgba(22, 163, 74, 0.08)",
  color: "#16A34A",
  fontSize: "13px",
  fontWeight: "600",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(22, 163, 74, 0.15)"
};

// Coach Box
const coachBoxStyle = {
  backgroundColor: "rgba(27, 31, 140, 0.04)",
  borderRadius: 0,
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const coachTitleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#1B1F8C",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const coachTextStyle = {
  fontSize: "13.5px",
  color: "#14151A",
  lineHeight: "1.6"
};

// Orders List Styles
const ordersListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const orderItemStyle = {
  borderRadius: 0,
  padding: "20px",
  backgroundColor: "#F7F7F2"
};

const orderHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #E7E7E2",
  paddingBottom: "12px",
  marginBottom: "12px"
};

const orderIdStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#1B1F8C",
  marginRight: "10px"
};

const orderDateStyle = {
  fontSize: "12px",
  color: "#6B6B75"
};

const statusBadgeStyle = {
  fontSize: "10px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#FFFFFF",
  backgroundColor: "#16A34A",
  padding: "4px 10px",
  borderRadius: "10px"
};

const orderProductListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  borderBottom: "1px solid #E7E7E2",
  paddingBottom: "12px",
  marginBottom: "12px"
};

const orderProductRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const orderProductNameStyle = {
  fontSize: "13.5px",
  fontWeight: "600",
  color: "#14151A",
  display: "block"
};

const orderProductMetaStyle = {
  fontSize: "11px",
  color: "#6B6B75",
  display: "block",
  marginTop: "2px"
};

const orderProductPriceStyle = {
  fontSize: "13.5px",
  fontWeight: "600",
  color: "#14151A"
};

const orderFooterRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const totalLabelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#6B6B75"
};

const totalValueStyle = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#1B1F8C"
};
