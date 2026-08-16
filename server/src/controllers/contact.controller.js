import * as contactService from "../services/contact.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const create = asyncHandler(async (req, res) => {
  const contact = await contactService.createContactSubmission(req.body);
  return success(
    res,
    {
      ...contact,
      message: "Thanks — your message was sent successfully.",
    },
    undefined,
    201
  );
});
