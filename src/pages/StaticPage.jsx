import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { useApi } from '../hooks/useApi.js';
import { settingsService } from '../services/settingsService.js';
import { formatDate } from '../utils/format.js';

const PAGES = {
    about: {
        title: 'About Bhandara Khao',
        fallback: `# About Bhandara Khao

Bhandara Khao is a free community platform that helps people find bhandaras, langars, free community meals and food seva events across India, and helps organizers share them.

## Our idea

Food seva is one of the most generous traditions in our communities. Too often the word does not travel beyond one street or one temple. We make it easy to post an event and easy to find one nearby.

## How it works

- Organizers post the date, time, menu and location.
- Visitors search by city, area or pincode, or browse the map.
- The community reports anything misleading, and moderators review it.

Events are posted by community members. Please check the details with the organizer when you can, and report anything that looks wrong.`,
    },
    contact: {
        title: 'Contact us',
        fallback: `# Contact us

Contact details have not been added yet. In the meantime, if you see something wrong with a listing, please use the "Report this event" button on that event's page so a moderator can review it.`,
    },
    guidelines: {
        title: 'Community guidelines',
        fallback: `# Community guidelines

- Post only real bhandaras and food seva events you are organizing or know about first-hand.
- Give accurate dates, times and addresses, and update or cancel the event if plans change.
- Never charge for events listed as free.
- Do not post hateful, misleading or inappropriate content.
- Share only contact details you are happy to make public.
- Moderators may hide or remove events that break these guidelines.`,
    },
    privacy: {
        title: 'Privacy Policy',
        fallback: `# Privacy Policy

## What we collect

- Account details: your name, email address, optional phone number, and a password stored only as a secure hash. If you sign in with Google, we receive your name, email address and profile picture from Google.
- Content you post: events, descriptions, photos and the contact details you choose to make public.
- Saved events, reminders and notification preferences.

## Cookies and local storage

We use a secure, HttpOnly cookie to keep you logged in, and your browser's local storage to remember your theme, recent searches and chosen location on your device.

## Location

If you tap "Use my location", your coordinates are used to find nearby events. They are kept on your device and not stored on our servers.

## Services we use

Photos are stored with Cloudinary. Maps use OpenStreetMap. Emails are sent through an email provider. Sign-in with Google is optional.

## Your choices

You can edit or delete your events, change your notification preferences and change your password from your dashboard. Contact us to ask for your account to be removed.`,
    },
    terms: {
        title: 'Terms of Use',
        fallback: `# Terms of Use

By using Bhandara Khao you agree to these terms.

## Using the site

- Events are posted by community members. We do not organize or guarantee any event.
- You are responsible for the accuracy of what you post.
- You must follow the community guidelines.

## Moderation

We may hide, reject or remove content, and suspend accounts, that break the guidelines or harm the community.

## Your content

You keep ownership of what you post, and you allow us to display it on the platform.

## Changes

We may update these terms from time to time. Continued use means you accept the changes.`,
    },
};

function Rich({ text }) {
    const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    return blocks.map((b, i) => {
        if (b.startsWith('## ')) return <h2 key={i} className="mt-8 text-xl font-bold">{b.slice(3)}</h2>;
        if (b.startsWith('# ')) return <h2 key={i} className="mt-8 text-2xl font-extrabold first:mt-0">{b.slice(2)}</h2>;
        const lines = b.split('\n');
        if (lines.every((l) => l.startsWith('- '))) {
            return <ul key={i} className="mt-3 list-disc space-y-1.5 pl-6">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        }
        return <p key={i} className="mt-3 whitespace-pre-line leading-relaxed">{b}</p>;
    });
}

export default function StaticPage({ pageKey }) {
    const meta = PAGES[pageKey];
    const { data, loading, error, reload } = useApi((s) => settingsService.get(pageKey, s), [pageKey]);

    return (
        <div className="container-page max-w-3xl py-10">
            <Seo title={meta.title} description={`${meta.title}, Bhandara Khao`} />
            {error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
                <div className="space-y-4"><Skeleton className="h-9 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            ) : (
                <article>
                    <Rich text={data.value?.trim() ? data.value : meta.fallback} />
                    {data.updatedAt && <p className="mt-10 text-sm text-stone-500">Last updated {formatDate(data.updatedAt)}</p>}
                    <p className="mt-6 text-sm">
                        <Link to="/" className="link">Back to home</Link>
                    </p>
                </article>
            )}
        </div>
    );
}