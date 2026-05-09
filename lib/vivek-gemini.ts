import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

// Uses NEXT_PUBLIC_ prefix so the key is available client-side in Next.js
export const aiInstance = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string,
});

export const bookDemoClassDeclaration: FunctionDeclaration = {
  name: 'book_demo_class',
  description: 'Book a demo class for the student.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Student name' },
      phone: { type: Type.STRING, description: 'Student phone number' },
      city: { type: Type.STRING, description: 'Student city' },
      target_exam: { type: Type.STRING, description: 'Target exam (e.g. IPMAT Indore, Rohtak, JIPMAT)' },
      preferred_time: { type: Type.STRING, description: 'Preferred time for the demo class' },
    },
    required: ['name', 'phone'],
  },
};

export const logLeadToCrmDeclaration: FunctionDeclaration = {
  name: 'log_lead_to_crm',
  description: 'Log the lead details to the CRM at the end of the session or when sufficient info is gathered.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      phone: { type: Type.STRING },
      student_class: { type: Type.STRING, description: 'Class 11, 12, dropper, etc.' },
      city: { type: Type.STRING },
      target_exam: { type: Type.STRING },
      lead_score: { type: Type.NUMBER, description: 'Hot (80-100), Warm (50-79), Cold (20-49), Dead (0-19)' },
      conversation_summary: { type: Type.STRING, description: 'Summary of what was discussed' },
    },
    required: ['lead_score', 'conversation_summary'],
  },
};

export const findNearestBranchDeclaration: FunctionDeclaration = {
  name: 'find_nearest_branch',
  description: 'Find the nearest IPM Careers branch based on the city.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: { type: Type.STRING, description: 'The city to search for a branch in' },
    },
    required: ['city'],
  },
};

export const getBatchDetailsDeclaration: FunctionDeclaration = {
  name: 'get_batch_details',
  description: 'Get details about upcoming batches for a specific branch or online mode.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      branch: { type: Type.STRING, description: 'The specific branch name or city' },
      mode: { type: Type.STRING, description: 'online vs offline' },
    },
    required: ['mode'],
  },
};

export const escalateHumanCounsellorDeclaration: FunctionDeclaration = {
  name: 'escalate_human_counsellor',
  description: 'Escalate to a human counsellor when needed (e.g. stress, complex query, closing).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: { type: Type.STRING, description: 'Why you are escalating' },
      urgency: { type: Type.STRING, description: 'high, medium, or low' },
    },
    required: ['reason', 'urgency'],
  },
};

export const sendWhatsappFollowupDeclaration: FunctionDeclaration = {
  name: 'send_whatsapp_followup',
  description: 'Send a follow-up via WhatsApp (brochures, study plans, etc.)',
  parameters: {
    type: Type.OBJECT,
    properties: {
      phone: { type: Type.STRING, description: 'The user phone number' },
      content_type: { type: Type.STRING, description: 'What to send (brochure, study_plan, fee_structure)' },
    },
    required: ['phone', 'content_type'],
  },
};

export const tools = [
  {
    functionDeclarations: [
      bookDemoClassDeclaration,
      logLeadToCrmDeclaration,
      findNearestBranchDeclaration,
      getBatchDetailsDeclaration,
      escalateHumanCounsellorDeclaration,
      sendWhatsappFollowupDeclaration,
    ],
  },
];

export const handleToolCall = async (item: any): Promise<any> => {
  const { name, args } = item;
  console.log(`Vivek AI tool called: ${name}`, args);
  switch (name) {
    case 'book_demo_class':
      return { success: true, message: `Demo class booked for ${args.name || 'student'}. Counsellor will contact shortly.` };
    case 'log_lead_to_crm':
      return { success: true, message: `Lead logged with score ${args.lead_score}` };
    case 'find_nearest_branch':
      return { success: true, message: `Nearest branch in ${args.city} — call 8299470392 for details.` };
    case 'get_batch_details':
      return { success: true, batch_start_date: 'Next batch starts soon', batches_available: true, fees_info: 'Call 8299470392 for exact fees' };
    case 'escalate_human_counsellor':
      return { success: true, message: `Human counsellor notified with urgency: ${args.urgency}` };
    case 'send_whatsapp_followup':
      return { success: true, message: `WhatsApp follow-up scheduled for ${args.content_type}` };
    default:
      return { error: 'Unknown function' };
  }
};
