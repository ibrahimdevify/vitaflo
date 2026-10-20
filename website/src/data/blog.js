// Blog posts - real content from vitalflohealth.com/blog/all-posts.

const images = import.meta.glob("../assets/blog/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

export const img = (name) =>
  Object.entries(images).find(
    ([path]) =>
      path
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "") === name,
  )?.[1] ?? null;

const slugify = (t) =>
  t
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const authorImages = import.meta.glob(
  "../assets/authors/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  },
);

const authorImg = (name) =>
  Object.entries(authorImages).find(
    ([path]) =>
      path
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "") === slugify(name),
  )?.[1] ?? null;

const withSlug = (list) =>
  list.map((p) => ({
    ...p,
    slug: slugify(p.title),
    subtitle: p.subtitle ?? p.body?.[0]?.h ?? null,
    summary: p.summary ?? p.body?.[0]?.p?.[0] ?? p.excerpt ?? "",
    authorPhoto: authorImg(p.author),
  }));

const TEAM = "The VitalFlo Team";
const LUKE = "Luke Marshall, PhD";
const NYX = "Nyx Robey";

const NEWS = "Impact and News";
const SCIENCE = "Science and Research";
const LEARNING = "Learning with VitalFlo";
const WORKING = "Working at VitalFlo";

// ─────────────────────────────────────────────────────────────
// FEATURED POST
// ─────────────────────────────────────────────────────────────
export const BLOG_FEATURED = withSlug([
  {
    category: NEWS,
    title:
      "VitalFlo is Acquired by Doktorconnect to Integrate Proactive Respiratory Care Solutions",
    author: LUKE,
    date: "May 8, 2025",
    image: img("doktorconnect"),
    body: [
      {
        p: [
          "VitalFlo, a proactive respiratory care technology platform, today announced its acquisition by Doktorconnect, a preventative health care company. Doktorconnect is transforming healthcare from a sick care model to a preventative care focus. The acquisition of VitalFlo aims to expand Doktorconnect's suite of health monitoring and care capabilities to now include the delivery of comprehensive, data-driven respiratory care solutions.",
        ],
      },
      {
        p: [
          "VitalFlo's innovative platform offers tools for in-office spirometry, remote patient monitoring, and clinical decision support, enabling healthcare providers to proactively manage conditions like asthma and COPD. By integrating VitalFlo's technology, Doktorconnect will now include preventative respiratory health services as part of its unified solution that already supports patients and providers with preventive services promoting cardiovascular, metabolic, endocrine, and musculoskeletal health.",
        ],
      },
      {
        p: [
          '"The acquisition of VitalFlo aligns with our mission to empower healthcare providers with comprehensive and cutting-edge tools that improve patient outcomes," said Dr. Joseph Olowe, CEO of Doktorconnect. "VitalFlo\'s expertise in respiratory care complements our existing services. Together, we can offer a more holistic approach to patient health."',
        ],
      },
      {
        p: [
          "VitalFlo has been instrumental in transforming pulmonary care by connecting patients and providers through its digital platform. The company's solutions have been adopted by medical groups, hospitals, and ACOs to test, monitor, and track pulmonary patients in various care settings.",
        ],
      },
      {
        p: [
          '"Joining forces with Doktorconnect presents an exciting opportunity to scale our impact," said VitalFlo\'s Founder, Luke Marshall, PhD. "Our shared vision of leveraging technology to enhance patient care makes this partnership a natural fit."',
        ],
      },
      {
        p: [
          "The integration of VitalFlo's platform into Doktorconnect's suite of services is expected to roll out over the coming months, with a focus on ensuring a seamless transition for existing clients and patients.",
        ],
      },
      { h: "About Doktorconnect" },
      {
        p: [
          "Doktorconnect, headquartered in El Paso, Texas, is a digital health platform leading the way in transforming healthcare from a sick care model to a preventative care focus. Its holistic preventive and wellness technology is robust with FDA and CE-certified IoT devices, providing tailored solutions for a healthier life, enhanced vitality, and increased longevity. (https://doktorconnect.com/us/)",
        ],
      },
      { h: "About VitalFlo" },
      {
        p: [
          "VitalFlo, founded in Raleigh, NC in 2017, is a digital health company specializing in proactive respiratory care. Its platform enables healthcare providers to deliver best-in-class respiratory care across the care continuum, from in-office testing to remote patient monitoring. (https://vitalflohealth.com)",
        ],
      },
    ],
  },
])[0];

// ─────────────────────────────────────────────────────────────
// ALL ARTICLES
// ─────────────────────────────────────────────────────────────
export const BLOG_ARTICLES = withSlug([
  // ── Early Identification of COPD ──
  {
    category: SCIENCE,
    title: "The Benefits of Early Identification of COPD",
    excerpt:
      "Chronic Obstructive Pulmonary Disease (COPD) is a progressive lung disease that, if left untreated, can lead to a significant decline in quality of life.",
    author: "Andy Taylor",
    date: "February 21, 2024",
    readTime: "6 min read",
    image: img("early-copd"),
    tags: ["COPD"],
    body: [
      {
        p: [
          "Chronic Obstructive Pulmonary Disease (COPD) is a progressive lung disease that, if left untreated, can lead to a significant decline in quality of life and ultimately, premature death. However, early identification of COPD can change the course of the disease, offering patients a chance at a better quality of life and reduced healthcare costs.",
        ],
      },
      {
        h: "Slowing Disease Progression",
        p: [
          "One of the hallmarks of COPD is that it is a progressive disease that can worsen as the patient ages, experiences exacerbations, and is exposed to environmental risk factors. Early detection of COPD is crucial for slowing the progression of the disease.",
          "Initiating appropriate treatment and lifestyle changes at an early stage can help preserve lung function and delay the onset of severe symptoms.",
        ],
      },
      {
        h: "Improved Quality of Life",
        p: [
          "Identifying COPD early can dramatically improve the quality of life for individuals with the disease. Research has demonstrated that early therapeutic strategies can mitigate exacerbation frequency, directly correlating with enhanced life quality.",
          "Moreover, early engagement with pulmonary rehabilitation programs can improve exercise capacity, emotional well-being, and overall health status.",
        ],
      },
      {
        h: "Reduction in Hospitalizations and Healthcare Costs",
        p: [
          "The economic impact of COPD, particularly regarding hospitalizations for exacerbations, poses a significant burden. Early detection and management of COPD can lead to a significant reduction in hospitalizations due to acute exacerbations.",
          "By preventing disease progression and reducing exacerbations, early COPD identification can decrease the overall financial burden of COPD on both individuals and society.",
        ],
      },
      {
        h: "Enhanced Survival Rates",
        p: [
          "The potential of early COPD detection to enhance survival rates cannot be overstated. Early therapeutic interventions following exacerbation onset are associated with faster recovery and decreased hospitalization risk, ultimately contributing to improved patient prognosis.",
          "By managing the disease before it leads to severe lung damage, patients can have a better prognosis and an increased lifespan.",
        ],
      },
      {
        h: "Methods for Early Identification and Prevention of COPD",
        p: [
          "Healthcare providers can leverage several programs and tools for early detection of COPD:",
          "1. Spirometry Screening Programs: Spirometry is the most effective tool for diagnosing COPD. It measures the amount and speed of air a person can exhale, helping to identify airflow obstruction.",
          "2. Smoking Cessation Programs: Since smoking is a primary risk factor for COPD, smoking cessation programs are crucial in preventing the disease's onset.",
          "3. Patient Education and Awareness Campaigns: Educating patients about the symptoms and risk factors of COPD can encourage early medical consultation.",
          "4. Telehealth Services: Telehealth platforms can facilitate early COPD detection by providing remote consultations and monitoring.",
        ],
      },
    ],
  },

  // ── Why Spirometry? ──
  {
    category: LEARNING,
    title: "Why Spirometry?",
    excerpt:
      "Complete guide to performing, interpreting and using spirometry to improve respiratory patient outcomes in your health care practice.",
    author: TEAM,
    date: "January 15, 2024",
    readTime: "8 min read",
    image: img("why-spirometry"),
    tags: ["Spirometry"],
    body: [
      {
        h: "Introduction",
        p: [
          "Spirometry stands as a cornerstone in the diagnostic and monitoring arsenal against respiratory diseases. This simple yet powerful tool provides critical insights into lung function, aiding healthcare professionals in diagnosing, managing, and monitoring a range of respiratory conditions.",
          `A common physiological test, spirometry is a <a href="https://www.us.elsevierhealth.com/ruppels-manual-of-pulmonary-function-testing-9780323762618.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">pulmonary function test</a> that measures the volumes and rates an individual inhales or exhales. Its primary purpose is to assess lung function, particularly in the diagnosis and management of conditions like asthma, chronic obstructive pulmonary disease (COPD), and other disorders that affect breathing.`,
          `The roots of spirometry can be traced back to the 19th century. John Hutchinson is credited with <a href="https://journal.chestnet.org/article/S0012-3692(15)35392-7/fulltext" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">inventing the spirometer</a> in 1846, which he used to measure vital capacity. Since then, the technology and methodology have evolved significantly, making spirometry a fundamental tool in modern respiratory medicine. The evolution of spirometry is well documented in <a href="https://err.ersjournals.com/content/30/162/210081" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">historical reviews of pulmonary function testing</a>.`,
          `Spirometry is an important tool in modern clinical practice due to the prevalence of chronic respiratory diseases, such as COPD and asthma, which are major health concerns globally. According to the World Health Organization (WHO), <a href="https://www.who.int/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">COPD is the third leading cause of death worldwide</a>. Asthma affects an estimated 262 million people and caused <a href="https://www.who.int/news-room/fact-sheets/detail/asthma" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">455,000 deaths in 2019</a>.`,
          `In addition to the high prevalence of these diseases, in the United States the medical costs associated with respiratory diseases like COPD are <a href="https://www.pulmonologyadvisor.com/home/topics/copd/copd-related-medical-costs-may-to-double-by-2029/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">forecasted to double over the next five years</a>. This makes early detection and management of respiratory diseases like asthma and COPD more urgent than ever.`,
          `Early detection and management of respiratory diseases can significantly improve patient outcomes. Spirometry plays a crucial role in this regard: it can help in the early detection of obstructive airway diseases, sometimes even before symptoms become apparent. Regular spirometric <a href="https://www.thoracic.org/statements/resources/copd/179full.pdf" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">monitoring is also essential</a> in managing patients with chronic respiratory diseases, allowing for timely interventions and adjustments in treatment.`,
          "As we delve deeper into the nuances of spirometry in the following sections, it becomes evident that proficiency in this technique is essential for all healthcare professionals involved in respiratory care.",
        ],
      },
      {
        h: "Spirometry Fundamentals",
        p: [
          "Understanding the basics of spirometry is crucial for healthcare professionals to effectively utilize this tool in clinical practice.",
          "Spirometry measures two key aspects of lung function: the volume and speed of air forcefully exhaled. The primary measurements include Forced Vital Capacity (FVC), which is the total volume of air that can be forcefully exhaled after full inhalation, and Forced Expiratory Volume in one second (FEV1), which is the volume of air exhaled in the first second of the FVC maneuver. The FEV1/FVC ratio is a critical parameter for diagnosing obstructive lung diseases. When spirometry includes a Flow Volume Loop (FVL), inhalation volume and speed is also measured.",
          "Key Spirometric Indices:",
          "• FEV1: Indicates the air volume expelled in the first second and is a primary measure in assessing obstruction",
          "• FVC: Total volume of air that can be forcefully exhaled after inhalation. Reductions can indicate restrictive lung disease",
          "• FEV1/FVC Ratio: A decreased ratio suggests obstructive disease, while a normal or increased ratio with reduced FEV1 and FVC indicates restrictive patterns",
          `• FVL: a characteristic patterns of restrictive, obstructive or other pulmonary disease may be revealed by the <a href="https://err.ersjournals.com/content/30/162/210081" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">shape of the graph</a>`,
          `The American Thoracic Society and European Respiratory Society routinely collaborate to produce <a href="https://academic.oup.com/atsjournals?login=false" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">standards for spirometry</a>. Their recommendations include guidelines for the maneuver and interpretation, as well as standards for the use and maintenance of the devices themselves.`,
          `<a href="https://get.vitalflohealth.com/indications-for-spirometry" target="_blank" rel="noreferrer" class="text-blue-600 underline font-semibold uppercase tracking-wide">CLICK TO DOWNLOAD: INDICATIONS FOR SPIROMETRY GUIDE</a>`,
        ],
      },
      {
        h: "Performing Spirometry",
        p: [
          "Effective spirometry testing is a skill that requires attention to detail, patient cooperation, and adherence to standardized procedures. By following simple guidelines and preparation, it should be straightforward to perform high quality, reproducible spirometry maneuvers. To assist with proper technique, there are spirometry software platforms available that can help patients and providers correctly prepare and perform the tests.",
          "Before conducting a spirometry test, it is essential to prepare the patient adequately. This includes Pretest Instructions and activities to avoid as described in the following table:",
        ],
      },
      {
        image: "spirometry-pretest",
        alt: "Pre-test instructions for spirometry",
      },
      {
        p: [
          `Table 1: Pre-test instructions for spirometry. Link: <a href="https://www.us.elsevierhealth.com/ruppels-manual-of-pulmonary-function-testing-9780323762618.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Ruppel's Manual of Pulmonary Function Testing</a> by Carl Mottram`,
          `<a href="https://get.vitalflohealth.com/pre-test-spirometry" target="_blank" rel="noreferrer" class="text-blue-600 underline font-semibold uppercase tracking-wide">CLICK TO DOWNLOAD PRE-TEST INSTRUCTIONS AS PRINTABLE HANDOUT</a>`,
          "After ensuring pretest instructions were followed, using proper technique during the spirometry maneuver is important. Providing clear instructions to the patient is helpful for ensuring patient cooperation and successful test performance. Finding a spirometry software platform that helps guide patients and providers through the maneuver can make spirometry more accessible in many care settings.",
          "To conduct the spirometry test, the patients should inspire as deeply as they can, and expire as forcefully and rapidly as possible into the spirometer. This should be followed by a deep and complete inspiration through the spirometer. The full maneuver is described in the following table:",
        ],
      },
      {
        image: "spirometry-performing",
        alt: "Performing spirometry with flow volume loop",
      },
      {
        p: [
          `Table 2: Performing spirometry with flow volume loop. Link: <a href="https://www.us.elsevierhealth.com/ruppels-manual-of-pulmonary-function-testing-9780323762618.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Ruppel's Manual of Pulmonary Function Testing</a>. Link: <a href="https://academic.oup.com/atsjournals?login=false" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Standardization of Spirometry 2019 Update</a>`,
          `<a href="https://get.vitalflohealth.com/performing-spirometry" target="_blank" rel="noreferrer" class="text-blue-600 underline font-semibold uppercase tracking-wide">CLICK TO DOWNLOAD PERFORMING SPIROMETRY AS PRINTABLE HANDOUT</a>`,
        ],
      },
      {
        h: "Three Key Components of a High-Quality Spirometry Maneuver",
        p: [
          "It can be helpful to remember that there are basically three key components to ensure a high quality spirometry maneuver:",
          "1. The patient needs to take a deep breath to their maximal lung volume. If this step is not achieved, the next two are not relevant to the outcome",
          "2. The blast exhale should be as forceful and rapid as possible",
          "3. The end of forced exhalation (EOFE) should meet one of the following criteria:",
          "Expiratory plateau (<0.025 L in the last 1 second of expiration)",
          "Expiratory time of greater than 15 seconds, and/or",
          "The FVC is within the repeatability tolerance of, or is greater than the largest prior observed FVC",
          "A modern spirometry software platform can help ensure high quality, repeatable, spirometry by providing coaching, feedback and grading (acceptability and repeatability criteria) in real-time throughout the spirometry session.",
        ],
      },
      {
        h: "Interpretation of Spirometry Results",
        p: [
          "Interpreting spirometry results is a critical skill for healthcare professionals, enabling the diagnosis and management of various respiratory conditions. Modern spirometry software platforms can help provide clinical decision support tools to provide guidelines and tools to aid in the interpretation of the results.",
          "Spirometry results are typically presented as both numerical values and graphical curves. As discussed above, some of the key spirometric indices include:",
          "Forced Expiratory Volume in one second (FEV1): the amount expelled during the first second of this maneuver",
          "Full Vital Capacity (FVC): the total amount of air that can be expelled from full lungs",
          "FEV1/FVC ratio: the ratio between the previous two values, which is used to define the presence of obstruction",
          "Flow Volume Loop (FVL): the graph of the full maneuver showing the relationship between the flow rates and total volumes expelled (positive values) or inhaled (negative values).",
          "Once it is determined that the spirometry test has produced valid, repeatable results, interpretation begins. Interpretation of spirometry results is based on comparison with predicted normal values such as the Global Lung Function 2012 (GLI 2012) reference values. These values are derived from population studies and are adjusted for age, sex, height, and ethnicity. Modern spirometry platforms may provide these values as an integrated part of their reporting and interpretation support.",
          "From these reference values, predicted values are determined. These predicted values are determined by dividing the observed value by the reference value (given as a percentage) and are helpful for interpreting spirometry results.",
          `A flow chart of a basic interpretation algorithm is shown in Figure 1 (reproduced from: <a href="https://www.aafp.org/afp/2020/0315/p362" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Office Spirometry: Indications and Interpretation</a>, American Family Physician).`,
        ],
      },
      {
        image: "spirometry-algorithm",
        alt: "Spirometry interpretation algorithm",
      },
      {
        p: [
          `The FVLs can reveal <a href="https://medschool.co/tests/lung-function/flow-volume-loops" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">normal and abnormal patterns</a> (see Figure 2) that can also be used to determine the subject's condition. A normal spirometry curve shows a rapid rise in flow rate followed by a gradual decline. <a href="https://medschool.co/tests/lung-function/flow-volume-loops" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Abnormal patterns may indicate obstructive or restrictive lung diseases</a>. In obstructive patterns, there is a scooped-out appearance due to a slower maximal flow rate. In restrictive patterns, the curve may appear normal but with reduced lung volumes.`,
        ],
      },
      {
        image: "spirometry-fvl-patterns",
        alt: "Flow volume loop characteristic patterns",
      },
      {
        p: [
          `Figure 2: Flow volume loop characteristic patterns. Link: <a href="https://medschool.co/tests/lung-function/flow-volume-loops" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">medschool.co</a>`,
        ],
      },
      {
        h: "Interpreting Obstructive vs. Restrictive Disorders",
        p: [
          "When developing a diagnosis, there are a few interpretive strategies that can help.",
          `Obstructive disorders, such as chronic obstructive pulmonary disease (COPD) and asthma are characterized by airflow limitation. In these cases, spirometry typically shows a reduced FEV1/FVC ratio (<0.70). In asthma, this obstruction is often reversible, whereas in COPD, it is <a href="https://erj.ersjournals.com/content/26/5/948" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">usually not fully reversible</a>.`,
          "Diseases such as pulmonary fibrosis are restrictive disorders and lead to a reduction in lung volumes. Spirometry in these cases shows a normal or increased FEV1/FVC ratio with a reduction in FVC.",
          `Spirometry interpretation is a skill that can be developed further with some basic training. The National Institute for Occupational Safety and Health (NIOSH) routinely provides <a href="https://wwwn.cdc.gov/niosh-rhd/spirometry/TrainingSchedule.aspx" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">hands-on training workshops</a>.`,
        ],
      },
      {
        h: "Spirometry in Clinical Management",
        p: [
          "Spirometry is not only pivotal in diagnosing respiratory conditions but also plays a significant role in the ongoing management of these diseases. This section explores the use of spirometry in monitoring disease progression and evaluating treatment efficacy.",
          `To monitor disease progression, the frequency of spirometry testing can vary depending on the condition and its severity. For chronic conditions <a href="https://goldcopd.org/digital-gold-report/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">like COPD</a>, annual spirometry is recommended to monitor disease progression and adjust treatment plans accordingly.`,
          `<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC1740862/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Longitudinal spirometry data</a> can provide insights into the rate of disease progression. Modern spirometry platforms can show the trends in FEV1, FVC, the FEV1/FVC ratio throughout the entire monitoring period. In conditions like COPD, a decline in FEV1 over time is expected, but an accelerated decline may indicate a need for <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5392482/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">treatment reassessment</a>. In asthma, variability in FEV1 can be a sign of <a href="https://www.vitalflohealth.com/vitalflohome" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">poor disease control</a>.`,
          "To monitor patients longitudinally, implementing a home monitoring program can provide more granular and timely data about disease progression. Modern spirometry platforms may include the ability to monitor patients with full spirometry, peak flow spirometry, and/or pulse oximetry depending on the technology provider. Automated alerting, reporting and patient status change notifications are an important consideration when implementing a home monitoring program.",
          `<a href="https://www.vitalflohealth.com/vitalflohome" target="_blank" rel="noreferrer" class="text-blue-600 underline font-semibold uppercase tracking-wide">LEARN MORE ABOUT REMOTE MONITORING: VitalFloHOME</a>`,
          `Spirometry can also be used to assess the responsiveness to bronchodilators, especially in conditions like asthma. Performing a bronchodilator responsiveness test (BRT) entails performing spirometry twice, once before (pre-bronchodilator) and once after (post-bronchodilator) administration of the medication. A significant improvement in FEV1 following bronchodilator administration indicates reversible airway obstruction, a hallmark of asthma. In COPD, less reversibility is often observed, but any improvement can <a href="https://goldcopd.org/digital-gold-report/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">still guide therapy</a>.`,
        ],
      },
      {
        h: "Further Learning and Helpful Resources",
        p: [
          `<a href="https://www.us.elsevierhealth.com/ruppels-manual-of-pulmonary-function-testing-9780323762618.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Ruppel's Manual of Pulmonary Function Testing</a>, Carl Mottram, RRT, RPFT, FAARC (VitalFlo Clinical Advisory Board)`,
          `<a href="https://get.vitalflohealth.com/pfts-for-pcps" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">PFTs for PCPs: the Role of Spirometry in Primary Care</a>, VitalFlo Guide`,
          `<a href="https://get.vitalflohealth.com/indications-for-spirometry" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Indications for Spirometry</a>, VitalFlo Download`,
          `<a href="https://get.vitalflohealth.com/pre-test-spirometry" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Pre-Test Instructions for Spirometry</a>, VitalFlo Download`,
          `<a href="https://get.vitalflohealth.com/performing-spirometry" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Performing Spirometry with Flow Volume Loop</a>, VitalFlo Download`,
          `<a href="https://err.ersjournals.com/content/30/162/210081" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Standardisation of spirometry</a>, European Respiratory Journal`,
          `<a href="https://www.aafp.org/afp/2020/0315/p362" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Office Spirometry: Indications and Interpretation</a>, American Family Physician`,
          `<a href="https://academic.oup.com/atsjournals?login=false" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Official American Thoracic Society technical standards: spirometry in the occupational setting</a>, American Journal of Respiratory and Critical Care Medicine`,
          `<a href="https://www.thoracic.org/statements/resources/copd/179full.pdf" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Clinical Guideline: Diagnosis and Management of Stable COPD</a>, American College of Physicians`,
          `<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4264797/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Role of spirometry in primary care</a>, Canadian Family Physician`,
          `<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3628641/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Spirometry in primary care</a>, Canadian Respiratory Journal`,
          `<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5392482/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Spirometry and Bronchodilator Test</a>, Tuberculosis & Respiratory Diseases`,
          `<a href="https://goldcopd.org/digital-gold-report/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">GOLD 2023: Highlights for primary care</a>, npj Primary Care Respiratory Medicine`,
          `<a href="https://err.ersjournals.com/content/22/129/386" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Multi-ethnic reference values for spirometry for the 3-95 year age range: the Global Lung Function 2012 equations</a>, European Respiratory Journal`,
        ],
      },
    ],
  },

  // ── Spirometric Lung Age ──
  {
    category: SCIENCE,
    title: "Spirometric Lung Age as a Tool in Smoking Cessation Programs",
    excerpt:
      "The concept of 'spirometric lung age' emerged as a means of providing patients with an understandable metric of their lung function relative to their chronological age. In the context of smoking cessation, conveying a patient's lung age can serve as a powerful motivator for change.",
    author: LUKE,
    date: "October 12, 2023",
    image: img("lung-age"),
    tags: ["Spirometry"],
    body: [
      {
        p: [
          "Spirometry has long been an essential diagnostic tool in the field of pulmonology, providing quantitative data on lung function. The concept of 'spirometric lung age' emerged as a means of providing patients with an understandable metric of their lung function relative to their chronological age. In the context of smoking cessation, conveying a patient's lung age can serve as a powerful motivator for change. This article delves into the value of spirometric lung age in smoking cessation interventions and its potential benefits in a clinical setting.",
        ],
      },
      {
        h: "Introduction to Spirometric Lung Age",
        p: [
          "Spirometric lung age is derived from the comparison between the patient's actual lung function and the expected lung function of someone of the same age with normal lung health. For instance, a 40-year-old smoker might have the lung function comparable to that of a 60-year-old non-smoker, translating to a spirometric lung age of 60 years.",
        ],
      },
      {
        h: "Historical Context",
        p: [
          "The notion of spirometric lung age was first introduced by Harris and Temple in their seminal paper. They proposed that presenting patients with their 'lung age' could be more impactful than just providing them with abstract spirometric values.",
          `Reference: Harris JE, Temple W. Spirometric lung age as a motivational tool in smoking cessation. Prev Med. 1985; 14(5):655-662 <a href="https://www.sciencedirect.com/science/article/abs/pii/0091743585900854" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">[Link]</a>.`,
        ],
      },
      {
        h: "Lung Age in Practice",
        p: [
          "What does it mean to use a patients lung age in the day-to-day realities of a smoking cessation program?",
          "While it is best practice to use FEV1, FVC and their ratio and their predictive values when assessing the severity of a patients' lung disease, those numbers can be very esoteric to a lay person. This is especially true when trying to create the motivation for behavior change (like quitting tobacco use), which is already notoriously difficult.",
          `However, when having a conversation with, for example, a 55 year old smoker with a 30 pack-year history, and his lung age is 78... "Your lung age is 78" is a much more meaningful and tangible statement to that patient than "Your FEV1 is <70% of predicted," when encouraging that patient to quit smoking.`,
        ],
      },
      {
        h: "Efficacy in Smoking Cessation Programs",
        p: [
          "Several studies have investigated the efficacy of spirometric lung age in motivating smokers to quit. The key findings include:",
          "Immediate Impact: Presenting smokers with their spirometric lung age often leads to immediate behavioral intentions to quit smoking.",
          "Enhanced Perception: It aids in translating the often intangible risks of smoking into a tangible, personalized metric.",
          "Sustained Motivation: Regular follow-ups with spirometric lung age assessments can provide patients with a clear picture of their progress, further motivating them to stay smoke-free.",
          `Reference: Parkes G, Greenhalgh T, Griffin M, Dent R. Effect on smoking quit rate of telling patients their lung age: the Step2quit randomised controlled trial. BMJ. 2008;336(7644):598-600. <a href="https://www.bmj.com/content/336/7644/598" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">[Link]</a>.`,
        ],
      },
      {
        h: "Incorporating Spirometric Lung Age in Clinical Practice",
        p: [
          "To best leverage the benefits of spirometric lung age is important to consider the following:",
          "Routine Assessment: Consider incorporating lung age assessments into routine check-ups for smokers.",
          "Counseling: Use the results as a conversation starter about the risks of continued smoking and the benefits of cessation.",
          "Follow-up: Regularly reassess lung age to track progress and reinforce motivation.",
        ],
      },
      {
        h: "Conclusion",
        p: [
          "Spirometric lung age can be a valuable tool in the arsenal of smoking cessation programs. By providing a tangible and personalized metric, it can bridge the gap between abstract health risks and real-world implications, thereby motivating and empowering patients to take control of their health.",
          "VitalFlo includes Lung Age as a standard feature in our proactive respiratory monitoring platform. Reach out to learn more today!",
        ],
      },
    ],
  },

  // ── Value-Based Care ──
  {
    category: LEARNING,
    title: "The Benefits of Spirometry for Value-Based Care",
    excerpt:
      "Why ACOs and MA Plans are adopting proactive respiratory solutions",
    author: TEAM,
    date: "October 2, 2023",
    image: img("spirometry-couple"),
    tags: ["Spirometry", "Value-Based Care"],
    body: [
      {
        p: [
          "In the ever-evolving landscape of healthcare, the shift towards value-based care has gained momentum. Value-based care aims to improve patient outcomes while controlling costs, emphasizing the importance of preventive measures and early diagnosis.",
          "One invaluable tool in achieving these goals for respiratory patients is spirometry, a simple yet powerful diagnostic test for assessing lung health. Here we will explore the benefits of spirometry in the context of value-based care and how it can contribute to better patient outcomes and cost-effective healthcare.",
        ],
      },
      {
        h: "Early Detection and Diagnosis",
        p: [
          "Spirometry is a simple, non-invasive pulmonary function test. It can detect respiratory problems, such as obstructive or restrictive lung disease, at an early stage, allowing for early intervention. Early diagnosis is a cornerstone of value-based care as it helps prevent the progression of diseases, reduces hospitalizations, and ultimately lowers healthcare costs. For example, identifying and managing chronic obstructive pulmonary disease (COPD) in its early stages can significantly improve a patient's quality of life and decrease the burden on the healthcare system.",
        ],
      },
      {
        h: "Personalized Treatment Plans",
        p: [
          "Value-based care places a strong emphasis on tailoring treatment plans to individual patient needs. Spirometry provides crucial data that can help healthcare providers create personalized treatment strategies. By understanding a patient's lung function, physicians can prescribe appropriate medications, lifestyle modifications, or interventions that are more likely to be effective. This not only improves patient outcomes but also reduces the trial-and-error approach often associated with treatments, saving both time and money.",
        ],
      },
      {
        h: "Monitoring Disease Progression",
        p: [
          "Value-based care models require ongoing monitoring of patients to track their progress and adjust treatment plans as necessary. Spirometry is a valuable tool for monitoring lung health over time. Regular follow-up tests can help healthcare providers assess disease progression, evaluate treatment efficacy, and make timely adjustments. This proactive approach not only benefits patients by ensuring they receive the most appropriate care but also helps prevent costly exacerbations and hospital admissions.",
        ],
      },
      {
        h: "Reducing Hospitalizations and Readmissions",
        p: [
          "Healthcare providers in value-based care contracts have a constant need to reduce hospitalizations and readmissions, which can be costly and detrimental to patient well-being. Spirometry can play a crucial role in achieving this goal by identifying patients at risk of respiratory exacerbations or complications. By intervening early and providing appropriate outpatient care, healthcare providers can reduce the need for hospitalization, resulting in cost savings and improved patient experiences. Monitoring solutions that also take medication adherence into consideration are particularly useful for reducing readmissions.",
        ],
      },
      {
        h: "Enhancing Patient Engagement",
        p: [
          "Patient engagement is a key element of value-based care. Spirometry tests provide tangible data that patients can understand and track over time. This can empower patients to take an active role in managing their lung health, encouraging adherence to treatment plans and healthier lifestyle choices. When patients are engaged in their care, they are more likely to achieve better outcomes, and this aligns with the principles of value-based care.",
        ],
      },
      {
        h: "Summary",
        p: [
          "Spirometry is a valuable tool that aligns perfectly with the principles of value-based care. It enables early detection and diagnosis, promotes personalized treatment plans, supports ongoing monitoring, and helps reduce hospitalizations and readmissions. Additionally, spirometry enhances patient engagement, fostering a collaborative approach to healthcare.",
          "As value-based care continues to reshape the healthcare landscape, spirometry emerges as a critical component for achieving better patient outcomes and controlling costs. By investing in this diagnostic tool and integrating it into healthcare practices, providers can deliver high-quality care while achieving the goals of value-based care models. Ultimately, spirometry is not just a diagnostic test; it's a pathway to better, more efficient, and patient-centered healthcare.",
        ],
      },
    ],
  },

  // ── Primary Care ──
  {
    category: LEARNING,
    title:
      "The Importance of Spirometry in Primary Care: A Breath of Fresh Air",
    excerpt:
      "Primary care is the cornerstone of healthcare, serving as the first point of contact for patients with various medical concerns.",
    author: TEAM,
    date: "September 25, 2023",
    image: img("spirometry-couple"),
    tags: ["Spirometry", "Primary Care"],
    body: [
      {
        p: [
          "Primary care is the cornerstone of healthcare, serving as the first point of contact for patients with various medical concerns. In this crucial setting, accurate diagnosis and monitoring of respiratory conditions are of paramount importance. Spirometry, a simple yet powerful lung function test, is an invaluable tool in primary care. Here, we will explore why spirometry is essential for primary care and how it benefits both healthcare providers and patients.",
        ],
      },
      {
        h: "Early Detection of Respiratory Conditions",
        p: [
          "Spirometry allows primary care physicians to detect respiratory conditions at their earliest stages. Conditions such as asthma, chronic obstructive pulmonary disease (COPD), and interstitial lung disease can be asymptomatic or present with subtle symptoms. Spirometry provides objective data about lung function, enabling healthcare providers to identify these conditions before they become more severe. Early detection often leads to more effective treatment and improved outcomes.",
        ],
      },
      {
        h: "Differential Diagnosis",
        p: [
          "Respiratory symptoms can be non-specific and overlap with various conditions. Spirometry helps in the differential diagnosis of respiratory disorders by quantifying lung function parameters such as forced expiratory volume in one second (FEV1) and forced vital capacity (FVC). These values, along with the FEV1/FVC ratio, can aid in distinguishing between obstructive and restrictive lung diseases, guiding the diagnostic process.",
        ],
      },
      {
        h: "Monitoring Disease Progression",
        p: [
          "For patients with chronic respiratory conditions like asthma and COPD, spirometry is essential for monitoring disease progression. Regular spirometry tests enable healthcare providers to track changes in lung function over time. This information is crucial for adjusting treatment plans, assessing medication efficacy, and ensuring that patients are receiving the most appropriate care.",
        ],
      },
      {
        h: "Treatment Optimization",
        p: [
          "Spirometry results provide a foundation for personalized treatment plans. By understanding a patient's lung function, primary care physicians can tailor medications and interventions to address specific needs. This approach not only enhances treatment effectiveness but also minimizes the risk of overmedication or under-treatment.",
        ],
      },
      {
        h: "Patient Education and Engagement",
        p: [
          "Spirometry offers an opportunity for patient education and engagement. When patients see objective data about their lung function, they are more likely to understand the importance of adherence to treatment plans and lifestyle modifications. Visualizing improvements in lung function over time can motivate patients to take an active role in managing their respiratory health.",
        ],
      },
      {
        h: "Referral Guidance",
        p: [
          "In some cases, spirometry results may indicate the need for further evaluation by a specialist. Primary care providers can use these results to make informed referrals to pulmonologists or other specialists. This ensures that patients receive timely and appropriate care from the right healthcare professionals.",
        ],
      },
      {
        h: "Summary",
        p: [
          "Spirometry has become an indispensable tool in primary care for good reason. Its ability to detect, diagnose, monitor, and guide treatment for respiratory conditions has revolutionized the way healthcare providers approach these issues. By integrating spirometry into routine primary care practice, we can improve patient outcomes, enhance the quality of care, and ultimately help individuals breathe easier and lead healthier lives. Spirometry is not just a breath of fresh air; it's a breath of hope and better health for countless patients in primary care settings.",
        ],
      },
      {
        image: "primary-care-spirometry",
        alt: "Easiest Spirometry for Primary Care",
        href: "/demo",
      },
    ],
  },

  // ── Best Practice ──
  {
    category: LEARNING,
    title: "The Importance of Spirometry: Best Practice for Respiratory Health",
    excerpt:
      "Learn why spirometry is considered best practice in the field of respiratory health.",
    author: TEAM,
    date: "September 20, 2023",
    image: img("spirometry-best-practice"),
    tags: ["Spirometry"],
    body: [
      {
        p: [
          "Spirometry is a diagnostic tool that plays a crucial role in the assessment and management of respiratory health. It measures lung function by assessing the volume and flow of air that a person can inhale and exhale. While spirometry is a well-established practice, its significance cannot be understated. Here, we will dive into why spirometry is considered best practice in the field of respiratory health, and explore the numerous benefits it offers to both healthcare providers and patients.",
        ],
      },
      {
        h: "Early Detection of Respiratory Conditions",
        p: [
          "Spirometry is a powerful tool for early detection and diagnosis of various respiratory conditions, including asthma, chronic obstructive pulmonary disease (COPD), and restrictive lung diseases. By measuring lung function, healthcare providers can identify abnormalities and initiate timely interventions. Early detection often leads to more effective management and improved patient outcomes.",
        ],
      },
      {
        h: "Personalized Treatment Plans",
        p: [
          "One of the key advantages of spirometry is its ability to provide quantitative data about an individual's lung function. This data allows healthcare providers to create personalized treatment plans tailored to each patient's specific needs. Whether it's adjusting medication dosages, recommending lifestyle changes, or implementing pulmonary rehabilitation, spirometry results guide healthcare decisions that are unique to the patient.",
        ],
      },
      {
        h: "Tracking Disease Progression",
        p: [
          "For individuals with chronic respiratory conditions, monitoring disease progression is essential. Spirometry provides a baseline measurement that can be tracked over time, enabling healthcare providers to assess whether a patient's condition is stable, improving, or deteriorating. This information is invaluable for making adjustments to treatment plans and ensuring that interventions remain effective.",
        ],
      },
      {
        h: "Assessing Response to Treatment",
        p: [
          "Spirometry is instrumental in assessing a patient's response to treatment. By comparing pre-treatment and post-treatment spirometry results, healthcare providers can gauge the effectiveness of prescribed therapies. This enables timely modifications to treatment plans if necessary, optimizing the chances of achieving the desired outcomes.",
        ],
      },
      {
        h: "Objective and Quantitative Data",
        p: [
          "Unlike subjective assessments, such as patient-reported symptoms, spirometry provides objective and quantitative data. This makes it a valuable tool for healthcare providers to make informed decisions and avoid relying solely on subjective information, which can sometimes be misleading. This is why the American Thoracic Society recommends annual spirometry testing for respiratory patients with asthma or COPD.",
        ],
      },
      {
        h: "Facilitating Research and Clinical Trials",
        p: [
          "Spirometry is essential in research studies and clinical trials focused on respiratory health. It serves as a standardized method for measuring lung function and provides consistent data that can be compared across different studies and populations. This consistency is vital for advancing our understanding of respiratory diseases and developing new treatments.",
        ],
      },
      {
        h: "Patient Empowerment",
        p: [
          "For patients, spirometry can be empowering. It allows them to see their lung function measurements and understand how their condition is progressing. This knowledge can motivate individuals to adhere to treatment plans, make necessary lifestyle changes, and actively engage in managing their respiratory health.",
        ],
      },
      {
        h: "Summary",
        p: [
          "Spirometry is undeniably the best practice in assessing and managing respiratory health. Its ability to detect respiratory conditions early, guide personalized treatment plans, track disease progression, assess treatment effectiveness, and provide objective data makes it an indispensable tool for healthcare providers and patients alike. As we continue to prioritize respiratory health in our society, the role of spirometry in improving outcomes and enhancing the quality of life for individuals with respiratory conditions cannot be underestimated.",
        ],
      },
      {
        image: "smart-software-spirometry",
        alt: "Smart Software Makes Spirometry Easy",
        href: "/demo",
      },
    ],
  },

  // ── 7 Challenges ACOs ──
  {
    category: LEARNING,
    title: "The 7 Challenges that ACOs face with COPD Care",
    excerpt:
      "Accountable Care Organizations (ACOs) face several challenges that can impact the quality and effectiveness of care for their patients with COPD.",
    author: TEAM,
    date: "September 11, 2023",
    image: img("copd-aco"),
    tags: ["COPD", "Value-Based Care"],
    body: [
      {
        p: [
          "Accountable Care Organizations (ACOs) face several challenges that can impact the quality and effectiveness of care for their patients with Chronic Obstructive Pulmonary Disease (COPD). Here are the seven common challenges that we hear frequently cited by ACO leaders:",
        ],
      },
      {
        h: "1. Fragmented Care",
        p: [
          "High quality COPD care frequently requires multiple healthcare providers, including primary care physicians, pulmonologists, respiratory therapists, and others. Ensuring effective communication among these providers is challenging, which can lead to fragmented care and potential gaps in treatment.",
          "Quick Tip: using integrated tools that can automate alerts and workflows across providers can help provide consistency of COPD care.",
        ],
      },
      {
        h: "2. Care Coordination",
        p: [
          "A key goal of ACOs is to coordinate care across different healthcare settings. However, achieving seamless care coordination between primary care, specialty care, hospitals, and post-acute care providers can be difficult. In the case of COPD, patients may require hospitalizations, rehabilitation, and ongoing management, requiring effective transitions of care.",
          "Quick Tip: automating workflows and alerts, as well as standardizing reporting for tests like spirometry, can drive simpler and more consistent coordination across providers.",
        ],
      },
      {
        h: "3. Patient Education and Self-Management",
        p: [
          "COPD is a chronic condition that requires ongoing self-management by patients. However, many patients may lack awareness about their condition, proper inhaler techniques, and strategies for symptom management. ACOs and healthcare providers face challenges in educating and empowering patients to actively participate in their own care.",
          "Quick Tip: home monitoring programs can help drive improved patient self-management.",
        ],
      },
      {
        h: "4. Resource Allocation",
        p: [
          "ACOs need to allocate resources effectively to provide optimal care for COPD patients. This includes ensuring adequate access to pulmonary rehabilitation programs, respiratory therapists, and other specialized services. Limited resources and competing priorities can present challenges in providing comprehensive care to all patients in need.",
          "Quick tip: prioritization is the first step, and with COPD being one of the largest chronic disease categories driving up costs, it presents a significant ROI opportunity to invest in improving patient outcomes.",
        ],
      },
      {
        h: "5. Adherence to Guidelines",
        p: [
          "COPD management guidelines (such as the GOLD Report standards) exist to provide evidence-based recommendations for diagnosis, treatment, and follow-up care. However, adherence to these guidelines can be inconsistent across healthcare providers and settings. Variations in practice and lack of guideline implementation can affect the quality and outcomes of COPD care.",
          "Quick tip: build the recommended care strategies into automated workflows to ensure consistent care.",
        ],
      },
      {
        h: "6. Patient Access and Socioeconomic Factors",
        p: [
          "Access to healthcare services, particularly in underserved areas, can be a challenge for COPD patients. Limited access to healthcare providers, diagnostic tests, and medications may hinder timely diagnosis and appropriate management. Socioeconomic factors, such as poverty, low health literacy, and inadequate social support, can also impact COPD care outcomes.",
          "Quick tip: making standard testing, like spirometry, available in every care setting helps ensure patients are being proactively monitored every time they do have access to healthcare services.",
        ],
      },
      {
        h: "7. Health Information Technology",
        p: [
          "Effective utilization of health information technology (HIT) systems, including electronic health records (EHRs) and interoperability between systems, is crucial for seamless information exchange and care coordination. However, interoperability issues, inadequate HIT infrastructure, and data sharing challenges can hinder communication and coordination among ACOs and healthcare providers.",
          "Quick tip: ensure your respiratory program tools are interoperable with your current systems (e.g., EHR) and focused on achieving coordinated workflows for your providers.",
        ],
      },
      {
        p: [
          "Addressing these challenges requires a collaborative approach involving healthcare providers, ACOs, policymakers, and patients themselves. Strategies such as care coordination initiatives, patient education programs, guideline implementation, improved access to healthcare services, and enhanced HIT infrastructure can contribute to better COPD care within the ACO framework.",
        ],
      },
      {
        image: "copd-aco",
        alt: "Illustration of a doctor discussing COPD care with a patient",
      },
    ],
  },

  // ── Medication Adherence ──
  {
    category: LEARNING,
    title:
      "How does Spirometry help with Medication Adherence and Inhaler Technique?",
    excerpt:
      "Spirometry is a diagnostic test used to assess lung function by measuring the volume and flow of air during breathing.",
    author: TEAM,
    date: "September 4, 2023",
    image: img("medication-adherence"),
    tags: ["Spirometry"],
    body: [
      {
        p: [
          "Spirometry is a diagnostic test used to assess lung function by measuring the volume and flow of air during breathing. While spirometry itself does not directly address medication adherence or inhaler technique, it can provide valuable information that can aid in evaluating and improving these aspects of respiratory care:",
        ],
      },
      {
        h: "Baseline Assessment",
        p: [
          "Spirometry can establish a patient's lung function before starting medication or inhaler therapy. This baseline measurement helps healthcare providers determine the appropriate medication dosage and monitor changes in lung function over time.",
          "Quick tip: most spirometry reports are in ATS/ERS-compliant PDF formats. This is great for visualizing an individual spirometry report, however it can be challenging to monitor patient progress over time when this is the only format available. VitalFlo offers trends-over-time visualizations for every patient, making it simple to compare a patient to themselves over time and monitor progress.",
        ],
      },
      {
        h: "Brochodilator Responsiveness Testing",
        p: [
          'A common diagnostic tool, bronchodilator responsiveness testing (sometimes referred to as "pre-/post-brochodilator testing"), in which spirometry is performed both before and after the administration of a bronchodilator drug (e.g., β2-agonist) to assess the impact of the drug. This test can also be helpful for the provider to observe and correct the patient\'s inhaler technique, and to show the patient the positive impact of good technique with the spirometry results.',
          "Quick tip: many, but not all, spirometry platforms help with the assessment and reporting of bronchodilator responsiveness testing. When considering spirometry platforms, make sure to review whether this is an included feature.",
        ],
      },
      {
        h: "Monitoring Progress",
        p: [
          "Regular spirometry tests can track a patient's lung function and assess the effectiveness of medication therapy. By comparing current spirometry results with previous measurements, healthcare providers can evaluate treatment outcomes and adjust medication or inhaler technique accordingly.",
          "Quick tip: with some home respiratory monitoring platforms, like VitalFlo, it is possible to track both spirometry and medication adherence over time: even visualizing them on the same trend line. With automated alerts, it is possible to proactively monitor patients and help make adjustments pre-emptively.",
        ],
      },
      {
        h: "Inhaler Technique Assessment",
        p: [
          "Spirometry can be combined with assessment of inhaler technique to ensure patients are using their inhalers correctly. Improper inhaler technique can lead to reduced medication delivery to the lungs, compromising treatment effectiveness. Spirometry can measure lung function before and after inhaler use, helping to identify if the medication is reaching the lungs adequately.",
          "Quick tip: especially with home monitoring platforms, including both medication adherence data and spirometry can be a powerful way to judge the success of the patient's prescribed therapy. Spirometry can show if a patient is not responding to therapy, and offer clues about whether additional technique education, a different prescription, or a new medication dosage are warranted.",
        ],
      },
      {
        h: "Education and Training",
        p: [
          "Spirometry results can be used as visual aids to educate patients about their lung health and the importance of medication adherence and proper inhaler technique. Demonstrating the impact of medication on lung function through spirometry can motivate patients to adhere to their prescribed treatment plans.",
          "Quick tip: with comprehensive home monitoring programs, be sure to evaluate if patient education and training tools are available within the platform, or how easily they can be added and customized.",
        ],
      },
      {
        h: "Identifying Non-Adherence",
        p: [
          "Spirometry can sometimes reveal poor treatment adherence. If spirometry results indicate worsening lung function despite appropriate medication therapy, it may suggest that the patient is not using the medication as prescribed. This can prompt healthcare providers to inquire about adherence issues and offer support to improve compliance.",
          "Quick tip: in cases where patients are non-adherent to medication, it is important to consider if a different delivery mechanism may make adherence easier (e.g., a nebulizer or alternative device).",
        ],
      },
      {
        p: [
          "It's important to note that while spirometry is a useful tool, addressing medication adherence and inhaler technique requires a comprehensive approach. Healthcare providers should combine spirometry assessment with patient education, counseling, and regular follow-ups to ensure optimal treatment outcomes.",
        ],
      },
    ],
  },

  // ── Asthma Action Plan ──
  {
    category: LEARNING,
    title: "How to Use an Asthma Action Plan",
    excerpt: "May 2, 2023, is World Asthma Day",
    author: LUKE,
    date: "May 2, 2023",
    image: img("asthma-action-plan"),
    tags: ["Asthma", "Primary Care"],
    body: [
      {
        p: [
          `It's <a href="https://ginasthma.org/world-asthma-day-2023/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">World Asthma Day</a> (May 2, 2023), which is organized by the <a href="https://ginasthma.org/world-asthma-day-2023/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Global Initiative for Asthma</a>, (GINA), a World Health Organization collaborative organization.`,
        ],
      },
      {
        image: "asthma-awareness-month",
        alt: "Asthma Care for ALL - World Asthma Day 2023",
      },
      {
        p: [
          "If you are a primary care provider, it's a great chance to reflect on the crucial role you play in managing your patients' asthma.",
          `One tool that can help you provide effective care and improve outcomes is the Asthma Action Plan developed by the <a href="https://www.nhlbi.nih.gov/resources/asthma-action-plan-2020" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">National Heart, Lung & Blood Institute (NHLBI)</a>.`,
        ],
      },
      {
        p: [
          "The Asthma Action Plan is a personalized management plan that outlines steps to take when asthma symptoms worsen. Typically, it is a printed handout that includes three “zones” – green, yellow, and red – that are defined by different patient metrics (e.g., Peak Flow Rate, FEV1, symptoms), and have corresponding actions for the patient to take:",
        ],
      },
      {
        p: [
          "The Green Zone indicates good asthma control, with no symptoms or minimal symptoms that don't interfere with daily activities and a peak flow and/or FEV1 that is greater than 80% of the patient's predicted values. The instructions for the green zone typically include taking daily controller medication as prescribed and avoiding triggers that can worsen asthma symptoms.",
        ],
      },
      {
        p: [
          "The Yellow Zone indicates that asthma symptoms are worsening and that caution is needed. Symptoms in the yellow zone may include coughing, wheezing, or shortness of breath. A patient in the Yellow Zone typically has a peak flow and/or FEV1 that is between 50-79% of their predicted values. The instructions for the Yellow Zone typically include increasing the use of rescue medication, monitoring symptoms, and seeking medical attention if symptoms worsen.",
        ],
      },
      {
        p: [
          "The Red Zone indicates a medical emergency and requires immediate action. In the Red Zone, peak flow and/or FEV1 are below 50% of predicted and symptoms may include severe shortness of breath, wheezing that does not improve with rescue medication, or difficulty speaking or walking. The instructions for the Red Zone typically include using rescue medication immediately, seeking medical attention right away, and calling 911 if necessary.",
        ],
      },
      {
        p: [
          `So, how can you use the <a href="https://www.nhlbi.nih.gov/resources/asthma-action-plan-2020" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Asthma Action Plan</a> as part of your practice?`,
        ],
      },
      {
        image: "asthma-action-plan",
        alt: "Asthma Action Plan",
      },
      {
        p: [
          "Use the Asthma Action Plan to educate your patients. By creating a personalized plan, you can help them understand the severity of their asthma and what to do when symptoms worsen. Reviewing the plan with them during office visits can ensure they are following the appropriate medication regimen and provide guidance on how to avoid triggers that can exacerbate their symptoms.",
          "Encourage patients to bring their Asthma Action Plan to school or work, so teachers or supervisors are aware of their condition and know what to do in case of an emergency.",
          "The Asthma Action Plan should be reviewed regularly to ensure it remains relevant and effective. During office visits, ask your patients if they've experienced any changes in their symptoms or if they've had to use their rescue medication more frequently. Based on their responses, you can make any necessary adjustments to the Asthma Action Plan.",
          "If possible, keeping track of how often your patients move between the different zones, can help you get a sense of how well their asthma is being managed. If a patient is frequently moving into the yellow or red zones, it may indicate that their asthma is not well-controlled, and additional interventions may be needed.",
          `The print-out version of an Asthma Action Plan is a valuable tool that primary care providers can use to help their patients manage their asthma effectively. However, an automated digital asthma action plan, with integrated alerting features for both patients and providers can help with ongoing asthma management. VitalFlo has these features integrated into our home monitoring platform – <a href="https://meetings.hubspot.com/lukegmarshall/meet-with-luke?uuid=3d471dd9-fa75-42a6-b85a-e23cb8fb2dc9" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">schedule a product demo</a>.`,
        ],
      },
      {
        image: "spirometry-couple",
        alt: "VitalFlo platform on tablet and phone",
      },
      {
        p: [
          "By creating personalized plans that include the Green, Yellow, and Red Zones, educating patients, regularly reviewing the plan, tracking progress, and collaborating with specialists, primary care providers can provide comprehensive and effective care for their patients with asthma.",
          "Together, we can improve outcomes and help our patients lead healthier, happier lives. Happy World Asthma Day!",
        ],
      },
    ],
  },

  // ── Asthma Awareness Month ──
  {
    category: LEARNING,
    title: "May is Asthma and Allergy Awareness Month",
    excerpt:
      "VitalFlo discusses the impact that asthma and allergies take on both patients and providers.",
    author: TEAM,
    date: "May 11, 2022",
    image: img("asthma-awareness-month"),
    tags: ["Asthma"],
    body: [
      {
        p: [
          "Every May, we turn our attention to the people living with asthma and allergies and the people who support and care for them. Since 1984, the Asthma and Allergy Foundation of America (AAFA) has declared May to be “National Asthma and Allergy Awareness Month.” On a near-daily basis, the team at VitalFlo hears first-hand about the impact that asthma and allergies take on both patients and providers.",
        ],
      },
      {
        p: [
          `Quick facts (source: <a href="https://aafa.org/get-involved/asthma-and-allergy-awareness-month/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">AAFA</a>)`,
        ],
      },
      {
        p: [
          "More than 65 million Americans overall have asthma and allergies. Some people may have one or both of these conditions.",
        ],
      },
      {
        h: "Quick facts",
        p: [
          `About 25 million Americans have asthma (20 million adults and 5 million children)<a href="https://aafa.org/media/3004/aafa-asthma-facts-and-figures.pdf" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">1</a>`,
          "About 32 million Americans have food allergies (26 million adults and 6 million children)2,3",
          "About 24 million Americans have rhinitis (hay fever), or nasal allergies (19.2 million adults and 5.2 million children)4",
          "There is no cure for asthma or allergies.",
        ],
      },
      {
        p: [
          `How can you help? By bringing awareness to the conditions and supporting the advocacy work being done by leading experts and educators in the field. Visit <a href="https://aafa.org/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">aafa.org</a> or <a href="https://vitalflohealth.com/contact" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">contact us</a> to learn more.`,
        ],
      },
    ],
  },

  // ── Vitalograph Partnership ──
  {
    category: NEWS,
    title:
      "VitalFlo Partners With Vitalograph to Deliver a Unified Digital Respiratory Monitoring Solution",
    excerpt:
      "Partnership between VitalFlo and Vitalograph enables pulmonary function testing, anytime, anywhere",
    author: TEAM,
    date: "May 9, 2022",
    image: img("vitalograph"),
    tags: ["Partnerships", "Remote Monitoring", "Spirometry"],
    body: [
      {
        p: [
          "VitalFlo today announced that it has partnered with Vitalograph to provide smart respiratory health monitoring through Vitalograph's range of remote monitoring spirometry devices. This exciting partnership enables patients to perform reliable lung function tests anytime, anywhere as a critical element in the ongoing management of their respiratory health.",
        ],
      },
      {
        p: [
          '"For us, the key characteristics we look for in spirometry devices are accuracy, ease of use, and affordability," said Luke Marshall, CEO of VitalFlo. "With nearly 60 years\' experience, Vitalograph is a great fit for us as we strive to bring lung function testing and monitoring to the patient."',
        ],
      },
      {
        p: [
          "VitalFlo and Vitalograph join forces to provide innovative respiratory health solution",
        ],
      },
      {
        p: [
          "Using VitalFlo's innovative digital healthcare platform, Vitalograph's range of remote monitoring solutions enable clinical teams to provide proactive and routine management of respiratory diseases and conditions. This in turn improves the quality of life of those affected and empowers respiratory healthcare professionals to perform their job to the best of their abilities, and to better manage resources.",
        ],
      },
      {
        p: [
          'Executive Vice President of Vitalograph\'s Sales & Operations for North America, Troy Pridgeon added: "This is a very exciting opportunity to work with VitalFlo because they see healthcare as a connected whole. A digitally transformed space helping patients and healthcare workers to manage and prevent illness more quickly, conveniently, and seamlessly. Vitalograph is proud to include our devices for respiratory monitoring into this impressive digital healthcare system."',
        ],
      },
      { h: "About Vitalograph" },
      {
        p: [
          "Vitalograph is a global leading provider of respiratory diagnostic products and clinical drug trial services. Through the delivery of respiratory diagnostic solutions that are accurate and reliable, healthcare professionals are empowered to give the best possible care to their patients, wherever it is needed.",
          "Founded in 1963 and with a base in the US since 1969, Vitalograph products are relied on by healthcare professionals in more than 110 countries worldwide.",
          `Find out more: <a href="https://vitalograph.com/remote-respiratory-monitoring-solutions-from-vitalograph/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://vitalograph.com/remote-respiratory-monitoring-solutions-from-vitalograph/</a>`,
        ],
      },
      { h: "About VitalFlo" },
      {
        p: [
          "VitalFlo is a digital health company that helps clinical teams monitor the respiratory health of their patients. With patient devices for remotely monitoring lung function, VitalFlo delivers patient status and potential exacerbation trigger data back to clinical teams to make rapid corrections to care plans and improve outcomes.",
          `Find out more at <a href="https://vitalflohealth.com" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">vitalflohealth.com</a>`,
        ],
      },
    ],
  },

  // ── Predictive Equations ──
  {
    category: LEARNING,
    title: "Spirometry Predictive Equations: NHANES III vs. GLI 12",
    excerpt:
      "How to understand these standards, and decide which is most appropriate for your patients",
    author: LUKE,
    date: "April 27, 2022",
    image: img("predictive-equations"),
    tags: ["Spirometry"],
    body: [
      {
        p: [
          `Author's Note: The following is an excerpt from the "Spirometry Predictive Equations: NHANES III vs. GLI 12 Report" compiled by myself, Dr. Wes Sublett, and Dr. Todd Rowland. To access the complete guide to understanding these standards and how to decide which is most appropriate for your patients, please <a href="https://get.vitalflohealth.com/pfts-for-pcps" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">follow this link</a>.`,
        ],
      },
      {
        p: [
          `The National Health and Nutrition Examination Survey (NHANES) III and the ERS Global Lung Initiative 2012 (GLI 12) predictive equations for spirometry are both based on regression equations that use demographic and physiological factors (such as height, age, and sex) to predict forced expiratory volume in one second (FEV1). For most patients, there is general agreement between NHANES III and GLI 12 spirometry prediction equations <a href="#citation-1">[1]</a>.`,
        ],
      },
      {
        h: "NHANES III",
        p: [
          `Based on data obtained using equipment and techniques that met or exceeded the ATS guidelines, NHANES III included 7429 subjects aged 8-80 years old <a href="#citation-3">[3]</a>. Notably, the NHANES III polynomial model development used age and height as predictors for three specific US-based populations: Caucasian, African-American, and Mexican-American <a href="#citation-3">[3]</a>. While the ATS/ERS task force does recommend extrapolating the NHANES III prediction equations for patients older than 80 years, it is common in clinical practice <a href="#citation-2">[2</a>,<a href="#citation-4">4]</a>.`,
        ],
      },
      {
        h: "GLI 12",
        p: [
          `The GLI task force developed spirometric reference equations for ages 3–95 years using the generalized additive models for location, scale, and shape approach, resulting in the GLI 12 prediction equations <a href="#citation-5">[5-8]</a>. The supporting data were collected in a number of international studies (73 centers globally), including NHANES III data, and are intended to be applied globally <a href="#citation-5">[5]</a>. There were 74,187 subjects aged 2.5-95 years included in the GLI 12 spirometric prediction equations, and they were developed for four specific populations: Caucasian, Black, North-East Asian and South-East Asian <a href="#citation-4">[4]</a>. The GLI 12 predictive equations are endorsed by a number of respiratory societies around the world.`,
        ],
      },
      {
        h: "Citations",
        p: [
          `<a id="citation-1"></a>1. Linares-Perdomo, et al. Comparison of NHANES III and ERS/GLI 12 for airway obstruction classification and severity. Eur Respir J 2016; 48: 133–141.`,
          `<a id="citation-2"></a>2. Pellegrino R, Viegi G, Brusasco V, et al. Interpretative strategies for lung function tests. Eur Respir J 2005; 26: 948–968.`,
          `<a id="citation-3"></a>3. Hankinson JL, Odencrantz JR, Fedan KB. Spirometric reference values from a sample of the general U.S. population. Am J Respir Crit Care Med 1999; 159: 179–187.`,
          `<a id="citation-4"></a>4. Miller MR, Thinggaard M, Christensen K, et al. Best lung function equations for the very elderly selected by survival analysis. Eur Respir J 2014; 43: 1338–1346.`,
          `<a id="citation-5"></a>5. Quanjer PH, Stanojevic S, Cole TJ, et al. Multi-ethnic reference values for spirometry for the 3–95-yr age range: the global lung function 2012 equations. Eur Respir J 2012; 40: 1324–1343.`,
          `<a id="citation-6"></a>6. Quanjer PH, Hall GL, Stanojevic S, et al. Age- and height-based prediction bias in spirometry reference equations. Eur Respir J 2012; 40: 190–197.`,
          `<a id="citation-7"></a>7. Stanojevic S, Wade A, Stocks J, et al. Reference ranges for spirometry across all ages: a new approach. Am J Respir Crit Care Med 2008; 177: 253–260.`,
          `<a id="citation-8"></a>8. Rigby RA, Stasinopoulos DM. Generalized additive models for location, scale and shape. Appl Statist 2005; 54: 507–554.`,
          `<a id="citation-9"></a>9. Braun L, Wolfgang M, Dickersin K. Defining race/ethnicity and explaining difference in research studies on lung function. Eur Respir J. 2013;41(6):1362–1370.`,
          `<a id="citation-10"></a>10. Robey, N. Race in Spirometry (Part II) The Predictive Formulas. VitalFlo Health 2020. URL: <a href="https://www.vitalflohealth.com/post/race-in-spirometry-part-ii" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.vitalflohealth.com/post/race-in-spirometry-part-ii</a>. Last accessed April 8, 2022.`,
        ],
      },
    ],
  },

  // ── Parental Leave ──
  {
    category: WORKING,
    title: "Taking Parental Leave as a Startup Founder",
    excerpt:
      "It can be scary to take parental leave as a startup founder. Do it anyway.",
    author: LUKE,
    date: "April 1, 2022",
    image: img("parental-leave"),
    tags: ["Company Culture"],
    body: [
      {
        p: [
          "You are a startup founder. You recently learned that you or your partner is pregnant. Congratulations!",
          "Start planning how you'll take your parental leave now.",
          'You run a company, which means you work incredibly long, hard hours every week. Even when you are not sitting at your desk actively working, part of your brain is still grinding away at the problems your business is facing. Have you ever taken more than one consecutive week off? For many of us (before the prospect of parental leave), the answer has been "no."',
          "There have been many Twitter flame wars about how many hours-per-week are appropriate in workers in Tech and for founders. Let's leave that aside because this is about your growing family, and about your team.",
          "You need and want to take parental leave. The first weeks of your child's life are an amazing blur. If this is your first kiddo, you and your partner (if you have one) are about to cross a threshold with higher stakes than anything you've done before (yes, including your company). You will be rewarded with a brand new wonderful relationship with your child, and getting to know them as their personality emerges. It's also a period of the most erratic sleep you've ever had (unless you're a combat veteran). It takes time, and likely some tears, for you and your partner to get your bearings again. Parental leave is that time.",
          "Unfortunately, many founders don't believe they cannot take leave out of fear that the company will break while they are away.",
        ],
      },
      {
        h: "You've built a great team - trust them.",
        p: [
          "Yes, we have all seen and heard the founder glory stories. As a group we seem to be very fond of seeing ourselves on 30-for-30 lists and on cover stories. But this founder worship overlooks the fact that you are one person.",
          "Don't believe your own hype as a solo-executor: you have built your team so that the company can scale beyond your own abilities.",
          "There are a few reasons founders think they cannot take parental leave (or that they need to keep it super short):",
          "• Important things will slip through the cracks",
          "• The team won't know what to do",
          "• The company will slow down",
          "• Your investors will be angry or won't understand",
          "These are valid concerns - but you can solve for them. One of the graces of learning there is a kid on the way is you have 7-8 months of time to plan ahead and set expectations!",
          "Here's how, step by step:",
        ],
      },
      {
        h: "Step 1: Decide who will be in charge while you are on leave",
        p: [
          "The most important part of parental leave is that you actually... leave. That means you are not engaged in the day-to-day decision making.",
          "To feel comfortable with that you, your team, and your other stakeholders (investors, customers, etc), will want to know who is making the decisions.",
          "This is especially true if you are CEO: who will be the final say in unclear decisions? But it is also true if you are in another typical founder position: if you are CTO, who is the engineering team going to report to in the interim? If you have a pretty flat org chart, there still needs to be a clear and declared handoff of your current responsibilities and deliverables.",
          "When it comes to tapping in a new leader, I was fortunate to have my cofounder available for that. Andy and I started talking about the new reporting structure about 6 months before executing it, and told the team what was coming about 2 months ahead of time. One benefit to pregnancy being a 9-10 month timeline is that you have time to plan: use the time wisely!",
          "Sanity Check: There will be decisions made while you are away that will be different than the decisions you would have made. That is ok!",
          "As Reid Hoffman (founder of LinkedIn) has commented on the need for speed in startup decision making, and the tradeoffs from that speed:",
          '"In order to move fast, I expect you’ll make some foot faults. I’m okay with an error rate of 10-20% — times when I would have made a different decision in a given situation — if it means you can move fast."',
          "This is especially true when the typical decision maker (that's you) is out of the room. Give your team the autonomy they need to keep moving fast!",
        ],
      },
      {
        h: "Step 2: Plan your roadmap and priorities well in advance",
        p: [
          "The first step in the plan is to know who is going to be executing it (see above). This takes you most of the way there.",
          "But you also need to equip your #2 with everything they need to be successful in their new chance to step up. This will give them and the team they are managing the confidence to keep executing.",
          "Whatever you use as your normal planning process, make sure you stretch those plans out farther into the future where possible.",
          "One of the unique aspects of an early-stage start us is, to use Seth Godin's analogy: there is no map. It's the founder's job to make the map. To do that, they need to understand how to use their compass and their wits.",
          "In startups, this compass comes from an intuitive sense of the market and the problem you are solving. That intuition is built over time through lots of engagement with customers and stakeholders.",
          "Frequently, your team doesn't think of it as their job to be way-finders (that's your job). They are good at executing based on the map you build for them. So while you are away, leave them with a map of their immediate surroundings (this is your planning). And make sure your #2 is capable with a compass by looping them into all of your decision making processes well in advance of your departure.",
          "For example, knowing that I would be taking leave around February/March of 2022, I made sure Andy was in every board meeting and every significant decision conversation since August of 2021.",
        ],
      },
      {
        h: "Step 3: Communicate and over-communicate",
        p: [
          "This is admittedly the step I continue to need the most improvement. It is very easy to forget how often you need to say something in order for folks to hear and internalize what you said.",
          "As Jeff Weiner, CEO of Linkedin remarked in an interview:",
          "\"A friend of mine once paraphrased David Gergen, saying on the subject of repetition, 'If you want to get your point across, especially to a broader audience, you need to repeat yourself so often, you get sick of hearing yourself say it. And only then will people begin to internalize what you're saying.'\"",
          "Making sure everyone knows their roles and responsibilities - and how those may have changed - while you are on leave is a key ingredient to success.",
          "And again: use the lead time you have (in most pregnancies) to make sure all of your stakeholders know what is happening and what the plan is: I made sure our Board knew what the plan on well in advance of our execution of the plan.",
          "Sanity Check: Your investors, if they are investors worth having, will back (and encourage) your decision to take parental leave.",
          "There are several reasons your investors will be in your corner:",
          "• They want you to be successful over the long-term. Your investors are helping you run a 10+ year marathon, and that means partnering with you throughout many phases of your life. For you to pilot a successful outcome for them, they need you to have a home-life that is happy and healthy as well so that you approach your work from a position of strength, love, and support. (Example: Claire Díaz-Ortiz stepped in as interim CEO to help one of her portfolio company's CEOs take parental leave.)",
          "• They want you to set an example for the company. The fact of the matter is, you need a good parental leave policy if you want to be able to recruit top talent. That can be hard in a startup, but it\'s an investment worth making. It is also much different to live those values than to just give them lip service: by taking leave yourself, you demonstrate that your current and future employees will be able to do so as well. (Example: Gary Tan said exactly that when parental leave was a hot Twitter topic last year)",
          "In my personal experience, it was the investors on the Board that encouraged me to take my leave more seriously and completely. I originally was planning to take a two weeks off, followed by 3-4 weeks of part-time: Mike Troy (Geekdom Fund) and Ben Nahir (Elevate Capital) convinced me to take my full leave completely off.",
        ],
      },
      {
        h: "Your team is going to do great: enjoy the time with your new family member",
        p: [
          "I had all of the anxieties and neuroses I expect most founders do when it came to taking parental leave.",
          "My team crushed it while I was away.",
          "We had our best sales month in the history of the company while I was on leave (and it was not obvious that would be the case before I left).",
          "Trust your team to have your back and they will.",
          "Congratulations again: this is going to be a crazy whirlwind of joy and tears. Best of luck.",
        ],
      },
    ],
  },

  // ── Seed Round ──
  {
    category: NEWS,
    title: "VitalFlo Raises $2.14M Seed Round Led by Geekdom Fund",
    excerpt: "Respiratory Health Startup Secures Funds to Grow the Company",
    author: LUKE,
    date: "July 14, 2021",
    image: img("seed-round"),
    tags: ["Company News"],
    body: [
      {
        p: [
          `Raleigh, NC — July 13, 2021 — VitalFlo, the predictive medicine platform for chronic respiratory diseases such as asthma and COPD, today announced it has secured $2.14 million in seed funding led by <a href="https://geekdomfund.com/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Geekdom Fund</a>, who were joined by <a href="https://elevate.vc/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Elevate Capital</a>, <a href="https://lontraventures.com/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Lontra Ventures</a>, <a href="https://www.frontporchvp.com/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Front Porch Venture Partners</a>, and <a href="https://purposebuilt.vc/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Purpose Built Ventures</a>.`,
        ],
      },
      {
        p: [
          "VitalFlo's Remote Respiratory Monitoring platform helps health providers and clinical researchers connect with their asthma and COPD patients, and collect vital clinical quality data virtually.",
        ],
      },
      {
        image: "seed-round",
        alt: "VitalFlo Dashboard",
      },
      {
        p: [
          "After experiencing rapid growth and expansion with Allergy & Asthma clinics, Primary Care clinics, and Clinical Research teams, VitalFlo will use the new funding to scale up the business and grow its teams in Raleigh, NC and its new Portland, OR office to meet the demand for its remote patient monitoring and predictive medicine products.",
          '"We are thrilled our investors are eager to join us in our vision to improve patient care and health outcomes for those with chronic respiratory disease," said Luke Marshall, VitalFlo founder and CEO. "VitalFlo helps doctors keep their patients safe and healthy, with in-home tracking and forecasting of lung function, symptoms and environmental triggers."',
          "VitalFlo has realized significant growth since its commercial launch last year, and its ability to provide in-home monitoring of respiratory patients has been a key driver of that growth. VitalFlo has grown the number of patients under contract by 17X over the last 12 months.",
          '"Especially in the wake of COVID-19, it has never been more apparent that predictive medicine products like VitalFlo are needed to improve our ability to deliver care when and where it is needed most," said Mike Troy, Managing Partner at Geekdom Fund.',
        ],
      },
      {
        p: [
          "VitalFlo emerged from the patient care and research experiences of its Clinical Advisors, Dr. Michelle Hernandez and Dr. David Peden of UNC School of Medicine and in collaboration with researchers at NC State University. They identified an acute need for home respiratory monitoring for patients with asthma. This research has continued at VitalFlo with support from the National Science Foundation.",
          "VitalFlo built its platform to address the needs of both doctors and patients through clinically validated tools and systems. The company continues to grow the capabilities of its predictive medicine platform, and is excited by the reception in the clinical practice and research markets.",
        ],
      },
      { h: "About VitalFlo" },
      {
        p: [
          `VitalFlo is a predictive medicine platform for chronic respiratory diseases such as asthma and COPD. By running machine learning models across a unique dataset of remotely monitored patient lung function, symptoms and environmental triggers, VitalFlo's clinical decision support helps identify patients who are at-risk of a health decline and provides patients and their doctor with alerts to get them back on track. VitalFlo has offices in Raleigh, NC and Portland, OR. For more information about VitalFlo, visit <a href="https://www.vitalflohealth.com/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.vitalflohealth.com/</a>`,
        ],
      },
      { h: "About Geekdom Fund" },
      {
        p: [
          `Geekdom Fund is an early stage, B2B venture fund that backs entrepreneurs in Texas and beyond who are delivering innovative and disruptive solutions to small, medium and enterprise-level customers. For more information, please visit: <a href="https://www.geekdomfund.com/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">www.geekdomfund.com</a>`,
        ],
      },
    ],
  },

  // ── Survey ──
  {
    category: SCIENCE,
    title: "How to Form A Survey Effectively",
    excerpt:
      "This is a question that frequently enters the mind of non-profit program managers, healthcare professionals, product managers.",
    author: NYX,
    date: "June 3, 2021",
    image: img("survey"),
    tags: [],
    body: [
      {
        p: [
          "This is a question that frequently enters the mind of non-profit program managers, healthcare professionals, product managers, school principals, the list goes on. The key word to this title, however, is how does one do this effectively? Sure, asking questions is easy, but how do you know they're even the right questions?",
        ],
      },
      {
        h: "Top Considerations: Where to Begin",
        p: [
          "1. What's the purpose of the survey? This is the most important question. What questions are you trying to answer? Are you trying to eventually publish this somewhere? If so, the design needs to be particularly rigorous.",
          "2. How do you measure these answers? For this question, ideally you use a pre-existing questionnaire. Questionnaires need to be validated and reliable for them to be relevant. This ensures your format didn't unduly influence the individual taking the survey and can be repeated. This is an incredibly important question, which we'll go into more depth below.",
          "3. Has this been done before? Are you drawing new answers by doing this survey? Can you learn from previous attempts? Are there experts in this area who you could consult?",
          "4. Who are you trying to reach? When we form surveys, we want to keep the individual respondent in mind. Does the survey need to be tailored towards their particular condition, age-range, or other demographic?",
          "5. Does the format you have in mind work for your respondents? It's critical that the survey you're designing is going to be accessible to the individuals you're trying to survey. Is paper and pen in-office the best method? Over the phone? Or is a more technical format that streamlines survey data into one database like a cell phone application most accessible for your respondents?",
          "6. Data cleaning, analysis, and dissemination — Who will look at the data? Having data isn't helpful unless someone is looking at it, drawing conclusions, and synthesizing it. What are the questions that will be helpful to your audience, and who is the designated team to help aggregate conclusions about the data. Can they organize the data, clean it appropriately, recognize outliers, and visualize conclusions succinctly?",
        ],
      },
      {
        image: "survey-top-considerations",
        alt: "Top Considerations in Forming a Survey",
      },
      {
        h: "Survey Factors: Considerations in Writing",
        p: [
          "1. Item-order Consider what order the questions are going to appear, and whether they may affect responses on the following ones. This is particularly key for valenced questions that may represent evaluative judgment on self for an individual, for example: life satisfaction, how often individuals feel a certain way, etc.",
          "2. Types of items Open-ended items allow minimal influence of the research on the patient, but trade-off with the difficulty of coding and transcribing. Individuals are more likely to skip these questions because they take longer. Questions where you don't want to influence the participant or force them into a box, should be open-ended. Do you want to use a 1–5 Likert scale that allows you to range from 'Very Poor' to 'Excellent'? Do you need to judge measurable differences like a 1–10 numerical scale? Would a visual analog scale with happy to unhappy faces work best? On the other hand, yes or 'I agree' vs 'no' or 'I disagree' are straightforward and don't allow for ambiguity. Participants are forced to respond in a valenced capacity.",
          "3. Writing Effective Items: BRUSO: Authors Price, Jhangiani & Chiang use this acronym that stands for “brief,” “relevant,” “unambiguous,” “specific,” and “objective.” Additionally, are your items:",
          "• To the point without extra language",
          "• Relevant to the research question",
          "• Use scales that are familiar to individuals when possible.",
          "Lastly, be sure to introduce your survey in some capacity. This both encourages participation and its explains the purpose of the survey, and allows for a fluid touchpoint to gain consent for their answers.",
        ],
      },
      {
        image: "survey-factors",
        alt: "Survey Factors to Consider in Writing",
      },
      {
        h: "Reference",
        p: [
          `Price, Paul C., Jhangiani, Rajiv S. & Chiang, I-Chant A. “Constructing survey questionnaires.” Research methods in psychology (2015). <a href="https://opentextbc.ca/researchmethods/chapter/constructing-survey-questionnaires/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://opentextbc.ca/researchmethods/chapter/constructing-survey-questionnaires/</a>`,
        ],
      },
    ],
  },

  // ── Machine Learning ──
  {
    category: SCIENCE,
    title: "The power of remote monitoring through machine learning",
    excerpt:
      "As an asthma forecasting company, we strive to reduce the burden of asthma.",
    author: "Alicia Chen",
    date: "February 26, 2021",
    image: img("machine-learning"),
    tags: ["Remote Monitoring", "Asthma"],
    body: [
      {
        p: ["Written in collaboration with Nyx Robey"],
      },
      {
        h: "Recent developments in machine learning for asthma prediction",
        p: [
          "As an asthma forecasting company, we strive to reduce the burden of asthma so that patients can better prepare for the possibility of an exacerbation. We do so based on forecasting asthma control based on weather, pollution, previous spirometry measures, and most recently, previous days of asthma control.",
        ],
      },
      {
        h: "What is Asthma Control?",
        p: [
          "Asthma control as defined by the National Lung, Health, and Blood Institute involves (1) reducing impairment, or the frequency and intensity of symptoms and limitations, and (2) reducing risk, or the likelihood of future asthma attacks or worsening of lung function.[1] It is frequently used by clinicians to determine the degree of asthma care required by patients and how much such care should be periodically adjusted. It is, in other words, a prime indicator of how well a patient's lungs are doing and is a key framework for making clinical decisions.",
        ],
      },
      {
        h: "What does the Research Say?",
        p: [
          "In recently published respiratory literature, machine learning has previously been used to predict whether a patient will be diagnosed with asthma[2], or help triage patients who are in an emergency room[3]. However, recently, two studies have been published that predict an asthma patient's functioning anywhere from a day to a week in advance, allowing for the possibility of live remote monitoring of patients by their physicians.",
          "One, an international study,[4] predicted whether a patient would experience an asthma exacerbation within the next day, utilizing patient PEF and symptom scores. The second study predicted whether patients would exhibit high or low levels of asthma symptomatology[5]. The last study predicted asthma control deterioration in children one week in advance[6].",
        ],
      },
      {
        h: "What if there's no spirometer?",
        p: [
          "All of these models take spirometry measurements as predictors; however, we wanted to create a novel model that makes achieving high asthma control possible even for patients who cannot access a spirometer. We've started this process by validating our asthma control survey against industry standards — and now we're also applying it through creating models that can forecast control a day in advance without requiring a spirometer.",
        ],
      },
      {
        h: "Asthma control can be tracked and predicted through recording asthma symptoms",
        p: [
          "At VitalFlo, we recently created a machine learning model that predicts a patient's level of daily asthma control around a day in advance without requiring spirometry measurements. This model performs almost identically well to our model that includes spirometry measurements, demonstrating the primacy of past symptoms in helping predict future control. Using symptoms alone may prove just as effective as using more granular measures such as spirometry.",
          "The model allows us to see if patients' symptomatology will change from day to day. These criteria were created using NIH asthma control guidelines[2], and data were collected from adolescent asthmatic patients from a symptom survey sent out via the VitalFlo smartphone app.",
        ],
      },
      {
        h: "Preliminary Results from Our Model",
        p: [
          "Three previously published models for predicting asthma exacerbation or control reported accuracy ranging from 71–100%*, specificity ranging from 71–100%**, and recall ranging from 73–100%***.",
          "Our model performs comparably: we've achieved an accuracy of 93% with accompanying specificity and recall of 97% and 72%, respectively. This performance is identical to our model that uses spirometry measurements.",
        ],
      },
      {
        h: "What does this mean for the future of remote lung health monitoring?",
        p: [
          "The results are promising. Applying and deploying this machine learning model may help physicians successfully monitor lung health for a broader range of respiratory patients — those who cannot use spirometers, or do not have access to them. Understanding lung function triggers and symptoms will ideally help improve patients' control of their asthma. This preliminary exploration suggests that providing demographics, collecting information about air quality, and completing symptom surveys may provide such control improvement.",
          "We're excited to continue to draw insights from machine learning that might support physicians in making the best possible patient care decisions.",
        ],
      },
      {
        h: "Footnotes",
        p: [
          "*Accuracy: how many of the model's predictions are correct?",
          "** Specificity: of all the actual days without symptoms, which did the model predict were days without symptoms?",
          "*** Recall: of all the actual days with symptoms, which did the model predict were days with symptoms?",
        ],
      },
      {
        h: "References",
        p: [
          "National Lung, Health, and Blood Institute. Asthma care quick reference: Diagnosing and managing asthma.",
          "Spathis, D., & Vlamos, P. (2019). Diagnosing asthma and chronic obstructive pulmonary disease with machine learning. Health Informatics Journal, 25(3), 811–827.",
          "Patel, S. J., Chamberlain, D. B., & Chamberlain, J. M. (2017). A machine learning approach to predicting need for hospitalization for pediatric asthma exacerbation at the time of emergency department triage. Academic Emergency Medicine, 25(12), 1463–1470.",
          "Zhang, O., Minku, L. L., & Gonem, S. (2020). Detecting asthma exacerbations using daily home monitoring and machine learning. Journal of Asthma, 1–10.",
          "Finkelstein, J., & Jeong, I. (2017). Machine learning approaches to personalize early prediction of asthma exacerbations. Annals of the New York Academy of Sciences, 1387(1), 153.",
          "Luo, G., Stone, B. L., Fassl, B., Maloney, C. G., Gesteland, P. H., Yerram, S. R., & Nkoy, F. L. (2015). Predicting asthma control deterioration in children. BMC Medical Informatics and Decision Making, 15(1), 1–8.",
        ],
      },
    ],
  },

  // ── Race & Spirometry Part IV ──
  {
    category: SCIENCE,
    title: "Race & Spirometry (Part IV)",
    excerpt:
      "Today, in the final article of the series, we'll focus on the impact of these factors.",
    author: NYX,
    date: "December 2, 2020",
    image: img("race-spirometry"),
    tags: ["Health Equity", "Spirometry"],
    body: [
      {
        h: "Quick recap",
        p: [
          "• The first article focused on the history of race in American medicine.",
          "• The second article focused on how predictive algorithms came to be in spirometry.",
          "• The third article focused on the history of race in specifically spirometry.",
          "• Today, in the final article of the series, we'll focus on the impact of these factors.",
        ],
      },
      {
        h: "Baltimore Asbestos Lawsuit",
        p: [
          `Dr. Lindy Braun started researching for her book <em>Breathing Race into the Machine</em> when she heard about a case in Baltimore in 1999.<a href="#ref-1">1</a> A lawsuit was underway, and lawyers for an insulation manufacturer were refusing to allow Black Americans to even qualify for a class-action lawsuit unless they could prove their lung health was worse due to asbestos exposure beyond the scores of White Americans.<a href="#ref-1">1</a>`,
          `Because of the massive amount of asbestos lawsuits in Maryland, in 1992, Maryland Circuit Court Judge Joseph H.H. Kaplan came up with guidelines that stipulated lung lawsuits can use the racial correction factors as guidance for determining appropriate test values.<a href="#ref-1">1</a>`,
          `Experts came to speak on behalf of both sides. The American Medical Association, <a href="https://www.ama-assn.org/delivering-care/health-equity/ama-racism-threat-public-health" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">who recently came out acknowledging racism as a public health threat</a>,<a href="#ref-2">2</a> at the time supported race as a qualification in considering lung health. A pulmonologist at the University of Pennsylvania spoke in support of using a correction factor for racial differences while a pulmonary specialist in Virginia mentioned that are many other factors that account for lung capacity.<a href="#ref-3">3</a>`,
          `Other medical and asbestos specialists as well as an anthropologist denounced the validity of using race as a correction factor in pulmonology.<a href="#ref-1">1</a> After hearing the case, Jude Kaplan overruled his previous guidelines and adjudicated race as an inappropriate factor in asbestos lawsuits in Maryland.<a href="#ref-3">3</a>`,
          `Lawsuits on asbestos ended up making their way to a congressional bill called the \`Fairness in Asbestos Compensation Act of 1999' that died in a previous congress after not receiving a vote, where predicted values were again defined by factors including race and/or ethnicity.<a href="#ref-4">4</a>`,
          `While this lawsuit happened nearly two decades ago, its implications in spirometry, and even value of life and compensation, ring true in 2020. This lawsuit was not factored into medical history as a clause on how we view race in spirometry.`,
          `As a result of those previous court rules, Black Americans could not sue asbestos manufacturers for their injuries. Misusing racial "corrections" in spirometry has cost these communities millions in recompense, further increasing racial health disparities. Instead, studies have continued to solidify racial and/or ethnic differences, that can end in the devaluing of life, and the downsizing of important and significantly evidence-based factors that affect lung function (i.e. asbestos exposure).`,
        ],
      },
      {
        h: "Impact of Spirometry",
        p: [
          `Spirometry is used in diagnosing respiratory conditions like asthma or COPD, but it may also be used in screening for occupational-related lung disorders.<a href="#ref-5">5</a> OSHA, or the Occupational Safety & Health Association, also harps on the importance of recording an individual's race/ethnicity during an occupational spirometry screening, using an individual's race from their personal record.<a href="#ref-6">6</a>`,
          `OSHA recognizes that some of the predictive algorithms are not able to correctly account for individuals of mixed-racial background or of ethnicities that don't currently have research populations. As a result, they ask individuals to approximate to the closest ethnic group that is accounted for.<a href="#ref-6">6</a> Ethnic identity can often be a deeply important aspect of one's identity. Asking someone to conform to another ethnic group for the purpose of their health may serve as an additional microaggression against their identity.`,
          `Spirometry may result in asthma management techniques and prescription changes,<a href="#ref-8">8</a> lung cancer screenings,<a href="#ref-9">9</a> and as history has shown even accessibility to health-related lawsuits.`,
          `We truly believe in the importance of spirometry as a clinical tool that can be hugely beneficial to patients. We also must be mindful of the history, implications, and extent of a positive impact each factor plays in reporting spirometry.`,
        ],
      },
      {
        h: "Other Factors",
        p: [
          `Disaggregating Social Determinants of Health`,
          `We're here to think about the other factors that impact one's lung health, and what's most useful from research, patient, and provider perspectives. While the Race & Spirometry blog series is on its final official blog post, we'll be ramping up other stories about the factors that affect lung health.`,
          `Currently we're investigating things like time, coaching and education, and air quality. Air quality, for example, can be a proxy for a social determinant of health like income, in which individuals from impoverished areas tend to face more pollutants.<a href="#ref-10">10</a> <a href="#ref-11">11</a> It is incredibly important in impactful healthcare that we seek to disaggregate social determinants of health to what they truly are. In this case, one's distance from a pollution source.`,
          `Disaggregating factors linked to social determinants of health, help us all to reduce racial, economic and social biases that also creep into the medical office, where privacy and safety are already concerning for marginalized communities in particular.`,
          `It also pushes us to reevaluate "normal" and who gets to be qualified as the comparison group, when our country is becoming increasingly diverse across genders and racial groups.<a href="#ref-12">12</a> Who gets to tell our stories as Americans? How do we want them told and upheld?`,
          `In blog posts to come, Ryan and Luke will lead us through topics of air quality, and reflections on news articles on how we can focus in on some of the factors that deeply affect lung health, and what we can do about it: both as companies in healthcare, and as individuals. We'll work on educating our communities around asthma control, spirometry functioning, and the factors that affect asthma most.`,
        ],
      },
      {
        h: "Working at VitalFlo: A Digression",
        p: [
          `At VitalFlo we invite people on our team who are not only great at what they do, but their experiences and passions are diverse. We recruit individuals who think from many angles and help us build a product that is truly beneficial to all patients and to the community that we're a part of in Raleigh.`,
          `We think critically with medical and university partners to ask hard and meaningful questions that contribute to research. We want to ensure that the providers have the most useful tools in pulmonology at their disposal, and that patients are well-informed about the benefits, impacts, and education around our product. If this sounds like a good fit to you, you should check out our "Working at VitalFlo" section and follow us on LinkedIn for job announcements.`,
        ],
      },
      {
        h: "References",
        p: [
          `<span id="ref-1">1. Texeira, E. (2017, October 12). Racial basis for asbestos lawsuits?; Owens Corning seeks more stringent standards for blacks. Retrieved November 24, 2020, from <a href="https://www.baltimoresun.com/news/bs-xpm-1999-03-25-9903250041-story.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.baltimoresun.com/news/bs-xpm-1999-03-25-9903250041-story.html</a></span>`,
          `<span id="ref-2">2. O'Reily, K. B. (2020, November 16). AMA: Racism is a threat to public health. Retrieved November 18, 2020, from <a href="https://www.ama-assn.org/delivering-care/health-equity/ama-racism-threat-public-health" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.ama-assn.org/delivering-care/health-equity/ama-racism-threat-public-health</a></span>`,
          `<span id="ref-3">3. Franklin, J. (1999, March 26). Owens Corning Can't Bar Lawsuits. Retrieved November 24, 2020, from <a href="https://apnews.com/article/1663c6c757a578952015db70c5c420f4" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://apnews.com/article/1663c6c757a578952015db70c5c420f4</a></span>`,
          `<span id="ref-4">4. Fairness in Asbestos Compensation Act of 1999: Hearing before the Committee on the Judiciary, House of Representatives, One Hundred Sixth Congress, First Session, on H.R. 1283, July 1, 1999.; 2000.</span>`,
          `<span id="ref-5">5. <a href="https://www.congress.gov/bill/106th-congress/senate-bill/758/text" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.congress.gov/bill/106th-congress/senate-bill/758/text</a></span>`,
          `<span id="ref-6">6. Spirometry. (2017, August 17). Retrieved November 24, 2020, from <a href="https://www.mayoclinic.org/tests-procedures/spirometry/about/pac-20385201" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.mayoclinic.org/tests-procedures/spirometry/about/pac-20385201</a></span>`,
          `<span id="ref-7">7. Occupational Safety and Health Administration, 2013. Spirometry Testing in Occupational Health Programs. Best Practices for Healthcare Professionals. Osha 3637–03 2013. Washington, DC: OSHA. Retrieved November 24, 2020 from <a href="https://www.osha.gov/Publications/OSHA3637.pdf" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.osha.gov/Publications/OSHA3637.pdf</a></span>`,
          `<span id="ref-8">8. Horak F, Doberer D, Eber E, et al. Diagnosis and management of asthma — Statement on the 2015 GINA Guidelines. Wien Klin Wochenschr. 2016;128(15–16):541–554. doi:10.1007/s00508–016–1019–4</span>`,
          `<span id="ref-9">9. Mohamed Hoesein FA, de Jong PA. Personalized lung cancer screening: the value of spirometry and emphysema as risk modifiers. Ann Transl Med. 2016;4(15):293. doi:10.21037/atm.2016.05.59</span>`,
          `<span id="ref-10">10. Katz, C. (2012, November 01). People in Poor Neighborhoods Breathe More Hazardous Particles. Retrieved November 24, 2020, from <a href="https://www.scientificamerican.com/article/people-poor-neighborhoods-breate-more-hazardous-particles/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.scientificamerican.com/article/people-poor-neighborhoods-breate-more-hazardous-particles/</a></span>`,
          `<span id="ref-11">11. Disparities in the Impact of Air Pollution. (2020, April 20). Retrieved November 24, 2020, from <a href="https://www.lung.org/clean-air/outdoors/who-is-at-risk/disparities" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.lung.org/clean-air/outdoors/who-is-at-risk/disparities</a></span>`,
          `<span id="ref-12">12. Vespa, J., Armstrong, D.M. and Medina, L. (2020 February). Demographic turning points for the United States: Population projections for 2020 to 2060. Washington, DC: US Department of Commerce, Economics and Statistics Administration, US Census Bureau</span>`,
        ],
      },
    ],
  },

  // ── Who We Are ──
  {
    category: WORKING,
    title: "Who We Are",
    excerpt: "VitalFlo's Vision, Mission & Values",
    author: LUKE,
    date: "November 22, 2020",
    image: img("who-we-are"),
    tags: ["Company Culture"],
    body: [
      {
        p: [
          "VitalFlo is on a mission to dramatically improve the experience of those living with chronic respiratory disease by revolutionizing the way preventative care is delivered.",
          "Our remote monitoring tools are driven by the latest in data science, clinical research, and environmental science to help Care Teams seamlessly manage their patients. By elevating timely data-centered insights, VitalFlo's solution improves patient satisfaction, improves clinical outcomes, and reduces overall health spending.",
          "We are early in our journey and growing fast. Here is a little more on where we are going, how we're getting there, and who we are:",
        ],
      },
      {
        h: "Our Vision",
        p: [
          "At VitalFlo, we make managing chronic respiratory disease the least disruptive part of your day.",
        ],
      },
      {
        h: "Our Mission",
        p: [
          "VitalFlo creates clinically validated tools, accessible to all, to proactively monitor chronic respiratory disease. We use the latest clinical research, behavioral science, and environmental science to empower patients to take charge of their health with a simple, intuitive experience. With our predictive analytics and data-driven insights, VitalFlo supports provider teams in making efficient, effective clinical decisions.",
        ],
      },
      {
        image: "who-we-are-banner",
        alt: "VitalFlo - Remote Monitoring for Lung Health",
      },
      {
        h: "Our Values",
        p: [
          "These values are in this order intentionally. Sometimes circumstances arise that cause values to conflict. In those cases, we expect team members to uphold these values, and in this order:",
        ],
      },
      {
        h: "1. Be courageous.",
        p: [
          "At VitalFlo, we always strive to act with integrity, both internally and externally. We expect our employees to be honest and steadfast through challenging times. We believe team members function best when they have autonomy in their roles, and that with that autonomy comes the responsibility to do what is right even when no one is watching.",
          "As a team, we respect one another enough to have a hard, awkward or difficult conversation when it's necessary for improving our work, our workplace or ourselves. We aim to build a team representative of all walks of life, and as such celebrate when our team mates are courageous enough to show up with their whole selves: their true, weird and beautiful selves.",
        ],
      },
      {
        h: "2. Focus on results.",
        p: [
          "We actively provide, and expect from each other, context on why the work we are tasked with will create meaningful results. Frequently, the most impactful outcomes are driven by team members who take initiative: when you notice something is wrong, you find a way to fix it. This individual initiative is valued, and also fits within a larger company context: though problems will sometimes arise that need addressed, we all still strive to plan ahead.",
          "By defining our individual and collective goals within the context of larger organizational outcomes, we are able to achieve big things together. Much of the day-to-day work that drives these results takes place on our own time. We have deep trust in all of our team members to complete their work on schedule, while respecting their ability to manage their schedule and to make selfcare a priority. The road to accomplishing your goals will often be self-driven and flexible, provided your outcomes are achieved.",
        ],
      },
      {
        h: "3. Seek out growth.",
        p: [
          "The scale of the impact we seek to make at VitalFlo is massive. If we are to successfully meet this challenge and to realize our mission, we need to scale our company and ourselves. Consistent growth and persistent improvement of our company, our team, our products, and every individual is both an aspiration and an expectation. VitalFlo is dedicated to empowering the continued growth of our team, and will invest in the resources and time that this requires.",
          "Team members regularly dedicate work hours towards individual improvement, skills enhancement, and career development because our company cannot grow if our people do not grow. Our team members are proud of the growth that they independently nurture and actively disseminate that knowledge throughout the organization. We also recognize that you may leave VitalFlo at some point in the future (although we hope you never do!), and if that is the case our goal is that you will leave with more skills and opportunities than you had when you arrived.",
        ],
      },
      {
        h: "4. Be helpful.",
        p: [
          "VitalFlo has the incredible opportunity to help individuals with chronic respiratory issues to move beyond disease management and into a thriving and fulfilling life. When we are reaching for our vision and fulfilling our mission, we are engaging in an act of service to our customers and community. As a result, being helpful is simply just part of who we are.",
          "Any time you interact with someone, whether they are a fellow teammate or an external stakeholder, we expect you to ask yourself how you can step in to help improve their day or share their load. Individuals at VitalFlo succeed when their fellow team members succeed. We take notice when team members go above and beyond to improve the lives of those around them.",
        ],
      },
      {
        h: "5. Maximize Impact.",
        p: [
          "There are always multiple ways to solve a problem. In our current world, it is so easy to have a never-ending inbox and task list, but checking to-dos off the list does not always create big results or improve outcomes — sometimes it can distract from them.",
          "We value creating leverage. For example: is there a task, which when completed, solves the other ten or makes them irrelevant? What small experiment can you run to test an initiative that may have a substantial impact on revenues? Where can you apply a small amount of effort to see outsized results?",
          "Looking for leverage does not mean we don't work hard, it means we work smarter, with increased efficiency and resourceful creativity. Follow sparks of inspiration with rigor: creating leverage is about finding unseen or unnoticed opportunities and then following through with focused diligence. It is worth noting that we believe one of these powerful levers is taking care of yourself emotionally, physically, and relationally: the company does better when our team members are happy, healthy, and fulfilled.",
        ],
      },
      {
        h: "6. Reduce complexity.",
        p: [
          "This informs the experiences we are trying to create for our customers and stakeholders: go reread our vision. We strive to make our products more intuitive, easier to use, and less complicated. This also informs how we strive to build our company structure and culture.",
          "There are two types of rules in any company: structured, universal and obligatory and natural, company-centered, and cultural. The first type includes rules that are put in place for the health, safety, and well-being of customers, team members, and the community (for example: FDA requirements, password security, and sexual harassment policies). These rules should feel mandatory, essential and familiar, but also desirable. The second type is the natural, organic growth of company cultural expectations sometimes codified as rules (for example, All Hands Meetings or using Jira for group projects). The rules of this second type should ideally be adopted in order to reduce complexity… but sometimes they increase it. When this happens, it is your job to ask why the rule is in place and to strive to create new cultural norms that make working in the company easier and less complex for everyone.",
        ],
      },
      {
        image: "remote-monitor",
        alt: "VitalFlo Dashboard",
      },
    ],
  },

  // ── Race & Spirometry Part III ──
  {
    category: SCIENCE,
    title: "Race & Spirometry (Part III)",
    excerpt: "Reducing Bias in Data by Understanding Its History",
    author: NYX,
    date: "November 19, 2020",
    image: img("race-spirometry"),
    tags: ["Health Equity", "Spirometry"],
    body: [
      {
        p: [
          `In case you've missed the first two articles, it may be helpful to go read those first. <a href="https://medium.com/vitalflo-health/race-spirometry-part-1-ec38720c2087" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">The first article</a> details the broader history of race in American medicine. <a href="https://medium.com/vitalflo-health/race-in-spirometry-part-ii-cbe930fe325e" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">The second article</a> details predictive equations in spirometry, and race as a factor of prediction. This article will tie those two by detailing the history of race in spirometry. Much of this article goes into details chronicled by <a href="https://vivo.brown.edu/display/lbraun" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Dr. Lundy Braun</a> in her book, <a href="https://www.upress.umn.edu/9780816683598/breathing-race-into-the-machine/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Breathing Race into the Machine</a>. If this series interests you, I would encourage you to read her book, <a href="https://www.upress.umn.edu/9780816683598/breathing-race-into-the-machine/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">available in paperback in January</a> and currently available in hardback.`,
        ],
      },
      {
        h: "History of Race in Spirometry: Founding Fathers",
        p: [
          "Roots of race in spirometry were established when Thomas Jefferson noted differences in lung function between White and Black individuals, possibly as a way of further justifying slavery.¹ ² Spirometry was imagined in many capacities, but modern spirometry began to take shape in Europe in the 1840s through the work, study, apparatus and nomenclature created by John Hutchinson.¹ He promoted height as a potential predictive factor of lung function later adding in occupation.",
          "However by the time spirometry made it to the United States, Jefferson's mentality around racial differences in biological capacities was cultivated by the pseudo-science of eugenics and nurtured by skull sizing, craniology and racial differences as famously chronicled by Samuel Morton.³ In the 1850s, Samuel Cartwright a prominent physician and plantation owner who forced individuals into enslaved labor began using his educational background to justify racial differences to build a device in order to justify that the Black individuals “consume less oxygen than white people”⁴ and accounted for a 20% difference numerically.",
        ],
      },
      {
        image: "race-spirometry-timeline",
        alt: "Timeline of Race in Spirometry",
      },
      {
        h: "1850 on: Civil War",
        p: [
          "The notion of racial differences helped fuel ideas of enslaved labor and environmental tolerance that made one race better suited for labor than another. By the time the Civil War broke out, the United States commissioned a Sanitary Commission in order to understand the hygiene and physical burdens of the war on the Union Army's success.¹ Originally race was not a factor in this study.",
          "The focus changed when Benjamin Apthrop Gould led the helm, a prominent astronomer and data analyst (also one of the original founders of the National Academy of Sciences),⁵ fueled by funding from the life insurance industry.¹ The original mission advanced to compare White soldiers to Black soldiers recently authorized to join the fight. His efforts ended in Investigations in the Military and Anthropological Statistics of American Soldiers, in which the hefty volume details various anthropomorphic differences from baldness, facial angle, and number of teeth lost to the use of spirometry organized by race and “nativity” over occupation for the first time.⁶",
        ],
      },
      {
        h: "Bias and A Lack of Reliable Data",
        p: [
          "Field reporters who helped with the survey were told to assess race visually and estimate level of non-white race compared to a White standard soldier.¹ He noted “marked inferiority of the values observed in the black race” in lung capacity and used “inferior” to describe “Indian” and “Mulatto” groups throughout the volume.⁶ While Gould looked at differences between some occupational factors like job or rank, for White individuals, these were ignored for other races.",
          "Lastly in a push to publish, data was lost or misclassified, leaving numbers that are likely untrue.¹ The study was published and accepted despite a pretty similar study conducted by Jedidah Baxter, the chief medical officer for the Bureau of the War Department, that found no differences.¹ ⁷ Additionally prominent Black physicians, scientists, and intellectuals like W.E.B. DuBois, Kelly Miller, and M.V. Ball protested, nevertheless, the idea that “non-white” individuals had weaker lungs persisted and prevailed.",
        ],
      },
      {
        h: "Early 1900s: Life & Medicine",
        p: [
          "Frederick Hoffman, chief statistician for Prudential Life Insurance Co. used the data from Gould's study from the Civil War as justification for eliminating industrial life insurance policies for Black individuals.¹ This was premised on his argument that Black individuals will die at faster rates due to the insufficient capacities of handling emancipation, and inferior lung health and capacity.¹ ⁸ ⁹",
          "Medical Handbook",
          "Hoffman's conclusion that White individuals fundamentally had higher lung capacity than other racial groups took root. These racial differences (and differences based on sex) were then incorporated in a clinical handbook by JA Myers in 1925,¹⁰ setting the stage for an official standard worldwide and solidifying race as a predictive variable. Research in 1960 emphasized these racial differences further and brought it to the international forefront. One study compared lung function in mills and ginneries cross-borders between Uganda and Kenya with England and concluded smaller lung capacity without confounding or additional factors.¹¹",
        ],
      },
      {
        h: "Scaled Factors and Pushing Out Other Factors",
        p: [
          "Differences led to a scaled factor first presented (to my knowledge) from Tulane University in 1974. This 13% difference can still be seen in modern equations including within the NHANES formulas. This New Orleans-based study entirely dismissed social and economic factors. In the discussion section, the authors cite that because their results reflect other studies, “these factors may be unimportant.”¹² Additionally they recommend that the results “be taken representative of the ethnic differences throughout the U.S.A.” despite solely comparing Black and White asbestos cement workers in the south.",
          "Around the same time, a book was published on predictive values and only looked at the function of age and height over time in its regression formulas.¹⁴ This book did not claim race as a factor, but race as a factor in spirometry persisted.",
        ],
      },
      {
        h: "Centering of White Men",
        p: [
          "Predictive values accepted by spirometers today date back to the 1960s. Early values like those produced by Berglund and colleagues originate in European countries with a White population forming a norm to compare other individuals.¹⁵ Additional previous acceptable measures of predicted values include Knudson, 1976 and Knudson, Lebowitz, Holberg, and Burrows 1982. The latter looked at “white non-Mexican-American” participants in Arizona.¹⁴",
          "White men become the standard that is left unweighted and untouched while individuals outside of that identity are adapted via “corrective” values or formulas, and often crippled in the process in terms of weighted variables within a predictive equation.",
          "The 1990s brings us to the NHANES formulas focused in the USA and comparisons in accessible datasets across White, African-American, and Mexican American populations.⁶",
        ],
      },
      {
        h: "Back to GLI",
        p: [
          "Last article, we focused a lot on the Global Lung Function Initiative predictive equations, largely acceptable, with over 74,000 participants within the study and an intent to reach and incorporate more age groups and ethnic groups.",
          "The GLI equations are often globally acceptable and to their credit wide reaching. Yet they are still really limited in the various ethnic identities they can predict. They don’t account for movement across regions or racial/ethnic identity within a country; they don’t account for generational or immigration status. The authors even mentioned that certain variation may be a result of advanced lung function based on altitude of a city or region, for example. There has been research on pretty substantial differences based on altitude,¹⁶ ¹⁷ ¹⁸ but these factors are not accounted for in the analyses.¹⁹",
          "The issue with these predictive formulas is that race, as shown through historic timelines, is not a good proxy for things like proximity to pollution, whether you were raised at altitude, if you have impactful biological factors that may impact your age, sex, height, and ultimately your lung capacity.",
          "With their national acceptance and integration into spirometers using baseline information in order to even access the device, these algorithms are hard to move away from. The study has large study sample sizes in various centers across the world, making the study highly impactful, while still squandering ethnic identity into four categories. This can be dangerous in the realm of science, where we rely on doctors and scientists to interpret results meaningfully, and we trust the integrity of that science based on their expertise, the peer-review process, and the quality of journals and statistical methodology. We want professionals to focus on impact over intent, and to recognize ethical implications of interpretability.",
          "The issue with intent though, is it doesn’t factor in societal assumptions, the implicit biases that individuals foster based on those assumptions, and our country’s storied history. All of these funnel into impacting an individual’s health.",
        ],
      },
      {
        h: "Steps towards Centering of the Individual",
        p: [
          "At VitalFlo we’re seeking to predict an individual’s lung capacity from their own baseline based on vital capacity, environmental air quality, time in the year, and other variables that influence how well you breathe as an individual.",
          "We’re attempting to break potentially harmful cycles that are determined by social norms of gender and ethnic or racial identities, while recognizing that these are important aspects to an individuals identity and a possible social determinant. While we will continue to offer access to these national and international standards, we want to ensure that our audiences recognize the detailed history and possible impact that these predictions are empowered with.",
        ],
      },
      {
        image: "ama-quote",
        alt: "AMA Quote on Racism",
      },
      {
        p: [
          `The American Medical Association just this week publicly recognized racism as a threat to public health,²⁰ which is a huge step towards tackling historical precedence and focusing on impactful health outcomes. We hope as a healthcare startup that AMA will continue to hone in on the impacts of racism and its part in medicine, and we plan on continuing that fight.`,
        ],
      },
      {
        h: "Stay Tuned",
        p: [
          `In the <a href="https://medium.com/vitalflo-health/race-spirometry-part-iv-9ef25233b873" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">next article</a> we'll talk about the impact of these predictive equations.`,
        ],
      },
      {
        h: "References",
        p: [
          "Braun L. Breathing Race into the Machine: The Surprising Career of the Spirometer from Plantation to Genetics. U of Minnesota Press; 2014.",
          "Thomas Jefferson, “Notes on the State of Virginia,” in Race and the Enlightenment: A Reader, ed. Emmanuel Eze (Malden, Mass., and London: Blackwell Publishing, 1997), 98. Enlightenment thinking about race played out differently in India. See Mark Harrison, Climates and Constitutions: Health, Race, Environment and British Imperialism in India, 1600–1850 (Oxford: Oxford University Press, 1999).",
          "Fabian A. The Skull Collectors: Race, Science, and America’s Unburied Dead. University of Chicago Press; 2010.",
          "Gould BA, Elliott EN, Schomburg Center for Research in Black Culture, Adam Matthew Digital. Slavery in the Light of Ethnology. In: Cotton Is King, and pro-Slavery Arguments Comprising the Writings of Hammond, Harper, Christy, Stringfellow, Hodge, Bledsoe, and Cartwright, on This Important Subject / [Edited] by E.N. Elliott ; with an Essay on Slavery in the Light of International Law / by the Editor. Slavery, abolition & social justice. Pritchard, Abbott & Loomis; 1860:701. Accessed November 3, 2020. http://www.slavery.amdigital.co.uk/Contents/DocumentDetails.aspx?documentid=136902",
          "National Academy of Sciences. History: Incorporators of the NAS. National Academy of Sciences. Accessed November 3, 2020. http://www.nasonline.org/about-nas/history/archives/nas-incorporators.html",
          "Gould BA. Investigations in the Military and Anthropological Statistics of American Soldiers. U.S. sanitary commission; 1869.",
          "Jedediah H. Baxter, Statistics, Medical and Anthropological of the Provost-Marshal-General’s Bureau Derived from Records of the Examination for Military Service in the Armies of the United States during the Late War of the Rebellion of over a Million Recruits, Drafted Men, Substitutes, and Enrolled, 2 vols. (Washington, D.C.: U.S. Government Printing Office, 1875).",
          "Frederick L. Hoffman, History of the Prudential Insurance Company of America (Industrial Insurance), 1875–1900 (Newark: Prudential Press, 1900); “The Colored Race in Life Assurance,” Lancet 2 (1898), 902; Haller, “Race, Mortality, and Life Insurance.”",
          "Hoffman FL. Race Traits and Tendencies of the American Negro. American Economic Association; 1896.",
          "J.A. Myers, Vital Capacity of the Lungs: A Handbook for Clinicians and Others Interested in the Examination of the Heart and Lungs Both in Health and Disease (Baltimore: Williams & Wilkins Company, 1925).",
          "J.C. Gilson, H. Stott, B.E.C. Hopwood, S.A. Roach, C. B. McKerrow, and R.S. F. Schilling, “Byssinosis: The Acute Effect of Ventilatory Capacity of Dusts in Cotton Ginneries, Cotton, Sisal, and Jute Mills,” British Journal of Industrial Medicine 18 (1962).",
          "Rossiter CE, Weill H. Ethnic Differences in Lung Function: evidence for proportional differences. Int J Epidemiol. 1974;3(1):55–61. doi:10.1093/ije/3.1.55",
          "Edge JR. The Aging Lung: Normal Function. Ardent Media; 1974.",
          "Knudson RJ, Lebowitz MD, Holberg CJ, Burrows B. Changes in the Normal Maximal Expiratory Flow-Volume Curve with Growth and Aging. Am Rev Respir Dis. 1983;127(6):725–734. doi:10.1164/arrd.1983.127.6.725",
          "Berglund E, Birath G, Bjure J, et al. Spirometric Studies in Normal Subjects I. Acta Medica Scandinavica. 1963;173(2):185–192. doi:10.1111/j.0954–6820.1963.tb16520.x",
          "Gilbert-Kawai, E.T., Milledge, J.S., Grocott, M.P. and Martin, D.S., 2014. King of the mountains: Tibetan and Sherpa physiological adaptations for life at high altitude. Physiology, 29(6), pp.388–402.",
          "Wood, S., Norboo, T., Lilly, M., Yoneda, K. and Eldridge, M., 2003. Cardiopulmonary function in high altitude residents of Ladakh. High altitude medicine & biology, 4(4), pp.445–454.",
          "Roh, H. and Lee, D., 2014. Respiratory function of university students living at high altitude. Journal of physical therapy science, 26(9), pp.1489–1492.",
          "Quanjer, P.H., Stanojevic, S., Cole, T.J., Baur, X., Hall, G.L., Culver, B.H., Enright, P.L., Hankinson, J.L., Ip, M.S., Zheng, J. and Stocks, J., 2012. Multi-ethnic reference values for spirometry for the 3–95-yr age range: the global lung function 2012 equations. doi: 10.1183/09031936.00080312",
          `O'Reily, K. B. (2020, November 16). AMA: Racism is a threat to public health. Retrieved November 18, 2020, from <a href="https://www.ama-assn.org/delivering-care/health-equity/ama-racism-threat-public-health?__cf_chl_tk=hDNCcWzyq7HJXq95nfw3_iWB4DhrxC2wc4HWTM7Hfw0-1792219707-1.0.1.1-ztyEiJt5u_t__2j6jnYK9UeENVen0DQr9J1F1oJBIEs" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.ama-assn.org/delivering-care/health-equity/ama-racism-threat-public-health</a>`,
        ],
      },
    ],
  },

  // ── Race in Spirometry Part II ──
  {
    category: SCIENCE,
    title: "Race in Spirometry (Part II)",
    excerpt: "The Predictive Formulas",
    author: NYX,
    date: "November 9, 2020",
    image: img("race-spirometry"),
    tags: ["Health Equity", "Spirometry"],
    body: [
      {
        p: [
          `A little over a week ago I summarized some of America's history that disadvantaged marginalized racial groups. Today I'll dive into how spirometry equations are created, and next week we'll dive into how history embeds itself into spirometry as well.`,
        ],
      },
      {
        h: "What is Spirometry?",
        p: [
          `Spirometry is a commonly used test for aiding the determination of lung health functioning and various diagnoses related to respiratory health (like asthma).¹ Typically along with spirometry, the patient would fill out a clinical history and may take additional tests depending on their symptoms. It functions by measuring how much air you can blow out of your lungs in a short period of time.`,
          `Why are there predicted values in the first place? Doctors usually compare a person’s spirometry results to these expected values for spirometry to get an idea of how they are doing. That is, they compare someone to results for a similar person. However, there are some issues here, like how do we classify similarity across people? How do we define identity for someone else, and is that a place for a predictive formula?`,
          `Spirometry is affected by a lot of variable factors, coaching for example is one area that may affect the quality of data that our company is beginning to research. The raw values produced by spirometry, are typically compared to predictive values pre-determined by a formula.`,
        ],
      },
      {
        h: "Reference Equations & Predicted Values",
        p: [
          `These formulas are widely used and accepted, endorsed by national organizations including the <a href="https://academic.oup.com/atsjournals?login=false" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">American Thoracic Society</a>,² the <a href="https://wwwn.cdc.gov/nchs/nhanes/nhanes3/default.aspx" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Center for Disease Control and Prevention</a>,³ in addition to major international respiratory organizations.⁴ With ringing endorsements, it can be a big step to think critically about these values.`,
          `However at VitalFlo, we found that many of our own employees were unaware of the history behind how these formulas develop. As a result, we felt it important to make that history better known in our own capacity so that individuals can understand and take charge of their own health and better understand how these formulas may impact them and their diagnoses.`,
        ],
      },
      {
        h: "Unearthing the Formulas",
        p: [
          `Image for post`,
          `I’m going to rewind a bit to how I stumbled upon this story. Part of my job is to better understand how we can look at variables that affect and predict asthma attacks and emergency room visits so that we can better prevent these occurrences for our patients. As part of compliance with federal organizations, our spirometer must offer predicted values by reference equations.`,
          `The most widely used and far-reaching modern reference equation comes from the Global Lung Function Initiative from a 2012 paper,⁵ expanding on previous attempts at references by widening age and ethnic categories.⁶ These formulas are predicated on a few well-established variables as proxies to estimating lung size: age, height, sex, and race or ethnicity. Using statistics, the authors developed weighted formulas based off of the samples used within their papers to understand how these variables relate to one another. The formulas that are more widely used in modern spirometry include:`,
          `<ul>
            <li>NHANES III,⁶ used in multi-level modeling typically</li>
            <li>the more robust Global Lung Function Initiative (GLI) equations,⁵ used with General Additive Modeling for Location Scale and Shape.</li>
          </ul>`,
          `If you don’t know what the statistical models are, that’s okay. The important aspect to understanding these models is that they directly take those four variables I mentioned earlier and use them in a formula for predicting lung health. As a data scientist, it is my responsibility to question and verify the validity of each variable. For the purpose of this story, we’ll focus on the GLI equations.`,
        ],
      },
      {
        image: "glis-formula",
        alt: "GLI Formula",
      },
      {
        h: "The Variables",
        p: [
          `Age is used to the nearest quarter of a year in the GLI equations with height in centimeters.⁵ These two may be a bit less controversial if taken into consideration with past clinical history or other aspects that may directly impact an individuals lung size through physical development. That being said, recent research reveals body mass index (BMI) may be a better predictor of pulmonary health than height alone with additional particularity for obese patients.⁷ ⁸ ⁹`,
          `Sex and race or ethnicity are a little more complicated. Sex in these formulas is only determined as male or female, leaving no option for intersex patients or individuals who undergo sex reassignment surgeries. Race or ethnicity by these formulas is grouped into only four categories and an “other” category:`,
          `<ul>
            <li>Caucasian</li>
            <li>Black</li>
            <li>South-east Asian</li>
            <li>North-East Asian</li>
          </ul>`,
        ],
      },
      {
        image: "glis-categories",
        alt: "GLI Categories",
      },
      {
        p: [
          `This was determined after extensive worldwide spirometry testing. However there are a couple notes, despite individuals from Mexico City and Israel performing better than the “Caucasian” group, they were lumped in to Caucasian as the best performing group and the reference for the equation.⁶ The only ethnicity included in the “Black” group is African Americans. The groups are based on locational nationalities that were available to the researchers. For any individual that does not qualify as Caucasian, Black or originating from east Asia is given an average score across groups without further questions.`,
        ],
      },
      {
        h: "Problems with Qualification in Race or Ethnic Identity",
        p: [
          `While this is the broadest reaching comprehensive study done in regards to ethnicity and the intent of the research is to better encompass racial and ethnic identities beyond the three groups identified by the previous standard in NHANES III (Caucasian, African American, or Mexican American),⁵ the equations do not account for intersectionality in racial or ethnic identity (biracial, multiracial) or varying levels of identity. One study examined how problematic this may be for biracial children by analyzing how that predictive formulas change depending on what race is entered.¹⁰`,
          `Additionally it may be possible that individuals identify their racial identity differently in different spaces, or are technically from a certain region by ancestry, but have a more complicated geographic history.`,
          `Lastly, spirometry exams may use self-reported racial or ethnic identity (most accurate), but they also may assume racial identity by past clinical exams, or by what the parent reports for children or when they first received their diagnoses. Racial or ethnic identity may be observed by staff or physicians and reported. These formulas were even used by Occupational Safety and Health Association (OSHA) for baseline reporting of respiratory health on the job, where previous standards told the official that if a self-reported value was omitted, it could be taken from their personal record or assumed visually.¹¹`,
          `While standards for these processes are better emerging, in terms of more accurate self-report measures and collection,¹² there is also understandable pushback, concern or hesitation from patients (and staff)¹² at times on their use of race in their health decisions.¹³ ¹⁴ ¹⁵ Race and ethnicity may also be more variable than its understood in its use in predictive equations. Given race and racial identity are socially constructed, associating them with genetics and influencing health decisions can be incredibly dangerous, and echo previous efforts to cleave apart individuals into distinct races to justify its use in health (see <a href="https://medium.com/vitalflo-health/race-spirometry-part-1-ec38720c2087" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Part I: History of Race in Medicine</a>).¹⁶ Patients may identify differently depending on the race or ethnic identity of their physician,¹⁴ experiences of bias or racial stereotyping¹⁴ or fear of future discrimination.¹⁷ This is also the case for gender and social class, which melts into the patient-physician communication and impacts other aspects of self-report that are often tied to social determinants of health.¹⁴`,
        ],
      },
      {
        h: "How the Respiratory Community Defines Race is Varied",
        p: [
          `There also may be confusion for patients on how to define race and ethnicity by both patients¹⁸ and the medical community.¹⁹ A comprehensive literature review shows that lung function research does not clearly and consistently define race and ethnicity nor consistently attribute these differences to the same source.¹⁹ The authors examined 226 articles published from 1922 to 2008.They noted that over 90% of articles failed to look at socioeconomic status as an additional proxy, often grouping race into “white” or “other”.¹⁹ While definitions have improved since 2000 (about 70% of articles provided a definition of how they classified race or ethnicity),¹⁹ there is still a lot of room for improvement.`,
        ],
      },
      {
        image: "glis-meta-analysis",
        alt: "Meta-Analysis 2013",
      },
      {
        p: [
          `Up until this past summer when I began at VitalFlo, the American Medical Association had little consistency for reporting race and ethnicity beyond capitalization of sociocultural origin in the 11th edition.²⁰ In July, they cite recent events and discussions leading to the final usage of capitalization for racial and ethnic groups like Black and White ²¹ that align with other journal styles like APA.²² AMA style also now requires reporting of classification (patient self-report, observed, etc.) for sex and gender²³ as well as race/ethnicity.²⁴`,
          `However these strides are recent and do not exactly shape the history that has already passed and led to the reference equations still in use today developed in the 90s and in 2012. So where did these differences come from to begin with? How did medical history start to put weighted numbers to racial groups given our genetic diversity is at times more dissimilar to members of the same race than to members of other racial or ethnic groups?²⁵ The answer, unsurprisingly, follows similar themes to <a href="https://medium.com/vitalflo-health/race-spirometry-part-1-ec38720c2087" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Part I</a>, the history of race in America, and a social fostering of preference towards lighter skin worldwide.²⁶`,
          `In Part I, I mentioned this would be a two-part series but after writing the full length second part I thought I’d break it up into one to two more posts in order to keep them approximately similar in length. Plus, who doesn’t love a good cliffhanger? <a href="https://medium.com/vitalflo-health/race-spirometry-part-iii-fc438a60aabe" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Hope you join me next week as we hone in on the history of race in spirometry.</a>`,
          `P.S. If you’re interested in seeing how some of these formulas play out with your own personal data, you can check out`,
          `<ul>
            <li>the <a href="https://www.merckmanuals.com/iframe/manual/medical-calculators/pulmonarypredictm_a.htm?ruleredirectid=569" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">1993 Quanjer et al., equation</a> ²⁷</li>
            <li>The <a href="https://www.cdc.gov/niosh/topics/spirometry/nhanes.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">NHANES III Lookup Tables</a> ²⁸</li>
            <li>The <a href="http://gligastransfer.org.au/calcs/spiro.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">GLI online calculator</a> ²⁹</li>
          </ul>`,
        ],
      },
      {
        h: "References",
        p: [
          `1. American Lung Association. (2020, February 19). Spirometry. Retrieved November 03, 2020, from <a href="https://www.lung.org/lung-health-diseases/lung-procedures-and-tests/spirometry" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.lung.org/lung-health-diseases/lung-procedures-and-tests/spirometry</a>`,
          `2. Culver BH, Graham BL, Coates AL, et al. Recommendations for a Standardized Pulmonary Function Report. An Official American Thoracic Society Technical Statement. Am J Respir Crit Care Med. 2017;196(11):1463–1472. doi:<a href="https://doi.org/10.1164/rccm.201710-1981ST" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1164/rccm.201710-1981ST</a>`,
          `3. Center for Diseases Control and Prevention. NHANES III (1988–1994). National Center for Health Statistics. Published Aust 2020. Accessed November 3, 2020. <a href="https://wwwn.cdc.gov/nchs/nhanes/nhanes3/default.aspx" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://wwwn.cdc.gov/nchs/nhanes/nhanes3/default.aspx</a>`,
          `4. Cooper BG, Stocks J, Hall GL, et al. The Global Lung Function Initiative (GLI) Network: bringing the world’s respiratory reference values together. Breathe (Sheff). 2017;13(3):e56-e64. doi:<a href="https://doi.org/10.1183/20734735.012717" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1183/20734735.012717</a>`,
          `5. Quanjer, P.H., Stanojevic, S., Cole, T.J., Baur, X., Hall, G.L., Culver, B.H., Enright, P.L., Hankinson, J.L., Ip, M.S., Zheng, J. and Stocks, J., 2012. Multi-ethnic reference values for spirometry for the 3–95-yr age range: the global lung function 2012 equations. doi: <a href="https://doi.org/10.1183/09031936.00080312" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1183/09031936.00080312</a>`,
          `6. Quanjer, P. H., Tammeling, G. J., Cotes, J. E., Pedersen, O. F., Peslin, R., & Yernault, J. C. (1993). Lung volumes and forced ventilatory flows. | PFT Adjusted Predicted Values for Men MultiCalc. Accessed November 3, 2020. <a href="https://www.merckmanuals.com/medical-calculators/PulmonaryPredictM_A.htm" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.merckmanuals.com/medical-calculators/PulmonaryPredictM_A.htm</a>`,
          `7. Bhatti U, Laghari ZA, Syed BM. Effect of Body Mass Index on respiratory parameters: A cross-sectional analytical Study. Pak J Med Sci. 2019;35(6):1724–1729. doi:<a href="https://doi.org/10.12669/pjms.35.6.746" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.12669/pjms.35.6.746</a>`,
          `8. Kamal R, Kesavachandran CN, Bihari V, Sathian B, Srivastava AK. Alterations in Lung Functions Based on BMI and Body Fat % Among Obese Indian Population at National Capital Region. Nepal J Epidemiol. 2015;5(2):470–479. doi:<a href="https://doi.org/10.3126/nje.v5i2.12829" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.3126/nje.v5i2.12829</a>`,
          `9. Peralta GP, Marcon A, Carsin A-E, et al. Body mass index and weight change are associated with adult lung function trajectories: the prospective ECRHS study. Thorax. 2020;75(4):313–320. doi:<a href="https://doi.org/10.1136/thoraxjnl-2019-213880" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1136/thoraxjnl-2019-213880</a>`,
          `10. Pittman JE, Van Rie A, Davis SD. Spirometry in Biracial Children: How Adequate Are Race-Based Reference Equations? Arch Pediatr Adolesc Med. 2011;165(6). doi:<a href="https://doi.org/10.1001/archpediatrics.2011.76" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1001/archpediatrics.2011.76</a>`,
          `11. Occupational Safety and Health Administration. (2013). Spirometry Testing in Occupational Health Programs. Best Practices for Healthcare Professionals. Osha 3637–03 2013. Washington, DC: OSHA.`,
          `12. Baker DW, Cameron KA, Feinglass J, et al. Patients’ attitudes toward health care providers collecting information about their race and ethnicity. J Gen Intern Med. 2005;20(10):895–900. doi:<a href="https://doi.org/10.1111/j.1525-1497.2005.0195.x" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1111/j.1525-1497.2005.0195.x</a>`,
          `13. Institute of Medicine (US) Committee on Understanding and Eliminating Racial and Ethnic Disparities in Health Care; Smedley BD, Stith AY, Nelson AR, editors. Unequal Treatment: Confronting Racial and Ethnic Disparities in Health Care. Washington (DC): National Academies Press (US); 2003. PATIENT-PROVIDER COMMUNICATION: THE EFFECT OF RACE AND ETHNICITY ON PROCESS AND OUTCOMES OF HEALTHCARE. Available from: <a href="https://www.ncbi.nlm.nih.gov/books/NBK220354/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.ncbi.nlm.nih.gov/books/NBK220354/</a>`,
          `14. Petkovic J, Duench SL, Welch V, Rader T, Jennings A, Forster AJ, Tugwell P. Potential harms associated with routine collection of patient sociodemographic information: A rapid review. Health Expect. 2019 Feb;22(1):114–129. doi: <a href="https://doi.org/10.1111/hex.12837" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1111/hex.12837</a>. Epub 2017 Oct 19. PMID: 30341795; PMCID: PMC6351414.`,
          `15. Gannon, M. Race Is a Social Construct, Scientists Argue. Scientific American. Published February 5, 2016. Accessed November 3, 2020. <a href="https://www.scientificamerican.com/article/race-is-a-social-construct-scientists-argue/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.scientificamerican.com/article/race-is-a-social-construct-scientists-argue/</a>`,
          `16. Witzig R. The Medicalization of Race: Scientific Legitimization of a Flawed Social Construct. Ann Intern Med. 1996;125(8):675–679. doi:<a href="https://doi.org/10.7326/0003-4819-125-8-199610150-00008" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.7326/0003-4819-125-8-199610150-00008</a>`,
          `17. Kiran T, Sandhu P, Aratangy T, Devotta K, Lofters A, Pinto AD. Patient perspectives on routinely being asked about their race and ethnicity: Qualitative study in primary care. Can Fam Physician. 2019;65(8):e363-e369.`,
          `18. Baker DW, Hasnain-Wynia R, Kandula NR, Thompson JA, Brown ER. Attitudes toward health care providers, collecting information about patients’ race, ethnicity, and language. Med Care. 2007 Nov;45(11):1034–42. doi: <a href="https://doi.org/10.1097/MLR.0b013e318127148f" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1097/MLR.0b013e318127148f</a>. PMID: 18049343.`,
          `19. Braun L, Wolfgang M, Dickersin K. Defining race/ethnicity and explaining difference in research studies on lung function. Eur Respir J. 2013;41(6):1362–1370. doi:<a href="https://doi.org/10.1183/09031936.00091612" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1183/09031936.00091612</a>`,
          `20. Gregoline B, The JAMA Network Editors. Capitalization: Sociocultural Designations. In: AMA Manual of Style: A Guide for Authors and Editors. 11th ed. AMA Manual of Style. Oxford University Press; 2020:1256. <a href="https://books.google.com/books?id=b-87yAEACAAJ" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://books.google.com/books?id=b-87yAEACAAJ</a>`,
          `21. AMA Manual of Style Committee. Updates to the Manual. AMA Manual of Style 11th Edition: A Guide for Authors and Editors. Published July 3, 2020. Accessed November 3, 2020. <a href="https://www.amamanualofstyle.com/page/951;jsessionid=E9507D8DB95536A954402965CDF4E474" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.amamanualofstyle.com/page/951;jsessionid=E9507D8DB95536A954402965CDF4E474</a>`,
          `22. Racial and Ethnic Identity. https://apastyle.apa.org. Accessed November 3, 2020. <a href="https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/racial-ethnic-minorities" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/racial-ethnic-minorities</a>`,
          `23. Clayton JA, Tannenbaum C. Reporting Sex, Gender, or Both in Clinical Research? JAMA. 2016;316(18):1863. doi:<a href="https://doi.org/10.1001/jama.2016.16405" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1001/jama.2016.16405</a>`,
          `24. Journal of American Medical Association (JAMA). (2020, October 28). Instructions for Authors. Retrieved November 03, 2020, from <a href="https://jamanetwork.com/journals/jama/pages/instructions-for-authors" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://jamanetwork.com/journals/jama/pages/instructions-for-authors</a>`,
          `25. Witherspoon DJ, Wooding S, Rogers AR, et al. Genetic Similarities Within and Between Human Populations. Genetics. 2007;176(1):351–359. doi:<a href="https://doi.org/10.1534/genetics.106.067355" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10.1534/genetics.106.067355</a>`,
          `26. Glenn EN. Shades of Difference: Why Skin Color Matters. Stanford University Press; 2009.`,
          `27. Quanjer, P. H., Tammeling, G. J., Cotes, J. E., Pedersen, O. F., Peslin, R., & Yernault, J. C. (1993). Lung volumes and forced ventilatory flows. | PFT Adjusted Predicted Values for Men MultiCalc. Accessed November 3, 2020. <a href="https://www.merckmanuals.com/medical-calculators/PulmonaryPredictM_A.htm" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.merckmanuals.com/medical-calculators/PulmonaryPredictM_A.htm</a>`,
          `28. National Institute for Occupational Safety and Health. CDC — Spirometry — Spirometry Training Program: NHANES III Reference Values — NIOSH Workplace Safety and Health Topic. Center for Disease Control and Prevention. Published December 22, 2011. Accessed November 6, 2020. <a href="https://www.cdc.gov/niosh/topics/spirometry/nhanes.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.cdc.gov/niosh/topics/spirometry/nhanes.html</a>`,
          `29. European Respiratory Society. ERS — Online Calculator. ERS. Accessed November 6, 2020. <a href="https://www.ers-education.org/guidelines/global-lung-function-initiative/spirometry-tools/online-calculator/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.ers-education.org/guidelines/global-lung-function-initiative/spirometry-tools/online-calculator/</a>`,
        ],
      },
    ],
  },

  // ── Race & Spirometry Part I ──
  {
    category: SCIENCE,
    title: "Race & Spirometry (Part I)",
    excerpt: "Race & Medicine",
    author: NYX,
    date: "October 28, 2020",
    image: img("race-spirometry"),
    tags: ["Health Equity", "Spirometry"],
    body: [
      {
        p: [
          "When I started working at VitalFlo, I noticed in the universally used algorithms developed from clinical research that exist for predicting lung health, race or ethnicity is a necessary factor for the equation. As a healthcare company, we have an ethical responsibility for understanding the nuance of how our product is used, its effects on the health of our patients, and the implications of the readings of our product puts forth.",
          "Race/ethnicity is a common and well-founded predictor in lung health, with a long history in the field for its practicality. Given the history of race in medicine, this is something worth questioning and investigating further. In this two-part series, we dive into those findings, and how the historical context of race in medicine rears its ugly head in spirometry as well. I wanted to begin with a broader introduction into the role of race in the field of medicine.",
        ],
      },
      {
        h: "A Sordid History",
        p: [
          `The U.S. has a storied past when it comes to identity and medicine, which has rightfully led to mistrust of the medical community particularly amongst marginalized racial groups.<a href="https://doi.org/10.1111/j.1525-1497.2006.00485.x" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">1</a> <a href="https://doi.org/10.2105/AJPH.2005.080762" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">2</a> This is particularly true for the Black and African American community, whose abuse in medicine has persisted throughout American history. <a href="https://www.google.com/search?q=Medical+apartheid+%3A+the+dark+history+of+medical+experimentation+on+Black+Americans" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">3</a> While certainly not an exhaustive list, more famous examples include:`,
          `• The case of Henrietta Lacks, whose cells during a cancer examination were taken without permission and continue to benefit the world without compensation to her family. <a href="https://www.npr.org/2010/02/02/123232331/henrietta-lacks-a-donors-immortal-legacy" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">4</a> <a href="https://doi.org/10.1172/JCI43410" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">5</a> <a href="https://www.google.com/search?q=The+Immortal+Life+Of+Henrietta+Lacks+by+Rebecca+Skloot" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">6</a>`,
          `• The Tuskegee Syphilis Experiment, a study ultimately abusing Black and African American participants without their permission, consent, or knowledge in a clinical study on a treatment for syphilis. The participants were deceived into participating, left untreated, and ultimately killed or left with the effects of late stage syphilis. <a href="https://www.history.com/news/the-infamous-40-year-tuskegee-study" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">7</a> <a href="https://www.cdc.gov/tuskegee/timeline.htm" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">8</a> <a href="https://doi.org/10.2307/3561468" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">9</a> <a href="https://doi.org/10.1016/S0002-9629(15)40464-1" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10</a> <a href="https://www.nytimes.com/1972/07/26/archives/syphilis-victims-in-us-study-went-untreated-for-40-years-syphilis.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">11</a>`,
          `• According to the CDC,<a href="https://www.cdc.gov/media/releases/2019/p0905-racial-ethnic-disparities-pregnancy-deaths.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">12</a> Black and African American mothers are 3–4 times more likely to die in childbirth than other racial groups, and American Indian/Alaska Native.`,
        ],
      },
      {
        image: "population-crisis",
        alt: "Population Crisis Hearing Document",
      },
      {
        p: [
          `• Scientists and private organizations in the U.S. began the clinical trials of birth control contraceptive pills in Puerto Rico on the basis of low-income status,<a href="https://www.google.com/search?q=Beebe+GW%2C+Belaval+JS.+Fertility+and+contraception+in+Puerto+Rico" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">13</a> <a href="https://www.google.com/search?q=Mass+B.+Puerto+Rico%3A+A+case+study+of+population+control" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">14</a> <a href="https://www.washingtonpost.com/news/retropolis/wp/2017/05/09/guinea-pigs-or-pioneers-how-puerto-rican-women-were-used-to-test-the-birth-control-pill/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">15</a> aligned with birth population control campaigns throughout the Caribbean.<a href="https://books.google.com/books?id=gqM3AAAAIAAJ" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">16</a> These campaigns reached a Senate hearing in which it was stated that efforts to reduce unemployment were in contrast to a growing population.<a href="https://books.google.com/books?id=gqM3AAAAIAAJ" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">16</a> This same Senate hearing addressed an urgent need for birth control for the low-income Black population as a way to reduce its size.<a href="https://books.google.com/books?id=gqM3AAAAIAAJ" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">17</a>`,
          `• Coerced sterilizations of women in ICE detention centers at the border, brought to the attention by immigration detention center nurse and whistleblower.<a href="https://www.aclu.org/news/immigrants-rights/immigration-detention-and-coerced-sterilization-history-tragically-repeats-itself" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">18</a> <a href="https://www.npr.org/2020/09/18/914465793/ice-a-whistleblower-and-forced-sterilization" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">19</a>`,
        ],
      },
      {
        h: "Public Response",
        p: [
          `When concerns about the Tuskegee Experiment finally made front-page news, the study ended 40 years into its diabolical makings.<a href="https://www.nytimes.com/1972/07/26/archives/syphilis-victims-in-us-study-went-untreated-for-40-years-syphilis.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">11</a> This led to Congress passing the National Research Act of 1974 that informs ethics for human research participants in studies, and the subsequent commission publishing the Belmont Report in 1979. <a href="https://www.cdc.gov/tuskegee/after.htm" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">20</a> <a href="https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/index.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">21</a> It wasn’t until the 1990s when the government officially apologized for its wrongdoing in this study. <a href="https://www.al.com/news/2017/05/twenty_years_ago_today_america.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">22</a> <a href="https://apnews.com/article/c10fe858b3384708aef94ad759c924f0" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">23</a>`,
        ],
      },
      {
        image: "nyt-tuskegee",
        alt: "New York Times Tuskegee Article",
      },
      {
        p: [
          `As for maternal death racial disparities, citizens are actively petitioning congress with often personal, tragic stories.<a href="https://www.washingtonpost.com/sports/2019/05/16/olympian-allyson-felix-tells-congress-racial-disparities-maternal-mortality/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">24</a> <a href="https://www.aha.org/news/headline/2019-05-16-hearing-impact-racial-disparities-social-determinants-maternal-mortality" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">25</a> Congress representatives launched the Black Maternal Caucus in April 2019 to investigate legislative solutions.<a href="https://www.congress.gov/congressional-record/2019/5/9/house-section/article/h3668-1" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">26</a> <a href="https://thehill.com/homenews/house/438004-dem-reps-form-black-maternal-health-caucus" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">27</a>`,
        ],
      },
      {
        image: "momnibus",
        alt: "Black Maternal Health Momnibus",
      },
      {
        h: "Isolated Events?",
        p: [
          `Medicine has often been used to justify racial differences. <a href="https://www.google.com/search?q=Medical+apartheid+%3A+the+dark+history+of+medical+experimentation+on+Black+Americans" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">3</a> <a href="https://doi.org/10.2307/3561468" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">9</a> <a href="https://doi.org/10.1016/S0002-9629(15)40464-1" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">10</a> <a href="https://www.google.com/search?q=Beebe+GW%2C+Belaval+JS.+Fertility+and+contraception+in+Puerto+Rico" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">13</a> Eugenics in the United States gained its popular and ignoble foothold in the late 1800s and in the early to mid-1900s, propagating the maintenance and advancement of power in classism, racism, and homophobia <a href="https://www.google.com/search?q=Ordover+N.+American+Eugenics" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">29</a> and going as far as involuntary sterilization. <a href="https://doi.org/10.1086/415404" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">29</a> These efforts were popular and widely accepted.<a href="https://doi.org/10.1089/zeb.2008.0576" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">30</a>`,
          `While we often attribute eugenics to this isolated time period, its history stretches as far back as the ancient Greek philosopher <a href="https://doi.org/10.1558/hrge.v14i2.20" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">31</a> and as far forward as our current U.S. President when Trump appeared to endorse the Race Horse Theory first documented in a 2017 FRONTLINE documentary <a href="https://www.latimes.com/opinion/story/2020-10-14/trump-eugenics-politics-history" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">32</a> and again on the campaign trail in September of 2020. <a href="https://www.latimes.com/opinion/story/2020-10-14/trump-eugenics-politics-history" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">33</a> <a href="https://www.independent.co.uk/news/world/americas/us-politics/trump-genes-racehorse-theory-nazi-eugenics-holocaust-twitter-b511858.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">34</a> <a href="https://www.cnn.com/2020/09/22/politics/donald-trump-genes-historical-context-eugenics/index.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">35</a> White supremacy has gained more public strength in the last four years. The FBI warned about the threat of White supremacy nearly 15 years ago and coming to the public forefront in recent years with the rise in documented and violent hate crimes. <a href="https://oversight.house.gov/sites/democrats.oversight.house.gov/files/White_Supremacist_Infiltration_of_Law_Enforcement.pdf" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">36</a> <a href="https://www.fbi.gov/news/testimony/confronting-white-supremacy" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">37</a>`,
          `The events of racism that exist in history, do not exist in a vacuum, and continue to repeat themselves until they become solidified as a foundational and accepted practice. The chants of “I can’t breathe” have become well-known and echoed in protest of police brutality and White supremacy, stemming from the murder of George Floyd who repeated this phrase 30 times during his fatal asphyxiation. <a href="https://www.usatoday.com/story/news/nation/2020/07/09/george-floyd-body-cam-cant-breathe-30-times-transcript/5404026002/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">38</a> <a href="http://www.theguardian.com/us-news/2020/jul/08/george-floyd-police-killing-transcript-i-cant-breathe" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">39</a>`,
        ],
      },
      {
        h: "Our Responsibility",
        p: [
          "As a lung health company, these words hit home pretty hard. We strive to ensure everyone can breathe well, and this means tackling social determinants of health including racism and classism that present specific obstacles to healthcare and create barriers to everyday living for marginalized groups. We must keep our eyes open, and our ears to the ground in paving the way for accessibility for individuals to determine their own health.",
          "We began investigating as a company, and in part with our clinical partners on why this might be, and we dove into a literature review as part of the data science practice. When we began digging into the research that justifies its use, we found a long history stemming from slavery on race and ethnicity in spirometry to the intricacy of software in spirometers used today.",
          `I’ll elaborate on this in <a href="https://medium.com/vitalflo-health/race-in-spirometry-part-ii-cbe930fe325e" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Part 2: Predictive Equations</a>.`,
        ],
      },
      {
        h: "References",
        p: [
          `1. Jacobs, Elizabeth A et al. “Understanding African Americans’ views of the trustworthiness of physicians.” Journal of general internal medicinevol. 21,6 (2006): 642–7. doi:10.1111/j.1525–1497.2006.00485.x`,
          `2. Armstrong K, Ravenell KL, McMurphy S, Putt M. Racial/ethnic differences in physician distrust in the United States. Am J Public Health. 2007;97(7):1283–1289. doi:10.2105/AJPH.2005.080762`,
          `3. Washington, H.A., 2006. Medical apartheid: The dark history of medical experimentation on Black Americans from colonial times to the present. Doubleday Books.`,
          `4. NPR.org. “‘Henrietta Lacks’: A Donor’s Immortal Legacy.” Accessed October 19, 2020. <a href="https://www.npr.org/2010/02/02/123232331/henrietta-lacks-a-donors-immortal-legacy" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.npr.org/2010/02/02/123232331/henrietta-lacks-a-donors-immortal-legacy</a>.`,
          `5. Bloom, Stacie. “The Immortal Life of Henrietta Lacks.” The Journal of Clinical Investigation 120, no. 7 (July 1, 2010): 2252. <a href="https://doi.org/10.1172/JCI43410" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://doi.org/10.1172/JCI43410</a>.`,
          `6. Skloot, Rebecca. The Immortal Life Of Henrietta Lacks. New York : Crown Publishers, 2010. Print.`,
          `7. Tuskegee Experiment: The Infamous Syphilis Study — HISTORY. Accessed October 19, 2020. <a href="https://www.history.com/news/the-infamous-40-year-tuskegee-study" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.history.com/news/the-infamous-40-year-tuskegee-study</a>`,
          `8. Tuskegee Study — Timeline — CDC — NCHHSTP. Published July 16, 2020. Accessed October 19, 2020. <a href="https://www.cdc.gov/tuskegee/timeline.htm" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.cdc.gov/tuskegee/timeline.htm</a>`,
          `9. Brandt AM. Racism and Research: The Case of the Tuskegee Syphilis Study. The Hastings Center Report. 1978;8(6):21–29. doi:10.2307/3561468`,
          `10. Corbie-Smith G. The Continuing Legacy of the Tuskegee Syphilis Study: Considerations for Clinical Investigation. The American Journal of the Medical Sciences. 1999;317(1):5–8. doi:10.1016/S0002–9629(15)40464–1`,
          `11. Heller J. Syphilis Victims in U.S. Study Went Untreated for 40 Years — The New York Times. NYT. Published online July 26, 1972. Accessed October 19, 2020. <a href="https://www.nytimes.com/1972/07/26/archives/syphilis-victims-in-us-study-went-untreated-for-40-years-syphilis.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.nytimes.com/1972/07/26/archives/syphilis-victims-in-us-study-went-untreated-for-40-years-syphilis.html</a>`,
          `12. Racial and Ethnic Disparities Continue in Pregnancy-Related Deaths | CDC Online Newsroom | CDC. Published September 6, 2019. Accessed October 19, 2020. <a href="https://www.cdc.gov/media/releases/2019/p0905-racial-ethnic-disparities-pregnancy-deaths.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.cdc.gov/media/releases/2019/p0905-racial-ethnic-disparities-pregnancy-deaths.html</a>`,
          `13. Beebe GW, Belaval JS. Fertility and contraception in Puerto Rico. PR J Public Health Trop Med. 1942;18(1):3–52.`,
          `14. Mass B. “Puerto Rico: A case study of population control.” Latin American Perspectives 4.4 (1977): 66–82.`,
          `15. Vargas T. Guinea pigs or pioneers? How Puerto Rican women were used to test the birth control pill. Washington Post. Published May 09, 2020. <a href="https://www.washingtonpost.com/news/retropolis/wp/2017/05/09/guinea-pigs-or-pioneers-how-puerto-rican-women-were-used-to-test-the-birth-control-pill/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.washingtonpost.com/news/retropolis/wp/2017/05/09/guinea-pigs-or-pioneers-how-puerto-rican-women-were-used-to-test-the-birth-control-pill/</a>. Accessed October 20, 2020.`,
          `16. Operations USCSC on G. Hearings, Reports and Prints of the Senate Committee on Government Operations. U.S. Government Printing Office; 1966. pp. 208-225, 1395, 1577. <a href="https://books.google.com/books?id=gqM3AAAAIAAJ" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://books.google.com/books?id=gqM3AAAAIAAJ</a>`,
          `17. Operations USCSC on G. Hearings, Reports and Prints of the Senate Committee on Government Operations. U.S. Government Printing Office; 1966. Exhibit 216. pp. 1549–1551. <a href="https://books.google.com/books?id=gqM3AAAAIAAJ" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://books.google.com/books?id=gqM3AAAAIAAJ</a>`,
          `18. Manian M. ACLU News & Commentary. <a href="https://www.aclu.org/news/immigrants-rights/immigration-detention-and-coerced-sterilization-history-tragically-repeats-itself" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.aclu.org/news/immigrants-rights/immigration-detention-and-coerced-sterilization-history-tragically-repeats-itself</a>. Published September 29, 2020. Accessed October 27, 2020.`,
          `19. ICE, A Whistleblower And Forced Sterilization. [Radio series episode]. (2020, September 22). In 1A|WAMU. Washington D.C.: National Public Radio. Retrieved October 27, 2020, from <a href="https://www.npr.org/2020/09/18/914465793/ice-a-whistleblower-and-forced-sterilization" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.npr.org/2020/09/18/914465793/ice-a-whistleblower-and-forced-sterilization</a>`,
          `20. Tuskegee Study — Research Implications — CDC — NCHHSTP. Published March 2, 2020. Accessed October 19, 2020. <a href="https://www.cdc.gov/tuskegee/after.htm" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.cdc.gov/tuskegee/after.htm</a>`,
          `21. The Belmont Report. HHS.gov. Published January 28, 2010. Accessed October 19, 2020. <a href="https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/index.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/index.html</a>`,
          `22. Post TW. 20 years ago, US apologized for Tuskegee syphilis experiments. al. Published May 16, 2017. Accessed October 19, 2020. <a href="https://www.al.com/news/2017/05/twenty_years_ago_today_america.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.al.com/news/2017/05/twenty_years_ago_today_america.html</a>`,
          `23. AP WAS THERE, Tuskegee Syphilis Study: Clinton apologized. AP NEWS. Published May 10, 2017. Accessed October 19, 2020. <a href="https://apnews.com/article/c10fe858b3384708aef94ad759c924f0" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://apnews.com/article/c10fe858b3384708aef94ad759c924f0</a>`,
          `24. Maese R. Olympian Allyson Felix tells Congress of racial disparities in maternal mortality. Washington Post. Published May 15, 2019. Accessed October 20, 2020. <a href="https://www.washingtonpost.com/sports/2019/05/16/olympian-allyson-felix-tells-congress-racial-disparities-maternal-mortality/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.washingtonpost.com/sports/2019/05/16/olympian-allyson-felix-tells-congress-racial-disparities-maternal-mortality/</a>.`,
          `25. American Hospital Association. Hearing on impact of racial disparities, social determinants on maternal mortality | AHA News. House Hearing. Published May 16, 2019. Accessed October 20, 2020. <a href="https://www.aha.org/news/headline/2019-05-16-hearing-impact-racial-disparities-social-determinants-maternal-mortality" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.aha.org/news/headline/2019-05-16-hearing-impact-racial-disparities-social-determinants-maternal-mortality</a>`,
          `26. House of Congress. Congressional Record House Articles. Accessed October 20, 2020. <a href="https://www.congress.gov/congressional-record/2019/5/9/house-section/article/h3668-1" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.congress.gov/congressional-record/2019/5/9/house-section/article/h3668-1</a>`,
          `27. Frazin R. Dem lawmakers form Black Maternal Health Caucus. TheHill. Published April 9, 2019. Accessed October 20, 2020. <a href="https://thehill.com/homenews/house/438004-dem-reps-form-black-maternal-health-caucus" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://thehill.com/homenews/house/438004-dem-reps-form-black-maternal-health-caucus</a>`,
          `28. File: Alma Adams speaking about the Black Maternal Health Momnibus.jpg. Wikimedia Commons, the free media repository. Published October 10, 2020. Accessed October 20, 2020. <a href="https://commons.wikimedia.org/w/index.php?title=File:Alma_Adams_speaking_about_the_Black_Maternal_Health_Momnibus.jpg&oldid=485995359" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://commons.wikimedia.org/w/index.php?title=File:Alma_Adams_speaking_about_the_Black_Maternal_Health_Momnibus.jpg&oldid=485995359</a>`,
          `29. Ordover N. American Eugenics: Race, Queer Anatomy, and the Science of Nationalism. U of Minnesota Press; 2003. p. xii`,
          `30. Farber SA. U.S. scientists’ role in the eugenics movement (1907–1939): a contemporary biologist’s perspective. Zebrafish. 2008;5(4):243–245. doi:10.1089/zeb.2008.0576`,
          `31. Güvercin CH, Arda B. Eugenics concept: from Plato to present. Hum Reprod Genet Ethics. 2008;14(2):20–26. doi:10.1558/hrge.v14i2.20`,
          `32. Reilly PR. Involuntary sterilization in the United States: a surgical solution. Q Rev Biol. 1987;62(2):153–170. doi:10.1086/415404`,
          `33. Holtzman D, Dawkins R, Pohlad, D. Op-Ed: Eugenics is making a comeback. Resist, before history repeats itself. Los Angeles Times. Published October 14, 2020. Accessed October 20, 2020. <a href="https://www.latimes.com/opinion/story/2020-10-14/trump-eugenics-politics-history" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.latimes.com/opinion/story/2020-10-14/trump-eugenics-politics-history</a>`,
          `34. Embury-Dennis T. Trump genes comments ‘indistinguishable from Nazi rhetoric’, expert on Holocaust says. The Independent. Published September 21, 2020. Accessed October 20, 2020. <a href="https://www.independent.co.uk/news/world/americas/us-politics/trump-genes-racehorse-theory-nazi-eugenics-holocaust-twitter-b511858.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.independent.co.uk/news/world/americas/us-politics/trump-genes-racehorse-theory-nazi-eugenics-holocaust-twitter-b511858.html</a>`,
          `35. Tensley B. The dark subtext of Trump’s “good genes” compliment — CNNPolitics. CNN. Published September 22, 2020. Accessed October 20, 2020. <a href="https://www.cnn.com/2020/09/22/politics/donald-trump-genes-historical-context-eugenics/index.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.cnn.com/2020/09/22/politics/donald-trump-genes-historical-context-eugenics/index.html</a>`,
          `36. Federal Bureau of Investigation (FBI). (U) White Supremacist Infiltration of Law Enforcement. Intelligence Assessment. Published online October 17, 2006:10. <a href="https://oversight.house.gov/sites/democrats.oversight.house.gov/files/White_Supremacist_Infiltration_of_Law_Enforcement.pdf" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://oversight.house.gov/sites/democrats.oversight.house.gov/files/White_Supremacist_Infiltration_of_Law_Enforcement.pdf</a>`,
          `37. McGarrity MC, Shivers CA. Confronting White Supremacy — FBI. Federal Burea of Investigation (FBI). Published June 4, 2019. Accessed October 20, 2020. <a href="https://www.fbi.gov/news/testimony/confronting-white-supremacy" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.fbi.gov/news/testimony/confronting-white-supremacy</a>`,
          `38. Bote J. George Floyd, body cam: He said “can’t breathe” 30 times in transcript. USA Today. Published July 9, 2020. Accessed October 20, 2020. <a href="https://www.usatoday.com/story/news/nation/2020/07/09/george-floyd-body-cam-cant-breathe-30-times-transcript/5404026002/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">https://www.usatoday.com/story/news/nation/2020/07/09/george-floyd-body-cam-cant-breathe-30-times-transcript/5404026002/</a>`,
          `39. George Floyd told officers “I can’t breathe” more than 20 times, transcripts show. the Guardian. Published July 9, 2020. Accessed October 20, 2020. <a href="http://www.theguardian.com/us-news/2020/jul/08/george-floyd-police-killing-transcript-i-cant-breathe" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">http://www.theguardian.com/us-news/2020/jul/08/george-floyd-police-killing-transcript-i-cant-breathe</a>`,
        ],
      },
    ],
  },

  // ── Clinical Research ──
  {
    category: LEARNING,
    title: "Remotely Conducting Respiratory Clinical Research",
    excerpt:
      "Conducting research in the respiratory space has always been intricate.",
    author: "Ryan Kelley",
    date: "June 1, 2020",
    image: img("clinical-research"),
    tags: ["Remote Monitoring", "Spirometry", "Clinical Research"],
    body: [
      {
        p: [
          "Conducting research in the respiratory space has always been intricate. Lungs vary across demographics, baseline standards are fractured and often incomplete, and spirometry is a difficult procedure to get subjects to perform correctly.",
          "This has resulted in many trials and studies being limited by the geography of the research center and bandwidth of the clinical team. Most studies require a patient to visit the clinic multiple times over the length of the study to perform spirometry under the coaching of a respiratory therapist.",
          `This system, while inefficient, has basically worked well from 1960 <a href="https://www.jonesmedical.com/brief-history-spirometer/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">[1]</a> until March of 2020. When faced with the outbreak of COVID-19 many respiratory clinics shut their doors for all nonessential visits.`,
        ],
      },
      {
        h: "In-Clinic Spirometry is Now Risky",
        p: [
          "Even now as restrictions are loosening in some areas, in-clinic spirometry is still considered a high-risk procedure by the American Thoracic Society. This is because the forced exhale procedure can cause a large volume of aerosolized particles from the respiratory system to evacuate the body. This process puts everyone in the immediate vicinity at a much higher risk of contracting the disease from an infected patient.",
          "This embargo on spirometry and in-clinic visits resulted in an “on pause until further notice” for most respiratory trials around the world.",
          "The likelihood of COVID-19 being a short-term problem is very slim. It makes sense to develop a longterm strategy for coping with the new guidelines.",
        ],
      },
      {
        h: "Remote Spirometry Provides a Way Forward",
        p: [
          "At VitalFlo, we have built our platform for researchers and clinicians to remotely monitor their patients’ respiratory condition. To do this we use spirometry and symptom surveys collected through a smartphone app; and air quality measurements from the EPA as well as an indoor air quality monitoring device.",
          "I wish I could say our product offering was a brilliant strategic maneuver to capture the market as soon as the need arose, but the truth is far less interesting: the idea that would become VitalFlo was first posed by Dr. David Peden, the now-former president of the AAAAI, back in 2013. His initial concept was to prevent emergency room visits by collecting hard and soft endpoints from patients daily as opposed to the current quarterly visits.",
          "So, a team of dedicated University of North Carolina at Chapel Hill and North Carolina State University researchers set to work.",
          "From the outset, VitalFlo has had one guiding principle: clinical validation.",
          "After three years of rigorous incubation at the UNC/NCSU joint department of biomedical engineering in partnership with the UNC School of Medicine, VitalFlo launched as a company in 2017. We have continued to focus first on clinical validation; however, now as a digital health company we had additional directives:",
          "• Clinical Validation",
          "• Accuracy of Data",
          "• Patient Privacy",
          "• Return on Investment for Customers",
        ],
      },
      {
        h: "Clinical Validation",
        p: [
          "At VitalFlo we have completed two clinical studies. We are in the process of wrapping up our third. Our first funding was from the National Science Foundation (NSF) from whom we now received an SBIR Phase I and II.",
          "Our home base is the clinical research lab of Dr. Michelle Hernandez at UNC School of Medicine, where we will continue to develop and conduct respiratory research. Since launching as a company, we have gone on to partner with many of the academic research centers across the country.",
          "Clinical validation is not a checkbox for us. Through our existing and future partnerships, we are continually working to iterate and improve the capabilities of our platform within the proper scientific framework",
        ],
      },
      {
        h: "Accuracy of Data",
        p: [
          "We spend the majority of our time in the VitalFlo product team focused on how we consistently collect accurate data from patients at a high adherence rate. The bottom line is that if we do not collect accurate data, none of the data we collect matters.",
          "Furthermore, we have a difficult physiological measurement to capture. Spirometry is traditionally a coached procedure that requires multiple attempts. We approached this problem with our mental model validation. Our first two clinical studies at the UNC school of medicine were studying the ability to capture accurate spirometry with a handheld spirometer.",
          "We have spent more time and money on this problem than any other. The solution we have come to is video coaching of the correct technique, interactive user experience which the patient ‘drives’ to ensure proper completion of the procedure, and rigorous data validation on our backend.",
          "The result is a smartphone app with a simple and efficient interface and a daily adherence rate of 60% as of May 2020.",
        ],
      },
      {
        h: "Patient Privacy",
        p: [
          "At VitalFlo patient privacy is at the forefront of our minds. Digital health products can only consciously collect patient data if they can protect and be good stewards of that data.",
          "An in-depth look at our security policies and standards is available upon request, but to answer the initial questions, we are HIPAA compliant, and we have been approved by three IRBs and their security reviews (and counting).",
        ],
      },
      {
        h: "Return on Investment",
        p: [
          "At VitalFlo we are only as successful as our partners. There will always be humans to answer your questions. We will always begin an engagement by determining first what you need to achieve and if there is alignment.",
          "And I myself will always be available for product feedback and feature suggestions. In every case I have seen so far an improvement for one customer makes the lives of all customers better.",
          `If you are interested in learning more about our platform or what we can do to help your study or clinical practice reach out at any time: <a href="mailto:ryan@vitalflohealth.com" class="text-blue-600 underline font-medium">ryan@vitalflohealth.com</a>`,
          "All materials on Clinical validation, Data Accuracy, and Patient privacy are available upon request.",
        ],
      },
    ],
  },

  // ── RxVIP ──
  {
    category: NEWS,
    title:
      "RxVIP Concierge partners with VitalFlo to provide COPD, Asthma and CHF Remote Patient Monitoring",
    excerpt:
      "Westbury, NY—RxVIP Concierge today announced that it has teamed up with VitalFlo Inc.",
    author: LUKE,
    date: "May 26, 2020",
    image: img("rxvip"),
    tags: ["Partnerships", "Remote Monitoring", "COPD", "Asthma"],
    body: [
      {
        p: [
          "Westbury, NY — RxVIP Concierge today announced that it has teamed up with VitalFlo Inc. to license VitalFlo’s proprietary Remote Patient Monitoring software platform for Chronic Obstructive Pulmonary Disease (COPD), Asthma and Congestive Heart Failure (CHF) patients. RxVIP Concierge said it plans to use the VitalFlo platform to enhance what it does with its novel “PharmD Concierge” program in which it assigns licensed pharmacists to assist physicians with assessments, screenings, remote patient monitoring, chronic care management and direct observed therapy",
        ],
      },
      {
        image: "rxvip-dashboard",
        alt: "VitalFlo Dashboard on Tablet",
      },
      {
        p: [
          "“VitalFlo provides ‘best of class’ respiratory monitoring support for our clients’ patients” said Ken Sternfeld, RPh, founder and CPO of RxVIP Concierge. “Their powerful dashboard system allows our Pharmacists to monitor respiratory flows timed against pollen counts and overlay that data across the medications on file for the patient.” Sternfeld also said that the VitalFlo system would allow Pharmacists to make rapid corrections in medications for respiratory distressed patients rather than time-consuming titration and experimental changes, thus proving superior outcomes to the disease management of COPD, Asthma and CHF.",
        ],
      },
      {
        p: [
          "RxVIP Concierge is launching VitalFlo in over 40 provider offices in the next few months as it rolls out its program nationwide.",
        ],
      },
      {
        p: [
          "“We are excited to be working with RxVIP Concierge’s program, which places qualified pharmacists into medical practices to assist patients with chronic disease management such as COPD and Asthma” said Luke Marshall, CEO of VitalFlo. “We will be working closely with RxVIP to equip pharmacists with modern approaches like VitalFlo’s remote monitoring platform. Together, VitalFlo and RxVIP will make a difference for thousands of patients, improving outcomes amid rapid policy and reimbursement changes in virtual patient care.”",
        ],
      },
      { h: "About RxVIP Concierge" },
      {
        p: [
          `RxVIP Concierge helps providers and provider networks provide excellent patient care and restore their diminished revenues by deploying innovative solutions that involve a simple Telehealth product for patients but also incorporate licensed Pharmacists to assist providers in capturing critical patient data, providing assessments, screenings and clinical management. Contact: Bill Archer, RxVIP National Sales Manager, <a href="mailto:barcher@welltrackone.com" class="text-blue-600 underline font-medium">barcher@welltrackone.com</a>`,
        ],
      },
      { h: "About VitalFlo" },
      {
        p: [
          `VitalFlo is a digital health company that helps clinical teams remotely monitor their chronic respiratory patients. With patient devices for remotely monitoring lung function and local air quality, VitalFlo delivers patient status and potential exacerbation trigger data back to clinical teams to make rapid corrections to care plans and improve outcomes. Our remote physiologic monitoring platform is also available to academic researchers to help them conduct virtual clinical trials. Contact: Ryan Kelley, Head of Product, <a href="mailto:ryan@vitalflohealth.com" class="text-blue-600 underline font-medium">ryan@vitalflohealth.com</a>`,
        ],
      },
    ],
  },

  // ── Allergy & Asthma Network ──
  {
    category: NEWS,
    title: "VitalFlo Launches Partnership with Allergy & Asthma Network",
    excerpt:
      "VitalFlo Supports New Telehealth Coaching Program with Remote Monitoring Solutions",
    author: LUKE,
    date: "May 7, 2020",
    image: img("allergy-asthma-network"),
    tags: ["Partnerships", "Remote Monitoring", "Asthma"],
    body: [
      {
        p: [
          "Raleigh, NC: VitalFlo, a digital health company focused on remote monitoring for patients with chronic respiratory disease, announced a partnership with Allergy & Asthma Network. VitalFlo will be providing remote physiological monitoring tools and technology to enhance the Network’s new Telehealth Coach Program.",
          "This new service, with over 25 certified asthma educators at program start, will be made available to Allergy & Asthma Network’s over 2 million members.",
        ],
      },
      {
        image: "rxvip-dashboard", // Make sure you have an image named this, or change it to your preferred image name
        alt: "VitalFlo platform on tablet and phone",
      },
      {
        p: [
          "Through the partnership, VitalFlo is helping the Network’s asthma coaches deliver better care and education with technology solutions for remote monitoring of client lung function, symptoms and air quality. VitalFlo’s technology will be deployed to support the Telehealth Coach Program in the following ways:",
          "• **Clinical decision support:** data visualization tools for the asthma educators",
          "• **Provider-Patient communication:** end-to-end encrypted messaging to facilitate coaching and feedback",
          "• **Remote spirometry:** Clinical-quality pulmonary function testing from home",
          "• **Indoor air quality monitoring:** Small indoor units to help assess indoor environment and quantify remediation progress",
        ],
      },
      {
        p: [
          `The Telehealth Coach Program was launched May 5, 2020 in celebration of World Asthma Day. For more information, please <a href="https://allergyasthmanetwork.org/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">visit the Allergy & Asthma Network website</a>.`,
        ],
      },
      {
        p: [
          `**About VitalFlo:** <a href="https://www.vitalflohealth.com/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">VitalFlo</a> is a digital health company based in Raleigh, NC. Founded in 2017, VitalFlo has grown quickly by partnering with the nation’s leading respiratory research institutions and primary care providers. VitalFlo is the recipient of a National Science Foundation Phase I & II SBIR, the NC IDEA Seed Grant, and a participant in Techstars Impact 2019.`,
        ],
      },
      {
        p: [
          `**About Allergy & Asthma Network:** Founded in 1985, <a href="https://allergyasthmanetwork.org/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Allergy & Asthma Network</a> is the leading nonprofit organization whose mission is to end the needless death and suffering due to asthma, allergies and related conditions through outreach, education, advocacy and research. The Network has more than 2 million members, including patients, families and healthcare providers.`,
        ],
      },
    ],
  },

  // ── Together ──
  {
    category: NEWS,
    title: "We Are in This Together: Protecting Those Who are Protecting Us",
    excerpt:
      "Never bet against American heroes in a crisis... but they need our help",
    author: LUKE,
    date: "March 25, 2020",
    image: img("together"),
    tags: ["Company News", "COVID-19", "Public Health"],
    body: [
      {
        p: [
          `We are now all familiar with versions of the now infamous #FlattenTheCurve graph, showing the intended impact of social distancing on the spread of Coronavirus (COVID-19):`,
        ],
      },
      {
        image: "flatten-the-curve",
        alt: "Flatten the curve graph",
      },
      {
        p: [
          "A major reason flattening the curve is so important is to protect our clinical teams — our American heroes — who are at the frontlines of this epidemic.",
          `<a href="https://drive.google.com/file/u/0/d/14tGJF9tdv4osPhY1-fswLcSlWZJ9zx45/view?pli=1" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Early evidence</a> suggests that healthcare workers have a 3–5X higher infection rate than the general public.`,
          "They keep showing up and sacrificing for us. Will we keep showing up for them?",
          "To do our part, *VitalFlo is waiving all subscription fees for primary care providers.* More details below.",
        ],
      },
      {
        h: "Structure and Summary of this Post:",
        p: [
          "• Primary care providers are overwhelmed",
          "• Telehealth and remote physiologic monitoring can help",
          "• There are already leaders we should be emulating",
          "• To help providers, VitalFlo is making its platform freely available",
          "• We can, and must, all step up and do our part",
        ],
      },
      {
        h: "Our Primary Care Providers are Struggling to Keep Up",
        p: [
          `Dr. Farzad Mostashari, CEO of Aledade, <a href="https://x.com/Farzad_MD/status/1239369834128957442" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">outlined the major issues</a> that independent practices are having with keeping up with the epidemic:`,
        ],
      },
      {
        h: "Lack of Personal Protective Equipment (PPE)",
        p: [
          "The supply chain for PPE has broken down. As a result of shortages some hospitals are issuing guidelines that are putting providers at risk:",
          `We have seen some response to the dire need for PPE in recent days: companies are <a href="https://www.nytimes.com/2020/03/19/business/companies-retooling-manufacturing-ppe.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">responding</a> by <a href="https://www.usatoday.com/story/money/2020/03/20/coronavirus-manufacturers-produce-face-masks-ventilators/2881687001/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">retooling</a> and <a href="https://www.cnbc.com/2020/03/20/coronavirus-companies-retool-factories-to-make-medical-supplies.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">reorienting</a> their manufacturing lines.`,
        ],
      },
      {
        h: "Healthcare Staffing Shortages",
        p: [
          "In the meantime, if healthcare providers get sick (remember from above, they have a 3–5X higher infection rate), there is a risk that practices will not have enough staff to continue to manage the crisis.",
          "This concern is particularly impactful for small independent primary care providers: after the first staff member gets sick, can the practice stay open? That employee was in close contact with everyone else in the office. That means, remaining employees are not only at risk of becoming infected themselves — but also at risk of infecting their patients (see next).",
        ],
      },
      {
        h: "High-Risk and Chronic Disease Patients are Vulnerable",
        p: [
          `From what we know so far, <a href="https://www.cdc.gov/coronavirus/2019-ncov/specific-groups/people-at-higher-risk.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">older adults and people of any age who have serious underlying medical conditions</a> have higher morbidity and mortality due to COVID-19:`,
        ],
      },
      {
        image: "covid-fatality",
        alt: "Coronavirus early-stage case fatality rates",
      },
      {
        p: [
          "This is complicated by the fact that these patients need higher levels of care in general. If coming into the clinic is a high-risk activity, how will patients who need continued medical supervision get the treatment they need?",
        ],
      },
      {
        h: "Finances for Independent Practices is Being Devastated",
        p: [
          "The financial health of our primary care practices has not been making the headlines, but it is of critical importance:",
          "It is a good thing that non-essential medical procedures are being canceled: it keeps clinical providers and at-risk patients safer, and reserves resources for COVID-19 response (see above). However, normal care visits are also being canceled (anecdotally, the cancellation rate is north of 50%).",
          "However, because of how the current economics of practices are structured, this is crucial revenue for keeping the lights on!",
          "Like any other small business, independent practices typically do not have deep pockets or substantial cash reserves.",
        ],
      },
      {
        h: "Telehealth and Remote Physiologic Monitoring Can Help",
        p: [
          "There is no panacea and no silver bullet for these problems: we need to tackle all of them with every tool we have in the tool kit.",
          "One very useful tool for these specific problems is the implementation of telehealth and remote physiologic monitoring (basically: the collection of health vitals from a distance). That’s because implementing these solutions can helps address each of these problems:",
          "1. **Lack of PPE:** providers don’t need PPE when they are treating a patient on the other side of a screen. Increasing the ratio of telehealth to in-person visits will reduce PPE requirements.",
          `2. **Staffing Shortages:** staff are protected from infection when the interaction with infectious patients is held over a screen. The temporary <a href="https://www.hhs.gov/hipaa/for-professionals/special-topics/emergency-preparedness/notification-enforcement-discretion-telehealth/index.html" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">relaxation of telehealth</a> and data regulations makes it possible to use commercial products for this (like Skype and Zoom).`,
          "3. **Monitoring High Risk Patients:** by using remote physiologic monitoring in combination with telehealth, it is possible to keep tracking patient outcomes and delivering care to the at-risk patients who need it most.",
          `4. **Practice Finances:** Centers for Medicare and Medicaid Services (CMS) has <a href="https://www.healthcareitnews.com/news/trump-administration-expands-medicare-telehealth-benefits-covid-19-fight" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">expanded telehealth reimbursement</a> in response to COVID-19. While it is a start, it may not be enough to keep practices afloat — <a href="https://www.sba.gov/disaster-assistance/coronavirus-covid-19" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">the SBA is also stepping in</a> to make low interest loans available. This still may not be enough. Deploying tools that make practices eligible for the Remote Physiologic Monitoring reimbursement codes may also help.`,
          `None of these improvements are perfect and we need to see much more support from policy makers, especially to support the smaller practices that do not have a voice in Washington. Support for small practices should be part of any COVID-19 stimulus package (sign the <a href="https://www.change.org/p/congress-petition-to-congress-to-support-independent-physicians-and-practices-during-covid-19?utm_content=cl_sharecopy_21055095_en-US%3Av4&recruiter=1062298459&recruited_by_id=48d2bad0-6df0-11ea-9ebb-d521d917dadd&utm_source=share_petition&utm_medium=copylink&utm_campaign=psf_combo_share_message&utm_term=share_petition&share_bandit_exp=message-21055095-en-US&share_bandit_var=v0&redirect_reason=deprecated-url" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Petition to Congress to Support Independent Physicians and Practices During COVID-19</a>)`,
        ],
      },
      {
        h: "The Leaders: Who to Emulate",
        p: [
          "There are several people and groups that have led the charge in response to the outbreak. Here are a few that should be applauded:",
          `**Dr. Farzad Mostashari, Founder & CEO of Aledade** (<a href="https://x.com/Farzad_MD" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Twitter</a>, <a href="https://www.linkedin.com/in/farzad-mostashari-933210/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Linkedin</a>)`,
          `A powerful voice on in #medtwitter, Dr. Mostashari and Aledade have led by example. They have been excellent communicators, and have provided <a href="https://aledade.com/what-primary-care-practices-should-know-about-covid-19" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">useful guidance to all primary care providers</a> throughout the epidemic.`,
          `Most impressively: <a href="https://www.aledade.com/aledade-empowers-primary-care-acos-updoxs-telehealth-virtual-office-visits" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">In only three days, Aledade stood up Telemedicine for 150 independent providers</a> in their network. Do not say it can’t be done, they have already shone it can be.`,
          `**Dr. Rahul Rajkumar, Chief Medical Officer of Blue Cross NC** (<a href="https://x.com/RahulRajkumar11" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Twitter</a>, <a href="https://www.linkedin.com/in/rahul-rajkumar-94156013/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Linkedin</a>)`,
          `Under Dr. Rajkumar’s leadership, Blue Cross North Carolina was one of the first insurance companies to expand its telehealth reimbursements in response to COVID-19. (In fact, they have moved so fast, that <a href="https://www.bluecrossnc.com/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">the original link I posted</a> over two weeks ago complementing their leadership has broken and been replaced with a rich amount of content).`,
          `They have continued to roll out <a href="https://www.bluecrossnc.com/coronavirus" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">helpful and useful information</a> for their members and their network providers. They have expanded access to care through telehealth, allowed for early medication refills to promote sheltering in place, and continue to do everything in their power to make testing and care more available:`,
        ],
      },
      {
        image: "bluecrossnc",
        alt: "Blue Cross NC COVID-19 Measures",
      },
      {
        p: [
          `**Dr. Jordan Shlain, Founder of The Private Medical** (<a href="https://x.com/drjordanshlain" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Twitter</a>, <a href="https://www.linkedin.com/in/drjordanshlain/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Linkedin</a>)`,
          `With his “Dispatches from the Frontlines” series on <a href="https://tincture.io/" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">Tincture</a>, Dr. Shlain has been one of the most active voices providing up-to-date (but vetted) information regarding COVID-19.`,
          "The founder of a direct primary care practice with offices in the San Francisco Bay, Los Angeles and New York, he and The Private Medical team are certainly at the front lines during this epidemic in the US.",
        ],
      },
      {
        h: "VitalFlo’s Response: Doing Our Part",
      },
      {
        h: "What We Do (Normally)",
        p: [
          "VitalFlo helps doctors keep their asthma patients out of the ER. We help clinical teams remotely collect data related to patient care including symptoms, lung function as well as potential asthma attack triggers in the home and local environment.",
        ],
      },
      {
        image: "vitalflo-flow",
        alt: "VitalFlo Platform Flow",
      },
      {
        p: [
          "To help providers respond to COVID-19, VitalFlo’s platform can help keep at-risk chronic respiratory patients monitored from a distance. As discussed at length above, it is in everyone’s interest to keep these patients monitored without an in-person visit.",
        ],
      },
      {
        h: "Our Patients are At High Risk of Severe COVID-19 Symptoms",
        p: [
          "Because COVID-19 is a respiratory disease, early evidence is revealing that asthma and other chronic respiratory patients are at a higher risk of getting very sick if they contract the coronavirus.",
          "It is also very challenging for respiratory patients to differentiate between the symptoms of COVID-19, asthma, and seasonal allergies. Due to the current uncertainty caused by the outbreak, this can lead an asthma patient to visit their healthcare provider in person for something that could have been monitored remotely, increasing their risk of exposure to the virus.",
        ],
      },
      {
        h: "In Response to COVID-19, We Are Waiving Our Platform Fees",
        p: [
          "This is a critical time and it is important for us all to do what we can to help.",
          "Effective immediately, we are waiving all subscription fees for the most quickly scalable parts of our platform — our patient-facing automated daily symptom surveys and provider-facing clinical decision support dashboard, for the duration of this national emergency.",
        ],
      },
      {
        image: "vitalflo-dashboard",
        alt: "VitalFlo Dashboard",
      },
      {
        p: [
          "Additionally, providers will have the option to purchase home spirometry equipment to allow for more detailed vitals monitoring, which may qualify them for Remote Physiologic Monitoring insurance reimbursements. On behalf of interested providers, VitalFlo has secured preferred pricing through our device partners.",
        ],
      },
      {
        h: "We Are Expanding the Vitals We Can Monitor",
        p: [
          "Our platform is very flexibly designed to best help collect patients vitals and symptoms. Following our automated symptom survey, patients who have spirometers or other respiratory devices export those measurements back to their doctor as simply and easily as texting a photo to a friend.",
          "Because of this simple and intuitive interface, we are moving to rapidly add more vitals to the platform that will be useful for helping clinical teams monitor potential COVID-19 or flu infection (such as body temperature, blood pressure, and peripheral capillary oxygen saturation).",
        ],
      },
      {
        h: "Providers Can Onboard Immediately, Individuals Can Soon",
        p: [
          `If you are a primary care provider, we can onboard you right now at no cost: <a href="#" target="_blank" rel="noreferrer" class="text-blue-600 underline font-medium">sign up here</a> for a 10–15 minute onboarding session.`,
          "VitalFlo has an automated process to notify your patients that they have the opportunity to enroll, to educate them about our data privacy provisions, and to onboard them into the remote monitoring system.",
          "For patients interested in participating, please share this post with your provider and we will get them set up! VitalFlo is also working with our partners as rapidly as possible to launch a tool specifically for asthma patients. Stay tuned for more announcements (or sign up for announcements here).",
        ],
      },
      {
        h: "You Can Help, Here is How:",
        p: [
          "**Donate any Personal Protective Equipment You Have**",
          "N95 masks are especially in high need. If you have any N95 or surgical masks, please consider donating them to your primary care practice and help keep your care providers safe!",
          "**Stay at home as much as you can**",
          "You can help #FlattenTheCurve by breaking the chain of infection:",
        ],
      },

      {
        p: [
          "**Pressure Lawmakers to Support Independent Practices:**",
          "Sign the petition:",
        ],
      },
      {
        image: "healthcare-workers",
        alt: "Healthcare workers holding signs",
      },
      {
        p: [
          "**Thank the people protecting you:**",
          "Now, more than ever, it is a time to come together.",
          "Let’s celebrate our American heroes and do everything we can to protect and support them while they are standing in harm’s way to protect us.",
          "Luke Marshall is Founder and CEO of VitalFlo, a digital health company that helps doctors keep their asthma patients out of the ER. We help clinical teams remotely collect data related to patient care including symptoms, lung function as well as potential asthma attack triggers in the home and local environment.",
        ],
      },
    ],
  },
]);

// ─────────────────────────────────────────────────────────────
// DERIVED EXPORTS
// ─────────────────────────────────────────────────────────────
const LATEST = [BLOG_FEATURED, ...BLOG_ARTICLES];

export const BLOG_POSTS = LATEST.slice(0, 6).map(({ slug, title, image }) => ({
  slug,
  title,
  image,
}));

export const BLOG_HERO_LIST = BLOG_ARTICLES.slice(0, 4).map(
  ({ slug, category, title }) => ({
    slug,
    category,
    title,
  }),
);

export const BLOG_TAGS = [
  "Spirometry",
  "COPD",
  "Asthma",
  "Remote Monitoring",
  "Value-Based Care",
  "Primary Care",
  "Partnerships",
  "Company News",
  "Health Equity",
  "Company Culture",
];

const pick = (title) => LATEST.find((p) => p.slug === slugify(title));

export const BLOG_POPULAR = [
  pick("Why Spirometry?"),
  pick("The Benefits of Early Identification of COPD"),
  pick("VitalFlo Raises $2.14M Seed Round Led by Geekdom Fund"),
];

const DEFAULTS = { author: TEAM };

export const getPost = (slug) => {
  const post = LATEST.find((p) => p.slug === slug);
  return post ? { ...DEFAULTS, ...post } : null;
};

export const getRelated = (slug, count = 3) =>
  LATEST.filter((p) => p.slug !== slug).slice(0, count);
