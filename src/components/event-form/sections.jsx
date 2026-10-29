import { lazy, Suspense } from 'react';
import { Checkbox, Input, Select, Textarea } from '../ui/form.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import TagInput from './TagInput.jsx';
import { DIET_OPTIONS, INDIAN_STATES, MEAL_TYPES } from '../../utils/constants.js';
import { formatDate } from '../../utils/format.js';

const LocationPicker = lazy(() => import('../map/LocationPicker.jsx'));

const Group = ({ legend, hint, error, children }) => (
    <fieldset className="border-0 p-0">
        <legend className="mb-1 text-sm font-semibold">{legend}</legend>
        {hint && <p className="mb-2 text-sm text-stone-600 dark:text-stone-400">{hint}</p>}
        <div className="flex flex-wrap gap-x-5">{children}</div>
        {error && <p role="alert" className="mt-1 text-sm font-medium text-red-700 dark:text-red-400">{error}</p>}
    </fieldset>
);

/* ------------------------------- 1. Basics ------------------------------- */
export function BasicSection({ form, categories }) {
    const { register, formState: { errors } } = form;
    return (
        <div className="space-y-5">
            <Input label="Bhandara / event title" required placeholder="e.g. Hanuman Jayanti Mahaprasad" error={errors.title?.message} {...register('title')} />
            <div className="grid gap-5 sm:grid-cols-2">
                <Select label="Category" required error={errors.category?.message} {...register('category')}>
                    <option value="">Choose a category</option>
                    {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </Select>
                <Input label="Religious occasion or festival (optional)" placeholder="e.g. Navratri" error={errors.occasion?.message} {...register('occasion')} />
            </div>
            <Input label="Organizer or organization name" required placeholder="e.g. Shri Hanuman Seva Samiti" error={errors.organizationName?.message} {...register('organizationName')} />
            <Textarea
                label="Description"
                required
                rows={6}
                hint="Tell people what to expect: the occasion, who can attend, and anything they should know."
                error={errors.description?.message}
                {...register('description')}
            />
        </div>
    );
}

/* ----------------------------- 2. Date & time ----------------------------- */
const DAYS = [['1', 'Mon'], ['2', 'Tue'], ['3', 'Wed'], ['4', 'Thu'], ['5', 'Fri'], ['6', 'Sat'], ['0', 'Sun']];
const UNIT = { weekly: 'week', monthly: 'month', yearly: 'year' };

function recurrenceSummary(v) {
    if (v.recurrenceFrequency === 'none') return '';
    const n = Number(v.recurrenceInterval) || 1;
    let s = `Repeats every ${n > 1 ? `${n} ${UNIT[v.recurrenceFrequency]}s` : UNIT[v.recurrenceFrequency]}`;
    if (v.recurrenceFrequency === 'weekly' && v.recurrenceDays.length) {
        s += ` on ${DAYS.filter(([d]) => v.recurrenceDays.includes(d)).map(([, l]) => l).join(', ')}`;
    }
    if (v.recurrenceUntil) s += ` until ${formatDate(`${v.recurrenceUntil}T12:00:00+05:30`)}`;
    return `${s}.`;
}

export function WhenSection({ form }) {
    const { register, watch, formState: { errors } } = form;
    const v = watch();
    const recurring = v.recurrenceFrequency !== 'none';
    return (
        <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Start date" type="date" required error={errors.startDate?.message} {...register('startDate')} />
                <Input label="Start time" type="time" required error={errors.startTime?.message} {...register('startTime')} />
                <Input label="End date" type="date" required min={v.startDate || undefined} error={errors.endDate?.message} {...register('endDate')} />
                <Input label="End time" type="time" required error={errors.endTime?.message} {...register('endTime')} />
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400">
                Time zone: <strong>Asia/Kolkata (IST)</strong>. All times are in Indian Standard Time.
            </p>

            <div className="rounded-xl border border-stone-200 p-4 dark:border-stone-800">
                <Select label="Does this event repeat?" error={errors.recurrenceFrequency?.message} {...register('recurrenceFrequency')}>
                    <option value="none">Does not repeat (one-time event)</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </Select>

                {recurring && (
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input label={`Repeat every (${UNIT[v.recurrenceFrequency]}s)`} type="number" min={1} max={12} inputMode="numeric" error={errors.recurrenceInterval?.message} {...register('recurrenceInterval')} />
                            <Input label="Repeat until (optional)" type="date" min={v.startDate || undefined} error={errors.recurrenceUntil?.message} {...register('recurrenceUntil')} />
                        </div>
                        {v.recurrenceFrequency === 'weekly' && (
                            <Group legend="On these days (optional)">
                                {DAYS.map(([d, label]) => <Checkbox key={d} label={label} value={d} {...register('recurrenceDays')} />)}
                            </Group>
                        )}
                        <p className="rounded-lg bg-brand-50 p-3 text-sm dark:bg-brand-900/20" aria-live="polite">
                            <strong>{recurrenceSummary(v)}</strong> This is shown as a label on your event. The listing itself covers the dates above, so use{' '}
                            <em>Duplicate</em> in your dashboard to announce each new date.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ------------------------------- 3. Location ------------------------------ */
export function WhereSection({ form }) {
    const { register, watch, setValue, formState: { errors } } = form;
    const v = watch();
    const lat = parseFloat(v.latitude);
    const lng = parseFloat(v.longitude);
    const pin = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    const query = [v.venueName, v.address, v.locality, v.city, v.state, v.pincode].filter(Boolean).join(', ');

    const setPin = (p) => {
        const opts = { shouldDirty: true, shouldValidate: true };
        setValue('latitude', p ? String(p.lat) : '', opts);
        setValue('longitude', p ? String(p.lng) : '', opts);
    };

    return (
        <div className="space-y-5">
            <Input label="Venue or temple name" required error={errors.venueName?.message} {...register('venueName')} />
            <Input label="Full street address" required autoComplete="street-address" error={errors.address?.message} {...register('address')} />
            <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Area / locality" required error={errors.locality?.message} {...register('locality')} />
                <Input label="City" required autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
                <Select label="State" required error={errors.state?.message} {...register('state')}>
                    <option value="">Choose a state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="Pincode" required inputMode="numeric" maxLength={6} autoComplete="postal-code" error={errors.pincode?.message} {...register('pincode')} />
            </div>

            <div>
                <h3 className="mb-1 font-bold">Pin the location on the map</h3>
                <p className="mb-3 text-sm text-stone-600 dark:text-stone-400">
                    Optional, but it lets people find you in "near me" searches and opens exact directions.
                </p>
                <Suspense fallback={<Skeleton className="h-80 w-full rounded-2xl" />}>
                    <LocationPicker value={pin} onChange={setPin} searchQuery={query} />
                </Suspense>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <Input label="Latitude (optional)" inputMode="decimal" placeholder="e.g. 23.1815" error={errors.latitude?.message} {...register('latitude')} />
                    <Input label="Longitude (optional)" inputMode="decimal" placeholder="e.g. 79.9864" error={errors.longitude?.message} {...register('longitude')} />
                </div>
            </div>
        </div>
    );
}

/* --------------------------------- 4. Food -------------------------------- */
export function FoodSection({ form }) {
    const { register, watch, setValue, formState: { errors } } = form;
    const menu = watch('menuItems');
    return (
        <div className="space-y-6">
            <TagInput
                label="Menu items"
                value={menu}
                onChange={(next) => setValue('menuItems', next, { shouldDirty: true, shouldValidate: true })}
                placeholder="e.g. Puri, Aloo sabzi, Halwa"
                hint="Type an item and press Enter or comma. You can paste a comma-separated list."
                error={errors.menuItems?.message}
            />

            <Group legend="Meal type">
                {MEAL_TYPES.map((m) => <Checkbox key={m.value} label={m.label} value={m.value} {...register('mealTypes')} />)}
            </Group>

            <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Food served from" type="time" error={errors.foodStart?.message} {...register('foodStart')} />
                <Input label="Food served until" type="time" error={errors.foodEnd?.message} {...register('foodEnd')} />
                <Select label="Menu type" {...register('dietType')}>
                    {DIET_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </Select>
                <Input label="Expected number of people (optional)" inputMode="numeric" error={errors.expectedAttendees?.message} {...register('expectedAttendees')} />
            </div>

            <Group legend="Facilities">
                <Checkbox label="Free food for everyone" {...register('isFree')} />
                <Checkbox label="Drinking water available" {...register('drinkingWater')} />
                <Checkbox label="Seating available" {...register('seating')} />
            </Group>

            <Textarea label="Accessibility information (optional)" rows={2} hint="e.g. wheelchair access, ground-floor seating for seniors" error={errors.accessibilityInfo?.message} {...register('accessibilityInfo')} />
            <div className="grid gap-5 sm:grid-cols-2">
                <Textarea label="Parking (optional)" rows={2} error={errors.parkingInfo?.message} {...register('parkingInfo')} />
                <Textarea label="Public transport (optional)" rows={2} error={errors.transportInfo?.message} {...register('transportInfo')} />
            </div>
            <Textarea label="Special instructions for visitors (optional)" rows={3} hint="e.g. bring your own plate, queue timings, dress code" error={errors.specialInstructions?.message} {...register('specialInstructions')} />
        </div>
    );
}

/* ------------------------- 6. Contact & publication ------------------------ */
const VIS = [
    ['public', 'Everyone'],
    ['loggedIn', 'Logged-in members only'],
    ['hidden', 'Hidden (do not show)'],
];

export function ContactSection({ form, isEdit, status }) {
    const { register, formState: { errors } } = form;
    const needsTerms = !isEdit || status === 'draft';
    return (
        <div className="space-y-6">
            <p className="text-sm text-stone-600 dark:text-stone-400">
                Contact details are optional. Only what you choose to share is shown, and you control who can see each one.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Public phone number" type="tel" inputMode="tel" error={errors.contactPhone?.message} {...register('contactPhone')} />
                <Select label="Who can see the phone number?" {...register('phoneVisibility')}>
                    {VIS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
                <Input label="Public email" type="email" inputMode="email" error={errors.contactEmail?.message} {...register('contactEmail')} />
                <Select label="Who can see the email?" {...register('emailVisibility')}>
                    {VIS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
                <Select label="Preferred contact method" {...register('preferredMethod')}>
                    <option value="none">No preference</option>
                    <option value="phone">Phone call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                </Select>
            </div>

            {needsTerms && (
                <Checkbox
                    error={errors.acceptTerms?.message}
                    label={<>I confirm this is a genuine event and I agree to the community guidelines and <a href="/terms" target="_blank" rel="noopener noreferrer" className="link">Terms</a>. (<a href="/guidelines" target="_blank" rel="noopener noreferrer" className="link">Read guidelines</a>)</>}
                    {...register('acceptTerms')}
                />
            )}
        </div>
    );
}