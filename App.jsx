import React, { useMemo, useState } from "react";

const sampleCampaigns = [
  {
    id: 1,
    brand: "GlowNest",
    product: "Vitamin C Face Serum",
    category: "Beauty",
    budget: "$300 - $500",
    workType: "Instagram Reel",
    status: "Open",
  },
  {
    id: 2,
    brand: "FitFuel",
    product: "Protein Snack Bar",
    category: "Fitness",
    budget: "$150 - $250",
    workType: "Instagram Story",
    status: "Open",
  },
  {
    id: 3,
    brand: "TechAura",
    product: "Wireless Earbuds",
    category: "Tech",
    budget: "$500 - $900",
    workType: "Reel + Story",
    status: "Closed",
  },
];

const sampleHistory = [
  {
    id: "H-101",
    product: "Matte Lip Kit",
    creator: "RiyaCreates",
    budget: "$250",
    result: "Completed",
  },
  {
    id: "H-102",
    product: "Hydra Cleanser",
    creator: "MakeupWithAsha",
    budget: "$420",
    result: "Completed",
  },
];

const sampleInvites = [
  {
    id: "I-201",
    brand: "GlowNest",
    product: "Vitamin C Face Serum",
    workType: "Instagram Reel",
    budget: "$300 - $500",
    domain: "Beauty",
  },
  {
    id: "I-202",
    brand: "FitFuel",
    product: "Protein Snack Bar",
    workType: "Instagram Story",
    budget: "$150 - $250",
    domain: "Fitness",
  },
];

const scorecardData = [
  { label: "Completed Promotions", value: 18 },
  { label: "Acceptance Rate", value: "92%" },
  { label: "Average Rating", value: "4.8/5" },
  { label: "Domain Match Score", value: "89%" },
];

function App() {
  const [screen, setScreen] = useState("landing");
  const [brandProfile, setBrandProfile] = useState({
    brandName: "",
    productType: "",
  });
  const [creatorProfile, setCreatorProfile] = useState({
    name: "",
    platform: "",
    domain: "",
  });

  const [campaigns, setCampaigns] = useState(sampleCampaigns);

  const matchingCampaigns = useMemo(() => {
    if (!creatorProfile.domain) return campaigns;
    return campaigns.filter(
      (item) =>
        item.category.toLowerCase() === creatorProfile.domain.toLowerCase()
    );
  }, [campaigns, creatorProfile.domain]);

  const [newCampaign, setNewCampaign] = useState({
    product: "",
    budget: "",
    workType: "Instagram Reel",
    category: "",
  });

  const handleBrandSubmit = (e) => {
    e.preventDefault();
    setScreen("brandDashboard");
  };

  const handleCreatorSubmit = (e) => {
    e.preventDefault();
    setScreen("creatorDashboard");
  };

  const handleCampaignPost = (e) => {
    e.preventDefault();
    if (!newCampaign.product || !newCampaign.budget || !newCampaign.category) {
      alert("Please fill all required fields.");
      return;
    }

    const campaign = {
      id: Date.now(),
      brand: brandProfile.brandName || "Your Brand",
      product: newCampaign.product,
      category: newCampaign.category,
      budget: newCampaign.budget,
      workType: newCampaign.workType,
      status: "Open",
    };

    setCampaigns([campaign, ...campaigns]);
    setNewCampaign({
      product: "",
      budget: "",
      workType: "Instagram Reel",
      category: "",
    });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark">
          <div className="logo-dot"></div>
          <span>Radius</span>
        </div>

        <nav className="topnav">
          <button onClick={() => setScreen("landing")}>Home</button>
          <button onClick={() => setScreen("brandForm")}>Brand</button>
          <button onClick={() => setScreen("creatorForm")}>Creator</button>
        </nav>
      </header>

      {screen === "landing" && (
        <section className="landing-page">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="badge">AI-Powered Brand x Creator Matching</span>
              <h1>
                Connect brands and creators for smarter marketing collaborating
              </h1>
              <p>
                A modern collaboration platform where brand owners can post
                campaigns, creators can discover paid promotions, and AI helps
                match both sides in the same domain for better results.
              </p>

              <div className="cta-row">
                <button className="primary-btn" onClick={() => setScreen("brandForm")}>
                  Join as Brand
                </button>
                <button className="secondary-btn" onClick={() => setScreen("creatorForm")}>
                  Join as Creator
                </button>
              </div>
            </div>

            <div className="hero-card">
              <div className="glass-card">
                <h3>Platform Highlights</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <h2>120+</h2>
                    <p>Active Campaigns</p>
                  </div>
                  <div className="stat-box">
                    <h2>80+</h2>
                    <p>Verified Creators</p>
                  </div>
                  <div className="stat-box">
                    <h2>95%</h2>
                    <p>Domain Match Accuracy</p>
                  </div>
                  <div className="stat-box">
                    <h2>24/7</h2>
                    <p>Instant Discovery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-strip">
            <div className="feature-card">
              <h3>For Brands</h3>
              <p>Post product campaigns, define budget, and choose deliverables like reel or story.</p>
            </div>
            <div className="feature-card">
              <h3>For Creators</h3>
              <p>Explore collaboration invites, accept relevant campaigns, and build your scorecard.</p>
            </div>
            <div className="feature-card">
              <h3>AI Matching</h3>
              <p>Bring brands and creators together based on similar domain and promotional relevance.</p>
            </div>
          </div>
        </section>
      )}

      {screen === "brandForm" && (
        <section className="form-page">
          <div className="form-card">
            <h2>Brand Onboarding</h2>
            <p>Tell us about your brand and product category.</p>

            <form onSubmit={handleBrandSubmit} className="form-grid">
              <div className="input-group">
                <label>Brand Name</label>
                <input
                  type="text"
                  placeholder="Enter your brand name"
                  value={brandProfile.brandName}
                  onChange={(e) =>
                    setBrandProfile({ ...brandProfile, brandName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Product Type</label>
                <input
                  type="text"
                  placeholder="Example: Beauty, Tech, Fitness"
                  value={brandProfile.productType}
                  onChange={(e) =>
                    setBrandProfile({ ...brandProfile, productType: e.target.value })
                  }
                  required
                />
              </div>

              <button className="primary-btn full-btn" type="submit">
                Continue to Brand Dashboard
              </button>
            </form>
          </div>
        </section>
      )}

      {screen === "creatorForm" && (
        <section className="form-page">
          <div className="form-card">
            <h2>Creator Onboarding</h2>
            <p>Tell us about your creator profile and niche.</p>

            <form onSubmit={handleCreatorSubmit} className="form-grid">
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={creatorProfile.name}
                  onChange={(e) =>
                    setCreatorProfile({ ...creatorProfile, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Platform</label>
                <input
                  type="text"
                  placeholder="Instagram, YouTube, TikTok"
                  value={creatorProfile.platform}
                  onChange={(e) =>
                    setCreatorProfile({ ...creatorProfile, platform: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Domain / Niche</label>
                <input
                  type="text"
                  placeholder="Beauty, Tech, Fitness"
                  value={creatorProfile.domain}
                  onChange={(e) =>
                    setCreatorProfile({ ...creatorProfile, domain: e.target.value })
                  }
                  required
                />
              </div>

              <button className="primary-btn full-btn" type="submit">
                Continue to Creator Dashboard
              </button>
            </form>
          </div>
        </section>
      )}

      {screen === "brandDashboard" && (
        <section className="dashboard-page">
          <div className="dashboard-header">
            <div>
              <h2>Brand Dashboard</h2>
              <p>
                Welcome, <strong>{brandProfile.brandName || "Brand Owner"}</strong>
              </p>
            </div>
            <div className="pill-tag">{brandProfile.productType || "Category"}</div>
          </div>

          <div className="dashboard-grid">
            <div className="panel large-panel">
              <h3>Post New Campaign</h3>
              <form onSubmit={handleCampaignPost} className="form-grid">
                <div className="input-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    placeholder="Enter launched product name"
                    value={newCampaign.product}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, product: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Budget Range</label>
                  <input
                    type="text"
                    placeholder="Example: $200 - $500"
                    value={newCampaign.budget}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, budget: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Work Type</label>
                  <select
                    value={newCampaign.workType}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, workType: e.target.value })
                    }
                  >
                    <option>Instagram Reel</option>
                    <option>Instagram Story</option>
                    <option>Reel + Story</option>
                    <option>YouTube Short</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="Beauty, Tech, Fitness"
                    value={newCampaign.category}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, category: e.target.value })
                    }
                  />
                </div>

                <button className="primary-btn full-btn" type="submit">
                  Publish Campaign
                </button>
              </form>
            </div>

            <div className="panel">
              <h3>Campaign History</h3>
              <div className="list-wrap">
                {sampleHistory.map((item) => (
                  <div key={item.id} className="list-card">
                    <div>
                      <h4>{item.product}</h4>
                      <p>Creator: {item.creator}</p>
                    </div>
                    <div className="right-info">
                      <span>{item.budget}</span>
                      <small>{item.result}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel full-width">
              <h3>All Posted Campaigns</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Budget</th>
                      <th>Work Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((item) => (
                      <tr key={item.id}>
                        <td>{item.brand}</td>
                        <td>{item.product}</td>
                        <td>{item.category}</td>
                        <td>{item.budget}</td>
                        <td>{item.workType}</td>
                        <td>
                          <span className={`status ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {screen === "creatorDashboard" && (
        <section className="dashboard-page">
          <div className="dashboard-header">
            <div>
              <h2>Creator Dashboard</h2>
              <p>
                Welcome, <strong>{creatorProfile.name || "Creator"}</strong>
              </p>
            </div>
            <div className="pill-tag">{creatorProfile.domain || "Your Domain"}</div>
          </div>

          <div className="dashboard-grid">
            <div className="panel large-panel">
              <h3>AI Matched Collaboration Invites</h3>
              <div className="list-wrap">
                {(matchingCampaigns.length ? matchingCampaigns : sampleInvites).map((item) => (
                  <div key={item.id} className="invite-card">
                    <div>
                      <h4>{item.product}</h4>
                      <p>{item.brand}</p>
                      <small>
                        {item.category || item.domain} • {item.workType}
                      </small>
                    </div>
                    <div className="invite-side">
                      <span>{item.budget}</span>
                      <button className="small-btn">Send Interest</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <h3>Creator Scorecard</h3>
              <div className="score-grid">
                {scorecardData.map((item) => (
                  <div className="score-box" key={item.label}>
                    <p>{item.label}</p>
                    <h2>{item.value}</h2>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel full-width">
              <h3>Profile Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Name</span>
                  <strong>{creatorProfile.name}</strong>
                </div>
                <div className="summary-item">
                  <span>Platform</span>
                  <strong>{creatorProfile.platform}</strong>
                </div>
                <div className="summary-item">
                  <span>Domain</span>
                  <strong>{creatorProfile.domain}</strong>
                </div>
                <div className="summary-item">
                  <span>Status</span>
                  <strong>Available for Collaboration</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
