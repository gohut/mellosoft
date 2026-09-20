"use client";

import React from "react";
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
  const { navigateTo, setActiveFilters, setSearchQuery } = useStore();

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
    <div className="about-page-wrapper">
      {/* 1. HERO SECTION */}
      <section className="about-hero-section">
        <div className="about-hero-inner">
          <div className="about-hero-text">
            <div className="about-badge">
              <Sparkles size={14} color="#16A34A" />
              <span>ABOUT MELLOSOFT</span>
            </div>
            <h1 className="about-hero-title">About Mellosoft</h1>
            <h2 className="about-hero-subtitle">Better sleep. Better living.</h2>
            <p className="about-hero-desc">
              At Mellosoft, we believe exceptional sleep is the foundation of a healthier, happier life. Engineered with ergonomic precision and crafted from eco-certified materials, our luxury mattresses, pillows, bed frames, and protectors transform every night into a serene, restorative experience.
            </p>
            <div className="about-hero-pills">
              <div className="about-hero-pill-item">
                <CheckCircle2 size={16} color="#16A34A" />
                <span>100-Night Free Trial</span>
              </div>
              <div className="about-hero-pill-item">
                <CheckCircle2 size={16} color="#16A34A" />
                <span>10-Year Warranty</span>
              </div>
              <div className="about-hero-pill-item">
                <CheckCircle2 size={16} color="#16A34A" />
                <span>Free Doorstep Delivery</span>
              </div>
            </div>
          </div>
          <div className="about-hero-image-wrap">
            <img
              src="/asset/img1.jpg"
              alt="Mellosoft Luxury Bedding & Sleep Experience"
              className="about-hero-image"
            />
            <div className="about-hero-floating-badge">
              <Award size={22} color="#16A34A" />
              <div>
                <strong className="about-floating-title">100% Certified</strong>
                <span className="about-floating-sub">Sleep Ergonomics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHO WE ARE */}
      <section className="about-section-white">
        <div className="about-section-inner">
          <div className="about-two-col-grid">
            <div className="about-two-col-image-wrap">
              <img
                src="/asset/img2.jpg"
                alt="Mellosoft Master Craftsmanship"
                className="about-two-col-image"
              />
            </div>
            <div className="about-two-col-content">
              <div className="about-sub-tag">WHO WE ARE</div>
              <h2 className="about-section-heading">Who We Are</h2>
              <p className="about-paragraph">
                Mellosoft is a premier sleep and comfort brand dedicated to redesigning sleep essentials for modern living. We specialize in high-performance mattresses, ergonomic memory foam pillows, handcrafted solid bed frames, and waterproof mattress protectors.
              </p>
              <p className="about-paragraph">
                Driven by sleep ergonomics, our design philosophy combines zero-motion transfer pocket coil matrices with cooling open-cell memory foam to ensure your posture remains perfectly aligned throughout the night.
              </p>
              <div className="about-feature-list">
                <div className="about-feature-item">
                  <div className="about-icon-box">
                    <Layers size={20} color="#1B1F8C" />
                  </div>
                  <div>
                    <h4 className="about-feature-title">Precision Layering</h4>
                    <p className="about-feature-desc">Ergonomic zoning designed to relieve hip and shoulder pressure.</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="about-icon-box">
                    <ShieldCheck size={20} color="#1B1F8C" />
                  </div>
                  <div>
                    <h4 className="about-feature-title">Eco-Certified Safety</h4>
                    <p className="about-feature-desc">100% OEKO-TEX and CertiPUR-US certified non-toxic materials.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR MISSION */}
      <section className="about-section-muted">
        <div className="about-section-inner">
          <div className="about-center-header">
            <div className="about-sub-tag">OUR MISSION</div>
            <h2 className="about-section-heading">Our Mission</h2>
            <p className="about-center-desc">
              Our goal is simple: to make high-quality, comfortable sleep products accessible to everyone without compromise. We combine sleep science, sustainable craftsmanship, and direct-to-consumer accessibility.
            </p>
          </div>

          <div className="about-mission-grid">
            <div className="about-mission-card">
              <div className="about-card-icon-box">
                <Sparkles size={26} color="#1B1F8C" />
              </div>
              <h3 className="about-mission-title">Better Comfort</h3>
              <p className="about-mission-desc">
                Ergonomically engineered foam matrixes and responsive hybrid pocket coils that contour naturally to your body profile, relieving pressure points for deep, uninterrupted sleep.
              </p>
            </div>

            <div className="about-mission-card">
              <div className="about-card-icon-box">
                <Award size={26} color="#16A34A" />
              </div>
              <h3 className="about-mission-title">Quality Materials</h3>
              <p className="about-mission-desc">
                Sourced from non-toxic, eco-certified suppliers. OEKO-TEX certified fabrics, breathable organic latex, and open-cell cooling foams engineered to last for years.
              </p>
            </div>

            <div className="about-mission-card">
              <div className="about-card-icon-box">
                <Moon size={26} color="#1B1F8C" />
              </div>
              <h3 className="about-mission-title">Better Sleep</h3>
              <p className="about-mission-desc">
                Grounded in sleep science to promote optimal spinal alignment, active temperature regulation, and zero-motion transfer so you wake up refreshed every single morning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE MELLOSOFT */}
      <section className="about-section-white">
        <div className="about-section-inner">
          <div className="about-center-header">
            <div className="about-sub-tag">WHY CHOOSE MELLOSOFT</div>
            <h2 className="about-section-heading">Why Choose Mellosoft</h2>
            <p className="about-center-desc">
              Everything you need for total sleep confidence and lifetime peace of mind.
            </p>
          </div>

          <div className="about-why-grid">
            <div className="about-why-card">
              <div className="about-green-icon-box">
                <RotateCcw size={22} color="#16A34A" />
              </div>
              <h3 className="about-why-title">100-Night Trial</h3>
              <p className="about-why-desc">
                Sleep on it for 100 nights in your home. If you don't love it, return it risk-free.
              </p>
            </div>

            <div className="about-why-card">
              <div className="about-green-icon-box">
                <Truck size={22} color="#16A34A" />
              </div>
              <h3 className="about-why-title">Free Delivery</h3>
              <p className="about-why-desc">
                Fast, complimentary doorstep delivery nationwide, packaged for effortless setup.
              </p>
            </div>

            <div className="about-why-card">
              <div className="about-green-icon-box">
                <ShieldCheck size={22} color="#16A34A" />
              </div>
              <h3 className="about-why-title">10-Year Warranty</h3>
              <p className="about-why-desc">
                Built to last. Backed by a full 10-year non-prorated structural warranty.
              </p>
            </div>

            <div className="about-why-card">
              <div className="about-green-icon-box">
                <Award size={22} color="#16A34A" />
              </div>
              <h3 className="about-why-title">Premium Materials</h3>
              <p className="about-why-desc">
                Non-toxic, hypoallergenic foams and organic covers designed for cooling airflow.
              </p>
            </div>

            <div className="about-why-card">
              <div className="about-green-icon-box">
                <Headphones size={22} color="#16A34A" />
              </div>
              <h3 className="about-why-title">Customer Support</h3>
              <p className="about-why-desc">
                Our dedicated sleep specialists are available to guide your choice and assist with queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER TRUST & STATISTICS */}
      <section className="about-stats-section">
        <div className="about-section-inner about-stats-inner">
          <div className="about-stats-grid">
            <div className="about-stat-card">
              <div className="about-stat-value">100%</div>
              <div className="about-stat-label">Quality Sleep Products</div>
              <div className="about-stat-sub">Ergonomically Certified</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-value">4+</div>
              <div className="about-stat-label">Product Categories</div>
              <div className="about-stat-sub">Mattresses, Pillows & More</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-value">50,000+</div>
              <div className="about-stat-label">Happy Sleepers</div>
              <div className="about-stat-sub">Restful Nights Delivered</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-value">Free & Fast</div>
              <div className="about-stat-label">Reliable Delivery</div>
              <div className="about-stat-sub">Nationwide Doorstep Shipping</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR PROMISE (CTA BANNER) */}
      <section className="about-promise-banner">
        <div className="about-promise-overlay">
          <div className="about-promise-content">
            <div className="about-promise-tag">OUR PROMISE</div>
            <h2 className="about-promise-title">Designed for better nights and brighter mornings.</h2>
            <p className="about-promise-desc">
              Every Mellosoft mattress, pillow, and bed frame is built to transform your daily health through the power of deeper, uninterrupted sleep.
            </p>
            <button onClick={goToCatalog} className="about-promise-btn">
              <span>Explore Our Products</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .about-page-wrapper {
          width: 100%;
          background-color: #FFFFFF;
          color: #14151A;
          overflow-x: hidden;
        }

        .about-hero-section {
          width: 100%;
          background: linear-gradient(180deg, #FAFAF7 0%, #FFFFFF 100%);
          border-bottom: 1px solid #EAEAE5;
        }

        .about-hero-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 64px 32px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          align-items: center;
          gap: 48px;
          box-sizing: border-box;
        }

        .about-hero-text {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .about-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background-color: rgba(22, 163, 74, 0.1);
          color: #16A34A;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          width: fit-content;
        }

        .about-hero-title {
          font-size: 44px;
          font-weight: 800;
          color: #1B1F8C;
          line-height: 1.15;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .about-hero-subtitle {
          font-size: 20px;
          font-weight: 600;
          color: #16A34A;
          margin: 0;
        }

        .about-hero-desc {
          font-size: 16px;
          line-height: 1.7;
          color: #52525B;
          margin: 0;
        }

        .about-hero-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 18px;
          margin-top: 6px;
        }

        .about-hero-pill-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #14151A;
          background-color: #FFFFFF;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .about-hero-image-wrap {
          position: relative;
          width: 100%;
          height: 420px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(27, 31, 140, 0.08);
          background-color: #F3F4F6;
        }

        .about-hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .about-hero-floating-badge {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          padding: 12px 18px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid #E7E7E2;
        }

        .about-floating-title {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          color: #14151A;
        }

        .about-floating-sub {
          font-size: 11.5px;
          color: #6B7280;
        }

        .about-section-white {
          width: 100%;
          background-color: #FFFFFF;
          border-bottom: 1px solid #EAEAE5;
        }

        .about-section-muted {
          width: 100%;
          background-color: #FAFAF7;
          border-bottom: 1px solid #EAEAE5;
        }

        .about-section-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 72px 32px;
          box-sizing: border-box;
        }

        .about-two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          align-items: center;
          gap: 48px;
        }

        .about-two-col-image-wrap {
          border-radius: 20px;
          overflow: hidden;
          height: 380px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.06);
          background-color: #F3F4F6;
        }

        .about-two-col-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .about-two-col-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .about-sub-tag {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #16A34A;
          text-transform: uppercase;
        }

        .about-section-heading {
          font-size: 34px;
          font-weight: 800;
          color: #1B1F8C;
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .about-paragraph {
          font-size: 15px;
          line-height: 1.7;
          color: #52525B;
          margin: 0;
        }

        .about-feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 8px;
        }

        .about-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .about-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background-color: rgba(27, 31, 140, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .about-feature-title {
          font-size: 15px;
          font-weight: 700;
          color: #14151A;
          margin: 0 0 4px 0;
        }

        .about-feature-desc {
          font-size: 13.5px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }

        .about-center-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 44px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .about-center-desc {
          font-size: 15.5px;
          color: #52525B;
          line-height: 1.65;
          margin: 0;
        }

        .about-mission-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .about-mission-card {
          background-color: #FFFFFF;
          border: 1px solid #E7E7E2;
          border-radius: 20px;
          padding: 32px 26px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .about-mission-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.06);
        }

        .about-card-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background-color: #FAFAF7;
          border: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .about-mission-title {
          font-size: 19px;
          font-weight: 700;
          color: #1B1F8C;
          margin: 0;
        }

        .about-mission-desc {
          font-size: 14px;
          line-height: 1.65;
          color: #6B7280;
          margin: 0;
        }

        .about-why-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .about-why-card {
          background-color: #FAFAF7;
          border: 1px solid #E7E7E2;
          border-radius: 18px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .about-why-card:hover {
          background-color: #F4F4F0;
          transform: translateY(-2px);
        }

        .about-green-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background-color: rgba(22, 163, 74, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .about-why-title {
          font-size: 17px;
          font-weight: 700;
          color: #14151A;
          margin: 0;
        }

        .about-why-desc {
          font-size: 13.5px;
          line-height: 1.55;
          color: #6B7280;
          margin: 0;
        }

        .about-stats-section {
          width: 100%;
          background-color: #1B1F8C;
          color: #FFFFFF;
        }

        .about-stats-inner {
          padding: 56px 32px;
        }

        .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          text-align: center;
        }

        .about-stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .about-stat-value {
          font-size: 36px;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.1;
        }

        .about-stat-label {
          font-size: 14.5px;
          font-weight: 700;
          color: #E2E8F0;
        }

        .about-stat-sub {
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.75);
        }

        .about-promise-banner {
          position: relative;
          width: 100%;
          background-image: url('/asset/img1.jpg');
          background-size: cover;
          background-position: center;
        }

        .about-promise-overlay {
          width: 100%;
          background-color: rgba(27, 31, 140, 0.92);
          padding: 80px 32px;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .about-promise-content {
          max-width: 760px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          color: #FFFFFF;
        }

        .about-promise-tag {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #86EFAC;
        }

        .about-promise-title {
          font-size: 36px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
          line-height: 1.25;
        }

        .about-promise-desc {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.6;
          margin: 0;
        }

        .about-promise-btn {
          border: none;
          background-color: #16A34A;
          color: #FFFFFF;
          padding: 15px 32px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .about-promise-btn:hover {
          background-color: #15803D;
          transform: translateY(-2px);
        }

        /* ── TABLET RESPONSIVE (max-width: 960px) ── */
        @media (max-width: 960px) {
          .about-hero-inner {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 48px 24px;
          }
          .about-hero-image-wrap {
            height: 320px;
          }
          .about-two-col-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .about-two-col-image-wrap {
            height: 300px;
          }
          .about-mission-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .about-why-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .about-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 28px 16px;
          }
          .about-section-inner {
            padding: 54px 24px;
          }
        }

        /* ── MOBILE RESPONSIVE (max-width: 640px) ── */
        @media (max-width: 640px) {
          .about-hero-inner {
            padding: 32px 16px 40px 16px;
            gap: 28px;
          }
          .about-hero-title {
            font-size: 28px;
            line-height: 1.2;
          }
          .about-hero-subtitle {
            font-size: 17px;
          }
          .about-hero-desc {
            font-size: 14.5px;
            line-height: 1.6;
          }
          .about-hero-pills {
            gap: 8px 10px;
          }
          .about-hero-pill-item {
            font-size: 12.5px;
            padding: 6px 12px;
          }
          .about-hero-image-wrap {
            height: 230px;
            border-radius: 16px;
          }
          .about-hero-floating-badge {
            bottom: 12px;
            left: 12px;
            padding: 8px 12px;
            gap: 8px;
            border-radius: 12px;
          }
          .about-floating-title {
            font-size: 12px;
          }
          .about-floating-sub {
            font-size: 10px;
          }

          .about-section-inner {
            padding: 40px 16px;
          }
          .about-section-heading {
            font-size: 24px;
            line-height: 1.25;
          }
          .about-center-header {
            margin-bottom: 28px;
          }
          .about-center-desc {
            font-size: 14px;
            line-height: 1.6;
          }
          .about-paragraph {
            font-size: 14px;
            line-height: 1.6;
          }
          .about-two-col-grid {
            gap: 24px;
          }
          .about-two-col-image-wrap {
            height: 220px;
            border-radius: 16px;
          }

          .about-mission-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .about-mission-card {
            padding: 22px 18px;
            border-radius: 16px;
          }
          .about-card-icon-box {
            width: 44px;
            height: 44px;
            border-radius: 12px;
          }
          .about-mission-title {
            font-size: 17px;
          }
          .about-mission-desc {
            font-size: 13.5px;
          }

          .about-why-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .about-why-card {
            padding: 18px 16px;
            border-radius: 14px;
          }
          .about-green-icon-box {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }
          .about-why-title {
            font-size: 16px;
          }
          .about-why-desc {
            font-size: 13px;
          }

          .about-stats-inner {
            padding: 40px 16px;
          }
          .about-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px 12px;
          }
          .about-stat-value {
            font-size: 28px;
          }
          .about-stat-label {
            font-size: 13px;
          }
          .about-stat-sub {
            font-size: 11px;
          }

          .about-promise-overlay {
            padding: 48px 16px;
          }
          .about-promise-title {
            font-size: 22px;
            line-height: 1.3;
          }
          .about-promise-desc {
            font-size: 14px;
            line-height: 1.55;
          }
          .about-promise-btn {
            width: 100%;
            max-width: 280px;
            justify-content: center;
            padding: 13px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
