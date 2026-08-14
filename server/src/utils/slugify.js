export function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function uniqueSlug(Model, base, field = "slug", excludeId = null) {
  let slug = slugify(base) || "item";
  let candidate = slug;
  let counter = 1;

  while (
    await Model.exists({
      [field]: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    candidate = `${slug}-${counter}`;
    counter += 1;
  }

  return candidate;
}
