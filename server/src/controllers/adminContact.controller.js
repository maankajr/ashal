import * as adminContactService from "../services/adminContact.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listContacts = asyncHandler(async (req, res) => {
  const result = await adminContactService.listContacts(req.query);
  return success(res, result.items, result.meta);
});

export const getContact = asyncHandler(async (req, res) => {
  const contact = await adminContactService.getContact(req.params.id);
  return success(res, contact);
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const contact = await adminContactService.updateContactStatus(
    req.params.id,
    req.body.status
  );
  return success(res, contact);
});
