// Help Center content. Answers are based on VitalFlo's Privacy Policy and
// Terms of Service (last modified May 3rd, 2021). If those documents change,
// update the answers below too.
export const HELP_EMAILS = {
  support: "support@vitalflohealth.com",
  privacy: "privacy@vitalflohealth.com",
};

export const HELP_TOPICS = [
  {
    question: "How do I delete my account?",
    answer:
      "You can delete your VitalFlo account at any time using the account options in the app and by removing the app from your device. If you would rather have us do it, or you want your personal information removed as well, submit a request on the Account Deletion page.",
  },
  {
    question: "What happens to my data when I request deletion?",
    answer:
      "Once we have verified your request, we take reasonable steps to remove your personal information from the active part of our services. We may keep information that the law requires us to retain, and copies may remain with your healthcare providers or other third parties if the information was shared with them.",
  },
  {
    question: "Does deleting my account remove data my provider already has?",
    answer:
      "No. Information that was already shared with your healthcare provider is held by them under their own policies, and VitalFlo cannot remove it from their records. Please contact your provider directly about that data.",
  },
  {
    question: "How do I update or correct my information?",
    answer: `You can update, change or correct your personal information in the app, or by emailing ${HELP_EMAILS.support}.`,
  },
  {
    question: "How do I ask for a copy of my data?",
    answer: `Email ${HELP_EMAILS.privacy} and tell us what you would like to receive. We will email you to verify your identity first, to keep your information safe.`,
  },
  {
    question: "Is my health information protected?",
    answer:
      "We take reasonable security measures to protect your information against unauthorized access, alteration, disclosure or destruction. In some situations VitalFlo acts as a Business Associate under HIPAA for healthcare providers, and we handle protected health information as the law and our agreements require. The full details are in our Privacy Policy.",
  },
  {
    question: "I live in California. What are my rights?",
    answer: `California residents can ask to access their personal information, learn more about our practices, receive a copy of their data and request deletion, subject to legal exceptions. We verify your identity before acting on a request, and we will not discriminate against you for using these rights. Email ${HELP_EMAILS.privacy} or use the Account Deletion form.`,
  },
  {
    question: "Who do I contact for help?",
    answer: `For account or app questions, email ${HELP_EMAILS.support}. For privacy requests, email ${HELP_EMAILS.privacy}. You can also use the form on our Contact page.`,
  },
];
