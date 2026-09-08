'use client';

import React, { useState } from 'react';
import { Mail, Building, User, Globe, Phone, Layers, Send, CheckCircle2 } from 'lucide-react';
import { inquirySchema, InquiryInput } from '@/lib/validation/inquiry.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';

const CATEGORY_OPTIONS = [
  { value: 'Circular Knitwear', label: 'Circular Knitwear (T-Shirts, Polos, Hoodies)' },
  { value: 'Woven Tops & Bottoms', label: 'Woven Tops & Bottoms (Shirts, Chinos, Cargo)' },
  { value: 'Denim & Washed Apparel', label: 'Denim & Washed Apparel (Jeans, Jackets)' },
  { value: 'Outerwear & Jackets', label: 'Outerwear & Technical Jackets (Puffers, Parkas)' },
  { value: 'Performance Activewear', label: 'Performance Activewear (Leggings, Sports Tops)' },
  { value: 'Other Custom Sourcing', label: 'Other Custom Sourcing Program' },
];

export function InquiryForm() {
  const [formData, setFormData] = useState<InquiryInput>({
    name: '',
    company: '',
    country: '',
    email: '',
    phone: '',
    productCategory: '',
    estimatedQuantity: '',
    targetDeliveryDate: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InquiryInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof InquiryInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrors({});

    const parseResult = inquirySchema.safeParse(formData);
    if (!parseResult.success) {
      const fieldErrors: Partial<Record<keyof InquiryInput, string>> = {};
      parseResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof InquiryInput;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parseResult.data),
      });

      if (!response.ok) {
        throw new Error('Could not submit RFQ. Please check your connection or contact us directly.');
      }

      setSubmitSuccess(true);
      setFormData({
        name: '',
        company: '',
        country: '',
        email: '',
        phone: '',
        productCategory: '',
        estimatedQuantity: '',
        targetDeliveryDate: '',
        message: '',
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred during submission. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="p-8 sm:p-12 rounded-xl border border-success/30 bg-success/5 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-foreground tracking-tight">
          Your inquiry has been received by the system.
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Thank you for contacting XYZ Buying House. Your inquiry has been processed and logged in the system. Full automated notification routing will be enabled once production communication providers are configured.
        </p>
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSubmitSuccess(false)}
          >
            Submit Another Inquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errorMessage && (
        <Alert variant="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Name"
          id="rfq-name"
          placeholder="e.g. Sarah Jenkins"
          required
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          icon={<User className="w-4 h-4" />}
        />

        <Input
          label="Company / Brand Name"
          id="rfq-company"
          placeholder="e.g. Nordic Apparel Group"
          required
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          error={errors.company}
          icon={<Building className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Business Email"
          id="rfq-email"
          type="email"
          placeholder="sourcing@yourbrand.com"
          required
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          icon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Country / Region"
          id="rfq-country"
          placeholder="e.g. Germany, UK, USA"
          required
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          error={errors.country}
          icon={<Globe className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Product Category"
          id="rfq-category"
          placeholder="Select Apparel Category"
          options={CATEGORY_OPTIONS}
          required
          value={formData.productCategory}
          onChange={(e) => handleChange('productCategory', e.target.value)}
          error={errors.productCategory}
        />

        <Input
          label="Estimated Order Quantity"
          id="rfq-quantity"
          placeholder="e.g. 5,000 pcs / style"
          required
          value={formData.estimatedQuantity}
          onChange={(e) => handleChange('estimatedQuantity', e.target.value)}
          error={errors.estimatedQuantity}
          icon={<Layers className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone / WhatsApp (Optional)"
          id="rfq-phone"
          placeholder="+49 XXX XXXXXXX"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          icon={<Phone className="w-4 h-4" />}
        />

        <Input
          label="Target Ex-Factory Date (Optional)"
          id="rfq-date"
          type="date"
          value={formData.targetDeliveryDate}
          onChange={(e) => handleChange('targetDeliveryDate', e.target.value)}
          error={errors.targetDeliveryDate}
        />
      </div>

      <Textarea
        label="Collection Details / Tech Pack Specifications"
        id="rfq-message"
        rows={4}
        placeholder="Provide fabric specifications (GSM, yarn count), target FOB price, target size ratio, or wash requirements..."
        required
        value={formData.message}
        onChange={(e) => handleChange('message', e.target.value)}
        error={errors.message}
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full gap-2 font-medium"
        >
          <Send className="w-4 h-4" />
          Transmit Sourcing RFQ
        </Button>
      </div>

      <p className="text-[11px] text-center text-muted-foreground pt-1">
        All collection designs, tech packs, and pricing inquiries are governed under strict commercial non-disclosure.
      </p>
    </form>
  );
}
