## **Introduction & Scope**

 This document defines the test cases related to the Zeus.AI Subscription Workflow and other core features developed during Sprint 2. The primary objective of this testing effort is to ensure the accuracy, stability, and usability of each system process through a structured testing approach.

 The testing scope covers all functionalities involved in the Zeus.AI subscription and configuration process — including submitting business information, uploading the knowledge base, customizing the AI model to align with the organization’s needs, and confirming and processing payments. Additionally, it encompasses validation of the chatbot conversation interface after the system has been successfully activated.

 This testing process aims to confirm that Zeus.AI operates reliably and delivers a seamless user experience. It also serves as a guideline for both manual and automated testing, enhancing overall testing efficiency and minimizing potential defects.

## **Project: Zeus.AI Author(s):**

| Aphichai Nasongkhram  | 6531503128 |
| --------------------- | ---------- |
| Poonyawat Khomlek     | 6531503055 |
| Korawich Thisarg      | 6531503002 |
| Pongsatron Phooduong  | 6531503114 |
| Tirapat Saetiao       | 6531503109 |
| Pathomphong Chaichuay | 6531503110 |
| Wasitphon Kuekkong    | 6531503072 |
| Phubet Klubchai       | 6531503063 |
| Sirisak Vongsawat     | 6531503084 |

## Date Created: October 22, 2025


## **1 Zeus.AI Subscription form Workflow**

Zeus.AI Subscription Workflow is the primary process for registering and configuring the Zeus.AI system, starting from entering business information to the final activation of the service.

 The user proceeds through four key steps: filling out the Requirement Form, uploading the Knowledge Base, customizing the AI model to fit the business, and confirming the Payment before proceeding to the payment connection or credit card linking step.

##

## **1.1) Feature: Requirement Submission Form**

### *User Story:*

"As a new user, I want to submit my business information and upload relevant files, so that the AI assistant can be configured correctly for my organization."

| **Test ID** | **Type/ Descrition**                                        | **Preconditions**                                                                                  | **Steps**                                                                                                        | **Expexted Result**                                                                                                               |
| ----------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| RF-001      | User fills in all required fields and proceeds (Happy Path) | The user is logged in and clicks **“Subscribe Package”** to access the Requirement Submission Form | - Open the Requirement Submission Form<br>- Fill in all business information<br>- Click **“Next”**               | The system validates all data successfully, saves the information, and navigates the user to the next form(Knowledge Base Upload) |
| RF-002      | User leaves mandatory fields empty (Sad Path)               | The user is logged in and clicks **“Subscribe Package”** to access the Requirement Submission Form | - Leave a required field blank (e.g., Business Name)<br>- Click **“Next”**                                       | The system displays an error message such as “Please fill all information” and prevents navigation to the next page               |
| RF-003      | User enters invalid data (Validation Error)                 | The user is logged in and clicks **“Subscribe Package”** to access the Requirement Submission Form | - Enter incorrect data format (e.g., email without “@”)<br>- Click **“Next”**                                    | The system displays a message such as “Invalid email format”                                                                      |
| RF-004      | User selects multiple contact channels                      | The user is logged in and clicks **“Subscribe Package”** to access the Requirement Submission Form | - Fill in all required fields<br>- Select multiple contact channels (e.g., Line, Facebook)<br>- Click **“Next”** | The system saves all selected channels correctly and navigates to the next form successfully                                      |

##

## **1.2) Feature: Knowledge Base Upload**

### *User Story:*

 "As a user, I want to upload my documents or FAQ files, so that Zeus.AI can learn and respond to customer questions accurately."

| **Test ID** | **Type/ Descrition**                                     | **Preconditions**                                                       | **Steps**                                                                                    | **Expexted Result**                                                                                                                   |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| UF-001      | User uploads a valid file and proceeds (Happy Path)      | The user is logged in and has completed the Requirement Submission Form | - Click **“Upload File”** and select a supported file (PDF, CSV, DOCX)<br>- Click **“Next”** | The file uploads successfully, a confirmation or file name is displayed, and the system navigates to the next form (AI Customization) |
| UF-002      | User clicks “Next” without uploading a file (Sad Path)   | The user is logged in and has completed the Requirement Submission Form | - Do not upload any file<br>- Click **“Next”**                                               | The system displays a warning message such as “Please upload at least one file” and prevents navigation                               |
| UF-003      | User uploads an unsupported file type (Validation Error) | The user is logged in and has completed the Requirement Submission Form | - Try uploading an unsupported file format (e.g., .ZIP or .PNG)<br>- Click **“Next”**        | The system displays an error message such as “Unsupported file type”                                                                  |
| UF-004      | User uploads a file that exceeds size limit (Edge Case)  | The user is logged in and has completed the Requirement Submission Form | - Try uploading a file larger than 25 MB<br>- Click **“Next”**                               | The system displays an error message “File size exceeds 25 MB limit”                                                                  |
##

### **1.3) Feature: AI Customization Form**

### *User Story:*

"As a user, I want to customize my AI’s name, greeting message, and
tone of voice, so that it fits my business branding."

| **Test ID** | **Type/ Descrition**                                                      | **Preconditions**                                                                                            | **Steps**                                                                                                                                             | **Expexted Result**                                                                                   |
| ----------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| AF-001      | User fills out all AI customization fields and clicks “Next” (Happy Path) | The user is logged in and has completed both the Requirement Submission Form and Knowledge Base Upload steps | - Enter AI Name, Nickname, Welcome Message, Closing Message, and Restricted Topics<br>- Choose preferred language (Thai or English)<br>- Click “Next” | The system successfully saves all data and navigates the user to the next page (Summary/Payment Page) |
| AF-002      | User leaves a required field blank (e.g., “AI Name”) (Sad Path)           | The user is logged in and has completed both the Requirement Submission Form and Knowledge Base Upload steps | - Leave the “AI Name” field blank<br>- Click “Next”                                                                                                   | The system displays a validation message such as “Please enter AI name”                               |
| AF-003      | User enters text exceeding the character limit (Validation Error)         | The user is logged in and has completed both the Requirement Submission Form and Knowledge Base Upload steps | - Input text that exceeds the system limit (e.g., a welcome message longer than 255 characters)<br>- Click “Next”                                     | The system displays an error message such as “Character limit exceeded”                               |
##

### **1.4) Feature: Payment Confirmation**

### *User Story:*

“As a user, I want to review and confirm my subscription details before securely connecting my credit card to make a payment and activate Zeus.AI.”

| **Test ID** | **Type/ Descrition**                                                            | **Preconditions**                                                                                      | **Steps**                    | **Expexted Result**                                                        |
| ----------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------- | -------------------------------------------------------------------------- |
| PF-001      | Clicking “Pay Now” redirects to the Payment Gateway page (Navigation Flow Test) | The user has login completed all previous steps (Requirement, Knowledge Base Upload, AI Customization) | Click the **Pay Now** button | The system redirects to the Payment Gateway or Payment Method page         |
| PF-002      | Step progress indicator displays all 4 steps correctly (UX/UI test)             | The user has login completed all previous steps (Requirement, Knowledge Base Upload, AI Customization) | Refresh the page             | The progress tracker displays steps 1–4, with step 4 marked as “Completed” |

##

## **2) Feature: Payment Page**

### *User Story:*

“As a user, I want to enter my credit card information and confirm the
payment, so that I can subscribe to the Zeus.AI package securely and
accurately.”

| **Test ID** | **Type/ Descrition**                                          | **Preconditions**                                                        | **Steps**                                                                                                                          | **Expexted Result**                                                                               |
| ----------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| PP-001      | Display correct payment package details (ui functonal)        | The user has completed the previous form and is now on the payment page. | 1. Open the payment page after completing previous steps 2. Observe displayed package details                                      | The system shows correct package name, price, and company info                                    |
| PP-002      | Successful payment confirmation (Happy path)                  | The user has completed the previous form and is now on the payment page. | 1. Enter valid payment details (name, card number, expiry, CVC) 2. Tick “Accept Terms and Conditions” 3. Click **Confirm Payment** | Payment is completed successfully and the system redirects to the “Payment Success”               |
| PP-003      | Missing or invalid payment details (Sad Path)                 | The user has completed the previous form and is now on the payment page. | 1. Leave one or more fields empty 2. Click **Confirm Payment**                                                                     | The system shows a warning (e.g., “Please fill out all required fields”) and prevents payment     |
| PP-004      | Unchecked Terms and Conditions box ( Error Handling)          | The user has completed the previous form and is now on the payment page. | 1. Fill in all payment details 2. Leave the Terms checkbox unchecked 3. Click **Confirm Payment**                                  | System does not allow submission until the box is checked                                         |
| PP-005      | Insufficient card balance (Payment declined) (Error Handling) | The user has completed the previous form and is now on the payment page. | 1. Fill in valid card details 2. Click **Confirm Payment** while simulating low balance                                            | The system displays “Payment declined: insufficient balance” and does not process the transaction |

##

## **3.Chatbot Conversation Page**

### *User Story:*

“As a user, I want to chat with a chatbot that displays my business’s
model name, so that I know I am interacting with an AI assistant that
is customized for my business.”

| **Test ID** | **Type/ Descrition**                                              | **Preconditions**                                                | **Steps**                                                                                                                  | **Expexted Result**                                                                                                              |
| ----------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| CP-001      | Display available models correctly (UI Function)                  | User is logged in, on the chatbot page, and has selected a model | 1. Open the chatbot page.<br>2. Check the displayed list of models.                                                        | The system displays all available models correctly (e.g., **Free Trial**, **Custom Business Model**).                            |
| CP-002     | Select customized business model (Custom Model) (Functional Test) | User is logged in, on the chatbot page, and has selected a model | 1. Click to select the customized business model.<br>2. Observe the greeting or description message shown after selection. | The system loads the selected model correctly and displays the welcome or description text configured from the requirement form. |
| CP-003      | Send and receive messages normally (Happy Path)                   | User is logged in, on the chatbot page, and has selected a model | 1. Type a sample message .<br>2. Click **Send**.<br>3. Observe the AI response.                                            | The user can send messages successfully, and the AI responds correctly and promptly.                                             |

##