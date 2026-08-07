import { type Tables } from '@/lib/supabase/types';

interface NotificationTemplate {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export function getTemplate(
  notification: Tables<'notifications'>,
): NotificationTemplate {
  const metadata = (notification.metadata ?? {}) as Record<string, string>;

  switch (notification.type) {
    case 'buddy_request':
      return {
        title: metadata.user_name ?? 'Someone',
        body: 'Wants to be your buddy!',
        url: `/buddies/${metadata.user_id}`,
        tag: `buddy_request:${metadata.user_id}`,
      };
    case 'hangout_request':
      return {
        title: metadata.user_name ?? 'Someone',
        body: 'Wants to join hang out!',
        url: `/hangouts/${metadata.hangout_id}/requests`,
        tag: `hangout_request:${metadata.hangout_id}:${metadata.user_id}`,
      };
    case 'hangout_invite':
      return {
        title: metadata.user_name ?? 'Someone',
        body: 'Invited you to hang out!',
        url: `/hangouts/${metadata.hangout_id}`,
        tag: `hangout_invite:${metadata.hangout_id}`,
      };
    case 'hangout_ended':
      return {
        title: metadata.hangout_name ?? 'Your hang out',
        body: 'Hang out has ended!',
        url: `/hangouts/${metadata.hangout_id}`,
        tag: `hangout_ended:${metadata.hangout_id}`,
      };
    default:
      return {
        title: 'Blackout',
        body: 'You have a new notification.',
        url: '/home',
        tag: 'blackout',
      };
  }
}
