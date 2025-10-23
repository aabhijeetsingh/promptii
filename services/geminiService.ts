
import { GoogleGenAI, Type } from "@google/genai";
import { AIQuestionsResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const promptStructure = `
Role: Define the persona or expertise you want the AI to adopt.
Task: Clearly state the specific action or goal.
Context: Provide all necessary background information, details, and constraints.
Reasoning: Explain the underlying purpose or 'why'.
Output Format: Specify exactly how you want the answer to be delivered.
Stop Conditions: Define the criteria for a complete and successful response.
`;

const questionGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    field: { type: Type.STRING, description: 'The prompt structure field this question relates to (e.g., "role", "task").' },
                    question: { type: Type.STRING, description: 'The clarifying question to ask the user.' },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'A list of 3-4 multiple-choice options. Include a "Custom..." option.'
                    },
                },
                required: ['field', 'question', 'options'],
            },
        },
    },
    required: ['questions'],
};

export async function generateClarifyingQuestions(initialPrompt: string): Promise<AIQuestionsResponse> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following user prompt and the provided prompt engineering structure, generate a set of clarifying multiple-choice questions to gather the necessary details. Ask one question for each part of the structure that is not clearly defined in the user's prompt. Provide 3-4 concise options for each question, including a "Custom..." option.

            PROMPT ENGINEERING STRUCTURE:
            ${promptStructure}

            USER'S PROMPT: "${initialPrompt}"
            
            Generate the questions in the specified JSON format.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionGenerationSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        // Basic validation
        if (parsedResponse && Array.isArray(parsedResponse.questions)) {
             return parsedResponse as AIQuestionsResponse;
        }
        throw new Error("Invalid JSON structure received from API.");
    } catch (error) {
        console.error("Error generating clarifying questions:", error);
        throw new Error("Failed to get clarifying questions from the AI.");
    }
}

export async function generateProfessionalPrompt(initialPrompt: string, answers: Record<string, string>): Promise<string> {
    const hasAnswers = Object.keys(answers).length > 0;
    
    const collectedInfo = hasAnswers 
        ? Object.entries(answers)
            .map(([field, answer]) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${answer}`)
            .join('\n')
        : "No clarifying answers were provided.";

    const instructions = hasAnswers 
        ? `Based on the user's initial idea and their answers to clarifying questions, generate a highly detailed and professional prompt. Your task is not just to combine the information, but to elaborate and expand upon it to create a comprehensive and effective prompt.`
        : `A user has provided a single, unprofessional prompt. Your task is to analyze this initial idea and transform it into a highly detailed and professional prompt. You must infer the user's intent and fill in the missing details for each section of the prompt structure. Make reasonable, intelligent assumptions to create a complete and effective prompt.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `${instructions}

            **User's Initial Idea:**
            "${initialPrompt}"

            **User's Answers (if any):**
            ${collectedInfo}

            ---

            **Your Task:**
            Generate the final, polished prompt. For each section, expand on the user's input to add detail, clarity, and specificity. Think about what an AI would need to know to perform the task perfectly. If a piece of information wasn't provided, create a plausible and detailed placeholder based on the initial idea.

            Follow this exact structure for your output, using Markdown:

            ### **Prompt Engineering Structure**

            1.  **Role:** [Elaborate on a plausible role to create a detailed persona. For example, if the user's idea is about marketing, you might define the role as "a seasoned digital marketing strategist with expertise in B2B content marketing for SaaS companies."]
            2.  **Task:** [Clearly and unambiguously define the task. Break it down into concrete, actionable steps if the task is complex. Be specific about the action to be performed based on the user's intent.]
            3.  **Context:** [Combine the user's initial idea and any answers to build a rich, detailed context. Fill in plausible details where necessary to make the scenario complete and understandable for the AI.]
            4.  **Reasoning:** [Infer and explain the underlying purpose or "why" behind the task in detail. What is the ultimate goal the user is likely trying to achieve with this prompt? This helps the AI make better-informed decisions.]
            5.  **Output Format:** [Be extremely specific about a suitable output format. Mention structure (e.g., bullet points, numbered list, JSON object), tone (e.g., professional, casual, witty), length (e.g., 500 words, three paragraphs), and any other formatting requirements.]
            6.  **Stop Conditions:** [Define clear, measurable criteria for a complete and successful response. What exact conditions must be met for the AI to know the task is finished?]
            `,
            config: {
                systemInstruction: "You are an expert prompt engineer. Your goal is to transform a user's basic idea—and their specific answers, if available—into a highly detailed, comprehensive, and effective professional prompt. You must elaborate on the user's input, adding plausible details and structure to make the final prompt as clear and powerful as possible, especially when information is missing."
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating professional prompt:", error);
        throw new Error("Failed to generate the final prompt.");
    }
}