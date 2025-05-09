
import { useState, useEffect } from 'preact/hooks';
import { gsap } from 'gsap';  // GSAP for animations

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface ApiResponse {
  error?: string;
  success?: boolean;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  // Handle input changes
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name as keyof FormErrors]: '' }));
    }
  };

  // Validate form data
  const validate = (): boolean => {
    let formErrors: FormErrors = {};
    if (!formData.name.trim()) formErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      formErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = 'Email is invalid.';
    }
    if (!formData.message.trim()) formErrors.message = 'Message is required.';
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setSubmitMessage('Message sent successfully! Thank you.');
        setFormData({ name: '', email: '', message: '' });  // Reset form
      } else {
        setSubmitMessage(`Error: ${data.error || 'Failed to send message.'}`);
      }
    } catch (error) {
      setSubmitMessage('An unexpected error occurred. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // GSAP animation on mount
  useEffect(() => {
    const formFields = document.querySelectorAll('.form-field');
    if (formFields.length > 0) {
      gsap.from(formFields, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      {submitMessage && (
        <div class={`p-3 rounded ${submitMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {submitMessage}
        </div>
      )}

      <div class="form-field">
        <label htmlFor="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onInput={handleChange}
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
          placeholder="Your name"
        />
        {errors.name && <p class="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div class="form-field">
        <label htmlFor="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onInput={handleChange}
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
          placeholder="Your email"
        />
        {errors.email && <p class="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div class="form-field">
        <label htmlFor="message" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onInput={handleChange}
          rows={4}
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
          placeholder="Your message"
        />
        {errors.message && <p class="mt-1 text-sm text-red-600">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        class="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};
