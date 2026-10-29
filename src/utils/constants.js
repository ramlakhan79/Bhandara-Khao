export const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
  { value: "all-day", label: "All-day food" },
];
export const MEAL_LABEL = Object.fromEntries(
  MEAL_TYPES.map((m) => [m.value, m.label]),
);

export const DIET_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-vegetarian" },
  { value: "both", label: "Both veg & non-veg" },
  { value: "not-specified", label: "Not specified" },
];
export const DIET_LABEL = Object.fromEntries(
  DIET_OPTIONS.map((d) => [d.value, d.label]),
);

export const LIFECYCLE = {
  upcoming: { label: "Upcoming", tone: "brand" },
  ongoing: { label: "Happening now", tone: "green" },
  completed: { label: "Ended", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "red" },
  draft: { label: "Draft", tone: "blue" },
};

export const REPORT_REASONS = [
  { value: "misleading", label: "Misleading or false information" },
  { value: "expired", label: "Event is over or no longer happening" },
  { value: "duplicate", label: "Duplicate of another event" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];

export const REMINDER_OPTIONS = [
  { value: 1, label: "1 hour before" },
  { value: 3, label: "3 hours before" },
  { value: 12, label: "12 hours before" },
  { value: 24, label: "1 day before" },
];

export const DATE_RANGES = [
  { value: "", label: "Any date" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This week" },
  { value: "custom", label: "Custom dates" },
];

export const STATUS_FILTERS = [
  { value: "active", label: "Ongoing + upcoming" },
  { value: "ongoing", label: "Happening now" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

export const SORT_OPTIONS = [
  { value: "date", label: "Soonest first" },
  { value: "nearest", label: "Nearest" },
  { value: "newest", label: "Recently added" },
  { value: "relevance", label: "Most relevant" },
];

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const INDIA_CENTER = [22.9734, 78.6569];
