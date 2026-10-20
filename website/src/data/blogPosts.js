// src/data/blogPosts.js
// Single source of truth for all blog posts.

const images = import.meta.glob("../assets/blog/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const findImage = (name) => {
  const entry = Object.entries(images).find(([path]) =>
    new RegExp(`/${name}\\.[a-z]+$`, "i").test(path),
  );
  return entry?.[1] ?? null;
};

const acquisitionImage = findImage("doktorconnect");
const authorLuke = findImage("luke");
const copdImage = findImage("early-copd");
const spirometryImage = findImage("clinical-research");
const lungAgeImage = findImage("race-spirometry");
const valueCareImage = findImage("preventive-medicine");

export const BLOG_POSTS_FULL = [
  // ─────────────────────────────────────────────────────────────
  // POST 1: Acquisition (featured)
  // ─────────────────────────────────────────────────────────────
  {
    slug: "doktorconnect-acquires-vitalflo",
    category: "Impact and News",
    title:
      "VitalFlo is Acquired by Doktorconnect to Integrate Proactive Respiratory Care Solutions",
    subtitle:
      "VitalFlo joins Doktorconnect to expand proactive respiratory care across the care continuum.",
    excerpt:
      "VitalFlo, a proactive respiratory care technology platform, today announced its acquisition by Doktorconnect, a preventative health care company.",
    date: "May 8, 2025",
    readTime: "6 Min Read",
    image: acquisitionImage,
    featured: true,
    author: {
      name: "Luke Marshall, PhD",
      role: "Founder, VitalFlo",
      photo: authorLuke,
      bio: "Luke Marshall is the founder of VitalFlo...",
      links: [
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/lukegmarshall/",
        },
        { label: "Medium", href: "https://medium.com/@lukemarshall" },
      ],
    },
    tags: ["News", "Acquisition", "Respiratory Care"],
    content: [
      {
        type: "paragraph",
        text: "VitalFlo, a proactive respiratory care technology platform, today announced its acquisition by Doktorconnect, a preventative health care company.",
      },
      {
        type: "paragraph",
        text: "Doktorconnect is transforming healthcare from a sick care model to a preventative care focus. The acquisition of VitalFlo aims to expand Doktorconnect's suite of health monitoring and care capabilities to now include the delivery of comprehensive, data-driven respiratory care solutions.",
      },
      {
        type: "paragraph",
        text: "VitalFlo's innovative platform offers tools for in-office spirometry, remote patient monitoring, and clinical decision support, enabling healthcare providers to proactively manage conditions like asthma and COPD. By integrating VitalFlo's technology, Doktorconnect will now include preventative respiratory health services as part of its unified solution that already supports patients and providers with preventive services promoting cardiovascular, metabolic, endocrine, and musculoskeletal health.",
      },
      {
        type: "quote",
        text: "The acquisition of VitalFlo aligns with our mission to empower healthcare providers with comprehensive and cutting-edge tools that improve patient outcomes. VitalFlo's expertise in respiratory care complements our existing services. Together, we can offer a more holistic approach to patient health.",
        author: "Dr. Joseph Olowe, CEO of Doktorconnect",
      },
      {
        type: "image",
        src: acquisitionImage,
        alt: "VitalFlo platform on tablet and phone",
      },
      {
        type: "paragraph",
        text: "VitalFlo has been instrumental in transforming pulmonary care by connecting patients and providers through its digital platform. The company's solutions have been adopted by medical groups, hospitals, and ACOs to test, monitor, and track pulmonary patients in various care settings.",
      },
      {
        type: "quote",
        text: "Joining forces with Doktorconnect presents an exciting opportunity to scale our impact. Our shared vision of leveraging technology to enhance patient care makes this partnership a natural fit.",
        author: "Luke Marshall, PhD, Founder of VitalFlo",
      },
      {
        type: "paragraph",
        text: "The integration of VitalFlo's platform into Doktorconnect's suite of services is expected to roll out over the coming months, with a focus on ensuring a seamless transition for existing clients and patients.",
      },
      { type: "heading", level: 2, text: "About Doktorconnect" },
      {
        type: "paragraph",
        text: "Doktorconnect, headquartered in El Paso, Texas, is a digital health platform leading the way in transforming healthcare from a sick care model to a preventative care focus. Its holistic preventive and wellness technology is robust with FDA and CE-certified IoT devices, providing tailored solutions for a healthier life, enhanced vitality, and increased longevity.",
      },
      {
        type: "link",
        text: "https://doktorconnect.com/us/",
        href: "https://doktorconnect.com/us/",
      },
      { type: "heading", level: 2, text: "About VitalFlo" },
      {
        type: "paragraph",
        text: "VitalFlo, founded in Raleigh, NC in 2017, is a digital health company specializing in proactive respiratory care. Its platform enables healthcare providers to deliver best-in-class respiratory care across the care continuum, from in-office testing to remote patient monitoring.",
      },
      {
        type: "link",
        text: "https://vitalflohealth.com",
        href: "https://vitalflohealth.com",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // POST 2: Early COPD
  // ─────────────────────────────────────────────────────────────
  {
    slug: "benefits-early-identification-copd",
    category: "Science and Research",
    title: "The Benefits of Early Identification of COPD",
    excerpt:
      "Early detection of COPD can dramatically improve patient outcomes, slow disease progression, and reduce healthcare costs.",
    date: "April 12, 2025",
    readTime: "8 Min Read",
    image: copdImage,
    author: {
      name: "Dr. Amara Osei",
      role: "Pulmonologist",
      photo: null,
      links: [
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/lukegmarshall/",
        }, // Temporarily using Luke's link for testing
      ],
    },
    tags: ["COPD", "Research", "Diagnosis"],
    content: [
      {
        type: "paragraph",
        text: "Chronic Obstructive Pulmonary Disease (COPD) affects millions of people worldwide, yet many cases remain undiagnosed until significant lung function has already been lost. Early identification is one of the most powerful tools we have for changing the trajectory of this disease.",
      },
      { type: "heading", level: 2, text: "Why Early Detection Matters" },
      {
        type: "paragraph",
        text: "By the time symptoms become noticeable, patients may have already lost 50% or more of their lung function. Early identification through spirometry allows providers to intervene when treatments are most effective.",
      },
      {
        type: "list",
        items: [
          "Slows disease progression significantly",
          "Reduces hospitalizations and emergency visits",
          "Improves quality of life",
          "Lowers long-term healthcare costs",
        ],
      },
      { type: "heading", level: 2, text: "Screening Recommendations" },
      {
        type: "paragraph",
        text: "Current guidelines recommend spirometry screening for individuals over 40 with a history of smoking, occupational exposure, or persistent respiratory symptoms.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // POST 3: Why Spirometry
  // ─────────────────────────────────────────────────────────────
  {
    slug: "why-spirometry",
    category: "Learning with VitalFlo",
    title: "Why Spirometry?",
    excerpt:
      "Spirometry is the gold standard for diagnosing and monitoring respiratory conditions. Here's why it matters.",
    date: "March 20, 2025",
    readTime: "5 Min Read",
    image: spirometryImage,
    author: {
      name: "Luke Marshall, PhD",
      role: "Founder, VitalFlo",
      photo: authorLuke,
      links: [
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/lukegmarshall/",
        },
        { label: "Medium", href: "https://medium.com/@lukemarshall" },
      ],
    },
    tags: ["Spirometry", "Diagnosis"],
    content: [
      {
        type: "paragraph",
        text: "Spirometry is the most common pulmonary function test used to assess how well the lungs are working. It measures how much air a person can breathe in and out, and how quickly.",
      },
      { type: "heading", level: 2, text: "What Spirometry Measures" },
      {
        type: "list",
        items: [
          "FVC (Forced Vital Capacity)",
          "FEV1 (Forced Expiratory Volume in 1 second)",
          "FEV1/FVC ratio",
          "PEF (Peak Expiratory Flow)",
        ],
      },
      {
        type: "paragraph",
        text: "These measurements help providers diagnose asthma, COPD, and other respiratory conditions, as well as track disease progression over time.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // POST 4: Spirometric Lung Age (Jiski screenshot aapne bheji thi)
  // ─────────────────────────────────────────────────────────────
  {
    slug: "spirometric-lung-age-smoking-cessation",
    category: "Science and Research",
    title: "Spirometric Lung Age as a Tool in Smoking Cessation Programs",
    excerpt:
      "Sharing a patient's 'lung age' can be a powerful motivator for quitting smoking.",
    date: "February 8, 2025",
    readTime: "7 Min Read",
    image: lungAgeImage,
    author: {
      name: "Dr. Amara Osei",
      role: "Pulmonologist",
      photo: null,
      links: [
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/lukegmarshall/",
        }, // Temporarily using Luke's link for testing
      ],
    },
    tags: ["Smoking Cessation", "Research"],
    content: [
      {
        type: "paragraph",
        text: "Spirometric lung age is a concept that translates complex lung function measurements into an easy-to-understand number: how old your lungs appear to be compared to a healthy person of the same age.",
      },
      {
        type: "paragraph",
        text: "Studies have shown that when smokers are shown their lung age, they are significantly more likely to quit or attempt to quit smoking.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // POST 5: Value-Based Care
  // ─────────────────────────────────────────────────────────────
  {
    slug: "spirometry-value-based-care",
    category: "Learning with VitalFlo",
    title: "The Benefits of Spirometry for Value-Based Care",
    excerpt:
      "How spirometry supports value-based care models by improving outcomes and reducing costs.",
    date: "January 15, 2025",
    readTime: "6 Min Read",
    image: valueCareImage,
    author: {
      name: "Luke Marshall, PhD",
      role: "Founder, VitalFlo",
      photo: authorLuke,
      links: [
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/lukegmarshall/",
        },
        { label: "Medium", href: "https://medium.com/@lukemarshall" },
      ],
    },
    tags: ["Value-Based Care", "Spirometry"],
    content: [
      {
        type: "paragraph",
        text: "Value-based care models reward providers for improving patient outcomes while reducing costs. Spirometry plays a crucial role in this equation for respiratory patients.",
      },
      { type: "heading", level: 2, text: "Key Benefits" },
      {
        type: "list",
        items: [
          "Early detection of respiratory conditions",
          "Better medication management",
          "Fewer emergency visits",
          "Improved patient engagement",
          "Measurable outcomes tracking",
        ],
      },
    ],
  },

  // POST 6: Nyx Robey
  {
    slug: "nyx-robey-article-example",
    category: "Science and Research",
    title: "An Example Article by Nyx Robey",
    excerpt: "This is an example post to show Nyx's LinkedIn link.",
    date: "January 1, 2025",
    readTime: "4 Min Read",
    image: null,
    author: {
      name: "Nyx Robey",
      role: "Data Scientist",
      photo: null,
      links: [
        { label: "LinkedIn", href: "https://www.linkedin.com/in/nyxrobey/" },
      ],
    },
    tags: ["Data", "Research"],
    content: [{ type: "paragraph", text: "Content goes here..." }],
  },

  // POST 7: Alicia Chen
  {
    slug: "alicia-chen-article-example",
    category: "Science and Research",
    title: "An Example Article by Alicia Chen",
    excerpt: "This is an example post to show Alicia's LinkedIn link.",
    date: "January 1, 2025",
    readTime: "4 Min Read",
    image: null,
    author: {
      name: "Alicia Chen",
      role: "Researcher",
      photo: null,
      links: [
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/alicia--chen/",
        },
      ],
    },
    tags: ["Data", "Research"],
    content: [{ type: "paragraph", text: "Content goes here..." }],
  },
];

// Helper: find a post by slug
export const getPostBySlug = (slug) =>
  BLOG_POSTS_FULL.find((p) => p.slug === slug);
