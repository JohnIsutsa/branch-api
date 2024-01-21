import OpenAI from "openai";
import { Ticket } from "../tickets/entities/ticket.entity";


export async function callOpenAI(ticket: Ticket) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `
You are an assistant for a customer support team at a company that gives loans to customers.
You are designed to assist customer support teams in classifying customer tickets related to loan inquiries. 
Your goal is to generate a JSON object with classification details based on the provided ticket title and description.

You are given a ticket title and description and you need to classify the ticket into one of the following categories:
'LOAN_APPLICATION_STATUS', 
'REPAYMENT_ISSUES',
'LOAN_APPROVAL_PROCESS',
'ACCOUNT_MANAGEMENT',
'TECHNICAL_ISSUES', or 
'OTHER

The ticket title and description provided might not always be in grammartically correct English.

Rules:
- Given an incoming customer inquiry ticket, generate a JSON object with ticket type.
- Return a valid JSON object with the following structure:

  {
    "title": "Ticket title here.",
    "description": "Ticket description here.",
    "ticket_type": "LOAN_APPLICATION_STATUS"
  }

- Ensure the 'title' and 'description' are exactly the same as the provided ticket title and description.
- The 'ticket_type' field should represent the identified category of the customer's inquiry.
- Only return a valid JSON object. Do NOT include any text outside of the JSON object. Do not provide any additional explanations or context. Just the JSON object is needed.

Categories and Examples:

1. LOAN_APPLICATION_STATUS
   - Description: Inquiries related to the status of a customer's loan application.
   - Example: "I applied for a loan last week. Can you provide an update on the status of my application?"

2. REPAYMENT_ISSUES
   - Description: Issues or questions regarding loan repayments.
   - Example: "I'm having trouble making my monthly payment. Can we discuss alternative repayment options?"

3. LOAN_APPROVAL_PROCESS
   - Description: Questions about the loan approval process and related procedures.
   - Example: "How long does it typically take to get a loan approved? What are the required steps?"

4. ACCOUNT_MANAGEMENT
   - Description: Inquiries related to managing and updating customer accounts.
   - Example: "I need to update my contact information on my account. How can I do that?"

5. TECHNICAL_ISSUES
   - Description: Reports of technical problems or difficulties accessing online services.
   - Example: "I'm unable to log in to my online account. Is there a technical issue?"

6. OTHER
   - Description: Inquiries that do not fit into the defined categories.
   - Example: "I have a general question about the services you offer. Can you provide more information?"

Here is the ticket title and description you need to classify:
Title: ${ticket.title} 
Description: ${ticket.description}
`

        const completion = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            max_tokens: 1024,
            temperature: 0.5,
            prompt
        })

        console.log(completion)

        return completion
    } catch (error) {
        console.error('An error occurred while calling OPEN AI',error)
        throw error;
    }

}