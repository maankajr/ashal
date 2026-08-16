import { Contact } from "../models/Contact.js";
import { AppError } from "../utils/AppError.js";
import { sendContactAcknowledgmentEmail } from "../utils/email.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;
const MAX_SUBJECT = 120;
const MAX_NAME = 80;

export function validateContactPayload(payload = {}) {
  const errors = [];
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const subject = String(payload.subject ?? "").trim();
  const message = String(payload.message ?? "").trim();

  // Honeypot — bots often fill hidden fields
  if (payload.website || payload.companyUrl) {
    throw new AppError("Unable to submit form", {
      status: 400,
      code: "SPAM_REJECTED",
    });
  }

  if (!name || name.length < 2) {
    errors.push({ field: "name", message: "Name is required (min 2 characters)" });
  } else if (name.length > MAX_NAME) {
    errors.push({ field: "name", message: `Name must be at most ${MAX_NAME} characters` });
  }

  if (!email || !emailPattern.test(email)) {
    errors.push({ field: "email", message: "A valid email is required" });
  }

  if (!subject || subject.length < 3) {
    errors.push({ field: "subject", message: "Subject is required (min 3 characters)" });
  } else if (subject.length > MAX_SUBJECT) {
    errors.push({
      field: "subject",
      message: `Subject must be at most ${MAX_SUBJECT} characters`,
    });
  }

  if (!message || message.length < MIN_MESSAGE) {
    errors.push({
      field: "message",
      message: `Message must be at least ${MIN_MESSAGE} characters`,
    });
  } else if (message.length > MAX_MESSAGE) {
    errors.push({
      field: "message",
      message: `Message must be at most ${MAX_MESSAGE} characters`,
    });
  }

  if (errors.length) {
    throw new AppError("Validation failed", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: errors,
    });
  }

  return { name, email, subject, message };
}

export async function createContactSubmission(payload) {
  const data = validateContactPayload(payload);

  const contact = await Contact.create({
    ...data,
    status: "new",
  });

  // Asynchronously send confirmation email without blocking or failing the HTTP response
  sendContactAcknowledgmentEmail({
    name: contact.name,
    email: contact.email,
    subject: contact.subject,
    message: contact.message,
  }).catch((err) => {
    console.error("[Email] Contact acknowledgment email error:", err.message);
  });

  return {
    _id: contact._id,
    name: contact.name,
    email: contact.email,
    subject: contact.subject,
    status: contact.status,
    createdAt: contact.createdAt,
  };
}
