"use client";

import React, { useMemo } from "react";
import { useStore } from "../context/StoreContext";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Moon,
  Layers
} from "lucide-react";

export default function AboutView() {
  const { navigateTo, setActiveFilters, setSearchQuery, categories: storeCategories } = useStore();

  const activeCategories = useMemo(() => {
    if (!storeCategories || !Array.isArray(storeCategories)) return [];
    return storeCategories.filter(
      (cat) => cat.status !== "Inactive" && cat.status !== "inactive"
    );
  }, [storeCategories]);

  const goToCategory = (categorySlugOrName) => {
    setSearchQuery("");
    setActiveFilters({
      category: categorySlugOrName,
      firmness: "All",
      size: "All",
      sort: "Recommended"
    });
    navigateTo("catalog");
  };

  const goToCatalog = () => {
    setSearchQuery("");
    setActiveFilters({
      category: "All",
      firmness: "All",
      size: "All",
      sort: "Recommended"
    });
    navigateTo("catalog");
  };

  return (
    <div style={containerStyle}>
      {/* 1. HERO SECTION */}
      <section style={heroSectionStyle}>
        <div style={heroInnerStyle}>
          <div style={heroTextStyle}>
            <div style={badgeStyle}>
              <Sparkles size={14} style={{ color: "#16A34A" }} />
              <span>ABOUT MELLOSOFT</span>
            </div>
            <h1 style={heroTitleStyle}>About Mellosoft</h1>
            <h2 style={heroSubtitleStyle}>Better sleep. Better living.</h2>
            <p style={heroDescriptionStyle}>
              At Mellosoft, we believe exceptional sleep is the foundation of a healthier, happier life. Engineered with ergonomic precision and crafted from eco-certified materials, our luxury mattresses, pillows, bed frames, and protectors transform every night into a serene, restorative experience.
            </p>
            <div style={heroPillsStyle}>
              <div style={heroPillItemStyle}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>100-Night Free Trial</span>
              </div>
              <div style={heroPillItemStyle}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>10-Year Warranty</span>
              </div>
              <div style={heroPillItemStyle}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>Free Doorstep Delivery</span>
              </div>
            </div>
          </div>
          <div style={heroImageContainerStyle}>
            <img
              src="/asset/img1.jpg"
              alt="Mellosoft Luxury Bedding & Sleep Experience"
              style={heroImageStyle}
            />
            <div style={heroImageFloatingBadgeStyle}>
              <Award size={24} color="#16A34A" />
              <div>
                <strong style={{ display: "block", fontSize: "14px", color: "#14151A" }}>100% Certified</strong>
                <span style={{ fontSize: "12px", color: "#6B6B75" }}>Sleep Ergonomics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHO WE ARE */}
      <section style={sectionWhiteStyle}>
        <div style={sectionInnerStyle}>
          <div style={twoColGridStyle}>
            <div style={twoColImageWrapStyle}>
              <img
                src="/asset/img2.jpg"
                alt="Mellosoft Master Craftsmanship"
                style={twoColImageStyle}
              />
            </div>
            <div style={twoColContentStyle}>
              <div style={sectionSubTagStyle}>WHO WE ARE</div>
              <h2 style={sectionHeadingStyle}>Who We Are</h2>
              <p style={paragraphStyle}>
                Mellosoft is a premier sleep and comfort brand dedicated to redesigning sleep essentials for modern living. We specialize in high-performance mattresses, ergonomic memory foam pillows, handcrafted solid bed frames, and waterproof mattress protectors.
              </p>
              <p style={paragraphStyle}>
                Driven by sleep ergonomics, our design philosophy combines zero-motion transfer pocket coil matrices with cooling open-cell memory foam to ensure your posture remains perfectly aligned throughout the night.
              </p>
              <div style={featureListStyle}>
                <div style={featureListItemStyle}>
                  <div style={iconBoxStyle}>
                    <Layers size={20} color="#1B1F8C" />
                  </div>
                  <div>
                    <h4 style={featureListTitleStyle}>Precision Layering</h4>
                    <p style={featureListDescStyle}>Ergonomic zoning designed to relieve hip and shoulder pressure.</p>
                  </div>
                </div>
                <div style={featureListItemStyle}>
                  <div style={iconBoxStyle}>
                    <ShieldCheck size={20} color="#1B1F8C" />
                  </div>
                  <div>
                    <h4 style={featureListTitleStyle}>Eco-Certified Safety</h4>
                    <p style={featureListDescStyle}>100% OEKO-TEX and CertiPUR-US certified non-toxic materials.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR MISSION */}
      <section style={sectionCreamStyle}>
        <div style={sectionInnerStyle}>
          <div style={centerHeaderStyle}>
            <div style={sectionSubTagStyle}>OUR MISSION</div>
            <h2 style={sectionHeadingStyle}>Our Mission</h2>
            <p style={centerDescriptionStyle}>
              Our goal is simple: to make high-quality, comfortable sleep products accessible to everyone without compromise. We combine sleep science, sustainable craftsmanship, and direct-to-consumer accessibility.
            </p>
          </div>

          <div style={cardsThreeGridStyle}>
            <div style={missionCardStyle}>
              <div style={cardIconContainerStyle}>
                <Sparkles size={28} color="#1B1F8C" />
              </div>
              <h3 style={cardTitleStyle}>Better Comfort</h3>
              <p style={cardTextStyle}>
                Ergonomically engineered foam matrixes and responsive hybrid pocket coils that contour naturally to your body profile, relieving pressure points for deep, uninterrupted sleep.
              </p>
            </div>

            <div style={missionCardStyle}>
              <div style={cardIconContainerStyle}>
                <Award size={28} color="#16A34A" />
              </div>
              <h3 style={cardTitleStyle}>Quality Materials</h3>
              <p style={cardTextStyle}>
                Sourced from non-toxic, eco-certified suppliers. OEKO-TEX certified fabrics, breathable organic latex, and open-cell cooling foams engineered to last for years.
              </p>
            </div>

            <div style={missionCardStyle}>
              <div style={cardIconContainerStyle}>
                <Moon size={28} color="#1B1F8C" />
              </div>
              <h3 style={cardTitleStyle}>Better Sleep</h3>
              <p style={cardTextStyle}>
                Grounded in sleep science to promote optimal spinal alignment, active temperature regulation, and zero-motion transfer so you wake up refreshed every single morning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE MELLOSOFT */}
      <section style={sectionWhiteStyle}>
        <div style={sectionInnerStyle}>
          <div style={centerHeaderStyle}>
            <div style={sectionSubTagStyle}>WHY CHOOSE MELLOSOFT</div>
            <h2 style={sectionHeadingStyle}>Why Choose Mellosoft</h2>
            <p style={centerDescriptionStyle}>
              Everything you need for total sleep confidence and lifetime peace of mind.
            </p>
          </div>

          <div style={cardsFiveGridStyle}>
            <div style={whyChooseCardStyle}>
              <div style={greenIconBoxStyle}>
                <RotateCcw size={24} color="#16A34A" />
              </div>
              <h3 style={whyChooseTitleStyle}>100-Night Trial</h3>
              <p style={whyChooseDescStyle}>
                Sleep on it for 100 nights in the comfort of your home. If you don't love it, return it risk-free.
              </p>
            </div>

            <div style={whyChooseCardStyle}>
              <div style={greenIconBoxStyle}>
                <Truck size={24} color="#16A34A" />
              </div>
              <h3 style={whyChooseTitleStyle}>Free Delivery</h3>
              <p style={whyChooseDescStyle}>
                Fast, complimentary doorstep delivery nationwide on all orders, packaged for effortless setup.
              </p>
            </div>

            <div style={whyChooseCardStyle}>
              <div style={greenIconBoxStyle}>
                <ShieldCheck size={24} color="#16A34A" />
              </div>
              <h3 style={whyChooseTitleStyle}>10-Year Warranty</h3>
              <p style={whyChooseDescStyle}>
                Built to last. Backed by a full 10-year non-prorated structural warranty for maximum longevity.
              </p>
            </div>

            <div style={whyChooseCardStyle}>
              <div style={greenIconBoxStyle}>
                <Award size={24} color="#16A34A" />
              </div>
              <h3 style={whyChooseTitleStyle}>Premium Materials</h3>
              <p style={whyChooseDescStyle}>
                Non-toxic, hypoallergenic foams and organic natural covers designed for airflow and temperature control.
              </p>
            </div>

            <div style={whyChooseCardStyle}>
              <div style={greenIconBoxStyle}>
                <Headphones size={24} color="#16A34A" />
              </div>
              <h3 style={whyChooseTitleStyle}>Customer Support</h3>
              <p style={whyChooseDescStyle}>
                Our dedicated sleep specialists are available 24/7 to guide your choice and assist with queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OUR PRODUCT RANGE (Dynamic from Store Categories) */}
      <section style={sectionCreamStyle}>
        <div style={sectionInnerStyle}>
          <div style={centerHeaderStyle}>
            <div style={sectionSubTagStyle}>EXPLORE CATALOG</div>
            <h2 style={sectionHeadingStyle}>Our Product Range</h2>
            <p style={centerDescriptionStyle}>
              Discover our engineered collections crafted for ergonomic support, temperature control, and bedroom luxury.
            </p>
          </div>

          <div style={categoryGridStyle}>
            {activeCategories.length > 0 ? (
              activeCategories.map((cat) => (
                <div
                  key={cat.id}
                  style={categoryCardStyle}
                  onClick={() => goToCategory(cat.slug || cat.name)}
                >
                  <div style={categoryImageWrapStyle}>
                    <img
                      src={cat.image || "/asset/img1.jpg"}
                      alt={cat.name}
                      style={categoryImageStyle}
                    />
                    {cat.productCount !== undefined && (
                      <span style={categoryBadgeStyle}>
                        {cat.productCount} {cat.productCount === 1 ? "Item" : "Items"}
                      </span>
                    )}
                  </div>
                  <div style={categoryContentStyle}>
                    <h3 style={categoryTitleStyle}>{cat.name}</h3>
                    <p style={categoryDescStyle}>{cat.description || `Explore our ${cat.name.toLowerCase()} collection.`}</p>
                    <button style={categoryBtnStyle} aria-label={`Shop ${cat.name}`}>
                      <span>Shop {cat.name}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              [
                { name: "Mattresses", slug: "mattress", img: "/asset/img1.jpg", desc: "Memory foam & hybrid mattresses for optimal spinal support." },
                { name: "Pillows", slug: "pillows", img: "/asset/pillow.png", desc: "Ergonomic contouring & luxury down pillows for neck relief." },
                { name: "Bed Frames", slug: "bed frames", img: "/asset/bedframe.png", desc: "Handcrafted solid wood & upholstered bed frames." },
                { name: "Protectors", slug: "protectors", img: "/asset/texture.png", desc: "100% waterproof & breathable mattress protectors." }
              ].map((cat, idx) => (
                <div
                  key={idx}
                  style={categoryCardStyle}
                  onClick={() => goToCategory(cat.slug)}
                >
                  <div style={categoryImageWrapStyle}>
                    <img src={cat.img} alt={cat.name} style={categoryImageStyle} />
                  </div>
                  <div style={categoryContentStyle}>
                    <h3 style={categoryTitleStyle}>{cat.name}</h3>
                    <p style={categoryDescStyle}>{cat.desc}</p>
                    <button style={categoryBtnStyle}>
                      <span>Shop {cat.name}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER TRUST & STATISTICS */}
      <section style={statsSectionStyle}>
        <div style={sectionInnerStyle}>
          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <div style={statValueStyle}>100%</div>
              <div style={statLabelStyle}>Quality Sleep Products</div>
              <div style={statDescStyle}>Ergonomically Certified</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>4+</div>
              <div style={statLabelStyle}>Multiple Product Categories</div>
              <div style={statDescStyle}>Mattresses, Pillows & More</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>50,000+</div>
              <div style={statLabelStyle}>Customer Focused</div>
              <div style={statDescStyle}>Restful Nights Delivered</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>Free & Fast</div>
              <div style={statLabelStyle}>Reliable Delivery</div>
              <div style={statDescStyle}>Nationwide Doorstep Shipping</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. OUR PROMISE (CTA BANNER) */}
      <section style={promiseBannerStyle}>
        <div style={promiseOverlayStyle}>
          <div style={promiseContentStyle}>
            <div style={promiseTagStyle}>OUR PROMISE</div>
            <h2 style={promiseTitleStyle}>Designed for better nights and brighter mornings.</h2>
            <p style={promiseDescStyle}>
              Every Mellosoft mattress, pillow, and bed frame is built to transform your daily health through the power of deeper, uninterrupted sleep.
            </p>
            <button onClick={goToCatalog} style={promiseBtnStyle}>
              <span>Explore Our Products</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Inlined Layout & Design Token Styles
const containerStyle = {
  width: "100%",
  backgroundColor: "#F7F7F2",
  color: "#14151A"
};

const sectionInnerStyle = {
  maxWidth: "1720px",
  margin: "0 auto",
  padding: "60px 48px",
  boxSizing: "border-box"
};

const heroSectionStyle = {
  width: "100%",
  backgroundColor: "#FFFFFF",
  borderBottom: "1px solid #E7E7E2"
};

const heroInnerStyle = {
  maxWidth: "1720px",
  margin: "0 auto",
  padding: "72px 48px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  alignItems: "center",
  gap: "48px",
  boxSizing: "border-box"
};

const heroTextStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 14px",
  borderRadius: "999px",
  backgroundColor: "rgba(22, 163, 74, 0.1)",
  color: "#16A34A",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  alignSelf: "flex-start"
};

const heroTitleStyle = {
  fontSize: "46px",
  fontWeight: "800",
  color: "#1B1F8C",
  lineHeight: "1.15",
  margin: 0
};

const heroSubtitleStyle = {
  fontSize: "22px",
  fontWeight: "600",
  color: "#16A34A",
  margin: 0
};

const heroDescriptionStyle = {
  fontSize: "16px",
  lineHeight: "1.65",
  color: "#6B6B75",
  margin: 0
};

const heroPillsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  marginTop: "8px"
};

const heroPillItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#14151A"
};

const heroImageContainerStyle = {
  position: "relative",
  width: "100%",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 20px 40px rgba(27, 31, 140, 0.08)"
};

const heroImageStyle = {
  width: "100%",
  height: "440px",
  objectFit: "cover",
  display: "block"
};

const heroImageFloatingBadgeStyle = {
  position: "absolute",
  bottom: "24px",
  left: "24px",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  padding: "14px 20px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  border: "1px solid #E7E7E2"
};

const sectionWhiteStyle = {
  width: "100%",
  backgroundColor: "#FFFFFF",
  borderBottom: "1px solid #E7E7E2"
};

const sectionCreamStyle = {
  width: "100%",
  backgroundColor: "#F7F7F2",
  borderBottom: "1px solid #E7E7E2"
};

const twoColGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  alignItems: "center",
  gap: "48px"
};

const twoColImageWrapStyle = {
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(0,0,0,0.06)"
};

const twoColImageStyle = {
  width: "100%",
  height: "400px",
  objectFit: "cover",
  display: "block"
};

const twoColContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const sectionSubTagStyle = {
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#16A34A",
  textTransform: "uppercase"
};

const sectionHeadingStyle = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0,
  lineHeight: "1.2"
};

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#6B6B75",
  margin: 0
};

const featureListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  marginTop: "12px"
};

const featureListItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px"
};

const iconBoxStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  backgroundColor: "rgba(27, 31, 140, 0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

const featureListTitleStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#14151A",
  margin: "0 0 4px 0"
};

const featureListDescStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  margin: 0
};

const centerHeaderStyle = {
  textAlign: "center",
  maxWidth: "720px",
  margin: "0 auto 48px auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px"
};

const centerDescriptionStyle = {
  fontSize: "16px",
  color: "#6B6B75",
  lineHeight: "1.6",
  margin: 0
};

const cardsThreeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "28px"
};

const missionCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "36px 28px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.03)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease"
};

const cardIconContainerStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const cardTitleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1B1F8C",
  margin: 0
};

const cardTextStyle = {
  fontSize: "14.5px",
  lineHeight: "1.65",
  color: "#6B6B75",
  margin: 0
};

const cardsFiveGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "24px"
};

const whyChooseCardStyle = {
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "28px 24px",
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const greenIconBoxStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  backgroundColor: "rgba(22, 163, 74, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const whyChooseTitleStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#14151A",
  margin: 0
};

const whyChooseDescStyle = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#6B6B75",
  margin: 0
};

const categoryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "28px"
};

const categoryCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  overflow: "hidden",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.03)",
  display: "flex",
  flexDirection: "column"
};

const categoryImageWrapStyle = {
  position: "relative",
  width: "100%",
  height: "200px",
  backgroundColor: "#F7F7F2"
};

const categoryImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const categoryBadgeStyle = {
  position: "absolute",
  top: "14px",
  right: "14px",
  backgroundColor: "rgba(27, 31, 140, 0.88)",
  color: "#FFFFFF",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "700"
};

const categoryContentStyle = {
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  flexGrow: 1
};

const categoryTitleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1B1F8C",
  margin: 0
};

const categoryDescStyle = {
  fontSize: "13.5px",
  color: "#6B6B75",
  lineHeight: "1.5",
  margin: 0,
  flexGrow: 1
};

const categoryBtnStyle = {
  border: "none",
  background: "none",
  padding: 0,
  marginTop: "12px",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  color: "#16A34A",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer"
};

const statsSectionStyle = {
  width: "100%",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  padding: "54px 0"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "32px",
  textAlign: "center"
};

const statCardStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px"
};

const statValueStyle = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#FFFFFF"
};

const statLabelStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#E2E8F0"
};

const statDescStyle = {
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.75)"
};

const promiseBannerStyle = {
  position: "relative",
  width: "100%",
  backgroundImage: "url('/asset/img1.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center"
};

const promiseOverlayStyle = {
  width: "100%",
  backgroundColor: "rgba(27, 31, 140, 0.9)",
  padding: "90px 48px",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const promiseContentStyle = {
  maxWidth: "800px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  color: "#FFFFFF"
};

const promiseTagStyle = {
  fontSize: "13px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#86EFAC"
};

const promiseTitleStyle = {
  fontSize: "38px",
  fontWeight: "800",
  color: "#FFFFFF",
  margin: 0,
  lineHeight: "1.25"
};

const promiseDescStyle = {
  fontSize: "17px",
  color: "rgba(255, 255, 255, 0.88)",
  lineHeight: "1.6",
  margin: 0
};

const promiseBtnStyle = {
  border: "none",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  padding: "16px 36px",
  borderRadius: "999px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  transition: "background-color 0.2s ease, transform 0.2s ease"
};
