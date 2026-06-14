import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import { useQuery } from '@tanstack/react-query';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.ReactElement {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const whatsappNumber = settings?.contact_whatsapp || "+919880652548";

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </div>
  );
} 