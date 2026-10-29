import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fromDateTimeLocal, toDateTimeLocal } from "./format.js";

const timeOpt = z
  .string()
  .refine(
    (v) => v === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
    "Enter a valid time",
  );
const req = (label) => z.string().min(1, `${label} is required`);

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Title must be at least 5 characters")
      .max(150, "Title is too long"),
    category: req("Category"),
    description: z
      .string()
      .trim()
      .min(20, "Describe the event in at least 20 characters")
      .max(5000, "Description is too long"),
    organizationName: z
      .string()
      .trim()
      .min(2, "Enter the organizer or organization name")
      .max(120),
    occasion: z.string().trim().max(120),

    startDate: req("Start date"),
    startTime: req("Start time"),
    endDate: req("End date"),
    endTime: req("End time"),
    recurrenceFrequency: z.enum(["none", "weekly", "monthly", "yearly"]),
    recurrenceInterval: z
      .string()
      .refine(
        (v) => /^\d+$/.test(v) && +v >= 1 && +v <= 12,
        "Enter a number from 1 to 12",
      ),
    recurrenceDays: z.array(z.string()),
    recurrenceUntil: z.string(),

    venueName: z
      .string()
      .trim()
      .min(2, "Enter the venue or temple name")
      .max(150),
    address: z.string().trim().min(5, "Enter the street address").max(300),
    locality: z.string().trim().min(2, "Enter the area or locality").max(100),
    city: z.string().trim().min(2, "Enter the city").max(80),
    state: req("State"),
    pincode: z
      .string()
      .trim()
      .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
    latitude: z.string(),
    longitude: z.string(),

    menuItems: z.array(z.string()).max(40),
    mealTypes: z.array(z.string()),
    foodStart: timeOpt,
    foodEnd: timeOpt,
    dietType: z.enum(["vegetarian", "non-vegetarian", "both", "not-specified"]),
    drinkingWater: z.boolean(),
    seating: z.boolean(),
    isFree: z.boolean(),
    accessibilityInfo: z.string().max(500, "Keep this under 500 characters"),
    parkingInfo: z.string().max(300, "Keep this under 300 characters"),
    transportInfo: z.string().max(300, "Keep this under 300 characters"),
    specialInstructions: z
      .string()
      .max(1000, "Keep this under 1000 characters"),
    expectedAttendees: z
      .string()
      .refine(
        (v) => v === "" || (/^\d+$/.test(v) && +v <= 10000000),
        "Enter a whole number",
      ),

    contactPhone: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || /^\+?[0-9\s-]{7,15}$/.test(v),
        "Enter a valid phone number",
      ),
    contactEmail: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "Enter a valid email",
      ),
    preferredMethod: z.enum(["none", "phone", "whatsapp", "email"]),
    phoneVisibility: z.enum(["public", "loggedIn", "hidden"]),
    emailVisibility: z.enum(["public", "loggedIn", "hidden"]),
    acceptTerms: z.boolean(),
  })
  // .superRefine((d, ctx) => {
  //   const issue = (path, message) =>
  //     ctx.addIssue({ code: "custom", path: [path], message });

  //   if (d.startDate && d.startTime && d.endDate && d.endTime) {
  //     const start = new Date(
  //       `${d.startDate}T${d.startTime}:00+05:30`,
  //     ).getTime();
  //     const end = new Date(`${d.endDate}T${d.endTime}:00+05:30`).getTime();
  //     if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start)
  //       issue("endDate", "The end must be after the start");
  //   }
  //   if (
  //     d.recurrenceFrequency !== "none" &&
  //     d.recurrenceUntil &&
  //     d.startDate &&
  //     d.recurrenceUntil < d.startDate
  //   ) {
  //     issue("recurrenceUntil", "Must be on or after the start date");
  //   }

  //   const hasLat = d.latitude.trim() !== "";
  //   const hasLng = d.longitude.trim() !== "";
  //   if (hasLat !== hasLng)
  //     issue(
  //       hasLat ? "longitude" : "latitude",
  //       "Enter both latitude and longitude, or leave both empty",
  //     );
  //   if (
  //     hasLat &&
  //     (Number.isNaN(+d.latitude) || +d.latitude < -90 || +d.latitude > 90)
  //   )
  //     issue("latitude", "Latitude must be between -90 and 90");
  //   if (
  //     hasLng &&
  //     (Number.isNaN(+d.longitude) || +d.longitude < -180 || +d.longitude > 180)
  //   )
  //     issue("longitude", "Longitude must be between -180 and 180");

  //   if (
  //     ["phone", "whatsapp"].includes(d.preferredMethod) &&
  //     !d.contactPhone.trim()
  //   )
  //     issue("contactPhone", "Add a phone number for this contact method");
  //   if (d.preferredMethod === "email" && !d.contactEmail.trim())
  //     issue("contactEmail", "Add an email for this contact method");
  // });
/** Cross-field rules. Run independently of field errors so they show on whichever step the user is on. */
export function crossFieldErrors(d) {
  const e = {};
  const t = (s) => (s || '').trim();

  if (d.startDate && d.startTime && d.endDate && d.endTime) {
    const start = new Date(`${d.startDate}T${d.startTime}:00+05:30`).getTime();
    const end = new Date(`${d.endDate}T${d.endTime}:00+05:30`).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) e.endDate = 'The end must be after the start';
  }
  if (d.recurrenceFrequency !== 'none' && d.recurrenceUntil && d.startDate && d.recurrenceUntil < d.startDate) {
    e.recurrenceUntil = 'Must be on or after the start date';
  }

  const hasLat = t(d.latitude) !== '';
  const hasLng = t(d.longitude) !== '';
  if (hasLat !== hasLng) e[hasLat ? 'longitude' : 'latitude'] = 'Enter both latitude and longitude, or leave both empty';
  if (hasLat && (Number.isNaN(+d.latitude) || +d.latitude < -90 || +d.latitude > 90)) e.latitude = 'Latitude must be between -90 and 90';
  if (hasLng && (Number.isNaN(+d.longitude) || +d.longitude < -180 || +d.longitude > 180)) e.longitude = 'Longitude must be between -180 and 180';

  if (['phone', 'whatsapp'].includes(d.preferredMethod) && !t(d.contactPhone)) e.contactPhone = 'Add a phone number for this contact method';
  if (d.preferredMethod === 'email' && !t(d.contactEmail)) e.contactEmail = 'Add an email for this contact method';
  return e;
}

/** react-hook-form resolver: Zod field rules + the cross-field rules above. */
export const eventResolver = async (values, context, options) => {
  const result = await zodResolver(eventFormSchema)(values, context, options);
  const extra = crossFieldErrors(values);
  const keys = Object.keys(extra);
  if (!keys.length) return result;

  const errors = { ...result.errors };
  keys.forEach((k) => {
    if (!errors[k]) errors[k] = { type: 'custom', message: extra[k] };
  });
  return { values: {}, errors };
};

export const emptyValues = {
  title: "",
  category: "",
  description: "",
  organizationName: "",
  occasion: "",
  startDate: "",
  startTime: "12:00",
  endDate: "",
  endTime: "16:00",
  recurrenceFrequency: "none",
  recurrenceInterval: "1",
  recurrenceDays: [],
  recurrenceUntil: "",
  venueName: "",
  address: "",
  locality: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  menuItems: [],
  mealTypes: [],
  foodStart: "",
  foodEnd: "",
  dietType: "vegetarian",
  drinkingWater: false,
  seating: false,
  isFree: true,
  accessibilityInfo: "",
  parkingInfo: "",
  transportInfo: "",
  specialInstructions: "",
  expectedAttendees: "",
  contactPhone: "",
  contactEmail: "",
  preferredMethod: "none",
  phoneVisibility: "public",
  emailVisibility: "public",
  acceptTerms: false,
};

export const STEPS = [
  {
    id: "basic",
    title: "Basics",
    fields: [
      "title",
      "category",
      "description",
      "organizationName",
      "occasion",
    ],
  },
  {
    id: "when",
    title: "Date & time",
    fields: [
      "startDate",
      "startTime",
      "endDate",
      "endTime",
      "recurrenceFrequency",
      "recurrenceInterval",
      "recurrenceDays",
      "recurrenceUntil",
    ],
  },
  {
    id: "where",
    title: "Location",
    fields: [
      "venueName",
      "address",
      "locality",
      "city",
      "state",
      "pincode",
      "latitude",
      "longitude",
    ],
  },
  {
    id: "food",
    title: "Food",
    fields: [
      "menuItems",
      "mealTypes",
      "foodStart",
      "foodEnd",
      "dietType",
      "drinkingWater",
      "seating",
      "isFree",
      "accessibilityInfo",
      "parkingInfo",
      "transportInfo",
      "specialInstructions",
      "expectedAttendees",
    ],
  },
  { id: "photos", title: "Photos", fields: [] },
  {
    id: "contact",
    title: "Contact & publish",
    fields: [
      "contactPhone",
      "contactEmail",
      "preferredMethod",
      "phoneVisibility",
      "emailVisibility",
      "acceptTerms",
    ],
  },
];
export const PHOTOS_STEP = 4;
export const LAST_STEP = STEPS.length - 1;

const splitLocal = (iso) => (iso ? toDateTimeLocal(iso).split("T") : ["", ""]);

export function valuesFromEvent(ev) {
  const [startDate, startTime] = splitLocal(ev.startDateTime);
  const [endDate, endTime] = splitLocal(ev.endDateTime);
  const rec = ev.recurrence || {};
  const c = ev.publicContact || {};
  const coords = ev.location?.coordinates;
  return {
    ...emptyValues,
    title: ev.title || "",
    category: ev.category || "",
    description: ev.description || "",
    organizationName: ev.organizationName || "",
    occasion: ev.occasion || "",
    startDate,
    startTime: startTime || "12:00",
    endDate,
    endTime: endTime || "16:00",
    recurrenceFrequency: rec.frequency || "none",
    recurrenceInterval: String(rec.interval || 1),
    recurrenceDays: (rec.daysOfWeek || []).map(String),
    recurrenceUntil: rec.until ? splitLocal(rec.until)[0] : "",
    venueName: ev.venueName || "",
    address: ev.address || "",
    locality: ev.locality || "",
    city: ev.city || "",
    state: ev.state || "",
    pincode: ev.pincode || "",
    latitude: coords?.length === 2 ? String(coords[1]) : "",
    longitude: coords?.length === 2 ? String(coords[0]) : "",
    menuItems: ev.menuItems || [],
    mealTypes: ev.mealTypes || [],
    foodStart: ev.foodAvailability?.startTime || "",
    foodEnd: ev.foodAvailability?.endTime || "",
    dietType: ev.dietType || "vegetarian",
    drinkingWater: !!ev.drinkingWater,
    seating: !!ev.seating,
    isFree: ev.isFree !== false,
    accessibilityInfo: ev.accessibilityInfo || "",
    parkingInfo: ev.parkingInfo || "",
    transportInfo: ev.transportInfo || "",
    specialInstructions: ev.specialInstructions || "",
    expectedAttendees:
      ev.expectedAttendees != null ? String(ev.expectedAttendees) : "",
    contactPhone: c.phone || "",
    contactEmail: c.email || "",
    preferredMethod: c.preferredMethod || "none",
    phoneVisibility: c.phoneVisibility || "public",
    emailVisibility: c.emailVisibility || "public",
    acceptTerms: false,
  };
}

/**
 * mode: 'draft' | 'publish' | 'save' (edit, keeps status) | 'unpublish'
 * Empty strings are sent for cleared optional fields so the server can clear them.
 */
export function toPayload(
  v,
  { images, coverPublicId, mode, isEdit, hadLocation },
) {
  const iso = (d, t) => fromDateTimeLocal(`${d}T${t}`);
  const hasPin = v.latitude.trim() !== "" && v.longitude.trim() !== "";

  const payload = {
    title: v.title,
    category: v.category,
    description: v.description,
    organizationName: v.organizationName,
    occasion: v.occasion,
    startDateTime: iso(v.startDate, v.startTime),
    endDateTime: iso(v.endDate, v.endTime),
    timezone: "Asia/Kolkata",
    recurrence: {
      frequency: v.recurrenceFrequency,
      interval: Number(v.recurrenceInterval) || 1,
      daysOfWeek:
        v.recurrenceFrequency === "weekly" ? v.recurrenceDays.map(Number) : [],
      until:
        v.recurrenceFrequency !== "none" && v.recurrenceUntil
          ? iso(v.recurrenceUntil, "23:59")
          : "",
    },
    venueName: v.venueName,
    address: v.address,
    locality: v.locality,
    city: v.city,
    state: v.state,
    pincode: v.pincode,
    menuItems: v.menuItems,
    mealTypes: v.mealTypes,
    foodAvailability: { startTime: v.foodStart, endTime: v.foodEnd },
    dietType: v.dietType,
    drinkingWater: v.drinkingWater,
    seating: v.seating,
    isFree: v.isFree,
    accessibilityInfo: v.accessibilityInfo,
    parkingInfo: v.parkingInfo,
    transportInfo: v.transportInfo,
    specialInstructions: v.specialInstructions,
    expectedAttendees: v.expectedAttendees,
    publicContact: {
      phone: v.contactPhone,
      email: v.contactEmail,
      preferredMethod: v.preferredMethod,
      phoneVisibility: v.phoneVisibility,
      emailVisibility: v.emailVisibility,
    },
    images: images.map(({ url, publicId, width, height }) => ({
      url,
      publicId,
      width,
      height,
    })),
    coverPublicId: coverPublicId || undefined,
  };

  if (hasPin) {
    payload.latitude = Number(v.latitude);
    payload.longitude = Number(v.longitude);
  } else if (isEdit && hadLocation) {
    payload.clearLocation = true;
  }

  if (!isEdit) {
    payload.publish = mode === "publish";
    payload.acceptTerms = !!v.acceptTerms;
  } else if (mode === "publish") {
    payload.publish = true;
    payload.acceptTerms = true;
  } else if (mode === "unpublish") {
    payload.publish = false;
  }
  return payload;
}

/** Server field names → form field names. Image problems map to the special key "__images". */
const SERVER_TO_FORM = {
  startDateTime: "startDate",
  endDateTime: "endDate",
  timezone: "startDate",
  recurrence: "recurrenceFrequency",
  "recurrence.frequency": "recurrenceFrequency",
  "recurrence.interval": "recurrenceInterval",
  "recurrence.daysOfWeek": "recurrenceDays",
  "recurrence.until": "recurrenceUntil",
  "foodAvailability.startTime": "foodStart",
  "foodAvailability.endTime": "foodEnd",
  publicContact: "contactPhone",
  "publicContact.phone": "contactPhone",
  "publicContact.email": "contactEmail",
  "publicContact.preferredMethod": "preferredMethod",
  "publicContact.phoneVisibility": "phoneVisibility",
  "publicContact.emailVisibility": "emailVisibility",
};
const FORM_FIELDS = new Set(STEPS.flatMap((s) => s.fields));

export function mapServerErrors(fieldErrors = {}) {
  const out = {};
  Object.entries(fieldErrors).forEach(([field, message]) => {
    const key = SERVER_TO_FORM[field] || field;
    if (FORM_FIELDS.has(key)) out[key] = message;
    else if (field.startsWith("images") || field === "coverPublicId")
      out.__images = message;
    else if (field.startsWith("menuItems")) out.menuItems = message;
  });
  return out;
}

export const stepOfField = (name) =>
  STEPS.findIndex((s) => s.fields.includes(name));
