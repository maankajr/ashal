import mongoose from "mongoose";
import { Contact } from "../models/Contact.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

export const CONTACT_STATUSES = ["new", "read", "resolved"];

export async function listContacts(query = {}) {
  const { page, limit, skip } = getPagination({ ...query, limit: query.limit || 20 });
  const filter = {};

  if (CONTACT_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  const search = String(query.search || "").trim();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Contact.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

export async function getContact(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Contact message not found", { status: 404, code: "NOT_FOUND" });
  }

  const contact = await Contact.findById(id).lean();
  if (!contact) {
    throw new AppError("Contact message not found", { status: 404, code: "NOT_FOUND" });
  }

  return contact;
}

export async function updateContactStatus(id, status) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Contact message not found", { status: 404, code: "NOT_FOUND" });
  }

  if (!CONTACT_STATUSES.includes(status)) {
    throw new AppError("Invalid status", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [
        {
          field: "status",
          message: `Status must be one of: ${CONTACT_STATUSES.join(", ")}`,
        },
      ],
    });
  }

  const contact = await Contact.findById(id);
  if (!contact) {
    throw new AppError("Contact message not found", { status: 404, code: "NOT_FOUND" });
  }

  contact.status = status;
  await contact.save();
  return contact.toObject();
}
