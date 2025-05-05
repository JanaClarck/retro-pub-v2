'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase-config/client';
import type { HomepageContent } from '@/types/firestore';

export default function HomepageEditor() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      const docRef = doc(db, 'homepage', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContent(docSnap.data() as HomepageContent);
      }
    }
    fetchContent();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;

    setIsSaving(true);
    try {
      const docRef = doc(db, 'homepage', 'main');
      await updateDoc(docRef, {
        hero: content.hero,
        workingHours: content.workingHours,
        address: content.address,
        phone: content.phone,
        email: content.email,
        socialLinks: content.socialLinks,
      });
      alert('Homepage content updated successfully!');
    } catch (error) {
      console.error('Error updating homepage:', error);
      alert('Failed to update homepage content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Hero Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={content.hero.title}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, title: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={content.hero.description}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, description: e.target.value }
              })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Button Text</label>
            <input
              type="text"
              value={content.hero.buttonText}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, buttonText: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Button Link</label>
            <input
              type="text"
              value={content.hero.buttonLink}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, buttonLink: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Background Image URL</label>
            <input
              type="text"
              value={content.hero.backgroundImage}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, backgroundImage: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={content.address}
              onChange={(e) => setContent({ ...content, address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={content.phone}
              onChange={(e) => setContent({ ...content, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={content.email}
              onChange={(e) => setContent({ ...content, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Social Links</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook</label>
            <input
              type="url"
              value={content.socialLinks.facebook}
              onChange={(e) => setContent({
                ...content,
                socialLinks: { ...content.socialLinks, facebook: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Instagram</label>
            <input
              type="url"
              value={content.socialLinks.instagram}
              onChange={(e) => setContent({
                ...content,
                socialLinks: { ...content.socialLinks, instagram: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Twitter</label>
            <input
              type="url"
              value={content.socialLinks.twitter}
              onChange={(e) => setContent({
                ...content,
                socialLinks: { ...content.socialLinks, twitter: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Working Hours */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Working Hours</h2>
        <div className="space-y-4">
          {Object.entries(content.workingHours).map(([day, hours]) => (
            <div key={day}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{day}</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setContent({
                  ...content,
                  workingHours: { ...content.workingHours, [day]: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 