/* @ds-bundle: {"format":3,"namespace":"CarvanaDS_8e8ede","components":[{"name":"Banner","sourcePath":"ui_kits/carvana-web/kitPrimitives.jsx"},{"name":"Button","sourcePath":"ui_kits/carvana-web/kitPrimitives.jsx"},{"name":"Checkbox","sourcePath":"ui_kits/carvana-web/kitForms.jsx"},{"name":"Chip","sourcePath":"ui_kits/carvana-web/kitPrimitives.jsx"},{"name":"FAQ","sourcePath":"ui_kits/carvana-web/kitCompositions.jsx"},{"name":"FAQItem","sourcePath":"ui_kits/carvana-web/kitCompositions.jsx"},{"name":"Hero","sourcePath":"ui_kits/carvana-web/kitCompositions.jsx"},{"name":"I","sourcePath":"ui_kits/carvana-web/kitIcons.jsx"},{"name":"IconBadge","sourcePath":"ui_kits/carvana-web/kitPrimitives.jsx"},{"name":"IndicatorBadge","sourcePath":"ui_kits/carvana-web/kitPrimitives.jsx"},{"name":"LabelBadge","sourcePath":"ui_kits/carvana-web/kitPrimitives.jsx"},{"name":"Logo","sourcePath":"ui_kits/carvana-web/kitIcons.jsx"},{"name":"ReviewCard","sourcePath":"ui_kits/carvana-web/kitCompositions.jsx"},{"name":"Select","sourcePath":"ui_kits/carvana-web/kitForms.jsx"},{"name":"SelectOption","sourcePath":"ui_kits/carvana-web/kitForms.jsx"},{"name":"SiteFooter","sourcePath":"ui_kits/carvana-web/kitCompositions.jsx"},{"name":"SiteNav","sourcePath":"ui_kits/carvana-web/kitCompositions.jsx"},{"name":"Stars","sourcePath":"ui_kits/carvana-web/kitPrimitives.jsx"},{"name":"TextBadge","sourcePath":"ui_kits/carvana-web/kitPrimitives.jsx"},{"name":"TextInput","sourcePath":"ui_kits/carvana-web/kitForms.jsx"},{"name":"VehicleTile","sourcePath":"ui_kits/carvana-web/kitCompositions.jsx"}],"sourceHashes":{"ui_kits/carvana-web/Banner.jsx":"a0244f22120b","ui_kits/carvana-web/Button.jsx":"abc3bcc385ea","ui_kits/carvana-web/Checkbox.jsx":"dd68c98ba685","ui_kits/carvana-web/Chip.jsx":"7859a25a5cb1","ui_kits/carvana-web/FAQ.jsx":"18ea6ec9323c","ui_kits/carvana-web/FAQItem.jsx":"6ed7e2465271","ui_kits/carvana-web/Hero.jsx":"b809cccbd07a","ui_kits/carvana-web/I.jsx":"271461c0f2f6","ui_kits/carvana-web/IconBadge.jsx":"5b5155c8d8f1","ui_kits/carvana-web/IndicatorBadge.jsx":"5f4c333b1667","ui_kits/carvana-web/LabelBadge.jsx":"3f99bd9f7843","ui_kits/carvana-web/Logo.jsx":"7e14ecdaca0a","ui_kits/carvana-web/ReviewCard.jsx":"ee974116c9de","ui_kits/carvana-web/Select.jsx":"d3b829fad153","ui_kits/carvana-web/SelectOption.jsx":"61991db5dc88","ui_kits/carvana-web/SiteFooter.jsx":"59832f4e73f2","ui_kits/carvana-web/SiteNav.jsx":"68efa39b91ac","ui_kits/carvana-web/Stars.jsx":"7944c987f496","ui_kits/carvana-web/TextBadge.jsx":"19659c289ac7","ui_kits/carvana-web/TextInput.jsx":"a3b6d3fd5b21","ui_kits/carvana-web/VehicleTile.jsx":"64e462360b72","ui_kits/carvana-web/kitCompositions.jsx":"ff888cc3def2","ui_kits/carvana-web/kitForms.jsx":"fa440a0e8c5d","ui_kits/carvana-web/kitIcons.jsx":"67134b74ba8a","ui_kits/carvana-web/kitPrimitives.jsx":"3a482a026ea0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CarvanaDS_8e8ede = window.CarvanaDS_8e8ede || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/carvana-web/kitCompositions.jsx
try { (() => {
// Carvana.com Web UI kit — mockup compositions.
// These are NOT in @carvana/ds-*; they're page-level assemblies of primitives,
// stable enough to reuse across mocks.
//
// Exports: SiteNav, Hero, VehicleTile, ReviewCard, FAQ, FAQItem, SiteFooter.
// Depends on: Icons.jsx (I, Logo), Primitives.jsx (Button, Banner, Stars, TextBadge).
//
// Responsive: SiteNav and SiteFooter track three breakpoints observed in Figma
// (Desktop ≥1024, Tablet 768–1023, Mobile <768). The active layout is picked
// from the hosting container's width via ResizeObserver so these compositions
// work correctly inside constrained previews (DCArtboard, iframe, etc.), not
// just at window size.

// useContainerSize — observes the nearest wrapping element's width.
// We use ResizeObserver (ideal, catches container changes that the window
// doesn't), with a window.resize fallback for environments where RO doesn't
// fire reliably. Both call setW from the same measure() helper.
const useContainerSize = () => {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) setW(rect.width);
    };
    measure();
    let ro = null;
    try {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } catch (e) {/* RO unsupported — fall back to window resize */}
    window.addEventListener("resize", measure);
    return () => {
      ro && ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return [ref, w];
};

// ---- SiteNav --------------------------------------------------------------
// Desktop ≥1024: logo + tab row on same line, sign-in / avatar on right.
// Tablet/Mobile <1024: logo row on top (+ menu / sign-in), tab row below.
// Optional info banner above everything (shown when `banner` is truthy).

const SiteNav = ({
  current,
  onTab,
  signedIn = false,
  onSignIn,
  banner = true
}) => {
  const [ref, w] = useContainerSize();
  const compact = w < 1024;
  const tabs = ["Search cars", "Sell/Trade", "Financing"];
  const tabRow = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      alignItems: "center",
      flexWrap: "nowrap",
      overflowX: "auto",
      scrollbarWidth: "none"
    }
  }, tabs.map(t => {
    const active = t === current;
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => onTab?.(t),
      style: {
        font: "var(--label-md)",
        padding: "8px 16px",
        border: "none",
        cursor: "pointer",
        background: active ? "var(--background-primary-subtle)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-default)",
        borderRadius: 999,
        height: 40,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 6
      }
    }, t === "Search cars" && /*#__PURE__*/React.createElement(I.Search, {
      s: 16
    }), t);
  }));

  // Single pill combining avatar + hamburger.
  // Source: /Navigation-Web/Components/SignedIn{Yes|No}StateDefault
  // 78×44 white pill, 1px slate border, 999px radius.
  //  - Signed in: orange "AP" avatar on left
  //  - Signed out: grey avatar with person glyph on left
  // Both: navy 3-line hamburger on right.
  const menuPill = /*#__PURE__*/React.createElement("button", {
    onClick: signedIn ? undefined : onSignIn,
    "aria-label": signedIn ? "Account menu" : "Sign in / menu",
    style: {
      width: 78,
      height: 44,
      borderRadius: 999,
      background: "var(--background-default)",
      border: "1px solid var(--border-default, #BECBDA)",
      padding: "6px 12px 6px 6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 4,
      cursor: "pointer"
    }
  }, signedIn ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 999,
      background: "var(--brand-tertiary)",
      display: "grid",
      placeItems: "center",
      color: "var(--text-strong)",
      font: "var(--label-sm)",
      fontWeight: 700
    }
  }, "AP") : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 999,
      background: "var(--background-muted-subtle, #E2E8F0)",
      display: "grid",
      placeItems: "center",
      color: "var(--text-strong)"
    }
  }, /*#__PURE__*/React.createElement(I.User, {
    s: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-strong)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(I.Menu, {
    s: 24
  })));
  const rightCluster = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "Favorites",
    style: {
      width: 44,
      height: 44,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--icon-default)",
      display: "grid",
      placeItems: "center",
      borderRadius: 999
    }
  }, /*#__PURE__*/React.createElement(I.Heart, {
    s: 24
  })), menuPill);
  return /*#__PURE__*/React.createElement("header", {
    ref: ref,
    style: {
      background: "var(--canvas-default)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, banner && /*#__PURE__*/React.createElement(Banner, {
    type: "informational",
    inline: true,
    align: "center",
    icon: true
  }, /*#__PURE__*/React.createElement(Banner.Message, null, "Free delivery to your driveway, anywhere in the contiguous U.S.", " ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: "var(--text-primary)",
      font: "var(--body-link-sm)"
    }
  }, "Learn more"))), compact ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 64,
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Logo, null), rightCluster), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      padding: "8px 24px",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, tabRow)) : /*#__PURE__*/React.createElement("nav", {
    style: {
      height: 76,
      padding: "0 40px",
      display: "flex",
      alignItems: "center",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Logo, null), tabRow, /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, rightCluster)));
};

// ---- Hero -----------------------------------------------------------------
const Hero = ({
  onShop
}) => {
  const [ref, w] = useContainerSize();
  const compact = w < 768;
  return /*#__PURE__*/React.createElement("section", {
    ref: ref,
    style: {
      padding: compact ? "32px 24px" : "56px 40px 40px",
      display: "grid",
      gridTemplateColumns: compact ? "1fr" : "1.1fr 1fr",
      gap: compact ? 24 : 40,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--label-sm)",
      color: "var(--text-primary)",
      textTransform: "uppercase",
      letterSpacing: ".08em",
      marginBottom: 12
    }
  }, "The new way to buy a car"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: compact ? "var(--brand-md)" : "var(--brand-lg)",
      color: "var(--text-strong)",
      letterSpacing: "-0.02em",
      textTransform: "uppercase",
      margin: "0 0 20px",
      textWrap: "balance"
    }
  }, "Skip the dealership.", /*#__PURE__*/React.createElement("br", null), "Shop 40,000+ cars online."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--body-regular-lg)",
      color: "var(--text-default)",
      margin: "0 0 32px",
      maxWidth: 520
    }
  }, "No-haggle prices, free delivery, and a 7-day money-back guarantee on every car."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: onShop
  }, "Shop cars"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary"
  }, "Get pre-qualified"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--border-radius-2xl)",
      overflow: "hidden",
      aspectRatio: "4/3",
      background: `center/cover no-repeat url(../../assets/vehicle-hero.png), var(--canvas-muted)`
    }
  }));
};

// ---- VehicleTile ----------------------------------------------------------
const VehicleTile = ({
  car,
  onFav,
  favorited
}) => /*#__PURE__*/React.createElement("article", {
  style: {
    background: "var(--background-default)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--border-radius-lg)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    aspectRatio: "4/3",
    background: `center/cover no-repeat url(../../assets/vehicle-hero.png), var(--canvas-muted)`
  }
}, /*#__PURE__*/React.createElement("button", {
  onClick: onFav,
  style: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 999,
    border: "none",
    background: "rgba(255,255,255,.92)",
    color: favorited ? "var(--reference-red-500)" : "var(--icon-default)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer"
  }
}, /*#__PURE__*/React.createElement(I.Heart, {
  s: 18,
  filled: favorited
})), car.badge && /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: 10,
    left: 10
  }
}, /*#__PURE__*/React.createElement(TextBadge, {
  priority: car.badge === "EV" ? "success" : "informational",
  variant: "subtle"
}, car.badge))), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    font: "var(--heading-sm)",
    color: "var(--text-strong)"
  }
}, car.year, " ", car.make, " ", car.model), /*#__PURE__*/React.createElement("div", {
  style: {
    font: "var(--body-regular-sm)",
    color: "var(--text-weak)"
  }
}, car.trim, " \xB7 ", car.miles, " mi"), /*#__PURE__*/React.createElement("div", {
  style: {
    font: "var(--heading-md)",
    color: "var(--text-strong)",
    marginTop: 4
  }
}, "$", car.price.toLocaleString()), /*#__PURE__*/React.createElement("div", {
  style: {
    font: "var(--body-regular-xs)",
    color: "var(--text-weak)"
  }
}, "Est. $", car.monthly, "/mo \xB7 Delivery by ", car.delivery)));

// ---- ReviewCard -----------------------------------------------------------
const ReviewCard = ({
  r
}) => /*#__PURE__*/React.createElement("article", {
  style: {
    background: "var(--background-default)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--border-radius-lg)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
}, /*#__PURE__*/React.createElement(Stars, {
  n: r.rating
}), /*#__PURE__*/React.createElement("p", {
  style: {
    font: "var(--body-regular-md)",
    color: "var(--text-default)",
    margin: 0,
    textWrap: "pretty"
  }
}, "\"", r.quote, "\""), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: "auto"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 36,
    height: 36,
    borderRadius: 999,
    background: "var(--background-muted-subtle)",
    color: "var(--text-strong)",
    display: "grid",
    placeItems: "center",
    font: "var(--label-sm)"
  }
}, r.initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    font: "var(--body-strong-sm)",
    color: "var(--text-strong)"
  }
}, r.name), /*#__PURE__*/React.createElement("div", {
  style: {
    font: "var(--body-regular-xs)",
    color: "var(--text-weak)"
  }
}, r.city))));

// ---- FAQ ------------------------------------------------------------------
// <FAQ title bodyText ctaLabel>
//   <FAQItem q="…">Answer body…</FAQItem>
//   …
// </FAQ>
//
// Desktop ≥1024: two-column (content lockup | accordion list).
// Compact: stacked, CTA button moved below the list.

const FAQItem = ({
  q,
  children,
  defaultOpen = false
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    "aria-expanded": open,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "20px 0",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      width: "100%",
      font: "var(--body-strong-md)",
      color: "var(--text-strong)",
      fontFamily: "inherit"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      textWrap: "balance"
    }
  }, q), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 auto",
      width: 32,
      height: 32,
      borderRadius: 999,
      display: "grid",
      placeItems: "center",
      color: "var(--icon-default)"
    }
  }, open ? /*#__PURE__*/React.createElement(I.Minus, {
    s: 20
  }) : /*#__PURE__*/React.createElement(I.Plus, {
    s: 20
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: open ? 400 : 0,
      overflow: "hidden",
      transition: "max-height 240ms ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 0 20px",
      font: "var(--body-regular-md)",
      color: "var(--text-default)",
      textWrap: "pretty",
      maxWidth: 640
    }
  }, children)));
};
const FAQ = ({
  title = "Frequently asked questions",
  bodyText = "Everything you need to know about buying, selling, and financing a car with Carvana.",
  ctaLabel = "See all FAQs",
  onCta,
  children
}) => {
  const [ref, w] = useContainerSize();
  const compact = w < 1024;
  const pad = compact ? "56px 24px" : "64px 40px";
  const lockup = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      maxWidth: 408
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: compact ? "var(--heading-2xl)" : "var(--heading-3xl)",
      color: "var(--text-strong)",
      letterSpacing: "-.02em",
      margin: 0,
      textWrap: "balance"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--body-regular-md)",
      color: "var(--text-default)",
      margin: 0,
      textWrap: "pretty"
    }
  }, bodyText), !compact && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    onClick: onCta
  }, ctaLabel)));
  const list = /*#__PURE__*/React.createElement("div", null, children);
  return /*#__PURE__*/React.createElement("section", {
    ref: ref,
    style: {
      padding: pad,
      background: "var(--canvas-default)"
    }
  }, compact ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, lockup, list, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    width: "100%",
    onClick: onCta
  }, ctaLabel))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "408px 1fr",
      gap: 124,
      maxWidth: 1272,
      margin: "0 auto"
    }
  }, lockup, list));
};

// ---- SiteFooter -----------------------------------------------------------
// Lifted from /Footer in the Figma. Four breakpoints collapse to three layouts:
//   Desktop ≥1024 — 5 columns (Financing, Trade/Sell, How it works, About, Support+Other)
//   Tablet 640–1023 — 2 rows of 2 columns + support column
//   Mobile <640 — 2 columns side by side, then single-column support block
//
// Navy background (--brand-secondary), light blue link text (--reference-blue-50).
const FOOTER_COLUMNS = [{
  h: "Financing",
  l: ["Get Pre-Qualified"]
}, {
  h: "Trade/Sell",
  l: ["Get an Offer", "Carvana Value Tracker"]
}, {
  h: "How it works",
  l: ["Buying From Carvana", "Selling or Trading In", "Finance With Carvana", "Auto Loan Calculator", "Our Protection Plans", "Repairs with Carvana", "Certified Cars", "Carvana Insurance", "Used EV Tax Credit"]
}, {
  h: "About Carvana",
  l: ["About Us", "Logistics Hubs", "Customer Reviews", "Careers"]
}];
const FOOTER_OTHER = ["partnerships@carvana.com", "media@carvana.com", "realestate@carvana.com"];
const FOOTER_UTIL = ["Search Cars", "Sitemap", "Investors", "Blog", "Patents", "Press"];
const FOOTER_LEGAL = ["User Agreement", "Financial and Other Privacy Notices", "Do Not Sell My Info", "Code of Conduct", "Responsible Disclosure", "Accessibility"];
const LINK = {
  font: "var(--body-regular-sm)",
  color: "var(--reference-blue-50, #E7F5FF)",
  textDecoration: "none",
  lineHeight: "20px"
};
const HEADING = {
  font: "var(--body-strong-md)",
  color: "var(--text-inverse)",
  fontWeight: 700,
  fontSize: 16,
  lineHeight: "20px",
  marginBottom: 16
};
const FooterColumn = ({
  heading,
  items
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: HEADING
}, heading), /*#__PURE__*/React.createElement("ul", {
  style: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16
  }
}, items.map(x => /*#__PURE__*/React.createElement("li", {
  key: x
}, /*#__PURE__*/React.createElement("a", {
  href: "#",
  style: LINK
}, x)))));
const SupportBlock = () => /*#__PURE__*/React.createElement("div", {
  style: {
    paddingBottom: 24,
    borderBottom: "1px solid rgba(255,255,255,.3)",
    display: "flex",
    flexDirection: "column",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: HEADING
}, "Support"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  style: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    ...LINK
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 32,
    height: 32,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    color: "var(--reference-blue-50, #E7F5FF)",
    border: "1px solid rgba(255,255,255,.3)"
  }
}, /*#__PURE__*/React.createElement(I.Info, {
  s: 18
})), "Support & Contact"));
const OtherBlock = () => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: HEADING
}, "Other"), /*#__PURE__*/React.createElement("ul", {
  style: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16
  }
}, FOOTER_OTHER.map(x => /*#__PURE__*/React.createElement("li", {
  key: x
}, /*#__PURE__*/React.createElement("a", {
  href: `mailto:${x}`,
  style: LINK
}, x)))));
const SocialIcons = () => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 16,
    color: "var(--reference-blue-50, #E7F5FF)"
  }
}, [I.Facebook, I.X, I.Instagram, I.Youtube, I.LinkedIn].map((Ic, i) => /*#__PURE__*/React.createElement("a", {
  key: i,
  href: "#",
  "aria-label": "social",
  style: {
    width: 32,
    height: 32,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.08)",
    color: "inherit"
  }
}, /*#__PURE__*/React.createElement(Ic, {
  s: 16
}))));
const LegalRow = () => /*#__PURE__*/React.createElement("div", {
  style: {
    font: "var(--body-regular-sm)",
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--reference-blue-50, #E7F5FF)",
    display: "flex",
    flexDirection: "column",
    gap: 4
  }
}, /*#__PURE__*/React.createElement("div", null, "Copyright \xA9 2026 Carvana. All Rights Reserved."), /*#__PURE__*/React.createElement("div", {
  style: {
    textWrap: "pretty"
  }
}, FOOTER_LEGAL.map((x, i) => /*#__PURE__*/React.createElement(React.Fragment, {
  key: x
}, i > 0 && /*#__PURE__*/React.createElement("span", {
  "aria-hidden": "true",
  style: {
    opacity: .6,
    margin: "0 8px"
  }
}, "|"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  style: {
    ...LINK,
    display: "inline"
  }
}, x)))));
const SiteFooter = () => {
  const [ref, w] = useContainerSize();
  const layout = w >= 1024 ? "desktop" : w >= 640 ? "tablet" : "mobile";
  const gridStyle = {
    desktop: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 24
    },
    tablet: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 40
    },
    mobile: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }
  }[layout];
  return /*#__PURE__*/React.createElement("footer", {
    ref: ref,
    style: {
      background: "var(--brand-secondary)",
      color: "var(--text-inverse)",
      padding: layout === "mobile" ? "56px 24px" : "80px 40px",
      marginTop: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1272,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 40
    }
  }, layout === "desktop" ? /*#__PURE__*/React.createElement("div", {
    style: gridStyle
  }, FOOTER_COLUMNS.map(c => /*#__PURE__*/React.createElement(FooterColumn, {
    key: c.h,
    heading: c.h,
    items: c.l
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(SupportBlock, null), /*#__PURE__*/React.createElement(OtherBlock, null))) : layout === "tablet" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: gridStyle
  }, FOOTER_COLUMNS.slice(0, 2).map(c => /*#__PURE__*/React.createElement(FooterColumn, {
    key: c.h,
    heading: c.h,
    items: c.l
  })), FOOTER_COLUMNS.slice(2).map(c => /*#__PURE__*/React.createElement(FooterColumn, {
    key: c.h,
    heading: c.h,
    items: c.l
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(SupportBlock, null), /*#__PURE__*/React.createElement(OtherBlock, null))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: gridStyle
  }, FOOTER_COLUMNS.map(c => /*#__PURE__*/React.createElement(FooterColumn, {
    key: c.h,
    heading: c.h,
    items: c.l
  }))), /*#__PURE__*/React.createElement(SupportBlock, null), /*#__PURE__*/React.createElement(OtherBlock, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--body-regular-sm)",
      fontWeight: 500,
      fontSize: 14,
      lineHeight: "20px",
      color: "var(--reference-blue-50, #E7F5FF)",
      textAlign: layout === "desktop" ? "center" : "left",
      textWrap: "pretty"
    }
  }, FOOTER_UTIL.map((x, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: x
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      opacity: .6,
      margin: "0 12px"
    }
  }, "|"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      ...LINK,
      display: "inline"
    }
  }, x)))), /*#__PURE__*/React.createElement(SocialIcons, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "rgba(255,255,255,.3)"
    }
  }), /*#__PURE__*/React.createElement(LegalRow, null)));
};
Object.assign(window, {
  SiteNav,
  Hero,
  VehicleTile,
  ReviewCard,
  FAQ,
  FAQItem,
  SiteFooter
});
Object.assign(__ds_scope, { SiteNav, Hero, VehicleTile, ReviewCard, FAQItem, FAQ, SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/kitCompositions.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/FAQ.jsx
try { (() => {

Object.assign(__ds_scope, { FAQ: __ds_scope.FAQ });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/FAQ.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/FAQItem.jsx
try { (() => {

Object.assign(__ds_scope, { FAQItem: __ds_scope.FAQItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/FAQItem.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/Hero.jsx
try { (() => {

Object.assign(__ds_scope, { Hero: __ds_scope.Hero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/ReviewCard.jsx
try { (() => {

Object.assign(__ds_scope, { ReviewCard: __ds_scope.ReviewCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/ReviewCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/SiteFooter.jsx
try { (() => {

Object.assign(__ds_scope, { SiteFooter: __ds_scope.SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/SiteNav.jsx
try { (() => {

Object.assign(__ds_scope, { SiteNav: __ds_scope.SiteNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/SiteNav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/VehicleTile.jsx
try { (() => {

Object.assign(__ds_scope, { VehicleTile: __ds_scope.VehicleTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/VehicleTile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/kitForms.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Carvana.com Web UI kit — form primitives.
// TextInput is a port of packages/text-input/src/lib/TextInput.{tsx,module.css,styles.ts}.
// Checkbox is a port of packages/checkbox/src/lib/Checkbox.{tsx,module.css}.
// Select is a port of packages/select/src/lib/Select.{tsx,module.css} (default variant only;
// radio/multiselect variants need the Popup port).
// Depends on: Icons.jsx (I) for the X clear icon.

(() => {
  if (document.getElementById("cvna-text-input-css")) return;
  const style = document.createElement("style");
  style.id = "cvna-text-input-css";
  style.textContent = `
.cvna-ti-wrapper{display:flex;flex-direction:column;gap:var(--spacing-sm);width:100%;font-feature-settings:'cpsp' on,'liga' off}
.cvna-ti-container{display:flex;align-items:center;gap:var(--spacing-lg);position:relative;border:1px solid var(--border-default);border-radius:var(--border-radius-md);background:var(--background-default);box-sizing:border-box;padding-right:var(--spacing-xl)}
.cvna-ti-wrapper.is-disabled .cvna-ti-container{border-color:var(--border-disabled);background-color:var(--background-disabled-subtle)}
.cvna-ti-wrapper.show-error-icon .cvna-ti-container{border-color:var(--border-critical)}
.cvna-ti-container:focus-within{border-color:var(--border-strong);box-shadow:0 0 0 3px rgba(34,139,230,.25)}
.cvna-ti-container:has(.cvna-ti-input:focus){border-color:var(--border-strong);box-shadow:0 0 0 3px rgba(34,139,230,.25)}
.cvna-ti-container:focus-within:not(:has(.cvna-ti-input:focus)){border-color:var(--border-default);box-shadow:none}

.cvna-ti-input{font:var(--body-regular-md);-webkit-appearance:none;border:none;background:transparent;outline:none;box-sizing:border-box;color:var(--text-strong);flex:1;height:3.5rem;line-height:1rem;padding-left:var(--spacing-xl);width:100%;min-width:0}
.cvna-ti-input:not(:focus){overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cvna-ti-input:disabled{cursor:not-allowed;color:var(--text-disabled)}
.cvna-ti-input.has-label{padding:0.875rem 0 0 var(--spacing-xl)}

.cvna-ti-label{--label-offset:-1.5rem;display:flex;position:absolute;pointer-events:none;user-select:none;align-items:center;top:0;bottom:0;left:1rem;cursor:text;margin:0 auto;transition:all 150ms ease-in-out;color:var(--text-weak);font:var(--label-md)}
.cvna-ti-wrapper.is-disabled .cvna-ti-label{cursor:not-allowed;color:var(--text-disabled)}
.cvna-ti-input:focus ~ .cvna-ti-label,.cvna-ti-input.is-populated ~ .cvna-ti-label{font:var(--label-xs);top:var(--label-offset);color:var(--text-weak)}
.cvna-ti-input:disabled.is-populated ~ .cvna-ti-label,.cvna-ti-wrapper.is-disabled .cvna-ti-input.is-populated ~ .cvna-ti-label{color:var(--text-disabled)}

.cvna-ti-icons{display:flex;gap:var(--spacing-lg);height:1rem;align-items:center}
.cvna-ti-icon-btn{border:none;background:transparent;cursor:pointer;color:var(--icon-default);width:1rem;height:1rem;padding:0;display:inline-flex;align-items:center;justify-content:center}
.cvna-ti-icon-btn:hover{color:var(--icon-hover)}
.cvna-ti-icon-btn:disabled{cursor:not-allowed;color:var(--icon-disabled);pointer-events:none}

.cvna-ti-error{font:var(--body-regular-xs);color:var(--text-critical);text-align:left}
`;
  document.head.appendChild(style);
})();

// Filled check / filled error glyphs (stand-ins for @carvana/ds-icons CheckFilledCvna + ErrorFilledCvna)
const CheckFilledIcon = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "currentColor",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "8",
  cy: "8",
  r: "8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6.8 10.6 4.2 8l.9-.9 1.7 1.7 4-4 .9.9z",
  fill: "var(--icon-inverse, #fff)"
}));
const ErrorFilledIcon = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "currentColor",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "8",
  cy: "8",
  r: "8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7.25 4h1.5v5h-1.5zM7.25 10.5h1.5V12h-1.5z",
  fill: "var(--icon-inverse, #fff)"
}));
const XIcon = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M18 6 6 18"
}), /*#__PURE__*/React.createElement("path", {
  d: "m6 6 12 12"
}));
const MiniSpinner = ({
  size = 16
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-block",
    width: size,
    height: size,
    border: "2px solid currentColor",
    borderRightColor: "transparent",
    borderRadius: "50%",
    animation: "cvna-spin .7s linear infinite",
    color: "var(--icon-default)"
  }
});
const TextInput = React.forwardRef(function TextInput({
  id,
  label,
  value = "",
  type = "text",
  disabled = false,
  error,
  hasError = false,
  loading = false,
  touched: touchedProp = false,
  maxLength,
  minLength,
  onChange,
  onBlur,
  onFocus,
  onClear,
  customIcon,
  onCustomIconClick,
  testId,
  className,
  children,
  ...rest
}, ref) {
  const [touchedState, setTouchedState] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const hasBeenTouched = touchedState || touchedProp;
  const hasValue = !!value;
  const validMin = minLength ? (value?.length ?? 0) >= minLength : true;
  const validMax = maxLength ? (value?.length ?? 0) <= maxLength : true;
  const hasClearButton = !error && isFocused && hasValue && !!onClear;
  const isValid = !isFocused && !error && hasBeenTouched && hasValue && validMin && validMax;
  const shouldShowError = hasError || !!error;
  const wrapperCls = ["cvna-ti-wrapper", disabled && "is-disabled", shouldShowError && "show-error-icon", className].filter(Boolean).join(" ");
  const inputCls = ["cvna-ti-input", label && "has-label", hasValue && "is-populated", disabled && "is-disabled"].filter(Boolean).join(" ");
  const handleBlur = e => {
    onBlur?.(e);
    setTouchedState(true);
    setIsFocused(false);
  };
  const handleFocus = e => {
    onFocus?.(e);
    setIsFocused(true);
  };
  const icons = [];
  if (isValid && !shouldShowError && !loading) icons.push(/*#__PURE__*/React.createElement(CheckFilledIcon, {
    key: "ok",
    size: 16
  }));
  if (shouldShowError && !loading) icons.push(/*#__PURE__*/React.createElement("span", {
    key: "err",
    style: {
      color: "var(--icon-critical)"
    }
  }, /*#__PURE__*/React.createElement(ErrorFilledIcon, {
    size: 16
  })));
  if (loading) icons.push(/*#__PURE__*/React.createElement(MiniSpinner, {
    key: "sp",
    size: 16
  }));
  if (hasClearButton) icons.push(/*#__PURE__*/React.createElement("button", {
    key: "clr",
    type: "button",
    className: "cvna-ti-icon-btn",
    "aria-label": "Clear Input",
    tabIndex: -1,
    onMouseDown: () => onClear()
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 16
  })));
  if (customIcon) icons.push(/*#__PURE__*/React.createElement("button", {
    key: "custom",
    type: "button",
    className: "cvna-ti-icon-btn",
    "aria-label": "Input Icon",
    tabIndex: disabled ? -1 : 0,
    disabled: disabled,
    onClick: disabled ? undefined : onCustomIconClick
  }, customIcon));
  return /*#__PURE__*/React.createElement("div", {
    className: wrapperCls,
    "data-testid": testId
  }, /*#__PURE__*/React.createElement("div", {
    className: "cvna-ti-container"
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    id: id,
    type: type,
    className: inputCls,
    disabled: disabled,
    value: value,
    maxLength: maxLength,
    minLength: minLength,
    onChange: onChange,
    onBlur: handleBlur,
    onFocus: handleFocus
  }, rest)), label && /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    className: "cvna-ti-label"
  }, label), icons.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cvna-ti-icons",
    "data-testid": "icon-container"
  }, icons.map((node, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, node))), children), shouldShowError && error?.trim() && /*#__PURE__*/React.createElement("div", {
    className: "cvna-ti-error"
  }, error));
});

// -- Checkbox --
// Port of packages/checkbox/src/lib/Checkbox.{tsx,module.css}.
// Hidden native input + styled frame. Props: checked, indeterminate,
// disabled, variant ('primary'|'inverse'), size ('default'|'small'),
// label, onChange.
(() => {
  if (document.getElementById("cvna-checkbox-css")) return;
  const style = document.createElement("style");
  style.id = "cvna-checkbox-css";
  style.textContent = `
.cvna-cb{cursor:pointer;display:inline-flex;align-items:flex-start;gap:var(--spacing-sm);font:var(--body-regular-md)}
.cvna-cb--small .cvna-cb__label{font:var(--body-regular-sm);padding-top:var(--spacing-xs)}
.cvna-cb__frame{align-items:center;background:var(--background-default);border:1px solid var(--border-default);border-radius:var(--border-radius-sm);color:var(--text-inverse);cursor:pointer;display:flex;height:18px;justify-content:center;width:18px;margin:.1875em;flex-shrink:0;pointer-events:none}
.cvna-cb__label{color:var(--text-default);font:var(--body-regular-md);margin:0;pointer-events:none;user-select:none}
.cvna-cb__native{border:0;clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;white-space:nowrap;width:1px}
.cvna-cb:not(.cvna-cb--disabled):not(.cvna-cb--checked) .cvna-cb__frame:hover{border-color:var(--border-strong)}
.cvna-cb:not(.cvna-cb--disabled) .cvna-cb__native:focus-visible + .cvna-cb__frame{box-shadow:0 0 0 3px rgba(34,139,230,.6),0 0 0 1px var(--focus-shadow-color,#228be6)}
.cvna-cb--checked .cvna-cb__frame{background:var(--background-strong);border-color:transparent}
.cvna-cb--checked .cvna-cb__frame:hover{background:var(--background-strong-hover);border-color:transparent}
.cvna-cb--disabled{cursor:not-allowed}
.cvna-cb--disabled .cvna-cb__frame{background:var(--background-disabled-subtle);border-color:var(--border-disabled);cursor:not-allowed}
.cvna-cb--disabled.cvna-cb--checked .cvna-cb__frame{background:var(--background-disabled);border-color:transparent}
.cvna-cb--disabled .cvna-cb__label{color:var(--text-disabled);cursor:not-allowed}
.cvna-cb--checked .cvna-cb__frame svg *{stroke:var(--icon-inverse)}
.cvna-cb--disabled .cvna-cb__frame svg *{stroke:var(--icon-disabled)}
.cvna-cb--inverse .cvna-cb__frame{background:transparent;border-color:var(--border-inverse)}
.cvna-cb--inverse .cvna-cb__label{color:var(--text-inverse)}
.cvna-cb--inverse:not(.cvna-cb--disabled):not(.cvna-cb--checked) .cvna-cb__frame:hover{border-color:var(--border-inverse-hover)}
.cvna-cb--inverse.cvna-cb--checked .cvna-cb__frame{background:var(--background-inverse);border-color:transparent}
.cvna-cb--inverse.cvna-cb--checked .cvna-cb__frame:hover{background:var(--background-inverse-hover)}
.cvna-cb--inverse.cvna-cb--disabled .cvna-cb__frame{background:transparent;border-color:var(--border-inverse-disabled)}
.cvna-cb--inverse.cvna-cb--disabled.cvna-cb--checked .cvna-cb__frame{background:var(--background-inverse-disabled)}
.cvna-cb--inverse.cvna-cb--disabled .cvna-cb__label{color:var(--text-inverse-disabled)}
`;
  document.head.appendChild(style);
})();

// Lucide Check + Minus (matches Checkbox.tsx imports)
const CheckIcon = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20 6 9 17l-5-5"
}));
const MinusIcon = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14"
}));
const Checkbox = React.forwardRef(function Checkbox({
  testId,
  value = "",
  name,
  label,
  checked = false,
  indeterminate = false,
  disabled = false,
  className,
  variant = "primary",
  size = "default",
  onBlur,
  onChange,
  onFocus,
  ...rest
}, ref) {
  const internalRef = React.useRef(null);
  // Bridge forwarded ref → internal ref so we can set .indeterminate
  React.useImperativeHandle(ref, () => internalRef.current);
  React.useEffect(() => {
    if (internalRef.current) internalRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const isChecked = checked || indeterminate;
  const cls = ["cvna-cb", isChecked && "cvna-cb--checked", disabled && "cvna-cb--disabled", variant === "inverse" && "cvna-cb--inverse", size === "small" && "cvna-cb--small", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("label", {
    className: cls,
    "data-testid": testId
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: internalRef,
    type: "checkbox",
    role: "checkbox",
    className: "cvna-cb__native",
    "aria-checked": indeterminate ? "mixed" : checked,
    value: value,
    name: name,
    checked: checked,
    disabled: disabled,
    onBlur: onBlur,
    onChange: onChange,
    onFocus: onFocus
  }, rest)), /*#__PURE__*/React.createElement("div", {
    className: "cvna-cb__frame"
  }, checked && !indeterminate && /*#__PURE__*/React.createElement(CheckIcon, {
    size: 16
  }), indeterminate && /*#__PURE__*/React.createElement(MinusIcon, {
    size: 16
  })), label && /*#__PURE__*/React.createElement("span", {
    className: "cvna-cb__label"
  }, label));
});

// -- Select --
// Port of packages/select/src/lib/Select.{tsx,module.css}. Implements the
// default (single-select) variant. Search, radio, and multiselect variants
// depend on the Popup port — add when Popup lands.
(() => {
  if (document.getElementById("cvna-select-css")) return;
  const style = document.createElement("style");
  style.id = "cvna-select-css";
  style.textContent = `
.cvna-sel{position:relative;width:100%;display:flex;flex-direction:column;gap:var(--spacing-sm)}
.cvna-sel__box{box-sizing:border-box;position:relative;display:flex;align-items:center;justify-content:space-between;width:100%;height:56px;padding:0 20px 0 16px;border:1px solid var(--border-default);border-radius:8px;background:var(--background-default);cursor:pointer;transition:all .2s ease}
.cvna-sel__box.has-error{border-color:var(--border-critical)}
.cvna-sel__box:hover:not(.has-error):not(.is-disabled){border-color:var(--border-strong)}
.cvna-sel__box:focus{outline:none}
.cvna-sel__box:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(34,139,230,.6)}
.cvna-sel__box[aria-expanded='true']:not(.has-error){border-color:var(--border-strong)}
.cvna-sel__box.is-disabled{cursor:not-allowed;background:var(--background-disabled-subtle);border-color:var(--border-disabled);color:var(--text-disabled)}
.cvna-sel__input-container{flex:1;display:grid;min-width:0}
.cvna-sel__label{font:var(--label-xs);color:var(--text-weak)}
.cvna-sel__label.is-disabled{color:var(--text-disabled)}
.cvna-sel__value{font:var(--body-regular-md);color:var(--text-strong);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cvna-sel__value.placeholder{color:var(--text-weak);font:var(--label-md)}
.cvna-sel__value.is-disabled{color:var(--text-disabled)}
.cvna-sel__chev{transition:transform 200ms;color:var(--icon-default);flex-shrink:0}
.cvna-sel__chev.is-open{transform:rotate(180deg)}
.cvna-sel__chev.is-disabled{color:var(--icon-disabled)}
.cvna-sel__popup{position:absolute;z-index:1000;top:calc(100% + 4px);left:0;right:0;background:var(--background-default);border:1px solid var(--border-default);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);max-height:464px;overflow-y:auto;padding:var(--spacing-sm) 0}
.cvna-sel__option{display:flex;align-items:center;padding:12px 16px;font:var(--body-regular-md);color:var(--text-strong);cursor:pointer;user-select:none}
.cvna-sel__option:hover:not(.is-disabled){background:var(--background-subtle)}
.cvna-sel__option.is-selected{background:var(--background-subtle);font:var(--label-md)}
.cvna-sel__option.is-disabled{color:var(--text-disabled);cursor:not-allowed}
.cvna-sel__error{font:var(--body-regular-xs);color:var(--text-critical)}
`;
  document.head.appendChild(style);
})();
const ChevronDownIcon = ({
  size = 16,
  className
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "m6 9 6 6 6-6"
}));

// <SelectOption value="x">Label</SelectOption> — sibling to Option from @carvana/ds-popup.
const SelectOption = ({
  children
}) => children;
const Select = ({
  children,
  label,
  value = "",
  hasError = false,
  error,
  touched = false,
  disabled = false,
  className,
  onChange,
  onFocus,
  onBlur,
  id,
  ...rest
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);
  const boxRef = React.useRef(null);

  // Flatten children into [{value, children, disabled}]
  const optionList = React.useMemo(() => {
    return React.Children.toArray(children).filter(React.isValidElement).map(el => ({
      value: el.props.value,
      label: el.props.children,
      disabled: !!el.props.disabled
    }));
  }, [children]);
  const selected = optionList.find(o => o.value === value);
  const displayValue = selected ? selected.label : "";
  const shouldShowError = touched && !value || hasError;

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);
  const handleClick = () => {
    if (!disabled) setIsOpen(v => !v);
  };
  const handleKeyDown = e => {
    if (disabled) return;
    if (!isOpen && ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setIsOpen(true);
    } else if (isOpen && e.key === "Escape") {
      setIsOpen(false);
    }
  };
  const handleSelect = (opt, e) => {
    if (opt.disabled) return;
    onChange?.(opt.label, e, opt.value);
    setIsOpen(false);
    boxRef.current?.focus();
  };
  const boxCls = ["cvna-sel__box", shouldShowError && "has-error", disabled && "is-disabled", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: "cvna-sel",
    ref: containerRef
  }, /*#__PURE__*/React.createElement("div", _extends({
    ref: boxRef,
    id: id,
    className: boxCls,
    role: "combobox",
    "aria-expanded": isOpen,
    "aria-haspopup": "listbox",
    "aria-disabled": disabled ? "true" : undefined,
    tabIndex: disabled ? -1 : 0,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onFocus: onFocus,
    onBlur: onBlur,
    "data-testid": "ds-select"
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "cvna-sel__input-container"
  }, value && /*#__PURE__*/React.createElement("div", {
    className: ["cvna-sel__label", disabled && "is-disabled"].filter(Boolean).join(" "),
    "aria-hidden": "true"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: ["cvna-sel__value", !value && "placeholder", disabled && "is-disabled"].filter(Boolean).join(" ")
  }, displayValue || label)), /*#__PURE__*/React.createElement(ChevronDownIcon, {
    size: 16,
    className: ["cvna-sel__chev", isOpen && "is-open", disabled && "is-disabled"].filter(Boolean).join(" ")
  })), isOpen && optionList.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cvna-sel__popup",
    role: "listbox"
  }, optionList.map(opt => /*#__PURE__*/React.createElement("div", {
    key: opt.value,
    role: "option",
    "aria-selected": opt.value === value,
    "aria-disabled": opt.disabled || undefined,
    className: ["cvna-sel__option", opt.value === value && "is-selected", opt.disabled && "is-disabled"].filter(Boolean).join(" "),
    onMouseDown: e => handleSelect(opt, e)
  }, opt.label))), shouldShowError && error?.trim() && /*#__PURE__*/React.createElement("div", {
    className: "cvna-sel__error"
  }, error));
};
Object.assign(window, {
  TextInput,
  Checkbox,
  Select,
  SelectOption
});
Object.assign(__ds_scope, { TextInput, Checkbox, SelectOption, Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/kitForms.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/Checkbox.jsx
try { (() => {

Object.assign(__ds_scope, { Checkbox: __ds_scope.Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/Checkbox.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/Select.jsx
try { (() => {

Object.assign(__ds_scope, { Select: __ds_scope.Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/Select.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/SelectOption.jsx
try { (() => {

Object.assign(__ds_scope, { SelectOption: __ds_scope.SelectOption });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/SelectOption.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/TextInput.jsx
try { (() => {

Object.assign(__ds_scope, { TextInput: __ds_scope.TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/TextInput.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/kitIcons.jsx
try { (() => {
// Carvana.com Web UI kit — icons + logo.
// Inline Lucide-matched SVGs; Carvana logo from /assets/logo-*.svg.

const I = {
  Search: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  Chevron: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  })),
  ChevronR: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m9 18 6-6-6-6"
  })),
  Heart: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: p.filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  })),
  User: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
  })),
  Star: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 16,
    height: p.s || 16,
    viewBox: "0 0 24 24",
    fill: p.filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  })),
  Truck: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 18h5a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 16.52 8H14"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "18",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "18",
    r: "2"
  })),
  Shield: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  })),
  Sliders: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "21",
    x2: "4",
    y2: "14"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "10",
    x2: "4",
    y2: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "21",
    x2: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "8",
    x2: "12",
    y2: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "21",
    x2: "20",
    y2: "16"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "12",
    x2: "20",
    y2: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "1",
    y1: "14",
    x2: "7",
    y2: "14"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "8",
    x2: "15",
    y2: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "17",
    y1: "16",
    x2: "23",
    y2: "16"
  })),
  Tag: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "7",
    y1: "7",
    x2: "7.01",
    y2: "7"
  })),
  Plus: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })),
  Minus: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  })),
  Menu: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "7",
    x2: "20",
    y2: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "12",
    x2: "20",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "17",
    x2: "20",
    y2: "17"
  })),
  Info: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "16",
    x2: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "8",
    x2: "12.01",
    y2: "8"
  })),
  Check: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })),
  Close: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  })),
  Alert: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  })),
  Facebook: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
  })),
  X: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
  })),
  Instagram: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "20",
    rx: "5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "17.5",
    y1: "6.5",
    x2: "17.51",
    y2: "6.5"
  })),
  Youtube: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
  })),
  LinkedIn: p => /*#__PURE__*/React.createElement("svg", {
    width: p.s || 24,
    height: p.s || 24,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
  }))
};
const Logo = ({
  white,
  height = 32
}) => /*#__PURE__*/React.createElement("img", {
  src: white ? "../../assets/logo-horizontal-inverse.svg" : "../../assets/logo-horizontal-default.svg",
  alt: "Carvana",
  style: {
    height,
    width: "auto",
    display: "block"
  }
});
Object.assign(window, {
  I,
  Logo
});
Object.assign(__ds_scope, { I, Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/kitIcons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/I.jsx
try { (() => {

Object.assign(__ds_scope, { I: __ds_scope.I });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/I.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/Logo.jsx
try { (() => {

Object.assign(__ds_scope, { Logo: __ds_scope.Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/Logo.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/kitPrimitives.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Carvana.DS · carvana-web — primitives.
//
// Components in this file:
//   Button         — port of packages/button/src/lib/Button.{tsx,module.css,variants.ts,sizes.tsx}
//   Chip           — port of packages/chip/src/lib/chip.{tsx,module.css}
//   Banner         — port of packages/banner/src/lib/Banner.{tsx,module.css}
//                    (incl. BannerGlyph, BannerCloseX, BannerHeadline, BannerMessage)
//   Badges         — port of packages/badges/src/lib/* (BadgeGlyph, IndicatorBadge,
//                    TextBadge, LabelBadge, IconBadge)
//   Stars          — mockup-level primitive (not in @carvana/ds-*)

(() => {
  if (document.getElementById("cvna-button-css")) return;
  const style = document.createElement("style");
  style.id = "cvna-button-css";
  style.textContent = `
.cvna-btn{align-items:center;border-radius:var(--button-border-radius);border:0;cursor:pointer;display:inline-flex;justify-content:center;outline:none;padding:var(--button-padding);gap:var(--spacing-md);white-space:nowrap;height:var(--button-height);width:var(--button-width);text-decoration:none;font-family:inherit}
.cvna-btn:disabled{cursor:not-allowed}
.cvna-btn:focus-visible{box-shadow:0 0 0 3px rgba(34,139,230,.6),0 0 0 1px var(--focus-shadow-color,#228be6)}
.cvna-btn--lg{font:var(--label-lg)}
.cvna-btn--md{font:var(--label-md)}
.cvna-btn--sm,.cvna-btn--xs{font:var(--label-sm)}

.cvna-btn--primary{background-color:var(--background-primary);color:var(--text-inverse)}
.cvna-btn--primary:hover:not(:disabled){background-color:var(--background-primary-hover)}
.cvna-btn--primary:active:not(:disabled){background-color:var(--background-primary-active)}
.cvna-btn--primary:disabled{background-color:var(--background-disabled);color:var(--text-disabled)}

.cvna-btn--primaryInverted{background-color:var(--background-default);color:var(--text-primary)}
.cvna-btn--primaryInverted:hover:not(:disabled){background-color:var(--background-default-hover);color:var(--text-primary-hover)}
.cvna-btn--primaryInverted:active:not(:disabled){background-color:var(--background-default-active);color:var(--text-primary-active)}
.cvna-btn--primaryInverted:disabled{background-color:var(--background-disabled);color:var(--text-disabled)}

.cvna-btn--secondary{box-shadow:inset 0 0 0 2px var(--border-strong);background-color:transparent;color:var(--text-strong)}
.cvna-btn--secondary:hover:not(:disabled){box-shadow:none;background-color:var(--background-primary-hover);color:var(--text-inverse)}
.cvna-btn--secondary:active:not(:disabled){box-shadow:none;background-color:var(--background-primary-active);color:var(--text-inverse)}
.cvna-btn--secondary:disabled{box-shadow:inset 0 0 0 2px var(--border-disabled);background-color:transparent;color:var(--text-disabled)}

.cvna-btn--secondaryUtility{box-shadow:none;background-color:var(--background-weak-transparent);color:var(--text-primary)}
.cvna-btn--secondaryUtility:hover:not(:disabled){background-color:var(--background-weak-hover);color:var(--text-primary-hover)}
.cvna-btn--secondaryUtility:active:not(:disabled){background-color:var(--background-default-active);color:var(--text-primary-active)}
.cvna-btn--secondaryUtility:disabled{background-color:var(--background-disabled);color:var(--text-disabled)}

.cvna-btn--secondaryInverted{box-shadow:inset 0 0 0 2px var(--border-inverse);background-color:transparent;color:var(--text-inverse)}
.cvna-btn--secondaryInverted:hover:not(:disabled){box-shadow:none;background-color:var(--background-default-hover);color:var(--text-primary-hover)}
.cvna-btn--secondaryInverted:active:not(:disabled){box-shadow:none;background-color:var(--background-default-active);color:var(--text-primary-active)}
.cvna-btn--secondaryInverted:disabled{box-shadow:inset 0 0 0 2px var(--border-disabled);background-color:transparent;color:var(--text-disabled-subtle)}

.cvna-btn--tertiary{background-color:var(--background-weak-transparent);color:var(--text-primary)}
.cvna-btn--tertiary:hover:not(:disabled){background-color:var(--background-weak-hover);color:var(--text-primary-hover)}
.cvna-btn--tertiary:active:not(:disabled){background-color:var(--background-weak-active);color:var(--text-inverse)}
.cvna-btn--tertiary:disabled{background-color:var(--background-weak-transparent);color:var(--text-disabled)}

.cvna-btn--tertiaryIcon{background-color:transparent;color:var(--text-strong)}
.cvna-btn--tertiaryIcon:hover:not(:disabled){background-color:var(--background-weak-hover);color:var(--text-primary-hover)}
.cvna-btn--tertiaryIcon:active:not(:disabled){background-color:var(--background-default-active);color:var(--icon-strong-active)}
.cvna-btn--tertiaryIcon:disabled{background-color:transparent;color:var(--text-disabled)}

.cvna-btn--tertiaryInverted{background-color:var(--background-weak-transparent);color:var(--text-inverse)}
.cvna-btn--tertiaryInverted:hover:not(:disabled){background-color:var(--background-weak-hover);color:var(--text-primary-hover)}
.cvna-btn--tertiaryInverted:active:not(:disabled){background-color:var(--background-weak-active);color:var(--text-inverse)}
.cvna-btn--tertiaryInverted:disabled{background-color:var(--background-weak-transparent);color:var(--text-disabled-subtle)}

.cvna-btn--tertiaryInvertedIcon{background-color:transparent;color:var(--text-inverse)}
.cvna-btn--tertiaryInvertedIcon:hover:not(:disabled){background-color:var(--background-default);color:var(--text-primary-hover)}
.cvna-btn--tertiaryInvertedIcon:active:not(:disabled){background-color:var(--background-default-active);color:var(--icon-primary-active)}
.cvna-btn--tertiaryInvertedIcon:disabled{background-color:transparent;color:var(--text-disabled-subtle)}

.cvna-btn--destructive{background-color:var(--background-critical);color:var(--text-inverse)}
.cvna-btn--destructive:hover:not(:disabled){background-color:var(--background-critical-hover)}
.cvna-btn--destructive:active:not(:disabled){background-color:var(--background-critical-active)}
.cvna-btn--destructive:disabled{background-color:var(--background-disabled);color:var(--text-disabled)}
@keyframes cvna-spin{to{transform:rotate(360deg)}}
`;
  document.head.appendChild(style);
})();
const BUTTON_SIZE_HEIGHT = {
  lg: "3.5rem",
  md: "3rem",
  sm: "2.5rem",
  xs: "2rem",
  xxs: "24px"
};
const BUTTON_SIZE_CLASS = {
  lg: "cvna-btn--lg",
  md: "cvna-btn--md",
  sm: "cvna-btn--sm",
  xs: "cvna-btn--xs",
  xxs: ""
};
function buttonSizeStyle({
  size,
  icon,
  utility,
  width
}) {
  const h = BUTTON_SIZE_HEIGHT[size] || BUTTON_SIZE_HEIGHT.md;
  if (icon) {
    const pad = size === "lg" ? "var(--spacing-xl)" : size === "md" ? "var(--spacing-lg)" : size === "sm" ? "var(--spacing-md)" : "var(--spacing-sm)"; // xs + xxs
    return {
      "--button-height": h,
      "--button-padding": pad,
      "--button-width": h
    };
  }
  let pad;
  if (size === "lg") pad = utility ? "0.875rem var(--spacing-2xl)" : "0.875rem var(--spacing-3xl)";else if (size === "md") pad = utility ? "var(--spacing-lg) var(--spacing-xl)" : "var(--spacing-lg) var(--spacing-2xl)";else if (size === "sm") pad = "10px var(--spacing-xl)";else if (size === "xs") pad = utility ? "0.375rem var(--spacing-md)" : "0.375rem var(--spacing-xl)";else pad = undefined;
  return {
    "--button-height": h,
    "--button-padding": pad,
    "--button-width": width || "auto"
  };
}
function buttonVariantClass({
  variant,
  icon,
  utility
}) {
  switch (variant) {
    case "primaryInverted":
      return "cvna-btn--primaryInverted";
    case "secondary":
      return utility ? "cvna-btn--secondaryUtility" : "cvna-btn--secondary";
    case "secondaryInverted":
      return "cvna-btn--secondaryInverted";
    case "tertiary":
      return icon ? "cvna-btn--tertiaryIcon" : "cvna-btn--tertiary";
    case "tertiaryInverted":
      return icon ? "cvna-btn--tertiaryInvertedIcon" : "cvna-btn--tertiaryInverted";
    case "destructive":
      return "cvna-btn--destructive";
    default:
      return "cvna-btn--primary";
  }
}
const Button = React.forwardRef(function Button({
  variant = "primary",
  size = "md",
  icon = false,
  utility = false,
  width,
  disabled = false,
  isLoading = false,
  type = "button",
  className,
  style,
  onClick,
  children,
  ...rest
}, ref) {
  const cls = ["cvna-btn", icon ? null : BUTTON_SIZE_CLASS[size] || BUTTON_SIZE_CLASS.md, buttonVariantClass({
    variant,
    icon,
    utility
  }), className].filter(Boolean).join(" ");
  const computedStyle = {
    "--button-border-radius": utility ? "var(--border-radius-md)" : "var(--border-radius-round)",
    ...buttonSizeStyle({
      size,
      icon,
      utility,
      width
    }),
    ...style
  };
  const handleClick = e => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    ref: ref,
    type: type,
    className: cls,
    style: computedStyle,
    disabled: disabled,
    "aria-disabled": isLoading ? "true" : undefined,
    "data-testid": "ds-button",
    onClick: handleClick
  }, rest), isLoading ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      width: 16,
      height: 16,
      border: "2px solid currentColor",
      borderRightColor: "transparent",
      borderRadius: "50%",
      animation: "cvna-spin .7s linear infinite"
    }
  }) : children);
});

// -- Chip --
// Port of packages/chip/src/lib/chip.{tsx,module.css}.
// Props: shape ('rectangle'|'pill'), size ('default'|'large'),
// selected, disabled, icon, iconPosition ('left'|'right').
(() => {
  if (document.getElementById("cvna-chip-css")) return;
  const style = document.createElement("style");
  style.id = "cvna-chip-css";
  style.textContent = `
.cvna-chip{align-items:center;background:var(--background-default);border:1px solid var(--border-weak);color:var(--text-strong);cursor:pointer;display:inline-flex;gap:var(--spacing-sm);justify-content:center;outline:none;white-space:nowrap;font-family:inherit}
.cvna-chip--shape-rectangle{border-radius:var(--border-radius-md)}
.cvna-chip--shape-pill{border-radius:var(--border-radius-round)}
.cvna-chip--size-default{font:var(--body-regular-sm);padding:6px var(--spacing-md)}
.cvna-chip--size-large{font:var(--body-regular-md);padding:var(--spacing-md) var(--spacing-xl)}
.cvna-chip:focus-visible{box-shadow:0 0 0 3px rgba(34,139,230,.6),0 0 0 1px var(--focus-shadow-color,#228be6)}
.cvna-chip:hover:not(.cvna-chip--selected):not(.cvna-chip--disabled){background:var(--background-default-hover)}
.cvna-chip:active:not(.cvna-chip--selected):not(.cvna-chip--disabled){background:var(--background-default-active)}
.cvna-chip--selected{background:var(--background-default-selected);border-color:transparent;color:var(--text-inverse)}
.cvna-chip--selected:not(.cvna-chip--disabled):hover{background:var(--background-default-selected);color:var(--text-inverse)}
.cvna-chip--disabled{background:var(--background-disabled);border-color:transparent;color:var(--text-disabled);cursor:not-allowed}
`;
  document.head.appendChild(style);
})();
const Chip = ({
  shape = "rectangle",
  size = "default",
  selected = false,
  disabled = false,
  icon,
  iconPosition = "right",
  className,
  children,
  testId,
  onClick,
  ...rest
}) => {
  const cls = ["cvna-chip", `cvna-chip--shape-${shape}`, `cvna-chip--size-${size}`, selected && "cvna-chip--selected", disabled && "cvna-chip--disabled", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "button",
    className: cls,
    "aria-disabled": disabled,
    "aria-pressed": selected,
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    "data-testid": testId
  }, rest), iconPosition === "left" && icon, children, iconPosition === "right" && icon);
};
const Stars = ({
  n = 5,
  size = 16
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "inline-flex",
    gap: 2,
    color: "var(--brand-tertiary)"
  }
}, [1, 2, 3, 4, 5].map(i => /*#__PURE__*/React.createElement(I.Star, {
  key: i,
  s: size,
  filled: i <= n
})));

// -- Banner --
// Port of packages/banner/src/lib/Banner.{tsx,module.css}.
// 5 types × inline/vertical × left/center × optional icon + dismiss.
// Compound API: <Banner><Banner.Headline/><Banner.Message/>...</Banner>.
(() => {
  if (document.getElementById("cvna-banner-css")) return;
  const style = document.createElement("style");
  style.id = "cvna-banner-css";
  style.textContent = `
.cvna-banner{font:var(--body-regular-sm);border-radius:var(--border-radius-md);border-style:solid;border-width:1px;gap:var(--spacing-md);padding:var(--spacing-xl);display:flex;flex-direction:column;width:100%;box-sizing:border-box}
.cvna-banner--system{background-color:var(--background-weak);border-color:var(--border-weak)}
.cvna-banner--warning{background-color:var(--background-warning-subtle);border-color:var(--border-warning)}
.cvna-banner--success{background-color:var(--background-success-subtle);border-color:var(--border-success)}
.cvna-banner--informational{background-color:var(--background-informational-subtle);border-color:var(--border-informational)}
.cvna-banner--critical{background-color:var(--background-critical-subtle);border-color:var(--border-critical)}
.cvna-banner__top{align-items:center;align-self:stretch;display:flex;gap:var(--spacing-md);padding:0}
.cvna-banner__header{display:flex;flex:1 0 0;gap:var(--spacing-md);padding:0}
.cvna-banner__header--inline{align-items:center}
.cvna-banner__header--block{align-items:flex-start}
.cvna-banner__header--center{justify-content:center}
.cvna-banner__header--left{justify-content:flex-start}
.cvna-banner__icon{align-items:center;display:flex;justify-content:flex-end;height:24px;width:24px;flex-shrink:0}
.cvna-banner__subcopy{align-self:stretch;display:flex;flex-direction:column;gap:var(--spacing-md)}
.cvna-banner__subcopy--center{align-items:center;text-align:center}
.cvna-banner__subcopy--left{align-items:flex-start;text-align:left}
.cvna-banner__headline{font:var(--body-strong-sm);color:var(--text-strong);margin:0}
.cvna-banner__header--block .cvna-banner__headline{margin-top:2px}
.cvna-banner__header--inline .cvna-banner__headline{align-self:center}
.cvna-banner__message{font:var(--body-regular-sm);color:var(--text-default);margin:0}
.cvna-banner__close{border:none;background:transparent;cursor:pointer;color:var(--icon-default);width:24px;height:24px;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--border-radius-md);flex-shrink:0}
.cvna-banner__close:hover{background:var(--background-weak-hover);color:var(--icon-hover)}
`;
  document.head.appendChild(style);
})();
const BANNER_ICON = {
  warning: {
    color: "var(--icon-warning)",
    glyph: "error"
  },
  success: {
    color: "var(--icon-success)",
    glyph: "check"
  },
  informational: {
    color: "var(--icon-informational)",
    glyph: "info"
  },
  critical: {
    color: "var(--icon-critical)",
    glyph: "error"
  },
  system: {
    color: "var(--icon-strong)",
    glyph: "info"
  }
};
const BannerGlyph = ({
  kind,
  color
}) => {
  // Filled circle backgrounds with knocked-out glyph (stand-in for ds-icons Cvna set)
  if (kind === "check") return /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    style: {
      color
    },
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m10.2 15.6-3.3-3.3 1.3-1.3 2 2 5.6-5.6 1.3 1.3z",
    fill: "#fff"
  }));
  if (kind === "error") return /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    style: {
      color
    },
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 6h2v8h-2zM11 16h2v2h-2z",
    fill: "#fff"
  }));
  return /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    style: {
      color
    },
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 10h2v8h-2zM11 6h2v2h-2z",
    fill: "#fff"
  }));
};
const BannerCloseX = () => /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M18 6 6 18"
}), /*#__PURE__*/React.createElement("path", {
  d: "m6 6 12 12"
}));
const BannerHeadline = ({
  children,
  ...props
}) => /*#__PURE__*/React.createElement("h2", _extends({
  className: "cvna-banner__headline"
}, props), children);
const BannerMessage = ({
  children,
  ...props
}) => /*#__PURE__*/React.createElement("p", _extends({
  className: "cvna-banner__message"
}, props), children);
const Banner = ({
  type = "system",
  align = "left",
  inline = false,
  icon = false,
  open = true,
  onDismiss,
  className,
  children,
  ...rest
}) => {
  if (!open) return null;
  const childArr = React.Children.toArray(children);
  const headline = childArr.filter(c => React.isValidElement(c) && c.type === BannerHeadline);
  const content = childArr.filter(c => !React.isValidElement(c) || c.type !== BannerHeadline);
  const hasContent = content.length > 0;
  const dismissible = typeof onDismiss === "function";
  const bannerIconNode = icon ? typeof icon !== "boolean" ? icon : /*#__PURE__*/React.createElement(BannerGlyph, {
    kind: BANNER_ICON[type].glyph,
    color: BANNER_ICON[type].color
  }) : null;
  const cls = ["cvna-banner", `cvna-banner--${type}`, className].filter(Boolean).join(" ");
  const headerCls = ["cvna-banner__header", inline ? "cvna-banner__header--inline" : "cvna-banner__header--block", align === "center" ? "cvna-banner__header--center" : "cvna-banner__header--left"].join(" ");
  const closeBtn = dismissible && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "cvna-banner__close",
    "aria-label": "Close",
    "data-testid": "banner-close-button",
    onClick: onDismiss
  }, /*#__PURE__*/React.createElement(BannerCloseX, null));
  const iconEl = bannerIconNode && /*#__PURE__*/React.createElement("div", {
    className: "cvna-banner__icon",
    "data-testid": "banner-icon"
  }, bannerIconNode);
  const style = headline.length === 0 && !icon ? {
    gap: 0
  } : undefined;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "alert",
    "aria-label": `${type} banner`,
    "aria-live": type === "critical" ? "assertive" : "polite",
    "data-testid": "banner",
    style: style
  }, rest), inline ? /*#__PURE__*/React.createElement("div", {
    className: "cvna-banner__top",
    "data-testid": "banner-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: headerCls,
    "data-testid": "banner-header"
  }, iconEl, headline, content), closeBtn) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "cvna-banner__top",
    "data-testid": "banner-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: headerCls,
    "data-testid": "banner-header"
  }, iconEl, headline), closeBtn), hasContent && /*#__PURE__*/React.createElement("div", {
    className: `cvna-banner__subcopy cvna-banner__subcopy--${align === "center" ? "center" : "left"}`
  }, content)));
};
Banner.Headline = BannerHeadline;
Banner.Message = BannerMessage;

// -- Badge (Indicator / Text / Label / Icon) --
// Port of packages/badge/src/lib/*.{tsx,module.css} + constant.ts + useGetIconToShow.tsx.
// Shared CSS; 4 exported components. Priorities:
//   'critical' | 'warning' | 'success' | 'informational' | 'muted' | 'disabled' | 'custom'
// TextBadge adds variant: 'strong' | 'subtle' | 'outline' (combines with priority →
// 'criticalSubtle', 'successOutline', etc. — matches the real module.css class names).
(() => {
  if (document.getElementById("cvna-badge-css")) return;
  const style = document.createElement("style");
  style.id = "cvna-badge-css";
  style.textContent = `
.cvna-badge-indicator{display:flex;justify-content:center;align-items:center;box-sizing:content-box;border-radius:var(--border-radius-round);color:var(--text-inverse);width:fit-content;font:var(--label-xs);text-align:center}
.cvna-badge-indicator.cvna-badge--sm{width:4px;height:4px;border:1px solid var(--border-inverse)}
.cvna-badge-indicator.cvna-badge--md{width:8px;height:8px;border:1.5px solid var(--border-inverse)}
.cvna-badge-indicator.cvna-badge--lg{min-width:16px;height:16px;border:2px solid var(--border-inverse);padding:0 4px;box-sizing:border-box}
.cvna-badge-indicator.cvna-pri--critical{background-color:var(--background-critical)}
.cvna-badge-indicator.cvna-pri--warning{background-color:var(--background-warning)}
.cvna-badge-indicator.cvna-pri--success{background-color:var(--background-success)}
.cvna-badge-indicator.cvna-pri--informational{background-color:var(--background-informational)}
.cvna-badge-indicator.cvna-pri--muted{background-color:var(--background-muted-strong)}
.cvna-badge-indicator.cvna-pri--disabled{background-color:var(--background-disabled);color:var(--text-disabled)}

.cvna-badge-text{display:inline-flex;justify-content:center;align-items:center;padding:3px var(--spacing-md);border-radius:var(--border-radius-round);gap:var(--spacing-sm);font:var(--label-xs);width:fit-content}
.cvna-badge-text.cvna-tpri--critical{background-color:var(--background-critical);color:var(--text-inverse)}
.cvna-badge-text.cvna-tpri--criticalSubtle{background-color:var(--background-critical-subtle);color:var(--text-critical)}
.cvna-badge-text.cvna-tpri--criticalOutline{background-color:var(--background-default);color:var(--text-strong);box-shadow:inset 0 0 0 2px var(--border-critical)}
.cvna-badge-text.cvna-tpri--warning{background-color:var(--background-warning);color:var(--decorative-black,#000)}
.cvna-badge-text.cvna-tpri--warningSubtle{background-color:var(--background-warning-subtle);color:var(--text-warning)}
.cvna-badge-text.cvna-tpri--warningOutline{background-color:var(--background-default);box-shadow:inset 0 0 0 2px var(--border-warning);color:var(--text-strong)}
.cvna-badge-text.cvna-tpri--success{background-color:var(--background-success);color:var(--text-inverse)}
.cvna-badge-text.cvna-tpri--successSubtle{background-color:var(--background-success-subtle);color:var(--text-success)}
.cvna-badge-text.cvna-tpri--successOutline{background-color:var(--background-default);box-shadow:inset 0 0 0 2px var(--border-success);color:var(--text-strong)}
.cvna-badge-text.cvna-tpri--informational{background-color:var(--background-informational);color:var(--text-inverse)}
.cvna-badge-text.cvna-tpri--informationalSubtle{background-color:var(--background-informational-subtle);color:var(--text-informational)}
.cvna-badge-text.cvna-tpri--informationalOutline{background-color:var(--background-default);box-shadow:inset 0 0 0 2px var(--border-informational);color:var(--text-strong)}
.cvna-badge-text.cvna-tpri--muted{background-color:var(--background-muted-strong);color:var(--text-inverse)}
.cvna-badge-text.cvna-tpri--mutedSubtle{background-color:var(--background-muted-subtle);color:var(--text-default)}
.cvna-badge-text.cvna-tpri--mutedOutline{background-color:var(--background-default);box-shadow:inset 0 0 0 2px var(--border-weak);color:var(--text-strong)}
.cvna-badge-text.cvna-tpri--disabled{background-color:var(--background-disabled);color:var(--text-disabled)}
.cvna-badge-text.cvna-tpri--disabledSubtle{background-color:var(--background-disabled-subtle);color:var(--text-disabled)}
.cvna-badge-text.cvna-tpri--disabledOutline{background-color:var(--background-disabled);box-shadow:inset 0 0 0 2px var(--border-disabled);color:var(--text-disabled)}
.cvna-badge-text.cvna-tpri--custom{background-color:var(--background-informational);color:var(--text-inverse)}
.cvna-badge-text.cvna-tpri--customSubtle{background-color:var(--background-informational-subtle);color:var(--text-informational)}
.cvna-badge-text.cvna-tpri--customOutline{background-color:var(--background-default);box-shadow:inset 0 0 0 2px var(--border-informational);color:var(--text-strong)}

.cvna-badge-label{display:inline-flex;justify-content:center;align-items:center;padding:2px 0;gap:var(--spacing-md);font:var(--label-sm);color:var(--text-default);width:fit-content}
.cvna-badge-label.cvna-badge--outline{padding:1px 6px;border-radius:var(--border-radius-round);border:1px solid var(--border-weak)}
.cvna-badge-label.cvna-badge--disabled{color:var(--text-disabled)}

.cvna-badge-icon{display:inline-flex;justify-content:center;align-items:center;gap:var(--spacing-md);font:var(--body-regular-sm);color:var(--text-default);width:fit-content}
.cvna-badge-icon.cvna-badge--disabled{color:var(--text-disabled)}
`;
  document.head.appendChild(style);
})();

// Maps priority → icon stroke color (for Text/Icon badges).
// Matches constant.ts → iconColorMap for the 'strong' variant; subtle/outline
// variants use the same semantic color token (not inverse).
const BADGE_ICON_COLOR = {
  critical: "var(--icon-inverse)",
  criticalSubtle: "var(--icon-critical)",
  criticalOutline: "var(--icon-critical)",
  warning: "var(--decorative-black, #000)",
  warningSubtle: "var(--icon-warning)",
  warningOutline: "var(--icon-warning)",
  success: "var(--icon-inverse)",
  successSubtle: "var(--icon-success)",
  successOutline: "var(--icon-success)",
  informational: "var(--icon-inverse)",
  informationalSubtle: "var(--icon-informational)",
  informationalOutline: "var(--icon-informational)",
  muted: "var(--icon-inverse)",
  mutedSubtle: "var(--icon-default)",
  mutedOutline: "var(--icon-default)",
  disabled: "var(--icon-disabled)",
  disabledSubtle: "var(--icon-disabled)",
  disabledOutline: "var(--icon-disabled)",
  custom: "currentColor",
  customSubtle: "currentColor",
  customOutline: "currentColor"
};

// Built-in glyphs for IconBadge — mirrors useGetIconToShow.tsx:
//   critical/warning → ErrorFilled (circle w/ "!") or CircleAlert (outlined)
//   success          → CheckFilled or CircleCheck
//   informational    → InfoFilled or Info
//   muted/disabled   → MinusFilled or CircleMinus
const BadgeGlyph = ({
  priority,
  outlined,
  size = 16,
  color
}) => {
  const s = size;
  const stroke = color || "currentColor";
  if (priority === "success") {
    return outlined ? /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: stroke,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m9 12 2 2 4-4"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: stroke
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m10.2 15.6-3.3-3.3 1.3-1.3 2 2 5.6-5.6 1.3 1.3z",
      fill: "#fff"
    }));
  }
  if (priority === "informational") {
    return outlined ? /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: stroke,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 16v-4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 8h.01"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: stroke
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M11 10h2v8h-2zM11 6h2v2h-2z",
      fill: "#fff"
    }));
  }
  if (priority === "muted" || priority === "disabled") {
    return outlined ? /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: stroke,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 12h8"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: stroke
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 11h10v2H7z",
      fill: "#fff"
    }));
  }
  // critical / warning (default)
  return outlined ? /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: stroke,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16h.01"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: stroke
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 6h2v8h-2zM11 16h2v2h-2z",
    fill: "#fff"
  }));
};

// ---- IndicatorBadge ----
// <IndicatorBadge size="lg|md|sm" priority="critical|..." customBackground="#hex"/>
// lg renders children inside (pill-style count); md/sm are pure dots.
const IndicatorBadge = ({
  size = "lg",
  priority = "critical",
  customBackground,
  className,
  children,
  ...rest
}) => {
  const cls = ["cvna-badge-indicator", `cvna-badge--${size}`, `cvna-pri--${priority}`, className].filter(Boolean).join(" ");
  const style = priority === "custom" && customBackground ? {
    backgroundColor: customBackground
  } : undefined;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    style: style
  }, rest), size === "lg" ? children : null);
};

// ---- TextBadge ----
// <TextBadge priority="success" variant="strong|subtle|outline" iconLeft={Cmp} iconRight={Cmp}>Label</TextBadge>
const TextBadge = ({
  priority = "critical",
  variant = "strong",
  Icon,
  iconLeft,
  iconRight,
  customBgColor,
  customBorderColor,
  customFontColor,
  className,
  children,
  ...rest
}) => {
  const formatted = variant === "strong" ? priority : variant === "subtle" ? `${priority}Subtle` : `${priority}Outline`;
  const cls = ["cvna-badge-text", `cvna-tpri--${formatted}`, className].filter(Boolean).join(" ");
  const style = priority === "custom" ? {
    backgroundColor: customBgColor,
    boxShadow: customBorderColor ? `inset 0 0 0 2px ${customBorderColor}` : undefined,
    color: customFontColor
  } : undefined;
  const LeftIcon = Icon || iconLeft;
  const iconColor = BADGE_ICON_COLOR[formatted];
  const renderIcon = Cmp => {
    if (!Cmp) return null;
    // Support both user-passed SVG components (LucideProps/IconProps shape: size + color)
    // and elements — if it's a function component, call with size+color.
    if (typeof Cmp === "function") return /*#__PURE__*/React.createElement(Cmp, {
      size: 16,
      color: iconColor
    });
    return Cmp;
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    style: style
  }, rest), renderIcon(LeftIcon), /*#__PURE__*/React.createElement("span", null, children), renderIcon(iconRight));
};

// ---- LabelBadge ----
// <LabelBadge priority="success" outline>Label</LabelBadge>
// Composes IndicatorBadge size="md" + text.
const LabelBadge = ({
  priority = "critical",
  outline = false,
  customIndicatorColor,
  className,
  children,
  ...rest
}) => {
  const cls = ["cvna-badge-label", outline && "cvna-badge--outline", priority === "disabled" && "cvna-badge--disabled", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), /*#__PURE__*/React.createElement(IndicatorBadge, {
    size: "md",
    priority: priority,
    customBackground: customIndicatorColor
  }), /*#__PURE__*/React.createElement("span", null, children));
};

// ---- IconBadge ----
// <IconBadge priority="warning" outlined>Label</IconBadge>
// Built-in glyph comes from BadgeGlyph; CustomIcon only used when priority="custom".
const IconBadge = ({
  priority = "critical",
  outlined = false,
  CustomIcon,
  className,
  children,
  ...rest
}) => {
  const cls = ["cvna-badge-icon", priority === "disabled" && "cvna-badge--disabled", className].filter(Boolean).join(" ");
  const iconColor = BADGE_ICON_COLOR[priority];
  const iconEl = priority === "custom" ? CustomIcon ? /*#__PURE__*/React.createElement(CustomIcon, {
    size: 16
  }) : null : /*#__PURE__*/React.createElement(BadgeGlyph, {
    priority: priority,
    outlined: outlined,
    color: iconColor
  });
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), iconEl, children && /*#__PURE__*/React.createElement("span", null, children));
};
Object.assign(window, {
  Button,
  Chip,
  Stars,
  Banner,
  IndicatorBadge,
  TextBadge,
  LabelBadge,
  IconBadge
});
Object.assign(__ds_scope, { Button, Chip, Stars, Banner, IndicatorBadge, TextBadge, LabelBadge, IconBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/kitPrimitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/Banner.jsx
try { (() => {

Object.assign(__ds_scope, { Banner: __ds_scope.Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/Banner.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/Button.jsx
try { (() => {

Object.assign(__ds_scope, { Button: __ds_scope.Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/Button.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/Chip.jsx
try { (() => {

Object.assign(__ds_scope, { Chip: __ds_scope.Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/Chip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/IconBadge.jsx
try { (() => {

Object.assign(__ds_scope, { IconBadge: __ds_scope.IconBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/IconBadge.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/IndicatorBadge.jsx
try { (() => {

Object.assign(__ds_scope, { IndicatorBadge: __ds_scope.IndicatorBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/IndicatorBadge.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/LabelBadge.jsx
try { (() => {

Object.assign(__ds_scope, { LabelBadge: __ds_scope.LabelBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/LabelBadge.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/Stars.jsx
try { (() => {

Object.assign(__ds_scope, { Stars: __ds_scope.Stars });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/Stars.jsx", error: String((e && e.message) || e) }); }

// ui_kits/carvana-web/TextBadge.jsx
try { (() => {

Object.assign(__ds_scope, { TextBadge: __ds_scope.TextBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/carvana-web/TextBadge.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.FAQ = __ds_scope.FAQ;

__ds_ns.FAQItem = __ds_scope.FAQItem;

__ds_ns.Hero = __ds_scope.Hero;

__ds_ns.I = __ds_scope.I;

__ds_ns.IconBadge = __ds_scope.IconBadge;

__ds_ns.IndicatorBadge = __ds_scope.IndicatorBadge;

__ds_ns.LabelBadge = __ds_scope.LabelBadge;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.ReviewCard = __ds_scope.ReviewCard;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.SelectOption = __ds_scope.SelectOption;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.SiteNav = __ds_scope.SiteNav;

__ds_ns.Stars = __ds_scope.Stars;

__ds_ns.TextBadge = __ds_scope.TextBadge;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.VehicleTile = __ds_scope.VehicleTile;

})();
