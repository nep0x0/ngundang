import { notFound } from 'next/navigation';
import { guestService } from '@/lib/supabase';
import PersonalizedInvitation from '@/components/PersonalizedInvitation';

interface PageProps {
  params: {
    code: string;
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { code } = params;

  // Validate code format (5 characters, alphanumeric, no confusing chars)
  const codeRegex = /^[23456789abcdefghjkmnpqrstuvwxyz]{5}$/;
  if (!codeRegex.test(code)) {
    notFound();
  }

  try {
    // Get guest by invitation code
    const guest = await guestService.getByInvitationCode(code);
    
    if (!guest) {
      notFound();
    }

    return <PersonalizedInvitation guest={guest} />;
  } catch (error) {
    console.error('Error loading guest:', error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { code } = params;
  
  try {
    const guest = await guestService.getByInvitationCode(code);
    
    if (!guest) {
      return {
        title: 'Undangan Tidak Ditemukan',
        description: 'Undangan pernikahan tidak ditemukan'
      };
    }

    const guestName = guest.partner ? `${guest.name} & ${guest.partner}` : guest.name;
    
    return {
      title: `Undangan Pernikahan - ${guestName}`,
      description: `Undangan pernikahan Adelita & Ansyah untuk ${guestName}`,
      openGraph: {
        title: `Undangan Pernikahan - ${guestName}`,
        description: `Undangan pernikahan Adelita & Ansyah untuk ${guestName}`,
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Undangan Pernikahan',
      description: 'Undangan pernikahan Adelita & Ansyah'
    };
  }
}
